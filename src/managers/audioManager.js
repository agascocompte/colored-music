class AudioManager {
    constructor() {
        this.sound = [];
        this.songNames = ["RiseUp", "Yellow", "SomethingJustLikeThis", "Shots", "Thunder", "WhateverItTakes", "MedievalGamerVoice"];
        this.maxSongs = 0;
        this.currentSong = 0;
        this.paused = false;
        this.fft = null;
        this.amplitude = null;
    }

    preload() {
        for (let i = 0; i < this.songNames.length; i++) {
            this.sound[i] = loadSound("sounds/" + this.songNames[i] + ".mp3");
        }
        this.maxSongs = this.sound.length;
    }

    setup() {
        this.fft = new p5.FFT(0.9);
        this.amplitude = new p5.Amplitude();
    }

    getSpectrum() {
        return this.fft.analyze();
    }

    getEnergy(band) {
        return this.fft.getEnergy(band);
    }

    _ensureAudioRunning() {
        // iOS mantiene el AudioContext suspendido hasta que un gesto del
        // usuario lo reanuda explícitamente; sin esto no suena en iPhone
        if (typeof getAudioContext !== 'function') return;
        const ctx = getAudioContext();
        if (ctx && ctx.state !== 'running') {
            if (typeof userStartAudio === 'function') {
                userStartAudio();
            } else {
                ctx.resume();
            }
        }
        this._startSilentKeepAlive();
    }

    _startSilentKeepAlive() {
        // En iOS, Web Audio se considera sonido "ambiente" y el interruptor de
        // silencio lo enmudece. Mantener un <audio> reproduciéndose (aunque sea
        // silencio) pasa la sesión a modo "playback", que ignora el interruptor,
        // igual que hacen los vídeos de Twitter o YouTube.
        if (this._silentAudio) return;

        const ua = navigator.userAgent;
        const isIOS = /iPad|iPhone|iPod/.test(ua) || (ua.includes('Mac') && 'ontouchend' in document);
        if (!isIOS) return;

        const audio = document.createElement('audio');
        audio.setAttribute('playsinline', '');
        audio.loop = true;
        audio.src = this._silentWavDataUri();
        const playPromise = audio.play();
        if (playPromise) playPromise.catch(() => {});
        this._silentAudio = audio;
    }

    _silentWavDataUri() {
        // Genera 1 segundo de silencio en formato WAV (PCM 16 bits, mono, 8 kHz)
        const sampleRate = 8000;
        const numSamples = sampleRate;
        const buffer = new ArrayBuffer(44 + numSamples * 2);
        const view = new DataView(buffer);
        const writeStr = (offset, str) => {
            for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
        };

        writeStr(0, 'RIFF');
        view.setUint32(4, 36 + numSamples * 2, true);
        writeStr(8, 'WAVE');
        writeStr(12, 'fmt ');
        view.setUint32(16, 16, true);
        view.setUint16(20, 1, true);
        view.setUint16(22, 1, true);
        view.setUint32(24, sampleRate, true);
        view.setUint32(28, sampleRate * 2, true);
        view.setUint16(32, 2, true);
        view.setUint16(34, 16, true);
        writeStr(36, 'data');
        view.setUint32(40, numSamples * 2, true);
        // Las muestras ya son cero: silencio puro

        const bytes = new Uint8Array(buffer);
        let binary = '';
        for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
        return 'data:audio/wav;base64,' + btoa(binary);
    }

    play() {
        this._ensureAudioRunning();
        if (this.sound[this.currentSong].isPlaying()) {
            this.sound[this.currentSong].pause();
            this.paused = true;
        } else {
            this.sound[this.currentSong].play();
            this.paused = false;
        }
        return this.paused;
    }

    stop() {
        this.sound[this.currentSong].stop();
        this.paused = false;
    }

    next() {
        this._ensureAudioRunning();
        this.sound[this.currentSong].stop();
        if (this.currentSong < this.maxSongs - 1) {
            this.currentSong++;
        }
        this.sound[this.currentSong].play();
        this.paused = false;
    }

    previous() {
        this._ensureAudioRunning();
        this.sound[this.currentSong].stop();
        if (this.currentSong > 0) {
            this.currentSong--;
        }
        this.sound[this.currentSong].play();
        this.paused = false;
    }

    selectSong(index) {
        this._ensureAudioRunning();
        if (index >= 0 && index < this.songNames.length) {
            this.sound[this.currentSong].stop();
            this.currentSong = index;
            this.sound[this.currentSong].play();
            this.paused = false;
        }
    }

    addNewSong(file) {
        if (!file.name.endsWith(".mp3")) {
            throw new Error(`"${file.name}" is not a valid MP3 file.`);
        }

        const songName = file.name.replace(".mp3", "");

        // p5 1.x acepta objetos File directamente, sin necesidad de object URL
        this.sound.push(loadSound(file));
        this.songNames.push(songName);
        this.maxSongs = this.sound.length;
    }

    addRemoteSong(displayName, url, onReady, onError) {
        loadSound(url,
            (loadedSound) => {
                this.sound.push(loadedSound);
                this.songNames.push(displayName);
                this.maxSongs = this.sound.length;
                onReady(this.sound.length - 1);
            },
            (error) => {
                if (onError) onError(error);
            }
        );
    }

    getCurrentSongName() {
        return this.songNames[this.currentSong];
    }

    isPaused() {
        return this.paused;
    }
} 