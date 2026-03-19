import * as THREE from 'three';
import { BikePhysics } from '../bike/BikePhysics.js';

export class EnemyAI {
    constructor(scene, playerBike) {
        this.scene = scene;
        this.playerBike = playerBike;
        
        // Setup AI bike mesh
        const geometry = new THREE.BoxGeometry(0.5, 1, 2);
        const material = new THREE.MeshStandardMaterial({ color: 0x111111 });
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.set(4, 0.5, 20);
        this.mesh.castShadow = true;
        this.scene.add(this.mesh);
        
        this.physics = new BikePhysics(this.mesh);
        this.physics.speed = 30;
        
        this.state = 'chase';
        this.keys = { w: true, s: false, a: false, d: false, j: false, k: false };
        this.attackCooldown = 1.5;
        this.lastAttack = 0;
    }
    
    update(delta, totalTime) {
        if (this.physics.isCrashed) {
            this.physics.update(delta, this.keys);
            
            // Auto-reset enemy after crash
            if (this.physics.crashTimer > 4) {
                this.physics.reset();
                this.mesh.position.z = this.playerBike.position.z + 50;
            }
            return;
        }
        
        const playerPos = this.playerBike.position;
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
        
        // Steer towards player
        this.keys.a = distX < -1.0;
        this.keys.d = distX > 1.0;
        
        // Attack logic
        if (Math.abs(distZ) < 4 && Math.abs(distX) < 3.5) {
            if (totalTime - this.lastAttack > this.attackCooldown) {
                this.keys.j = true;
                this.lastAttack = totalTime;
                console.log("ENEMY_ATTACK: Punch");
            } else {
                this.keys.j = false;
            }
        } else {
            this.keys.j = false;
        }
        
        this.physics.update(delta, this.keys);
    }
}
