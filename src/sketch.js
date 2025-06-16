const WIDTH = 500;
const HEIGHT = 500;

let audioManager;
let visualizers;
let uiManager;
let canvas2D, canvas3D;
let currentCanvasMode = '2d';
let isChangingMode = false;

function preload() {
    audioManager = new AudioManager();
    audioManager.preload();
}

function recreateCanvas() {
    if (window.canvas) {
        window.canvas.remove();
    }
    window.canvas = createCanvas(WIDTH, HEIGHT, P2D);
    window.canvas.parent("canvas");
    window.canvas.style("display", "block");
    window.canvas.style("margin", "25 auto");
    isChangingMode = false;
}

function setup() {
    recreateCanvas();
    audioManager.setup();
    visualizers = {
        espiral: new SpiralVisualizer(WIDTH, HEIGHT),
        verticales: new VerticalLinesVisualizer(WIDTH, HEIGHT),
        circulos: new CirclesVisualizer(WIDTH, HEIGHT),
        dance: new DanceVisualizer(WIDTH, HEIGHT),
        rainbow: new RainbowVisualizer(WIDTH, HEIGHT),
        flyingmesh: new FlyingMeshVisualizer(WIDTH, HEIGHT)
    };
    uiManager = new UIManager(audioManager);
    uiManager.setup();
}

let lastMode = null;

function draw() {
    if (!audioManager.isPaused()) {
        const currentMode = uiManager.getCurrentMode();
        
        if (currentMode === 'flyingmesh') {
            clear();
            background(0);
            visualizers[currentMode].update(audioManager.getSpectrum());
        } else {
            clear();
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
            if (currentMode !== 'dance' && currentMode !== 'rainbow') {
                visualizers[currentMode].updateBackground(bass, treble);
            }
        }
    }
    document.getElementById("songSelected").textContent = audioManager.getCurrentSongName();
}

function setMode(mode) {
    uiManager.setMode(mode);
} 