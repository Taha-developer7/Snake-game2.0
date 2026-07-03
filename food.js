/**
 * Procedural Dynamic Target Subsystem
 */
class FoodSystem {
    constructor(scene) {
        this.scene = scene;
        this.gridSize = 20;
        this.position = new THREE.Vector3();
        
        let geom = new THREE.OctahedronGeometry(0.4, 0);
        this.material = new THREE.MeshStandardMaterial({
            color: 0x00f3ff,
            emissive: 0x00a2ff,
            emissiveIntensity: 2.5,
            roughness: 0.1,
            metalness: 0.8
        });
        
        this.mesh = new THREE.Mesh(geom, this.material);
        this.scene.add(this.mesh);
        
        // Secondary Omni-Directional Light Binding for dynamic shadows
        this.light = new THREE.PointLight(0x00f3ff, 2, 5);
        this.scene.add(this.light);
        
        this.clock = new THREE.Clock();
        this.randomizePosition([]);
    }

    randomizePosition(snakeCoords) {
        let valid = false;
        let rx, rz;
        
        while (!valid) {
            rx = Math.floor(Math.random() * this.gridSize) - this.gridSize / 2;
            rz = Math.floor(Math.random() * this.gridSize) - this.gridSize / 2;
            valid = true;
            
            for (let cell of snakeCoords) {
                if (cell.x === rx && cell.z === rz) {
                    valid = false;
                    break;
                }
            }
        }
        
        this.position.set(rx, 0.4, rz);
        this.mesh.position.copy(this.position);
        this.light.position.copy(this.position);
        
        // Dynamic procedural accent palette switching on generation
        const colorIndex = Math.random();
        if (colorIndex > 0.5) {
            this.material.color.setHex(0xec4899);
            this.material.emissive.setHex(0x9d174d);
            this.light.color.setHex(0xec4899);
        } else {
            this.material.color.setHex(0x00f3ff);
            this.material.emissive.setHex(0x00a2ff);
            this.light.color.setHex(0x00f3ff);
        }
    }

    animate() {
        const elapsedTime = this.clock.getElapsedTime();
        this.mesh.rotation.x = elapsedTime * 2.0;
        this.mesh.rotation.y = elapsedTime * 1.5;
        
        // Pulsing floating altitude displacement tracking matrix
        this.mesh.position.y = 0.4 + Math.sin(elapsedTime * 5.0) * 0.12;
        this.light.intensity = 2.0 + Math.sin(elapsedTime * 8.0) * 0.8;
    }
}