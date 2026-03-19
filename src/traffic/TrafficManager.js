import * as THREE from 'three';

export class TrafficManager {
    constructor(scene) {
        this.scene = scene;
        this.pool = [];
        this.activeCars = [];
        this.maxPoolSize = 20;
        this.spawnDistance = 400;
        this.despawnDistance = 100;
        this.roadWidth = 14; 
        
        this.initPool();
    }
    
    initPool() {
        const carGeometry = new THREE.BoxGeometry(2.2, 1.4, 4.5);
        const colors = [0x1a73e8, 0xe84118, 0x4cd137, 0xfbc531, 0x718093, 0x2f3640];
        
        for (let i = 0; i < this.maxPoolSize; i++) {
            const color = colors[i % colors.length];
            const carMaterial = new THREE.MeshStandardMaterial({ 
                color,
                roughness: 0.5,
                metalness: 0.5
            });
            const car = new THREE.Mesh(carGeometry, carMaterial);
            car.castShadow = true;
            car.receiveShadow = true;
            car.visible = false;
            
            // Four wheels
            const wheelGeo = new THREE.CylinderGeometry(0.4, 0.4, 0.3, 12);
            const wheelMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.9 });
            
            const wheelPositions = [
                { x: 1, y: -0.4, z: 1.5 },
                { x: -1, y: -0.4, z: 1.5 },
                { x: 1, y: -0.4, z: -1.5 },
                { x: -1, y: -0.4, z: -1.5 }
            ];
            
            wheelPositions.forEach(pos => {
                const wheel = new THREE.Mesh(wheelGeo, wheelMat);
                wheel.position.set(pos.x, pos.y, pos.z);
                wheel.rotation.z = Math.PI / 2;
                car.add(wheel);
            });
            
            this.scene.add(car);
            this.pool.push(car);
        }
    }
    
    spawn(playerZ) {
        if (this.pool.length === 0) return;
        
        const car = this.pool.pop();
        car.visible = true;
        
        // Random lane position
        const x = (Math.random() - 0.5) * this.roadWidth;
        const z = playerZ + this.spawnDistance + (Math.random() * 200);
        
        car.position.set(x, 0.7, z);
        
        // Random speed, mostly slower than player's cruising speed
        car.speed = 15 + Math.random() * 15; 
        
        this.activeCars.push(car);
    }
    
    update(delta, playerZ) {
        // Maintain a few cars ahead
        if (this.activeCars.length < 10 && Math.random() < 0.1) {
            this.spawn(playerZ);
        }
        
        for (let i = this.activeCars.length - 1; i >= 0; i--) {
            const car = this.activeCars[i];
            
            // Move car forward
            car.position.z += car.speed * delta;
            
            // Check for despawn (passed behind player)
            if (playerZ - car.position.z > this.despawnDistance) {
                this.despawn(car, i);
            }
        }
    }
    
    despawn(car, index) {
        car.visible = false;
        this.activeCars.splice(index, 1);
        this.pool.push(car);
    }
}
