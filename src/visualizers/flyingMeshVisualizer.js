class FlyingMeshVisualizer extends BaseVisualizer {
    constructor(width, height) {
        super(width, height);
        this.cols = 36;
        this.rows = 36;
        this.scale = width * 0.017;
        this.flying = 0;
        this.rotation = 0;
        this.baseHue = 200;
        this.pulse = 0;
        this.lastEnergy = 0;
        this.beatWaves = [];
        this.stars = [];

        this.terrain = [];
        for (let x = 0; x < this.cols; x++) {
            this.terrain[x] = [];
            for (let y = 0; y < this.rows; y++) {
                this.terrain[x][y] = 0;
            }
        }

        for (let i = 0; i < 110; i++) {
            this.stars.push({
                x: random(width),
                y: random(height),
                size: random(0.5, 2),
                phase: random(TWO_PI),
                speed: random(0.5, 2)
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
        this._updateTerrain(spectrum, energy);

        this.baseHue = (this.baseHue + 0.15 + energy * 0.002) % 360;
        this.rotation += 0.003 + energy * 0.00002;

        push();
        colorMode(HSB, 360, 100, 100, 100);
        noStroke();

        this._drawBackground(treble);

        translate(this.WIDTH / 2, this.HEIGHT / 2);
        rotate(this.rotation);
        // Respiración de la malla: zoom suave que golpea con los graves
        const zoom = 1 + this.pulse * 0.07 + sin(this.time * 0.8) * 0.015;
        scale(zoom);

        this._drawMesh(energy);

        pop();
        colorMode(RGB, 255, 255, 255, 255);

        this.pulse = lerp(this.pulse, 0, 0.08);
        this._updateBeatWaves();
    }

    _detectBeat(energy, bass) {
        const change = energy - this.lastEnergy;
        this.lastEnergy = energy;

        if (change > 16 && bass > 80) {
            this.pulse = min(this.pulse + 0.8, 1);
            if (this.beatWaves.length < 4) {
                this.beatWaves.push({ radius: 0, speed: 0.55 + bass * 0.002 });
            }
        }
    }

    _updateTerrain(spectrum, energy) {
        const dynamicRange = map(energy, 0, 255, 26, 58);
        this.flying -= 0.004 + map(energy, 0, 255, 0, 0.09);

        let yoff = this.flying;
        for (let y = 0; y < this.rows; y++) {
            let xoff = 0;
            for (let x = 0; x < this.cols; x++) {
                const audioMod = map(spectrum[x % spectrum.length], 0, 255, -dynamicRange, dynamicRange);
                this.terrain[x][y] = map(noise(xoff, yoff), 0, 1, -30, 30) + audioMod;
                xoff += 0.2;
            }
            yoff += 0.2;
        }
    }

    _updateBeatWaves() {
        for (let i = this.beatWaves.length - 1; i >= 0; i--) {
            this.beatWaves[i].radius += this.beatWaves[i].speed;
            if (this.beatWaves[i].radius > this.cols * 0.85) {
                this.beatWaves.splice(i, 1);
            }
        }
    }

    _drawBackground(treble) {
        // Espacio profundo: negro en los bordes, violeta tenue en el centro
        fill(265, 65, 3);
        rect(0, 0, this.WIDTH, this.HEIGHT);

        for (let i = 7; i >= 1; i--) {
            fill((this.baseHue + 60) % 360, 70, 3 + (7 - i) * 1.4, 16);
            ellipse(this.WIDTH / 2, this.HEIGHT / 2, this.WIDTH * 0.24 * i, this.WIDTH * 0.24 * i);
        }

        this.stars.forEach(star => {
            const twinkle = 0.5 + 0.5 * sin(this.time * star.speed * 2 + star.phase);
            fill(210, 12, 30 + twinkle * 40 + map(treble, 0, 255, 0, 25), 80);
            const size = star.size * (0.8 + twinkle * 0.5);
            ellipse(star.x, star.y, size, size);
        });
    }

    _drawMesh(energy) {
        const half = this.cols / 2;
        const energyBoost = map(energy, 0, 255, 0, 20);

        for (let y = 0; y < this.rows - 1; y++) {
            for (let x = 0; x < this.cols - 1; x++) {
                const h1 = this.terrain[x][y];
                const h2 = this.terrain[x][y + 1];

                // Posiciones deformadas por la altura, como en el diseño original
                let x1 = (x - half) * this.scale;
                let y1 = (y - half) * this.scale;
                let x2 = (x + 1 - half) * this.scale;
                let y2 = (y + 1 - half) * this.scale;

                const s1 = map(h1, -30, 30, 0.7, 1.3);
                const s2 = map(h2, -30, 30, 0.7, 1.3);

                // Misma deformación que el diseño original
                x1 *= s1;
                y1 *= s1;
                x2 *= s2;
                y2 *= s2;

                // Distancia al centro en celdas: gobierna color y desvanecimiento
                const gx = x - half;
                const gy = y - half;
                const dist = sqrt(gx * gx + gy * gy);

                // Onda de luz que atraviesa la malla en cada golpe
                let waveBoost = 0;
                for (let w = 0; w < this.beatWaves.length; w++) {
                    const d = abs(dist - this.beatWaves[w].radius);
                    if (d < 2.5) waveBoost = max(waveBoost, map(d, 0, 2.5, 55, 0));
                }

                const hue = (this.baseHue + dist * 3.4 + h1 * 1.1) % 360;
                const brightness = min(32 + map(h1, -30, 30, 0, 30) + energyBoost + waveBoost, 100);
                // La malla emerge de la oscuridad: se desvanece hacia los bordes
                const edgeFade = constrain(map(dist, half * 0.72, half * 1.02, 1, 0), 0, 1);
                const alpha = (30 + map(h1, -30, 30, 0, 45) + waveBoost) * edgeFade;

                if (alpha < 2) continue;

                stroke(hue, 80 - waveBoost * 0.9, brightness, alpha);
                strokeWeight(map(h1, -30, 30, 0.8, 2.2) + this.pulse * 0.6);

                line(x1, y1, x1, y2);
                line(x1, y1, x2, y1);
            }
        }
        noStroke();
    }
}
