class VerticalLinesVisualizer extends BaseVisualizer {
    constructor(width, height) {
        super(width, height);
        this.numBars = 56;
        this.levels = new Array(this.numBars).fill(0);
        this.peaks = new Array(this.numBars).fill(0);
        this.peakVels = new Array(this.numBars).fill(0);
        this.baselineY = height * 0.62;
        this.maxBarHeight = height * 0.46;
        this.lastEnergy = 0;
        this.beatGlow = 0;
    }

    update(spectrum) {
        this.time += 0.016;

        const bass = this._getAverageEnergy(spectrum, 0, 12);
        const mid = this._getAverageEnergy(spectrum, 40, 120);
        const energy = (bass + mid) / 2;

        const change = energy - this.lastEnergy;
        this.lastEnergy = energy;
        if (change > 16) {
            this.beatGlow = min(this.beatGlow + 50, 80);
        }

        push();
        colorMode(HSB, 360, 100, 100, 100);
        noStroke();

        this._drawBackground(bass);
        this._drawBars(spectrum);
        this._drawBaseline();

        pop();
        colorMode(RGB, 255, 255, 255, 255);

        this.beatGlow = lerp(this.beatGlow, 0, 0.06);
    }

    _drawBackground(bass) {
        // Cielo casi negro con un leve degradado índigo
        for (let y = 0; y < this.HEIGHT; y += 4) {
            const t = y / this.HEIGHT;
            fill(255, 60, lerp(3, 9, t));
            rect(0, y, this.WIDTH, 4);
        }

        // Resplandor de horizonte que respira con los graves
        const glowAlpha = 4 + map(bass, 0, 255, 0, 8) + this.beatGlow * 0.15;
        for (let i = 4; i >= 1; i--) {
            fill(265, 60, 40, glowAlpha / i);
            ellipse(this.WIDTH / 2, this.baselineY, this.WIDTH * (0.5 + i * 0.25), this.HEIGHT * 0.09 * i);
        }
    }

    _drawBars(spectrum) {
        const barWidth = this.WIDTH / this.numBars;
        const drawWidth = barWidth * 0.58;

        for (let i = 0; i < this.numBars; i++) {
            // Muestreo logarítmico: más resolución en graves, donde vive la música
            const bandIndex = floor(pow(i / this.numBars, 1.6) * 480);
            const target = (spectrum[bandIndex] || 0) / 255;

            // Ataque rápido, caída suave
            this.levels[i] = target > this.levels[i]
                ? lerp(this.levels[i], target, 0.5)
                : this.levels[i] * 0.9;

            // Tapa de pico que flota y cae con gravedad
            if (this.levels[i] >= this.peaks[i]) {
                this.peaks[i] = this.levels[i];
                this.peakVels[i] = 0;
            } else {
                this.peakVels[i] += 0.0012;
                this.peaks[i] = max(this.peaks[i] - this.peakVels[i], this.levels[i]);
            }

            const level = this.levels[i];
            const x = i * barWidth + (barWidth - drawWidth) / 2;
            const h = max(level * this.maxBarHeight, 2);
            const hue = map(i, 0, this.numBars, 205, 335);
            const brightness = 45 + level * 55;

            // Halo detrás de la barra
            fill(hue, 70, brightness, 8 + level * 14 + this.beatGlow * 0.15);
            rect(x - drawWidth * 0.55, this.baselineY - h - drawWidth * 0.55,
                 drawWidth * 2.1, h + drawWidth * 1.1, drawWidth);

            // Barra principal con la parte superior redondeada
            fill(hue, 75, brightness, 92);
            rect(x, this.baselineY - h, drawWidth, h, drawWidth / 2, drawWidth / 2, 0, 0);

            // Reflejo en el "suelo de cristal"
            fill(hue, 75, brightness, 13);
            rect(x, this.baselineY + 5, drawWidth, h * 0.35, 0, 0, drawWidth / 2, drawWidth / 2);

            // Tapa de pico
            const peakY = this.baselineY - this.peaks[i] * this.maxBarHeight - 4;
            fill(hue, 20, 100, 70 + level * 30);
            rect(x, peakY - 2.5, drawWidth, 2.5, 2);
        }
    }

    _drawBaseline() {
        // Línea de horizonte: un trazo ancho difuso y otro fino brillante
        stroke(265, 40, 70, 12 + this.beatGlow * 0.5);
        strokeWeight(5);
        line(0, this.baselineY + 1, this.WIDTH, this.baselineY + 1);

        stroke(265, 20, 95, 35 + this.beatGlow);
        strokeWeight(1.5);
        line(0, this.baselineY + 1, this.WIDTH, this.baselineY + 1);
        noStroke();
    }
}
