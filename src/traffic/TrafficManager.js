import * as THREE from 'three';

export class TrafficManager {
    constructor(scene, assetLoader) {
        this.scene = scene;
        this.loader = assetLoader;
        this.pool = [];
        this.activeCars = [];
        this.maxPoolSize = 15;
        this.spawnDistance = 400;
        this.despawnDistance = 100;
        this.roadWidth = 14; 
        
        this.initPool();
    }
    
    initPool() {
        if (!this.loader) return;
        
        for (let i = 0; i < this.maxPoolSize; i++) {
            const car = this.loader.getClone('car');
            if (car) {
                car.visible = false;
                this.pool.push(car);
            }
        }
    }
    
    spawn(playerZ) {
        if (this.pool.length === 0) return;
        
        const car = this.pool.pop();
        car.visible = true;
        this.scene.add(car);
        
        // Random lane position
        const x = (Math.random() - 0.5) * (this.roadWidth - 4);
        const z = playerZ + this.spawnDistance + (Math.random() * 300);
        
        car.position.set(x, 0.05, z); // 0.05 for slight clearance/avoiding z-fight, but visibly grounded
        car.rotation.y = 0; // Fix: 0 should be forward (+Z) for the car model if Math.PI was facing player
        car.scale.set(1.4, 1.4, 1.4); // Sweet spot between "toy" and "too big"
        
        // Slower than player max speed (80)
        car.speed = 15 + Math.random() * 25; 
        
        this.activeCars.push(car);
    }
    
    update(delta, playerZ, playerMesh, enemies) {
        // Significantly less dense spawning as requested
        if (this.activeCars.length < 3 && Math.random() < 0.005) {
            this.spawn(playerZ);
        }
        
        for (let i = this.activeCars.length - 1; i >= 0; i--) {
            const car = this.activeCars[i];
            
            // Move car forward (+Z)
            car.position.z += car.speed * delta;

            // --- INTERACTION LAYER ---
            
            // Player Collision Check
            const pdx = car.position.x - playerMesh.position.x;
            const pdz = car.position.z - playerMesh.position.z;
            if (Math.abs(pdx) < 2.2 && Math.abs(pdz) < 3.5) {
                // Not a full crash (yet), but a massive slowdown/bump
                if (typeof window !== 'undefined' && window.bikePhysics) {
                    window.bikePhysics.speed *= 0.5;
                    window.bikePhysics.takeDamage(10);
                }
                car.speed *= 0.5;
            }

            // Enemy Collision Check
            enemies.forEach(enemy => {
                const edx = car.position.x - enemy.mesh.position.x;
                const edz = car.position.z - enemy.mesh.position.z;
                if (Math.abs(edx) < 2.0 && Math.abs(edz) < 3.0) {
                    enemy.physics.isCrashed = true;
                    enemy.physics.takeDamage(20);
                    car.speed *= 0.5;
                }
            });

            // --- END INTERACTION ---
            
            // Despawn if too far ahead OR passed by player
            const relativeZ = car.position.z - playerZ;
            if (relativeZ < -50 || relativeZ > 800) {
                this.despawn(car, i);
            }
        }
    }
    
    despawn(car, index) {
        car.visible = false;
        this.scene.remove(car); // Remove when despawned
        this.activeCars.splice(index, 1);
        this.pool.push(car);
    }
}
