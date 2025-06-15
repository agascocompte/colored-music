class BaseVisualizer {
    constructor(width, height) {
        this.WIDTH = width;
        this.HEIGHT = height;
        this.bgcolor = color(0, 0, 0);
        this.time = 0;
        this.energyLevel = 0;
        this.lastEnergyLevel = 0;
        this.energyChange = 0;
        this.tempo = 0;
        this.lastTempoChange = 0;
        this.lastBassIntensity = 0;
        this.lastMidIntensity = 0;
    }

    _getAverageEnergy(spectrum, start, end) {
        let sum = 0;
        for (let i = start; i < end; i++) {
            sum += spectrum[i] || 0;
        }
        return sum / (end - start);
    }

    _detectTempo(bass, mid) {
        const currentChange = Math.abs(bass - this.lastBassIntensity) + Math.abs(mid - this.lastMidIntensity);
        this.lastBassIntensity = bass;
        this.lastMidIntensity = mid;

        if (currentChange > 30) {
            const timeSinceLastBeat = this.time - this.lastTempoChange;
            if (timeSinceLastBeat > 0.1) {
                this.tempo = 60 / timeSinceLastBeat;
                this.lastTempoChange = this.time;
            }
        }
    }

    updateBackground(bass, treble) {
        this.bgcolor = color(bass - 25, treble, 255);
    }
} 