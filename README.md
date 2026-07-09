# Colored Music

## Overview

**Colored Music** is a web-based music visualizer that creates dynamic and colorful animations synchronized with the audio playback. This project utilizes the **p5.js** library to generate visual effects based on frequency analysis of the audio spectrum. Users can search for any song, play, pause, stop, and switch between different visualization modes.

## Features

- 🎵 Play, pause, stop, and switch between songs.
- 🔍 Search any song and visualize its 30-second preview via the iTunes Search API.
- 🎨 Six visualization modes: Spiral, Nebula, Pulse, Aurora, Rainbow and Flying Mesh.
- 🎶 Supports loading custom MP3 files.
- 📜 Library with a scrollable and interactive song list.
- 🔥 Dynamic, beat-reactive colors driven by the frequency spectrum.

## Technologies Used

- **HTML, CSS, JavaScript** – for structuring and styling.
- **p5.js v1.11 + p5.sound** – for audio analysis (FFT) and visualization.
- **Tailwind CSS** – for UI styling.
- **iTunes Search API** – for song search and audio previews.

## Setup Instructions

### Prerequisites

Ensure you have a modern web browser with JavaScript enabled.

### Steps

1. Clone this repository:
   ```sh
   git clone https://github.com/yourusername/colored-music.git
   ```
2. Navigate to the project folder:
   ```sh
   cd colored-music
   ```
3. Serve the folder with any static server (e.g. the VS Code *Live Server* extension) and open it in your browser.

## Usage

1. Click the **Play** button to start a song.
2. Use the **Previous** and **Next** buttons to switch tracks.
3. Click **Stop** to halt the music.
4. Use the visualization mode pills above the canvas to change effects.
5. Add your own songs from the **Library** tab (`＋ Add local MP3`).
6. Find any song from the **Search** tab — results play a 30-second iTunes preview and are added to your library.

## Visualization Modes

- **🌀 Spiral** – Colored circles pulsing along a spiral grid.
- **🌌 Nebula** – A living spiral galaxy: orbiting comet particles tied to frequency bands, a bass-driven core and beat shockwaves.
- **📊 Pulse** – A modern equalizer: rounded gradient bars with falling peak caps, glass-floor reflections and a glowing horizon.
- **🌠 Aurora** – Northern lights over a mountain ridge: five frequency-driven light curtains, twinkling stars and beat-triggered shooting stars.
- **🌈 Rainbow** – A shimmering rainbow arch over a twilight sky: each color arc dances to its own frequency band, with beat-driven light glints sweeping across it.
- **✨ Flying Mesh** – A rotating neon lattice warped by the music, pulsing with the bass and rippling with light waves on every beat.

## License

This project is licensed under the MIT License.

## Acknowledgments

- **p5.js** for providing a powerful framework for creative coding.
- **Tailwind CSS** for styling the user interface effortlessly.

---

Enjoy making music come to life with **Colored Music**! 🎶✨
