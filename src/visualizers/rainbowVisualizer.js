class RainbowVisualizer extends BaseVisualizer {
    constructor(width, height) {
        super(width, height);
        this.needsReset = true;
        this.cx = width / 2;
        this.cy = height * 0.92;

        // Un arco por color, cada uno ligado a su propia banda de frecuencia
        // (rojo = graves exteriores ... violeta = agudos interiores)
        this.bands = [
            { hue: 0,   f0: 0,   f1: 8 },
            { hue: 28,  f0: 8,   f1: 20 },
            { hue: 55,  f0: 20,  f1: 45 },
            { hue: 125, f0: 45,  f1: 90 },
            { hue: 200, f0: 90,  f1: 150 },
            { hue: 245, f0: 150, f1: 240 },
            { hue: 285, f0: 240, f1: 380 }
        ];

        this.stars = [];
        this.sparkles = [];
        this.glints = [];
        this.drops = [];
        this.levels = new Array(this.bands.length).fill(0);
        this.lastEnergy = 0;
        this.skyGlow = 0;
        this.beatPulse = 0;
        this.reset();
    }

    reset() {
        this.time = 0;
        this.glints = [];
        this.drops = [];
        this.levels = new Array(this.bands.length).fill(0);
        this.skyGlow = 0;
        this.beatPulse = 0;

        this.stars = [];
        for (let i = 0; i < 90; i++) {
            this.stars.push({
                x: random(this.WIDTH),
                y: random(this.HEIGHT * 0.5),
                size: random(0.5, 2),
                phase: random(TWO_PI),
                speed: random(0.5, 2)
            });
        }

        this.sparkles = [];
        for (let i = 0; i < 44; i++) {
            this.sparkles.push({
                angle: random(PI + 0.2, TWO_PI - 0.2),
                band: floor(random(this.bands.length)),
                drift: random(-0.005, 0.005),
                phase: random(TWO_PI),
                speed: random(1.5, 3.5)
            });
        }
    }

    update(spectrum) {
        this.time += 0.016;

        const bass = this._getAverageEnergy(spectrum, 0, 12);
        const mid = this._getAverageEnergy(spectrum, 40, 120);
        const treble = this._getAverageEnergy(spectrum, 200, 400);
        const energy = (bass * 1.2 + mid + treble * 0.8) / 3;

        this._detectBeat(energy);
        this._updateLevels(spectrum);

        push();
        colorMode(HSB, 360, 100, 100, 100);
        noStroke();

        this._drawSky(bass);
        this._drawStars(treble);
        this._drawSunGlow(bass);
        this._drawRainbow(energy);
        this._updateDrops();
        this._drawGlints();
        this._drawSparkles(treble);
        this._drawClouds(mid);

        pop();
        colorMode(RGB, 255, 255, 255, 255);

        this.skyGlow = lerp(this.skyGlow, 0, 0.05);
        this.beatPulse *= 0.9;
    }

    _detectBeat(energy) {
        const change = energy - this.lastEnergy;
        this.lastEnergy = energy;

        if (change > 16) {
            this.skyGlow = min(this.skyGlow + 40, 60);
            this.beatPulse = min(this.beatPulse + 0.8, 1);
            this._spawnDrops(10);
            if (this.glints.length < 3) {
                this.glints.push({ angle: PI + 0.15, speed: 0.045 + energy * 0.0002 });
            }
        }
    }

    _updateLevels(spectrum) {
        // Nivel suavizado por banda: sube de golpe, baja despacio
        this.bands.forEach((band, i) => {
            const target = this._getAverageEnergy(spectrum, band.f0, band.f1) / 255;
            this.levels[i] = target > this.levels[i]
                ? lerp(this.levels[i], target, 0.5)
                : this.levels[i] * 0.92;
        });
    }

    _bandRadius(index) {
        // El radio de cada banda rebota con su nivel y salta con los golpes
        return this.WIDTH * (0.46 - index * 0.031)
            * (1 + this.levels[index] * 0.06 + this.beatPulse * 0.05);
    }

    _drawSky(bass) {
        // Crepúsculo: índigo profundo arriba, magenta cálido hacia el horizonte
        for (let y = 0; y < this.HEIGHT; y += 4) {
            const t = y / this.HEIGHT;
            const hue = lerp(255, 320, t);
            const bright = lerp(5, 13 + bass * 0.025, t) + this.skyGlow * 0.08;
            fill(hue, 65, bright);
            rect(0, y, this.WIDTH, 4);
        }
    }

    _drawStars(treble) {
        this.stars.forEach(star => {
            const twinkle = 0.5 + 0.5 * sin(this.time * star.speed * 2 + star.phase);
            fill(210, 12, 35 + twinkle * 40 + map(treble, 0, 255, 0, 25), 85);
            const size = star.size * (0.8 + twinkle * 0.5);
            ellipse(star.x, star.y, size, size);
        });
    }

    _drawSunGlow(bass) {
        // Amanecer cálido asomando bajo el arco
        const glow = map(bass, 0, 255, 0, 22) + this.skyGlow * 0.3;
        for (let i = 6; i >= 1; i--) {
            fill(38, 75, 55, (3.5 + glow * 0.35) / i);
            ellipse(this.cx, this.cy, this.WIDTH * 0.1 * i * (1 + bass / 255 * 0.25), this.WIDTH * 0.085 * i);
        }
        fill(45, 55, 95, 28 + glow);
        ellipse(this.cx, this.cy, this.WIDTH * 0.09, this.WIDTH * 0.075);
    }

    _drawRainbow(energy) {
        const step = 0.025;

        this.bands.forEach((band, i) => {
            const level = this.levels[i];
            const baseRadius = this._bandRadius(i);
            const thickness = this.WIDTH * 0.026 * (0.85 + level * 0.7);
            const brightness = 55 + level * 45;
            const alpha = 50 + level * 40 + this.skyGlow * 0.4;

            strokeWeight(thickness);
            let prev = null;

            for (let a = PI; a <= TWO_PI + 0.001; a += step) {
                // Ola que recorre el arco: la fase avanza con el tiempo, así que
                // el movimiento se ve viajar de un extremo al otro. El desfase
                // entre bandas es pequeño para que ondeen juntas, como una bandera
                const travelingWave = sin(a * 5 - this.time * 3.4 + i * 0.35)
                    * this.WIDTH * 0.013 * (0.25 + level * 1.6);
                const slowSwell = (noise(a * 2.2, this.time * 1.1 + i * 1.2) - 0.5)
                    * this.WIDTH * 0.022 * (0.4 + energy / 255);
                const r = baseRadius + travelingWave + slowSwell;
                const x = this.cx + cos(a) * r;
                const y = this.cy + sin(a) * r;

                if (prev) {
                    // Brillo que recorre el arco como luz atravesando un prisma
                    const shimmer = 0.65 + 0.35 * sin(a * 5 + this.time * 4 + i * 1.3);
                    stroke(band.hue, 85, brightness * shimmer, alpha);
                    line(prev.x, prev.y, x, y);
                }
                prev = { x: x, y: y };
            }
        });

        noStroke();
    }

    _spawnDrops(count) {
        for (let i = 0; i < count && this.drops.length < 70; i++) {
            const band = floor(random(this.bands.length));
            const angle = random(PI + 0.3, TWO_PI - 0.3);
            const r = this._bandRadius(band);
            this.drops.push({
                x: this.cx + cos(angle) * r,
                y: this.cy + sin(angle) * r,
                vx: random(-0.6, 0.6),
                vy: random(0.3, 1.2),
                hue: this.bands[band].hue,
                size: random(2.5, 5),
                life: 100
            });
        }
    }

    _updateDrops() {
        // Lluvia de color: gotas que se desprenden de los arcos con la música
        this.bands.forEach((band, i) => {
            if (this.levels[i] > 0.4 && random() < this.levels[i] * 0.25 && this.drops.length < 70) {
                const angle = random(PI + 0.3, TWO_PI - 0.3);
                const r = this._bandRadius(i);
                this.drops.push({
                    x: this.cx + cos(angle) * r,
                    y: this.cy + sin(angle) * r,
                    vx: random(-0.6, 0.6),
                    vy: random(0.3, 1.2),
                    hue: band.hue,
                    size: random(2.5, 5),
                    life: 100
                });
            }
        });

        for (let i = this.drops.length - 1; i >= 0; i--) {
            const drop = this.drops[i];
            drop.x += drop.vx;
            drop.y += drop.vy;
            drop.vy += 0.13;
            drop.life -= 1.6;

            fill(drop.hue, 80, 95, min(drop.life, 85));
            ellipse(drop.x, drop.y, drop.size, drop.size * 1.35);

            if (drop.life <= 0 || drop.y > this.HEIGHT + 10) {
                this.drops.splice(i, 1);
            }
        }
    }

    _drawGlints() {
        // Destellos blancos que barren el arcoíris en cada golpe fuerte
        for (let i = this.glints.length - 1; i >= 0; i--) {
            const glint = this.glints[i];
            glint.angle += glint.speed;

            const fade = map(glint.angle, TWO_PI - 0.8, TWO_PI - 0.1, 1, 0);
            this.bands.forEach((band, b) => {
                const r = this._bandRadius(b);
                const x = this.cx + cos(glint.angle) * r;
                const y = this.cy + sin(glint.angle) * r;
                fill(band.hue, 15, 100, 55 * min(fade, 1));
                const size = this.WIDTH * 0.032;
                ellipse(x, y, size, size * 0.8);
            });

            if (glint.angle >= TWO_PI - 0.12) {
                this.glints.splice(i, 1);
            }
        }
    }

    _drawSparkles(treble) {
        this.sparkles.forEach(sparkle => {
            sparkle.angle += sparkle.drift;
            if (sparkle.angle < PI + 0.15 || sparkle.angle > TWO_PI - 0.15) {
                sparkle.drift *= -1;
            }

            const r = this._bandRadius(sparkle.band);
            const x = this.cx + cos(sparkle.angle) * r;
            const y = this.cy + sin(sparkle.angle) * r;
            const twinkle = 0.5 + 0.5 * sin(this.time * sparkle.speed * 2 + sparkle.phase);
            const alpha = twinkle * (25 + map(treble, 0, 255, 0, 55));

            fill(50, 8, 100, alpha);
            const size = 2 + twinkle * 3;
            ellipse(x, y, size, size);
        });
    }

    _drawClouds(mid) {
        // Nubes suaves en los pies del arcoíris
        const outerRadius = this.WIDTH * 0.46;
        const puffs = [
            { dx: -0.2, dy: 0, s: 1.15 }, { dx: 0.25, dy: -0.12, s: 0.95 },
            { dx: 0.7, dy: 0.08, s: 1.05 }, { dx: -0.65, dy: 0.1, s: 0.85 },
            { dx: 0, dy: 0.18, s: 1.25 }
        ];
        const baseSize = this.WIDTH * 0.085;
        const alpha = 9 + map(mid, 0, 255, 0, 10) + this.skyGlow * 0.15;

        [-1, 1].forEach(side => {
            const footX = this.cx + side * outerRadius * 0.93;
            const footY = this.cy - this.HEIGHT * 0.045;
            puffs.forEach(puff => {
                const breathe = 1 + 0.06 * sin(this.time * 0.7 + puff.dx * 5 + side);
                fill(300, 8, 90, alpha);
                ellipse(footX + puff.dx * baseSize, footY + puff.dy * baseSize,
                        baseSize * puff.s * breathe, baseSize * puff.s * 0.62 * breathe);
            });
        });
    }
}
