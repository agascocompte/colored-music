class SpiralVisualizer extends BaseVisualizer {
    constructor(width, height) {
        super(width, height);
    }

    update(spectrum) {
        const newSpectrum = this._reduceSpectrum(spectrum, 3);
        const X = 11;
        const Y = 11;
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
} 