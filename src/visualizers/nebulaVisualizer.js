class NebulaVisualizer extends BaseVisualizer {
    constructor(width, height) {
        super(width, height);
        this.maxRadius = this.WIDTH * 0.46;
        this.particles = [];
        this.stars = [];
        this.shockwaves = [];
        this.hueShift = 0;
        this.corePulse = 0;
        this.lastEnergy = 0;
        this._initStars();
        this._initParticles();
    }

    _initStars() {
        for (let i = 0; i < 130; i++) {
            this.stars.push({
                x: random(this.WIDTH),
                y: random(this.HEIGHT),
                size: random(0.5, 2),
                phase: random(TWO_PI),
                speed: random(0.5, 2)
            });
        }
    }

    _initParticles() {
        const arms = 3;
        for (let i = 0; i < 300; i++) {
            // Distribución con más densidad hacia el centro, en tres brazos espirales
            const radius = pow(random(), 0.75) * (this.maxRadius - 24) + 24;
            const arm = i % arms;
            this.particles.push({
                baseRadius: radius,
                angle: (arm * TWO_PI / arms) + radius * 0.02 + random(-0.22, 0.22),
                speed: map(radius, 24, this.maxRadius, 0.03, 0.006) * random(0.75, 1.25),
                size: random(1, 3.2),
                band: floor(map(radius, 24, this.maxRadius, 4, 320)),
                wobble: random(TWO_PI),
                flare: 0
            });
        }
    }

    update(spectrum) {
        this.time += 0.016;

        const bass = this._getAverageEnergy(spectrum, 0, 12);
        const mid = this._getAverageEnergy(spectrum, 40, 120);
        const treble = this._getAverageEnergy(spectrum, 200, 400);
        const energy = (bass * 1.2 + mid + treble * 0.8) / 3;

        this._detectBeat(energy, bass);

        push();
        colorMode(HSB, 360, 100, 100, 100);
        noStroke();

        this._drawSpace(bass);
        this._drawStars(treble);
        this._drawShockwaves();
        this._drawParticles(spectrum, energy);
        this._drawCore(bass);

        pop();
        colorMode(RGB, 255, 255, 255, 255);

        this.hueShift = (this.hueShift + 0.05 + energy * 0.0015) % 360;
        this.corePulse = lerp(this.corePulse, 0, 0.06);
    }

    _detectBeat(energy, bass) {
        const change = energy - this.lastEnergy;
        this.lastEnergy = energy;

        if (change > 18 && bass > 90) {
            this.corePulse = min(this.corePulse + 160, 255);
            this.shockwaves.push({ radius: 30, alpha: 70, speed: 5 + bass * 0.03 });
            for (let i = 0; i < 26; i++) {
                this.particles[floor(random(this.particles.length))].flare = 50;
            }
        }
    }

    _drawSpace(bass) {
        fill(255, 60, 4);
        rect(0, 0, this.WIDTH, this.HEIGHT);

        // Brumas de nebulosa girando lentamente alrededor del centro
        const cx = this.WIDTH / 2;
        const cy = this.HEIGHT / 2;
        const hazes = [[285, 70], [220, 75], [330, 65]];

        hazes.forEach((haze, i) => {
            const a = this.time * (0.05 + i * 0.02) + i * TWO_PI / 3;
            const d = this.WIDTH * 0.16;
            const size = this.WIDTH * (0.55 + i * 0.12) * (1 + bass / 255 * 0.15);
            fill((haze[0] + this.hueShift * 0.3) % 360, haze[1], 22, 6);
            ellipse(cx + cos(a) * d, cy + sin(a) * d, size, size * 0.85);
        });
    }

    _drawStars(treble) {
        this.stars.forEach(star => {
            const twinkle = 0.5 + 0.5 * sin(this.time * star.speed * 2 + star.phase);
            const brightness = 35 + twinkle * 40 + map(treble, 0, 255, 0, 25);
            fill(210, 15, brightness, 80);
            const starSize = star.size * (0.8 + twinkle * 0.6);
            ellipse(star.x, star.y, starSize, starSize);
        });
    }

    _drawShockwaves() {
        for (let i = this.shockwaves.length - 1; i >= 0; i--) {
            const wave = this.shockwaves[i];
            wave.radius += wave.speed;
            wave.alpha *= 0.94;

            noFill();
            stroke((190 + this.hueShift) % 360, 55, 95, wave.alpha);
            strokeWeight(2.5);
            ellipse(this.WIDTH / 2, this.HEIGHT / 2, wave.radius * 2, wave.radius * 1.84);
            noStroke();

            if (wave.alpha < 2 || wave.radius > this.WIDTH) {
                this.shockwaves.splice(i, 1);
            }
        }
    }

    _drawParticles(spectrum, energy) {
        const cx = this.WIDTH / 2;
        const cy = this.HEIGHT / 2;

        this.particles.forEach(p => {
            const bandEnergy = spectrum[p.band] || 0;
            p.angle += p.speed * (1 + energy / 255 * 1.6);

            const radius = p.baseRadius
                + sin(this.time * 2.2 + p.wobble) * 4
                + map(bandEnergy, 0, 255, 0, 30)
                + this.corePulse * 0.06;
            const x = cx + cos(p.angle) * radius;
            const y = cy + sin(p.angle) * radius * 0.92;

            // Del magenta interior al cian exterior, con deriva de tono global
            const hue = (map(p.baseRadius, 24, this.maxRadius, 325, 190) + this.hueShift) % 360;
            const brightness = 65 + map(bandEnergy, 0, 255, 0, 35);
            const alpha = 45 + map(bandEnergy, 0, 255, 0, 40) + p.flare;

            // Cola de cometa: un arco que sigue la órbita de la partícula
            const tail = 0.07 + bandEnergy / 255 * 0.12 + energy / 255 * 0.05;
            const midAngle = p.angle - tail / 2;
            const tailAngle = p.angle - tail;
            stroke(hue, 80, brightness, alpha * 0.35);
            strokeWeight(p.size * (0.8 + bandEnergy / 255));
            line(cx + cos(tailAngle) * radius, cy + sin(tailAngle) * radius * 0.92,
                 cx + cos(midAngle) * radius, cy + sin(midAngle) * radius * 0.92);
            stroke(hue, 80, brightness, alpha * 0.75);
            line(cx + cos(midAngle) * radius, cy + sin(midAngle) * radius * 0.92, x, y);
            noStroke();

            fill(hue, 35, min(brightness + 30, 100), min(alpha + 20, 100));
            const dotSize = p.size * (1 + bandEnergy / 180);
            ellipse(x, y, dotSize, dotSize);

            p.flare = max(p.flare - 3, 0);
        });
    }

    _drawCore(bass) {
        const cx = this.WIDTH / 2;
        const cy = this.HEIGHT / 2;
        const coreSize = 26 + map(bass, 0, 255, 0, 34) + this.corePulse * 0.12;
        const coreHue = (270 + this.hueShift) % 360;

        // Halo suave: muchas capas con desvanecimiento exponencial
        const layers = 16;
        for (let i = layers; i >= 1; i--) {
            const t = i / layers;
            fill(coreHue, 45 * t + 10, 100, 3 + (1 - t) * 9);
            ellipse(cx, cy, coreSize * (0.9 + t * t * 3.6), coreSize * (0.85 + t * t * 3.4));
        }

        fill(coreHue, 8, 100, 100);
        ellipse(cx, cy, coreSize * 0.8, coreSize * 0.75);
    }
}
