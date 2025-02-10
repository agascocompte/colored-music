var sound = [];
var songNames = ["RiseUp", "Yellow", "SomethingJustLikeThis", "Faded", "Shots", "Skrillex", "Thunder", "WhateverItTakes", "MedievalGamerVoice"];
var WIDTH = 500;
var HEIGHT = 500;
var bgcolor = [0,0,0];
var maxAmp = 0;
var paused = false;
var song = 0;
var maxSongs = 0;
var spectrum;
var modo = 'espiral';

function preload () {  	
  	sound [0] = loadSound("sounds/" + songNames[0] + ".mp3");
  	sound [1] = loadSound("sounds/" + songNames[1] + ".mp3");
  	sound [2] = loadSound("sounds/" + songNames[2] + ".mp3");
  	sound [3] = loadSound("sounds/" + songNames[3] + ".mp3");
  	sound [4] = loadSound("sounds/" + songNames[4] + ".mp3");
  	sound [5] = loadSound("sounds/" + songNames[5] + ".mp3");
  	sound [6] = loadSound("sounds/" + songNames[6] + ".mp3");
  	sound [7] = loadSound("sounds/" + songNames[7] + ".mp3");
  	sound [8] = loadSound("sounds/" + songNames[8] + ".mp3");
  		
  	maxSongs = sound.length;
}

function setup() {
    canvas = createCanvas(WIDTH, HEIGHT);
    canvas.parent("canvas"); 
    canvas.style("display", "block"); 
    canvas.style("margin", "25 auto"); 
	fft = new p5.FFT(0.9);
	amplitude = new p5.Amplitude();	
}


function draw () {
	if (!paused) {
	  	background(bgcolor);  
	  	spectrum = fft.analyze();

	  	var bass = fft.getEnergy("bass");
	  	var lowMid = fft.getEnergy("lowMid");
	  	var mid = fft.getEnergy("mid");
	  	var highMid = fft.getEnergy("highMid");
	  	var treble = fft.getEnergy("treble");

	  	var forte = 0;

	  	switch (modo) {
	  		case 'espiral': espiral();
	  						break;
			case 'verticales': lineasVerticales();
								break;
			case 'circulos': circulos();
							break;
	  	}
	  		
	  	bgcolor = [bass - 25, treble, 255]; //fondo azul - morado
	 }  	
  	document.getElementById("songSelected").textContent = songNames[song];
}

function handleButtonPressed(num) {
    const playButton = document.getElementById("play");
    const pauseButton = document.getElementById("pause");

    if (num === 0) { // Stop
        sound[song].stop();
        paused = false;
        playButton.classList.remove("hidden");
        pauseButton.classList.add("hidden");
    } else if (num === 1) { // Play / Pause toggle
        if (sound[song].isPlaying()) {
            sound[song].pause();
            paused = true;
            playButton.classList.remove("hidden");
            pauseButton.classList.add("hidden");
        } else {
            sound[song].play();
            paused = false;
            playButton.classList.add("hidden");
            pauseButton.classList.remove("hidden");
        }
    } else if (num === 2) { // Next
        sound[song].stop();
        if (song < maxSongs - 1) song++;
        sound[song].play();
		paused = false;
		playButton.classList.add("hidden");
		pauseButton.classList.remove("hidden");
    } else { // Previous
        sound[song].stop();
        if (song > 0) song--;
        sound[song].play();
		paused = false;
		playButton.classList.add("hidden");
		pauseButton.classList.remove("hidden");
    }
}


function setMode(string) {
	modo = string;
}

function espiral() {  	
  	var newSpectrum = [];
  	for (var i = 0; i < spectrum.length; i = i + 2) {
  		newSpectrum.push((spectrum[i] + spectrum[i + 1]) / 2);
  	} 

	var newSpectrum2 = [];
  	for (var i = 0; i < newSpectrum.length; i = i + 2) {
  		newSpectrum2.push((newSpectrum[i] + newSpectrum[i + 1]) / 2);
  	}

  	var newSpectrum3 = [];
  	for (var i = 0; i < newSpectrum2.length; i = i + 2) {
  		newSpectrum3.push((newSpectrum2[i] + newSpectrum2[i + 1]) / 2);
  	}   	

  	var X = 11;
  	var Y = 10;
	var x = 0;
	var y = 0;
    var dx = 0;
    var dy = -1;

    for (var i = 0; i < Math.max(X,Y) ** 2; i++) {	    
        if ((-X/2 < x <= X/2) && (-Y/2 < y <= Y/2)) {            
            var radius = map(newSpectrum3[Math.abs(x * y * 5)], 100 , 300, 10, 60); 
			var color = map(newSpectrum3[Math.abs(x * y * 5)], 0 , 250, 0, 255);

			if (Math.abs(y) - 2 < 0 && Math.abs(x) - 2 < 0) {
				stroke(255 - ((x * y) * 3), 255 - color, 200);
				fill(255 - ((x * y) * 3), 255 - color, 200); //magenta
			}
			else if (Math.abs(y) - 3 < 0 && Math.abs(x) - 3 < 0){
				stroke(255 - ((x * y) * 3), 255 - color, 255 - color);
				fill(255 - ((x * y) * 3), 255 - color, 255 - color);//rojo
			}		
			else if (Math.abs(y) - 4 < 0 && Math.abs(x) - 4 < 0){
				stroke(255 - ((x * y) * 3), 255, 255 - color);
				fill(255 - ((x * y) * 3), 255, 255 - color);//amarillo	
			}
			else {
				stroke(255 - color, 255 - ((x * y) * 3), 0);
				fill(255 - color, 255 - ((x * y) * 3), 0);//verde
			}	
	  		ellipse((x * 50)  + (WIDTH / 2) , (y * 50) + (HEIGHT / 2), radius, radius);		  		
        }
        if (x == y || (x < 0 && x == -y) || (x > 0 && x == 1-y)) {
        	var aux = dx;
            dx = -dy;
        	dy = aux;
        }
        x = x + dx;
        y = y + dy;	  		
  	}
}

function circulos() {
	stroke(0);
  	var x = 0;
  	var y = 50;
  	var todosDibujados = false;
  	for (var i = 0; i < spectrum.length; i++) {	  		
  		var radius = map(spectrum[i], 0 , 255, 0, 50);
  		var color = map(spectrum[i], 0 , 255, 0, x);
		if (x == WIDTH - 50 && y == HEIGHT - 50) todosDibujados = true;

  		if (!todosDibujados) {
	  		if (x == WIDTH - 50) {	  			
	  			x = 50;
	  			y = y + 50;		  			
	  		}
	  		else 
	  			x = x + 50; 
	  	}
	  	else x = WIDTH + (radius * 4);

	  	if (spectrum[i] > 150 && spectrum < 200)
  			fill(255, 255 - color, 255 - color);
  		else if (spectrum[i] > 200)
  			fill(255, color, 255 - color);
  		else
  			fill(255, 255 - color, 255);
  		ellipse(x, y, radius, radius);			  		  	
  	}
}

function lineasVerticales() {
  	for (var i = 0; i < spectrum.length; i++) {
  		var h = map(spectrum[i], 0 , 255, 0, HEIGHT);  		 		
  		stroke(255 - h, 255 - h, 255);
  		line(i, HEIGHT, i, HEIGHT - h);
  		
  	}
}



