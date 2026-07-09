class UIManager {
    constructor(audioManager) {
        this.audioManager = audioManager;
        this.currentMode = 'espiral';
    }

    setup() {
        this.populateSongList();
        this.setupEventListeners();
        this.setupSearch();
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
        // Marcar que se necesita reiniciar el visualizador Rainbow
        if (mode === 'rainbow') {
            visualizers[mode].needsReset = true;
        }
    }

    getCurrentMode() {
        return this.currentMode;
    }

    setupSearch() {
        const input = document.getElementById("searchInput");
        const button = document.getElementById("searchButton");

        if (!input || !button) {
            console.warn("Los elementos de búsqueda no están disponibles en el DOM");
            return;
        }

        button.addEventListener("click", () => this.searchSongs());
        input.addEventListener("keydown", (event) => {
            if (event.key === "Enter") this.searchSongs();
        });
    }

    async searchSongs() {
        const query = document.getElementById("searchInput").value.trim();
        const resultsList = document.getElementById("searchResults");
        if (!query) return;

        resultsList.classList.remove("hidden");
        resultsList.innerHTML = '<li class="p-2 text-gray-400">Searching...</li>';

        try {
            const response = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(query)}&media=music&entity=song&limit=10`);
            const data = await response.json();
            this.renderSearchResults(data.results.filter(track => track.previewUrl));
        } catch (error) {
            resultsList.innerHTML = '<li class="p-2 text-red-400">Search failed. Please try again.</li>';
        }
    }

    renderSearchResults(results) {
        const resultsList = document.getElementById("searchResults");
        resultsList.innerHTML = "";

        if (!results.length) {
            resultsList.innerHTML = '<li class="p-2 text-gray-400">No results found.</li>';
            return;
        }

        results.forEach((track) => {
            const li = document.createElement("li");
            li.classList.add("cursor-pointer", "hover:bg-blue-500", "p-2", "rounded-md", "transition", "flex", "items-center", "gap-3", "text-left");

            const artwork = document.createElement("img");
            artwork.src = track.artworkUrl60;
            artwork.alt = "";
            artwork.classList.add("w-10", "h-10", "rounded");

            const info = document.createElement("div");
            info.classList.add("flex-1", "min-w-0");

            const title = document.createElement("div");
            title.textContent = track.trackName;
            title.classList.add("font-semibold", "truncate");

            const artist = document.createElement("div");
            artist.textContent = track.artistName;
            artist.classList.add("text-gray-400", "text-xs", "truncate");

            info.appendChild(title);
            info.appendChild(artist);
            li.appendChild(artwork);
            li.appendChild(info);
            li.onclick = () => this.playSearchResult(track, li);
            resultsList.appendChild(li);
        });
    }

    playSearchResult(track, li) {
        const displayName = `${track.trackName} - ${track.artistName}`;

        // Si la canción ya está en la lista, solo la seleccionamos
        const existingIndex = this.audioManager.songNames.indexOf(displayName);
        if (existingIndex !== -1) {
            this.selectSong(existingIndex);
            return;
        }

        li.classList.add("opacity-50", "pointer-events-none");
        this.audioManager.addRemoteSong(displayName, track.previewUrl,
            (index) => {
                li.classList.remove("opacity-50", "pointer-events-none");
                this.populateSongList();
                this.selectSong(index);
            },
            () => {
                li.classList.remove("opacity-50", "pointer-events-none");
                alert(`Could not load the preview for "${track.trackName}".`);
            }
        );
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