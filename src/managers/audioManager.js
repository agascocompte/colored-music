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