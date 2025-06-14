class UIManager {
    constructor(audioManager) {
        this.audioManager = audioManager;
        this.currentMode = 'espiral';
    }

    setup() {
        this.populateSongList();
        this.setupEventListeners();
    }

    populateSongList() {
        const songList = document.getElementById("songList");
        songList.innerHTML = "";

        this.audioManager.songNames.forEach((songName, index) => {
            let li = document.createElement("li");
            li.textContent = songName.replace(/_/g, " ");
            li.classList.add("cursor-pointer", "hover:bg-blue-500", "p-2", "rounded-md", "transition");

            if (index === this.audioManager.currentSong) {
                li.classList.add("text-green-400", "font-semibold");
            }

            li.onclick = () => this.selectSong(index);
            songList.appendChild(li);
        });
    }

    setupEventListeners() {
        // Primero removemos los event listeners existentes
        const playButton = document.getElementById("play");
        const pauseButton = document.getElementById("pause");
        const stopButton = document.getElementById("stop");
        const nextButton = document.getElementById("next");
        const prevButton = document.getElementById("previous");

        // Verificamos que todos los botones existan
        if (!playButton || !pauseButton || !stopButton || !nextButton || !prevButton) {
            console.warn("Algunos botones no están disponibles en el DOM");
            return;
        }

        // Clonamos los botones para remover todos los event listeners
        const newPlayButton = playButton.cloneNode(true);
        const newPauseButton = pauseButton.cloneNode(true);
        const newStopButton = stopButton.cloneNode(true);
        const newNextButton = nextButton.cloneNode(true);
        const newPrevButton = prevButton.cloneNode(true);

        // Reemplazamos los botones viejos con los nuevos
        playButton.parentNode.replaceChild(newPlayButton, playButton);
        pauseButton.parentNode.replaceChild(newPauseButton, pauseButton);
        stopButton.parentNode.replaceChild(newStopButton, stopButton);
        nextButton.parentNode.replaceChild(newNextButton, nextButton);
        prevButton.parentNode.replaceChild(newPrevButton, prevButton);

        // Añadimos los nuevos event listeners
        newPlayButton.addEventListener("click", () => this.handleButtonPressed(1));
        newPauseButton.addEventListener("click", () => this.handleButtonPressed(1));
        newStopButton.addEventListener("click", () => this.handleButtonPressed(0));
        newNextButton.addEventListener("click", () => this.handleButtonPressed(2));
        newPrevButton.addEventListener("click", () => this.handleButtonPressed(3));
    }

    handleButtonPressed(num) {
        const playButton = document.getElementById("play");
        const pauseButton = document.getElementById("pause");

        switch (num) {
            case 0: // Stop
                this.audioManager.stop();
                playButton.classList.remove("hidden");
                pauseButton.classList.add("hidden");
                break;
            case 1: // Play / Pause
                const isPaused = this.audioManager.play();
                if (isPaused) {
                    playButton.classList.remove("hidden");
                    pauseButton.classList.add("hidden");
                } else {
                    playButton.classList.add("hidden");
                    pauseButton.classList.remove("hidden");
                }
                break;
            case 2: // Next
                this.audioManager.next();
                playButton.classList.add("hidden");
                pauseButton.classList.remove("hidden");
                this.highlightCurrentSong();
                break;
            case 3: // Previous
                this.audioManager.previous();
                playButton.classList.add("hidden");
                pauseButton.classList.remove("hidden");
                this.highlightCurrentSong();
                break;
        }

        document.getElementById("songSelected").textContent = this.audioManager.getCurrentSongName();
    }

    highlightCurrentSong() {
        let items = document.querySelectorAll("#songList li");
        items.forEach((li, index) => {
            if (index === this.audioManager.currentSong) {
                li.classList.add("text-green-400", "font-semibold");
            } else {
                li.classList.remove("text-green-400", "font-semibold");
            }
        });
    }

    selectSong(index) {
        this.audioManager.selectSong(index);
        document.getElementById("songSelected").textContent = this.audioManager.getCurrentSongName();
        document.getElementById("pause").classList.remove("hidden");
        document.getElementById("play").classList.add("hidden");
        this.highlightCurrentSong();
    }

    setMode(mode) {
        this.currentMode = mode;
    }

    getCurrentMode() {
        return this.currentMode;
    }

    handleFileUpload(event) {
        const files = event.target.files;
        if (!files.length) return;

        for (let i = 0; i < files.length; i++) {
            try {
                this.audioManager.addNewSong(files[i]);
            } catch (error) {
                alert(error.message);
            }
        }

        this.populateSongList();
    }
} 