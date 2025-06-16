class FlyingMeshVisualizer extends BaseVisualizer {
    constructor(width, height) {
        super(width, height);
        this.cols = 50;
        this.rows = 50;
        this.scale = 7;
        this.flying = 0;
        this.terrain = [];
        this.rotation = 0;
        this.rotationSpeed = 0.004;
        this.colorOffset = 0;
        this.colorSpeed = 0.001;
        this.colorPhase = 0;
        this.colorPhase2 = 0.33; // Desfase para el segundo color
        this.colorPhase3 = 0.66; // Desfase para el tercer color
        for (let x = 0; x < this.cols; x++) {
            this.terrain[x] = [];
            for (let y = 0; y < this.rows; y++) {
                this.terrain[x][y] = 0;
            }
        }
    }

    update(spectrum) {
        // Usar la energía del audio para modular el terreno
        const energy = spectrum.reduce((a, b) => a + b, 0) / spectrum.length;
        const dynamicRange = map(energy, 0, 255, 30, 60);

        this.flying -= 0.001 + map(energy, 0, 255, 0, 0.1);
        let yoff = this.flying;
        
        // Actualizar el terreno
        for (let y = 0; y < this.rows; y++) {
            let xoff = 0;
            for (let x = 0; x < this.cols; x++) {
                let audioMod = map(spectrum[x % spectrum.length], 0, 255, -dynamicRange, dynamicRange);
                this.terrain[x][y] = map(noise(xoff, yoff), 0, 1, -30, 30) + audioMod;
                xoff += 0.2;
            }
            yoff += 0.2;
        }

        // Actualizar el color basado en la música
        this.colorOffset += this.colorSpeed * (1 + energy / 1024);
        if (this.colorOffset > 1) this.colorOffset -= 1;
        
        // Actualizar las fases de color a diferentes velocidades
        this.colorPhase += this.colorSpeed * 0.5;
        this.colorPhase2 += this.colorSpeed * 0.3; // Más lento
        this.colorPhase3 += this.colorSpeed * 0.7; // Más rápido
        
        if (this.colorPhase > 1) this.colorPhase -= 1;
        if (this.colorPhase2 > 1) this.colorPhase2 -= 1;
        if (this.colorPhase3 > 1) this.colorPhase3 -= 1;

        // Dibujo en 2D con efecto 3D
        push();
        translate(this.WIDTH / 2, this.HEIGHT / 2);
        rotate(this.rotation);
        this.rotation += this.rotationSpeed;

        // Dibujar el terreno
        for (let y = 0; y < this.rows - 1; y++) {
            for (let x = 0; x < this.cols - 1; x++) {
                let h1 = this.terrain[x][y];
                let h2 = this.terrain[x][y + 1];
                let h3 = this.terrain[x + 1][y];
                
                // Calcular cada componente de color basado en el espectro
                let bassIndex = Math.floor(x * y * 0.1) % spectrum.length;
                let midIndex = Math.floor((x + y) * 0.2) % spectrum.length;
                let highIndex = Math.floor((x * y + x + y) * 0.3) % spectrum.length;
                
                let r = map(spectrum[bassIndex], 0, 255, 100, 255);
                let g = map(spectrum[midIndex], 0, 255, 100, 255);
                let b = map(spectrum[highIndex], 0, 255, 100, 255);
                
                // Aplicar el efecto de desvanecimiento basado en la energía total
                let totalEnergy = spectrum.reduce((a, b) => a + b, 0) / spectrum.length;
                let intensity = map(totalEnergy, 0, 255, 0.7, 1);
                
                // Crear el color final
                let c = color(r * intensity, g * intensity, b * intensity);
                
                // Calcular posiciones con perspectiva
                let x1 = (x - this.cols/2) * this.scale;
                let y1 = (y - this.rows/2) * this.scale;
                let x2 = (x + 1 - this.cols/2) * this.scale;
                let y2 = (y + 1 - this.rows/2) * this.scale;
                
                // Aplicar perspectiva con un rango más pequeño
                let scale1 = map(h1, -30, 30, 0.7, 1.3);
                let scale2 = map(h2, -30, 30, 0.7, 1.3);
                let scale3 = map(h3, -30, 30, 0.7, 1.3);
                
                x1 *= scale1;
                y1 *= scale1;
                x2 *= scale2;
                y2 *= scale2;
                
                // Dibujar líneas con sombreado
                stroke(c);
                strokeWeight(map(h1, -30, 30, 1, 2));
                
                // Líneas verticales
                line(x1, y1, x1, y2);
                // Líneas horizontales
                line(x1, y1, x2, y1);
            }
        }
        pop();
    }
}          
