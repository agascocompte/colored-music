class AuroraVisualizer extends BaseVisualizer {
    constructor(width, height) {
        super(width, height);
        this.stars = [];
        this.shootingStars = [];
        this.ridges = [];
        this.glowBoost = 0;
        this.lastEnergy = 0;

        // Cada cortina de aurora baila con su propia banda de frecuencia
        this.ribbons = [
            { baseY: height * 0.24, amp: height * 0.055, length: height * 0.30, hue: 140, noiseScale: 0.0035, speed: 0.12, bandStart: 0,   bandEnd: 12,  alphaScale: 1.0 },
            { baseY: height * 0.30, amp: height * 0.065, length: height * 0.26, hue: 158, noiseScale: 0.0042, speed: 0.16, bandStart: 12,  bandEnd: 40,  alphaScale: 1.0 },
            { baseY: height * 0.37, amp: height * 0.075, length: height * 0.22, hue: 175, noiseScale: 0.005,  speed: 0.20, bandStart: 40,  bandEnd: 100, alphaScale: 0.9 },
            { baseY: height * 0.44, amp: height * 0.08,  length: height * 0.17, hue: 285, noiseScale: 0.006,  speed: 0.26, bandStart: 100, bandEnd: 200, alphaScale: 0.7 },
            { baseY: height * 0.50, amp: height * 0.085, length: height * 0.14, hue: 320, noiseScale: 0.007,  speed: 0.32, bandStart: 200, bandEnd: 340, alphaScale: 0.6 }
        ];

        this._initStars();
        this._initRidges();
    }

    _initStars() {
        for (let i = 0; i < 150; i++) {
            this.stars.push({
                x: random(this.WIDTH),
                y: random(this.HEIGHT * 0.75),
                size: random(0.5, 2.2),
                phase: random(TWO_PI),
                speed: random(0.5, 2)
            });
        }
    }

    _initRidges() {
        const configs = [
            { base: this.HEIGHT * 0.82, amp: this.HEIGHT * 0.10, scale: 0.004, bright: 10 },
            { base: this.HEIGHT * 0.90, amp: this.HEIGHT * 0.07, scale: 0.006, bright: 5 }
        ];

        configs.forEach((cfg, idx) => {
            const points = [];
            for (let x = 0; x <= this.WIDTH; x += 8) {
                points.push({ x: x, y: cfg.base - noise(x * cfg.scale + idx * 100) * cfg.amp });
            }
            this.ridges.push({ points: points, bright: cfg.bright });
        });
    }

    update(spectrum) {
        this.time += 0.016;

        const bass = this._getAverageEnergy(spectrum, 0, 12);
        const mid = this._getAverageEnergy(spectrum, 40, 120);
        const treble = this._getAverageEnergy(spectrum, 200, 400);
        const energy = (bass * 1.2 + mid + treble * 0.8) / 3;

        this._detectBeat(energy, treble);

        push();
        colorMode(HSB, 360, 100, 100, 100);
        noStroke();

        this._drawSky(bass);
        this._drawStars(treble);
        this._drawShootingStars();
        this._drawRibbons(spectrum, bass);
        this._drawMountains();

        pop();
        colorMode(RGB, 255, 255, 255, 255);

        this.glowBoost = lerp(this.glowBoost, 0, 0.05);
    }

    _detectBeat(energy, treble) {
        const change = energy - this.lastEnergy;
        this.lastEnergy = energy;

        if (change > 16) {
            this.glowBoost = min(this.glowBoost + 45, 70);

            if (this.shootingStars.length < 3) {
                const fromLeft = random() < 0.5;
                this.shootingStars.push({
                    x: fromLeft ? random(-40, this.WIDTH * 0.3) : random(this.WIDTH * 0.7, this.WIDTH + 40),
                    y: random(this.HEIGHT * 0.05, this.HEIGHT * 0.35),
                    vx: fromLeft ? random(4, 8) : random(-8, -4),
                    vy: random(1.5, 3.5),
                    life: 90 + treble * 0.2
                });
            }
        }
    }

    _drawSky(bass) {
        for (let y = 0; y < this.HEIGHT; y += 4) {
            const t = y / this.HEIGHT;
            fill(250, 70, lerp(4, 14 + bass * 0.02, t));
            rect(0, y, this.WIDTH, 4);
        }
    }

    _drawStars(treble) {
        this.stars.forEach(star => {
            const twinkle = 0.5 + 0.5 * sin(this.time * star.speed * 2 + star.phase);
            const brightness = 35 + twinkle * 40 + map(treble, 0, 255, 0, 25);
            fill(210, 12, brightness, 85);
            const starSize = star.size * (0.8 + twinkle * 0.5);
            ellipse(star.x, star.y, starSize, starSize);
        });
    }

    _drawShootingStars() {
        for (let i = this.shootingStars.length - 1; i >= 0; i--) {
            const s = this.shootingStars[i];
            s.x += s.vx;
            s.y += s.vy;
            s.life -= 4;

            stroke(200, 15, 100, min(s.life, 90));
            strokeWeight(1.8);
            line(s.x, s.y, s.x - s.vx * 5, s.y - s.vy * 5);
            noStroke();

            if (s.life <= 0 || s.y > this.HEIGHT) {
                this.shootingStars.splice(i, 1);
            }
        }
    }

    _drawRibbons(spectrum, bass) {
        const step = 8;

        strokeCap(SQUARE);

        this.ribbons.forEach((ribbon, index) => {
            const edge = [];

            for (let x = 0; x <= this.WIDTH; x += step) {
                const n = noise(x * ribbon.noiseScale, this.time * ribbon.speed + index * 13.7);
                const bandIndex = floor(map(x, 0, this.WIDTH, ribbon.bandStart, ribbon.bandEnd));
                const e = (spectrum[bandIndex] || 0) / 255;

                const yTop = ribbon.baseY + (n - 0.5) * 2 * ribbon.amp * (1 + bass / 255);
                const length = ribbon.length * (0.5 + n * 0.5) * (0.6 + e * 0.9);
                const alpha = (7 + e * 26 + this.glowBoost * 0.4) * ribbon.alphaScale;
                const hue = (ribbon.hue + n * 22) % 360;

                // Cortina de luz que se desvanece hacia abajo; el ancho de columna
                // coincide con el paso para que encajen sin costuras ni solapes
                strokeWeight(step);
                const segments = 5;
                for (let s = 0; s < segments; s++) {
                    stroke(hue, 80, 84 - s * 12, alpha * (1 - s / segments));
                    line(x, yTop + (length / segments) * s, x, yTop + (length / segments) * (s + 1));
                }

                edge.push({ x: x, y: yTop, e: e });
            }

            // Borde superior brillante de la cortina
            noFill();
            stroke(ribbon.hue, 50, 100, 22 + this.glowBoost * 0.8);
            strokeWeight(2);
            beginShape();
            edge.forEach(pt => vertex(pt.x, pt.y));
            endShape();
            noStroke();
        });

        strokeCap(ROUND);
    }

    _drawMountains() {
        this.ridges.forEach(ridge => {
            fill(240, 60, ridge.bright);
            beginShape();
            vertex(0, this.HEIGHT);
            ridge.points.forEach(pt => vertex(pt.x, pt.y));
            vertex(this.WIDTH, this.HEIGHT);
            endShape(CLOSE);
        });
    }
}
