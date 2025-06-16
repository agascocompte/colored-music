class RainbowVisualizer extends BaseVisualizer {
    constructor(width, height) {
        super(width, height);
        this.reset();
        this.rainbowWaves = [];
        this.lastEnergyChange = 0;
        this.needsReset = true;
        this._initializeRainbowWaves();
    }

    reset() {
        this.colorShift = 0;
        this.colorChangeThreshold = 50;
        this.rainbowWaves = [];
        this.maxRainbowWaves = 6;
        this.particles = [];
        this.maxParticles = 30;
        this.shockwaves = [];
        this.time = 0;
        this._initializeRainbowWaves();
    }

    _initializeRainbowWaves() {
        // Reiniciar las ondas con colores del arcoíris
        this.rainbowWaves = [];
        const baseColors = [
            color(255, 0, 0),     // Rojo
            color(255, 127, 0),   // Naranja
            color(255, 255, 0),   // Amarillo
            color(0, 255, 0),     // Verde
            color(0, 0, 255),     // Azul
            color(75, 0, 130)     // Índigo
        ];

        for (let i = 0; i < this.maxRainbowWaves; i++) {
            this.rainbowWaves.push({
                radius: 50 + i * 60,
                color: baseColors[i % baseColors.length],
                speed: 0.05 + i * 0.02,
                phase: i * PI / 4,
                amplitude: 3 + i * 1,
                frequency: 0.5 + i * 0.1,
                baseRadius: 50 + i * 60,
                smoothRadius: 50 + i * 60
            });
        }
    }

    update(spectrum) {
        // Asegurarnos de que el visualizador está inicializado
        if (this.rainbowWaves.length === 0) {
            this.reset();
        }

        this.time += 0.05;
        
        const bass = this._getAverageEnergy(spectrum, 0, 10);
        const lowMid = this._getAverageEnergy(spectrum, 10, 50);
        const mid = this._getAverageEnergy(spectrum, 50, 100);
        const highMid = this._getAverageEnergy(spectrum, 100, 200);
        const treble = this._getAverageEnergy(spectrum, 200, 255);
        
        this.energyLevel = (bass + lowMid + mid + highMid + treble) / 5;
        this._detectTempo(bass, mid);
        
        this._updateRainbowWaves(spectrum, bass, lowMid, mid, highMid, treble);
    }

    _updateRainbowWaves(spectrum, bass, lowMid, mid, highMid, treble) {
        const centerX = this.WIDTH / 2;
        const centerY = this.HEIGHT / 2;

        const currentEnergy = (bass + lowMid + mid + highMid + treble) / 5;
        const energyChange = Math.abs(currentEnergy - this.lastEnergyChange);
        this.lastEnergyChange = currentEnergy;

        const hasEnergy = currentEnergy > 10;

        if (energyChange > this.colorChangeThreshold) {
            this.colorShift = (this.colorShift + 180) % 360;
            
            if (hasEnergy) {
                this.shockwaves.push({
                    radius: 0,
                    maxRadius: 300,
                    speed: 15,
                    color: color(255, 255, 255, 150)
                });
            }
        }

        this._updateShockwaves(centerX, centerY);
        this._drawRainbowWaves(spectrum, bass, lowMid, mid, highMid, treble, centerX, centerY, hasEnergy);
        this._updateParticles();
    }

    _updateShockwaves(centerX, centerY) {
        for (let i = this.shockwaves.length - 1; i >= 0; i--) {
            const wave = this.shockwaves[i];
            wave.radius += wave.speed;
            
            push();
            noFill();
            stroke(wave.color);
            strokeWeight(2);
            ellipse(centerX, centerY, wave.radius * 2);
            pop();

            if (wave.radius >= wave.maxRadius) {
                this.shockwaves.splice(i, 1);
            }
        }
    }

    _drawRainbowWaves(spectrum, bass, lowMid, mid, highMid, treble, centerX, centerY, hasEnergy) {
        const rainbowColors = [
            color(255, 0, 0),     // Rojo
            color(255, 127, 0),   // Naranja
            color(255, 255, 0),   // Amarillo
            color(0, 255, 0),     // Verde
            color(0, 0, 255),     // Azul
            color(75, 0, 130),    // Índigo
            color(148, 0, 211)    // Violeta
        ];

        push();
        fill(20, 0, 50, 40);
        noStroke();
        rect(0, 0, this.WIDTH, this.HEIGHT);
        pop();

        for (let i = this.rainbowWaves.length - 1; i >= 0; i--) {
            const wave = this.rainbowWaves[i];
            let energy = this._getWaveEnergy(spectrum, bass, lowMid, mid, highMid, treble, i);

            const timeVariation = hasEnergy ? sin(this.time * (i + 1) * 0.5) * map(energy, 0, 255, 5, 20) : 0;
            const musicVariation = hasEnergy ? sin(this.time * this.tempo * 0.01) * map(energy, 0, 255, 10, 30) : 0;

            const minRadius = 40 + i * 50;
            const maxRadius = 120 + i * 80;
            const targetRadius = map(energy, 0, 255, minRadius, maxRadius) + timeVariation + musicVariation;
            
            wave.smoothRadius = lerp(wave.smoothRadius, targetRadius, 0.15);

            this._drawWave(wave, rainbowColors[i], energy, hasEnergy, centerX, centerY);
        }
    }

    _getWaveEnergy(spectrum, bass, lowMid, mid, highMid, treble, index) {
        switch (index) {
            case 0: return this._getAverageEnergy(spectrum, 0, spectrum.length) * 1.5;
            case 1: return bass * 0.9;
            case 2: return lowMid * 0.8;
            case 3: return mid * 0.7;
            case 4: return highMid * 0.6;
            case 5: return treble * 0.5;
            default: return 0;
        }
    }

    _drawWave(wave, color, energy, hasEnergy, centerX, centerY) {
        push();
        const brightness = map(energy, 0, 255, 150, 255);
        fill(red(color), green(color), blue(color), brightness);
        
        stroke(255, map(energy, 0, 255, 100, 255));
        strokeWeight(map(energy, 0, 255, 1, 3));
        
        ellipse(centerX, centerY, wave.smoothRadius * 2);
        
        if (hasEnergy && energy > 100) {
            this._drawWaveEffects(wave, color, energy, centerX, centerY);
        }
        pop();
    }

    _drawWaveEffects(wave, color, energy, centerX, centerY) {
        noFill();
        stroke(red(color), green(color), blue(color), 100);
        beginShape();
        for (let a = 0; a < 360; a += 10) {
            const angle = radians(a);
            const distortion = sin(angle * 3 + this.time * 2) * map(energy, 100, 255, 5, 15);
            const x = centerX + cos(angle) * (wave.smoothRadius + distortion);
            const y = centerY + sin(angle) * (wave.smoothRadius + distortion);
            vertex(x, y);
        }
        endShape(CLOSE);

        if (energy > 100) {
            noFill();
            stroke(red(color), green(color), blue(color), 50);
            ellipse(centerX, centerY, wave.smoothRadius * 2.2);
        }
    }

    _updateParticles() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.life -= 5;

            push();
            noStroke();
            fill(red(p.color), green(p.color), blue(p.color), p.life);
            ellipse(p.x, p.y, 4);
            pop();

            if (p.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }
} 
