import * as THREE from 'three';
import { BikePhysics } from '../bike/BikePhysics.js';

export class EnemyAI {
    constructor(scene, player, assetLoader) {
        this.scene = scene;
        this.player = player; // Note: using 'player' instead of 'playerBike'
        this.loader = assetLoader;
        
        this.initMesh();
        
        this.physics = new BikePhysics(this.mesh);
        this.physics.speed = 30;
        
        this.keys = { w: true, s: false, a: false, d: false, j: false, k: false };
        this.attackCooldown = 1.5;
        this.lastAttack = 0;
    }

    initMesh() {
        this.mesh = this.loader ? this.loader.getClone('bike') : null;
        
        if (!this.mesh) {
            // Fallback
            this.mesh = new THREE.Group();
            const body = new THREE.Mesh(
                new THREE.BoxGeometry(0.4, 0.8, 1.8),
                new THREE.MeshStandardMaterial({ color: 0x222222 })
            );
            this.mesh.add(body);
        } else {
            // Tint Enemy Blue
            this.mesh.traverse(c => {
                if (c.isMesh) {
                    c.material = c.material.clone();
                    c.material.color.set(0x3333ff); 
                }
            });
            this.mesh.scale.set(0.02, 0.02, 0.02);
            this.mesh.rotation.y = Math.PI;
            this.mesh.position.y = 0.1; // Lowered to match scale
        }
        
        this.mesh.position.set(4, 0.1, 30);
        this.scene.add(this.mesh);
    }
    
    update(delta, totalTime) {
        if (!this.mesh) return;
        
        if (this.physics.isCrashed) {
            this.physics.update(delta, this.keys);
            
            // Auto-reset enemy after crash
            if (this.physics.crashTimer > 4) {
                this.physics.reset();
                this.mesh.position.z = this.player.position.z + 50;
            }
            return;
        }
        
        const playerPos = this.player.position;
        const myPos = this.mesh.position;
        
        const distZ = playerPos.z - myPos.z;
        const distX = playerPos.x - myPos.x;
        
        // Rubber-banding: if enemy is too far behind, teleport ahead
        if (distZ > 150) {
            this.mesh.position.z = playerPos.z + 50;
            this.mesh.position.x = playerPos.x + (Math.random() - 0.5) * 10;
            this.physics.speed = 40;
        }
        
        // Match speed or catch up
        this.keys.w = distZ > 2;
        this.keys.s = distZ < -2;
        
        // Smoothly follow player X position
        const ROAD_LIMIT = 10.0;
        this.mesh.position.x += distX * 0.05; 
        this.mesh.position.x = THREE.MathUtils.clamp(this.mesh.position.x, -ROAD_LIMIT, ROAD_LIMIT);
        
        // Attack logic
        if (Math.abs(distZ) < 4 && Math.abs(distX) < 3.5) {
            if (totalTime - this.lastAttack > this.attackCooldown) {
                this.keys.j = true;
                this.lastAttack = totalTime;
            } else {
                this.keys.j = false;
            }
        } else {
            this.keys.j = false;
        }
        
        this.physics.update(delta, this.keys);
    }
}
