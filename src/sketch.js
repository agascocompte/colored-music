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
    visualizers = {
        espiral: new SpiralVisualizer(WIDTH, HEIGHT),
        verticales: new VerticalLinesVisualizer(WIDTH, HEIGHT),
        circulos: new CirclesVisualizer(WIDTH, HEIGHT),
        dance: new DanceVisualizer(WIDTH, HEIGHT),
        rainbow: new RainbowVisualizer(WIDTH, HEIGHT)
    };
    uiManager = new UIManager(audioManager);
    uiManager.setup();
}

function draw() {
    if (!audioManager.isPaused()) {
        const currentMode = uiManager.getCurrentMode();
        
        // Reiniciar el visualizador Rainbow si acabamos de cambiar a él
        if (currentMode === 'rainbow' && visualizers[currentMode].needsReset) {
            visualizers[currentMode].reset();
            visualizers[currentMode].needsReset = false;
        }
        
        background(visualizers[currentMode].bgcolor);
        const spectrum = audioManager.getSpectrum();

        const bass = audioManager.getEnergy("bass");
        const lowMid = audioManager.getEnergy("lowMid");
        const mid = audioManager.getEnergy("mid");
        const highMid = audioManager.getEnergy("highMid");
        const treble = audioManager.getEnergy("treble");

        visualizers[currentMode].update(spectrum);

        // Solo actualizar el fondo si no estamos en modo dance o rainbow
        if (currentMode !== 'dance' && currentMode !== 'rainbow') {
            visualizers[currentMode].updateBackground(bass, treble);
        }
    }
    document.getElementById("songSelected").textContent = audioManager.getCurrentSongName();
}

function setMode(mode) {
    uiManager.setMode(mode);
} 