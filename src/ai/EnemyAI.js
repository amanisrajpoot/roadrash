import * as THREE from 'three';
import { BikePhysics } from '../bike/BikePhysics.js';

export class EnemyAI {
    constructor(scene, playerBike) {
        this.scene = scene;
        this.playerBike = playerBike;
        
        // Setup AI bike mesh (Group)
        this.mesh = new THREE.Group();
        
        // Main body
        const bodyGeo = new THREE.BoxGeometry(0.4, 0.8, 1.8);
        const bodyMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.5, metalness: 0.5 });
        const body = new THREE.Mesh(bodyGeo, bodyMat);
        body.castShadow = true;
        this.mesh.add(body);
        
        // Front wheel
        const wheelGeo = new THREE.CylinderGeometry(0.4, 0.4, 0.2, 12);
        const wheelMat = new THREE.MeshStandardMaterial({ color: 0x050505, roughness: 0.9 });
        const frontWheel = new THREE.Mesh(wheelGeo, wheelMat);
        frontWheel.rotation.z = Math.PI / 2;
        frontWheel.position.set(0, -0.2, 0.7);
        this.mesh.add(frontWheel);
        
        // Back wheel
        const backWheel = new THREE.Mesh(wheelGeo, wheelMat);
        backWheel.rotation.z = Math.PI / 2;
        backWheel.position.set(0, -0.2, -0.7);
        this.mesh.add(backWheel);
        
        this.mesh.position.set(4, 0.6, 20);
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
        
        // Smoothly follow player X position (Layer 1 Fix)
        const ROAD_LIMIT = 10.0;
        this.mesh.position.x += distX * 0.05; // Smooth follow instead of binary A/D
        this.mesh.position.x = THREE.MathUtils.clamp(this.mesh.position.x, -ROAD_LIMIT, ROAD_LIMIT);
        
        // We still update physics but X is now controlled more directly/smoothly
        this.keys.a = false; 
        this.keys.d = false;
        
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
