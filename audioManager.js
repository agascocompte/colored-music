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

    play() {
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
        this.sound[this.currentSong].stop();
        if (this.currentSong < this.maxSongs - 1) {
            this.currentSong++;
        }
        this.sound[this.currentSong].play();
        this.paused = false;
    }

    previous() {
        this.sound[this.currentSong].stop();
        if (this.currentSong > 0) {
            this.currentSong--;
        }
        this.sound[this.currentSong].play();
        this.paused = false;
    }

    selectSong(index) {
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

        const objectURL = URL.createObjectURL(file);
        const songName = file.name.replace(".mp3", "");

        this.sound.push(loadSound(objectURL));
        this.songNames.push(songName);
        this.maxSongs = this.sound.length;
    }

    getCurrentSongName() {
        return this.songNames[this.currentSong];
    }

    isPaused() {
        return this.paused;
    }
} 