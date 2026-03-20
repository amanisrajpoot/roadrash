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
    
    update(delta, playerZ) {
        // Significantly less dense spawning as requested
        if (this.activeCars.length < 3 && Math.random() < 0.005) {
            this.spawn(playerZ);
        }
        
        for (let i = this.activeCars.length - 1; i >= 0; i--) {
            const car = this.activeCars[i];
            
            // Move car forward (+Z)
            car.position.z += car.speed * delta;
            
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
