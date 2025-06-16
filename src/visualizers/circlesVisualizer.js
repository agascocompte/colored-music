class CirclesVisualizer extends BaseVisualizer {
    constructor(width, height) {
        super(width, height);
    }

    update(spectrum) {
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
