/**
 * Procedural Vector Interpolated Segment Matrix
 */
class SnakeSystem {
    constructor(scene) {
        this.scene = scene;
        this.gridSize = 20;
        this.segments = [];
        this.meshes = [];
        this.direction = new THREE.Vector3(1, 0, 0);
        this.nextDirection = new THREE.Vector3(1, 0, 0);
        
        this.headGeometry = new THREE.BoxGeometry(0.85, 0.85, 0.85);
        this.bodyGeometry = new THREE.BoxGeometry(0.75, 0.75, 0.75);
        
        this.headMaterial = new THREE.MeshStandardMaterial({
            color: 0x00f3ff,
            emissive: 0x0044ff,
            emissiveIntensity: 1.5,
            roughness: 0.2
        });
        
        this.bodyMaterial = new THREE.MeshStandardMaterial({
            color: 0x3b82f6,
            emissive: 0x1d4ed8,
            emissiveIntensity: 0.4,
            roughness: 0.4
        });

        this.reset();
    }

    reset() {
        // Purge memory allocation references from memory map
        this.meshes.forEach(m => this.scene.remove(m));
        this.segments = [
            { x: 0, z: 0 },
            { x: -1, z: 0 },
            { x: -2, z: 0 }
        ];
        this.meshes = [];
        this.direction.set(1, 0, 0);
        this.nextDirection.set(1, 0, 0);

        for (let i = 0; i < this.segments.length; i++) {
            this.buildSegmentMesh(i, this.segments[i]);
        }
    }

    buildSegmentMesh(index, coords) {
        let isHead = index === 0;
        let mesh = new THREE.Mesh(
            isHead ? this.headGeometry : this.bodyGeometry,
            isHead ? this.headMaterial : this.bodyMaterial
        );
        mesh.position.set(coords.x, 0.4, coords.z);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        this.scene.add(mesh);
        this.meshes[index] = mesh;
    }

    setDirection(newX, newZ) {
        // Block 180-degree self-intersection overrides
        if (this.direction.x * newX + this.direction.z * newZ === 0) {
            this.nextDirection.set(newX, 0, newZ);
        }
    }

    step(growRequested) {
        this.direction.copy(this.nextDirection);
        AudioController.playMove();

        // Calculate theoretical vector position index allocations
        let head = this.segments[0];
        let newHead = {
            x: head.x + this.direction.x,
            z: head.z + this.direction.z
        };

        // Boundary collision logic check parameters
        const boundary = this.gridSize / 2;
        if (Math.abs(newHead.x) > boundary || Math.abs(newHead.z) > boundary) {
            return false; // Crash sequence signature detected
        }

        // Self-intersection metrics calculations
        for (let seg of this.segments) {
            if (seg.x === newHead.x && seg.z === newHead.z) {
                return false;
            }
        }

        this.segments.unshift(newHead);

        if (growRequested) {
            this.buildSegmentMesh(this.segments.length - 1, this.segments[this.segments.length - 1]);
        } else {
            this.segments.pop();
        }

        // Trigger decoupled GSAP layout tweening pipeline
        for (let i = 0; i < this.segments.length; i++) {
            gsap.to(this.meshes[i].position, {
                x: this.segments[i].x,
                z: this.segments[i].z,
                duration: this.stepDuration || 0.15,
                ease: "power2.out"
            });
        }
        return true;
    }
}