class VerticalLinesVisualizer extends BaseVisualizer {
    constructor(width, height) {
        super(width, height);
    }

    update(spectrum) {
        for (let i = 0; i < spectrum.length; i++) {
            const h = map(spectrum[i], 0, 255, 0, this.HEIGHT);
            stroke(255 - h, 255 - h, 255);
            line(i, this.HEIGHT, i, this.HEIGHT - h);
        }
    }
} 
