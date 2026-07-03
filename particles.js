/**
 * Particle Explosion System with Instanced Object Pooling Strategy
 */
class ParticleSystem {
    constructor(scene) {
        this.scene = scene;
        this.poolSize = 250;
        this.particles = [];
        this.geometry = new THREE.BoxGeometry(0.15, 0.15, 0.15);
        this.material = new THREE.MeshBasicMaterial({
            color: 0xec4899,
            transparent: true,
            opacity: 1
        });
        this.initPool();
    }

    initPool() {
        for (let i = 0; i < this.poolSize; i++) {
            let p = new THREE.Mesh(this.geometry, this.material.clone());
            p.visible = false;
            this.scene.add(p);
            this.particles.push({
                mesh: p,
                active: false,
                velocity: new THREE.Vector3(),
                life: 0
            });
        }
    }

    spawnExplosion(originVector, targetColorHex) {
        let spawned = 0;
        for (let i = 0; i < this.particles.length; i++) {
            if (spawned >= 25) break; 
            let p = this.particles[i];
            if (!p.active) {
                p.active = true;
                p.mesh.visible = true;
                p.mesh.position.copy(originVector);
                p.mesh.material.color.setHex(targetColorHex);
                p.mesh.material.opacity = 1.0;
                
                p.velocity.set(
                    (Math.random() - 0.5) * 8,
                    (Math.random() - 0.5) * 8,
                    (Math.random() - 0.5) * 8
                );
                p.life = 1.0; 
                spawned++;
            }
        }
    }

    update(deltaTime) {
        for (let i = 0; i < this.particles.length; i++) {
            let p = this.particles[i];
            if (p.active) {
                p.mesh.position.addScaledVector(p.velocity, deltaTime);
                p.velocity.y -= 2.0 * deltaTime; // Artificial Gravity Simulation
                p.life -= deltaTime * 1.8;
                p.mesh.material.opacity = Math.max(0, p.life);
                
                if (p.life <= 0) {
                    p.active = false;
                    p.mesh.visible = false;
                }
            }
        }
    }
}