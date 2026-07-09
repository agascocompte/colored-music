class UIManager {
    constructor(audioManager) {
        this.audioManager = audioManager;
        this.currentMode = 'espiral';
    }

    setup() {
        this.populateSongList();
        this.setupSearch();
        this.updateModePills();
        this.showTab('library');
    }

    populateSongList() {
        const songList = document.getElementById("songList");
        songList.innerHTML = "";

        this.audioManager.songNames.forEach((songName, index) => {
            let li = document.createElement("li");
            li.textContent = songName.replace(/_/g, " ");
            li.title = songName.replace(/_/g, " ");
            li.classList.add("cursor-pointer", "hover:bg-slate-800", "px-3", "py-2", "rounded-lg", "transition", "truncate");

            if (index === this.audioManager.currentSong) {
                li.classList.add("text-blue-400", "font-semibold", "bg-slate-800/60");
            }

            li.onclick = () => this.selectSong(index);
            songList.appendChild(li);
        });
    }

    handleButtonPressed(num) {
        switch (num) {
            case 0: // Stop
                this.audioManager.stop();
                this.updatePlayState(false);
                break;
            case 1: // Play / Pause
                const isPaused = this.audioManager.play();
                this.updatePlayState(!isPaused);
                break;
            case 2: // Next
                this.audioManager.next();
                this.updatePlayState(true);
                this.highlightCurrentSong();
                break;
            case 3: // Previous
                this.audioManager.previous();
                this.updatePlayState(true);
                this.highlightCurrentSong();
                break;
        }

        document.getElementById("songSelected").textContent = this.audioManager.getCurrentSongName();
    }

    updatePlayState(isPlaying) {
        document.getElementById("play").classList.toggle("hidden", isPlaying);
        document.getElementById("pause").classList.toggle("hidden", !isPlaying);

        const eq = document.getElementById("eq");
        if (eq) eq.classList.toggle("paused", !isPlaying);
    }

    highlightCurrentSong() {
        let items = document.querySelectorAll("#songList li");
        items.forEach((li, index) => {
            if (index === this.audioManager.currentSong) {
                li.classList.add("text-blue-400", "font-semibold", "bg-slate-800/60");
            } else {
                li.classList.remove("text-blue-400", "font-semibold", "bg-slate-800/60");
            }
        });
    }

    selectSong(index) {
        this.audioManager.selectSong(index);
        document.getElementById("songSelected").textContent = this.audioManager.getCurrentSongName();
        this.updatePlayState(true);
        this.highlightCurrentSong();
    }

    setMode(mode) {
        this.currentMode = mode;
        this.updateModePills();
        // Marcar que se necesita reiniciar el visualizador Rainbow
        if (mode === 'rainbow') {
            visualizers[mode].needsReset = true;
        }
    }

    updateModePills() {
        document.querySelectorAll("#mode .mode-pill").forEach(pill => {
            pill.classList.toggle("active", pill.dataset.mode === this.currentMode);
        });
    }

    getCurrentMode() {
        return this.currentMode;
    }

    showTab(name) {
        const libraryPanel = document.getElementById("libraryPanel");
        const searchPanel = document.getElementById("searchPanel");
        const tabLibrary = document.getElementById("tabLibrary");
        const tabSearch = document.getElementById("tabSearch");

        const showLibrary = name === 'library';
        libraryPanel.classList.toggle("hidden", !showLibrary);
        searchPanel.classList.toggle("hidden", showLibrary);
        searchPanel.classList.toggle("flex", !showLibrary);
        tabLibrary.classList.toggle("active", showLibrary);
        tabSearch.classList.toggle("active", !showLibrary);

        if (!showLibrary) {
            document.getElementById("searchInput").focus();
        }
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
        resultsList.innerHTML = '<li class="p-2 text-slate-400">Searching...</li>';

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
            resultsList.innerHTML = '<li class="p-2 text-slate-400">No results found.</li>';
            return;
        }

        results.forEach((track) => {
            const li = document.createElement("li");
            li.classList.add("cursor-pointer", "hover:bg-slate-800", "px-2", "py-2", "rounded-lg", "transition", "flex", "items-center", "gap-3", "text-left");

            const artwork = document.createElement("img");
            artwork.src = track.artworkUrl60;
            artwork.alt = "";
            artwork.classList.add("w-10", "h-10", "rounded-md", "shrink-0");

            const info = document.createElement("div");
            info.classList.add("flex-1", "min-w-0");

            const title = document.createElement("div");
            title.textContent = track.trackName;
            title.classList.add("font-semibold", "truncate");

            const artist = document.createElement("div");
            artist.textContent = track.artistName;
            artist.classList.add("text-slate-400", "text-xs", "truncate");

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
