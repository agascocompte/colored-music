class DanceVisualizer extends BaseVisualizer {
    constructor(width, height) {
        super(width, height);
        this.dancers = [];
        this.maxDancers = 5;
        this.staffLines = 5;
        this.staffSpacing = 80;
        this.dancerSpacing = 80;
        this.musicNotes = [];
        this.maxNotes = 5;
        this.lastNoteTime = 0;
        this.noteInterval = 2000;
        this.backgroundElements = [];
        this.particles = [];
        this.maxParticles = 30;
        this.energyWaves = [];
        
        this.danceMoves = [
            this._createDanceMove1,
            this._createDanceMove2,
            this._createDanceMove3,
            this._createDanceMove4
        ];

        this._initializeDancers();
        this._initializeBackgroundElements();
    }

    _initializeDancers() {
        const dancerColors = [
            color(255, 0, 0),     // Rojo
            color(255, 127, 0),   // Naranja
            color(255, 255, 0),   // Amarillo
            color(0, 255, 0),     // Verde
            color(0, 0, 255)      // Azul
        ];

        const frequencyTypes = ['bass', 'lowMid', 'mid', 'highMid', 'treble'];

        for (let i = 0; i < this.staffLines; i++) {
            this.dancers.push({
                x: random(this.WIDTH * 0.2, this.WIDTH * 0.8),
                y: this.HEIGHT * 0.5,
                size: random(1.5, 2.0),
                moveIndex: floor(random(this.danceMoves.length)),
                phase: random(TWO_PI),
                color: dancerColors[i % dancerColors.length],
                targetLine: i,
                currentLine: i,
                moveSpeed: random(0.02, 0.05),
                glow: 0,
                frequencyType: frequencyTypes[i % frequencyTypes.length],
                lastEnergy: 0,
                energyThreshold: 50 + i * 20,
                baseX: this.WIDTH / 2,
                amplitude: 200,
                frequency: 0.5 + i * 0.1
            });
        }
    }

    _initializeBackgroundElements() {
        for (let i = 0; i < 20; i++) {
            this.backgroundElements.push({
                x: random(this.WIDTH),
                y: random(this.HEIGHT),
                size: random(20, 100),
                speed: random(0.5, 2),
                angle: random(TWO_PI),
                color: color(
                    random(100, 255),
                    random(100, 255),
                    random(100, 255),
                    50
                )
            });
        }
    }

    update(spectrum) {
        this.time += 0.05;
        
        const bass = this._getAverageEnergy(spectrum, 0, 10);
        const lowMid = this._getAverageEnergy(spectrum, 10, 50);
        const mid = this._getAverageEnergy(spectrum, 50, 100);
        const highMid = this._getAverageEnergy(spectrum, 100, 200);
        const treble = this._getAverageEnergy(spectrum, 200, 255);
        
        const energy = (bass + lowMid + mid + highMid + treble) / 5;
        
        this._updateBackground(energy, bass, mid, treble);
        this._drawStaff(energy);
        this._updateBackgroundElements(energy);
        this._updateDancers(energy, bass, lowMid, mid, highMid, treble);
        this._updateMusicNotes();
        this._updateEnergyWaves(energy, bass, mid, treble);
        this._updateParticles();
    }

    _createDanceMove1(t, energy, bass, mid, treble) {
        return {
            head: { 
                x: 0, 
                y: -30 + sin(t * 2) * map(bass, 0, 255, 2, 8)
            },
            leftArm: { 
                x: -20, 
                y: -20 + sin(t * 3) * map(mid, 0, 255, 10, 25)
            },
            rightArm: { 
                x: 20, 
                y: -20 + sin(t * 3 + PI) * map(mid, 0, 255, 10, 25)
            },
            leftLeg: { 
                x: -10, 
                y: 20 + sin(t * 2) * map(bass, 0, 255, 15, 30)
            },
            rightLeg: { 
                x: 10, 
                y: 20 + sin(t * 2 + PI) * map(bass, 0, 255, 15, 30)
            }
        };
    }

    _createDanceMove2(t, energy, bass, mid, treble) {
        return {
            head: { 
                x: 0, 
                y: -30 + cos(t * 2) * map(treble, 0, 255, 3, 10)
            },
            leftArm: { 
                x: -25 + sin(t * 4) * map(mid, 0, 255, 5, 20), 
                y: -20
            },
            rightArm: { 
                x: 25 + sin(t * 4 + PI) * map(mid, 0, 255, 5, 20), 
                y: -20
            },
            leftLeg: { 
                x: -15, 
                y: 20 + cos(t * 3) * map(bass, 0, 255, 20, 35)
            },
            rightLeg: { 
                x: 15, 
                y: 20 + cos(t * 3 + PI) * map(bass, 0, 255, 20, 35)
            }
        };
    }

    _createDanceMove3(t, energy, bass, mid, treble) {
        return {
            head: { 
                x: sin(t) * map(treble, 0, 255, 3, 8), 
                y: -30
            },
            leftArm: { 
                x: -20, 
                y: -20 + cos(t * 2) * map(mid, 0, 255, 15, 30)
            },
            rightArm: { 
                x: 20, 
                y: -20 + cos(t * 2 + PI) * map(mid, 0, 255, 15, 30)
            },
            leftLeg: { 
                x: -10 + sin(t * 3) * map(bass, 0, 255, 5, 15), 
                y: 20
            },
            rightLeg: { 
                x: 10 + sin(t * 3 + PI) * map(bass, 0, 255, 5, 15), 
                y: 20
            }
        };
    }

    _createDanceMove4(t, energy, bass, mid, treble) {
        return {
            head: { 
                x: 0, 
                y: -30 + sin(t * 3) * map(treble, 0, 255, 5, 12)
            },
            leftArm: { 
                x: -25 + cos(t * 2) * map(mid, 0, 255, 10, 25), 
                y: -20 + sin(t * 2) * map(mid, 0, 255, 10, 25)
            },
            rightArm: { 
                x: 25 + cos(t * 2 + PI) * map(mid, 0, 255, 10, 25), 
                y: -20 + sin(t * 2 + PI) * map(mid, 0, 255, 10, 25)
            },
            leftLeg: { 
                x: -15 + sin(t * 4) * map(bass, 0, 255, 10, 25), 
                y: 20 + cos(t * 4) * map(bass, 0, 255, 10, 25)
            },
            rightLeg: { 
                x: 15 + sin(t * 4 + PI) * map(bass, 0, 255, 10, 25), 
                y: 20 + cos(t * 4 + PI) * map(bass, 0, 255, 10, 25)
            }
        };
    }

    _updateBackground(energy, bass, mid, treble) {
        push();
        noStroke();
        
        // Crear un gradiente más vibrante y colorido
        for (let y = 0; y < this.HEIGHT; y += 2) {
            const inter = map(y, 0, this.HEIGHT, 0, 1);
            
            // Colores más vibrantes basados en las frecuencias
            const c1 = color(
                map(bass, 0, 255, 50, 150),    // Más rojo en los bajos
                map(mid, 0, 255, 50, 150),     // Más verde en los medios
                map(treble, 0, 255, 100, 200)  // Más azul en los agudos
            );
            
            const c2 = color(
                map(bass, 0, 255, 100, 200),   // Más rojo en los bajos
                map(mid, 0, 255, 100, 200),    // Más verde en los medios
                map(treble, 0, 255, 150, 255)  // Más azul en los agudos
            );
            
            // Interpolar entre los colores
            const c = lerpColor(c1, c2, inter);
            
            // Añadir variación basada en la energía
            const energyVariation = sin(y * 0.02 + this.time) * map(energy, 0, 255, 0, 30);
            const r = red(c) + energyVariation;
            const g = green(c) + energyVariation;
            const b = blue(c) + energyVariation;
            
            stroke(r, g, b);
            line(0, y, this.WIDTH, y);
        }
        pop();
    }

    _drawStaff(energy) {
        push();
        const staffGlow = map(energy, 0, 255, 100, 200);
        stroke(255, staffGlow);
        strokeWeight(3);
        
        const startY = this.HEIGHT * 0.3;
        for (let i = 0; i < this.staffLines; i++) {
            const y = startY + i * this.staffSpacing;
            beginShape();
            for (let x = 0; x < this.WIDTH; x += 10) {
                const wave = sin(x * 0.02 + this.time) * map(energy, 0, 255, 0, 10);
                vertex(x, y + wave);
            }
            endShape();
        }

        push();
        fill(255, staffGlow);
        noStroke();
        textSize(60);
        text('𝄞', 50, startY + this.staffSpacing * 2);
        pop();
        pop();
    }

    _updateBackgroundElements(energy) {
        for (let element of this.backgroundElements) {
            element.angle += element.speed * 0.01;
            element.x += cos(element.angle) * element.speed;
            element.y += sin(element.angle) * element.speed;
            
            if (element.x < -element.size) element.x = this.WIDTH + element.size;
            if (element.x > this.WIDTH + element.size) element.x = -element.size;
            if (element.y < -element.size) element.y = this.HEIGHT + element.size;
            if (element.y > this.HEIGHT + element.size) element.y = -element.size;
            
            push();
            noStroke();
            fill(element.color);
            ellipse(element.x, element.y, element.size);
            pop();
        }
    }

    _updateDancers(energy, bass, lowMid, mid, highMid, treble) {
        for (let i = 0; i < this.dancers.length; i++) {
            const dancer = this.dancers[i];
            this._updateDancerPosition(dancer, energy, bass, lowMid, mid, highMid, treble);

            const move = this.danceMoves[dancer.moveIndex](
                this.time + dancer.phase,
                energy,
                bass,
                mid,
                treble
            );

            this._drawDancer(
                dancer.x,
                dancer.y,
                move,
                dancer.size,
                dancer.color,
                energy
            );
        }
    }

    _updateDancerPosition(dancer, energy, bass, lowMid, mid, highMid, treble) {
        let dancerEnergy;
        switch(dancer.frequencyType) {
            case 'bass': dancerEnergy = bass; break;
            case 'lowMid': dancerEnergy = lowMid; break;
            case 'mid': dancerEnergy = mid; break;
            case 'highMid': dancerEnergy = highMid; break;
            case 'treble': dancerEnergy = treble; break;
            default: dancerEnergy = energy;
        }

        const energyChange = Math.abs(dancerEnergy - dancer.lastEnergy);
        dancer.lastEnergy = dancerEnergy;

        if (energyChange > dancer.energyThreshold && random() < 0.2) {
            const otherDancer = this.dancers.find(d => 
                d !== dancer && 
                Math.abs(d.y - dancer.y) < this.staffSpacing * 3
            );
            
            if (otherDancer) {
                const tempLine = dancer.targetLine;
                dancer.targetLine = otherDancer.targetLine;
                otherDancer.targetLine = tempLine;
                
                dancer.glow = 255;
                otherDancer.glow = 255;

                for (let i = 0; i < 10; i++) {
                    this.particles.push({
                        x: (dancer.x + otherDancer.x) / 2,
                        y: (dancer.y + otherDancer.y) / 2,
                        vx: random(-3, 3),
                        vy: random(-3, 3),
                        life: 255,
                        color: lerpColor(dancer.color, otherDancer.color, 0.5)
                    });
                }
            }
        }

        const targetY = this._getNotePosition(dancer.targetLine);
        const verticalSpeed = map(dancerEnergy, 0, 255, 0.1, 0.3);
        dancer.y = lerp(dancer.y, targetY, verticalSpeed);

        const musicVariation = sin(this.time * dancer.frequency) * map(dancerEnergy, 0, 255, 0, 1);
        const targetX = dancer.baseX + musicVariation * dancer.amplitude;
        
        dancer.amplitude = map(dancerEnergy, 0, 255, 100, 300);
        
        const horizontalSpeed = map(dancerEnergy, 0, 255, 0.05, 0.2);
        dancer.x = lerp(dancer.x, targetX, horizontalSpeed);

        const sizeVariation = map(dancerEnergy, 0, 255, 0.8, 1.5);
        dancer.size = lerp(dancer.size, sizeVariation, 0.1);

        const r = map(dancerEnergy, 0, 255, 150, 255);
        const g = map(dancerEnergy, 0, 255, 150, 255);
        const b = map(dancerEnergy, 0, 255, 150, 255);
        dancer.color = lerpColor(dancer.color, color(r, g, b), 0.1);

        dancer.glow = lerp(dancer.glow, 0, 0.1);
    }

    _getNotePosition(line) {
        const startY = this.HEIGHT * 0.3;
        return startY + line * this.staffSpacing;
    }

    _drawDancer(x, y, move, size, color, energy) {
        push();
        translate(x, y);
        scale(size);
        
        const glow = map(energy, 0, 255, 50, 200);
        
        for (let i = 0; i < 5; i++) {
            const alpha = map(i, 0, 5, 50, 0);
            push();
            noStroke();
            fill(red(color), green(color), blue(color), alpha);
            ellipse(0, 0, 40 - i * 5);
            pop();
        }

        push();
        noStroke();
        fill(red(color), green(color), blue(color), glow);
        
        beginShape();
        vertex(move.leftArm.x, move.leftArm.y);
        vertex(move.head.x, move.head.y);
        vertex(move.rightArm.x, move.rightArm.y);
        vertex(0, 0);
        endShape(CLOSE);

        beginShape();
        vertex(0, 0);
        vertex(move.leftLeg.x, move.leftLeg.y);
        vertex(move.rightLeg.x, move.rightLeg.y);
        endShape(CLOSE);

        ellipse(move.head.x, move.head.y, 25, 25);
        pop();

        if (energy > 150 || glow > 100) {
            push();
            noFill();
            stroke(red(color), green(color), blue(color), 100);
            strokeWeight(3);
            ellipse(0, 0, 80 + sin(this.time * 5) * 20);
            pop();
        }
        pop();
    }

    _updateMusicNotes() {
        const currentTime = millis();
        if (currentTime - this.lastNoteTime > this.noteInterval && 
            this.musicNotes.length < this.maxNotes) {
            this.musicNotes.push(this._createMusicNote());
            this.lastNoteTime = currentTime;
        }

        for (let i = this.musicNotes.length - 1; i >= 0; i--) {
            const note = this.musicNotes[i];
            note.y += note.speed;
            note.rotation += note.rotationSpeed;
            
            push();
            translate(note.x, note.y);
            rotate(note.rotation);
            fill(note.color);
            noStroke();
            textSize(note.size);
            textAlign(CENTER, CENTER);
            text(note.note, 0, 0);
            pop();

            if (note.y > this.HEIGHT + 50) {
                this.musicNotes.splice(i, 1);
            }
        }
    }

    _createMusicNote() {
        const notes = ['♪', '♫', '♬', '♩'];
        const colors = [
            color(255, 50, 50, 200),   // Rojo brillante
            color(50, 255, 50, 200),   // Verde neón
            color(50, 50, 255, 200),   // Azul eléctrico
            color(255, 255, 50, 200),  // Amarillo dorado
            color(255, 50, 255, 200)   // Magenta vibrante
        ];
        
        return {
            x: random(this.WIDTH * 0.2, this.WIDTH * 0.8),
            y: -50,
            speed: random(2, 5),
            size: random(30, 50),
            note: notes[floor(random(notes.length))],
            color: colors[floor(random(colors.length))],
            rotation: random(-PI/4, PI/4),
            rotationSpeed: random(-0.02, 0.02)
        };
    }

    _updateEnergyWaves(energy, bass, mid, treble) {
        if (energy > 150 && random() < 0.1) {
            this.energyWaves.push({
                x: this.WIDTH / 2,
                y: this.HEIGHT / 2,
                radius: 0,
                maxRadius: 300,
                speed: 5,
                color: color(
                    map(bass, 0, 255, 100, 255),
                    map(mid, 0, 255, 100, 255),
                    map(treble, 0, 255, 100, 255),
                    100
                )
            });
        }

        for (let i = this.energyWaves.length - 1; i >= 0; i--) {
            const wave = this.energyWaves[i];
            wave.radius += wave.speed;
            
            push();
            noFill();
            stroke(wave.color);
            strokeWeight(2);
            ellipse(wave.x, wave.y, wave.radius * 2);
            pop();

            if (wave.radius >= wave.maxRadius) {
                this.energyWaves.splice(i, 1);
            }
        }
    }

    _updateParticles() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.life -= 5;

            push();
            noStroke();
            fill(red(p.color), green(p.color), blue(p.color), p.life);
            ellipse(p.x, p.y, 6);
            pop();

            if (p.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }
} 
