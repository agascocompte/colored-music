const WIDTH = 500;
const HEIGHT = 500;

let audioManager;
let visualizers;
let uiManager;

function preload() {
    audioManager = new AudioManager();
    audioManager.preload();
}

function setup() {
    canvas = createCanvas(WIDTH, HEIGHT);
    canvas.parent("canvas");
    canvas.style("display", "block");
    canvas.style("margin", "25 auto");

    audioManager.setup();
    visualizers = new Visualizers(WIDTH, HEIGHT);
    uiManager = new UIManager(audioManager);
    uiManager.setup();
}

function draw() {
    if (!audioManager.isPaused()) {
        background(visualizers.bgcolor);
        const spectrum = audioManager.getSpectrum();

        const bass = audioManager.getEnergy("bass");
        const lowMid = audioManager.getEnergy("lowMid");
        const mid = audioManager.getEnergy("mid");
        const highMid = audioManager.getEnergy("highMid");
        const treble = audioManager.getEnergy("treble");

        switch (uiManager.getCurrentMode()) {
            case 'espiral':
                visualizers.espiral(spectrum);
                break;
            case 'verticales':
                visualizers.lineasVerticales(spectrum);
                break;
            case 'circulos':
                visualizers.circulos(spectrum);
                break;
        }

        visualizers.updateBackground(bass, treble);
    }
    document.getElementById("songSelected").textContent = audioManager.getCurrentSongName();
}

function setMode(mode) {
    uiManager.setMode(mode);
} 