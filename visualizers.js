class Visualizers {
    constructor(width, height) {
        this.WIDTH = width;
        this.HEIGHT = height;
        this.bgcolor = [0, 0, 0];
    }

    updateBackground(bass, treble) {
        this.bgcolor = [bass - 25, treble, 255];
    }

    espiral(spectrum) {
        const newSpectrum = this._reduceSpectrum(spectrum, 3);
        const X = 11;
        const Y = 10;
        let x = 0;
        let y = 0;
        let dx = 0;
        let dy = -1;

        for (let i = 0; i < Math.max(X, Y) ** 2; i++) {
            if ((-X/2 < x && x <= X/2) && (-Y/2 < y && y <= Y/2)) {
                const radius = map(newSpectrum[Math.abs(x * y * 5) % newSpectrum.length], 100, 300, 10, 60);
                const color = map(newSpectrum[Math.abs(x * y * 5) % newSpectrum.length], 0, 250, 0, 255);

                this._setEspiralColor(x, y, color);
                ellipse((x * 50) + (this.WIDTH / 2), (y * 50) + (this.HEIGHT / 2), radius, radius);
            }

            if (x == y || (x < 0 && x == -y) || (x > 0 && x == 1-y)) {
                [dx, dy] = [-dy, dx];
            }
            x += dx;
            y += dy;
        }
    }

    circulos(spectrum) {
        stroke(0);
        let x = 0;
        let y = 50;
        let todosDibujados = false;

        for (let i = 0; i < spectrum.length; i++) {
            const radius = map(spectrum[i], 0, 255, 0, 50);
            const color = map(spectrum[i], 0, 255, 0, x);

            if (x == this.WIDTH - 50 && y == this.HEIGHT - 50) {
                todosDibujados = true;
            }

            if (!todosDibujados) {
                if (x == this.WIDTH - 50) {
                    x = 50;
                    y += 50;
                } else {
                    x += 50;
                }
            } else {
                x = this.WIDTH + (radius * 4);
            }

            this._setCirculosColor(spectrum[i], color);
            ellipse(x, y, radius, radius);
        }
    }

    lineasVerticales(spectrum) {
        for (let i = 0; i < spectrum.length; i++) {
            const h = map(spectrum[i], 0, 255, 0, this.HEIGHT);
            stroke(255 - h, 255 - h, 255);
            line(i, this.HEIGHT, i, this.HEIGHT - h);
        }
    }

    _reduceSpectrum(spectrum, times) {
        let result = spectrum;
        for (let i = 0; i < times; i++) {
            result = this._reduceSpectrumOnce(result);
        }
        return result;
    }

    _reduceSpectrumOnce(spectrum) {
        const newSpectrum = [];
        for (let i = 0; i < spectrum.length - 1; i += 2) {
            newSpectrum.push((spectrum[i] + spectrum[i + 1]) / 2);
        }
        return newSpectrum;
    }

    _setEspiralColor(x, y, color) {
        if (Math.abs(y) - 2 < 0 && Math.abs(x) - 2 < 0) {
            stroke(255 - ((x * y) * 3), 255 - color, 200);
            fill(255 - ((x * y) * 3), 255 - color, 200);
        } else if (Math.abs(y) - 3 < 0 && Math.abs(x) - 3 < 0) {
            stroke(255 - ((x * y) * 3), 255 - color, 255 - color);
            fill(255 - ((x * y) * 3), 255 - color, 255 - color);
        } else if (Math.abs(y) - 4 < 0 && Math.abs(x) - 4 < 0) {
            stroke(255 - ((x * y) * 3), 255, 255 - color);
            fill(255 - ((x * y) * 3), 255, 255 - color);
        } else {
            stroke(255 - color, 255 - ((x * y) * 3), 0);
            fill(255 - color, 255 - ((x * y) * 3), 0);
        }
    }

    _setCirculosColor(spectrumValue, color) {
        if (spectrumValue > 150 && spectrumValue < 200) {
            fill(255, 255 - color, 255 - color);
        } else if (spectrumValue > 200) {
            fill(255, color, 255 - color);
        } else {
            fill(255, 255 - color, 255);
        }
    }
} 