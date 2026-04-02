import * as THREE from 'three';
import { BikePhysics } from '../bike/BikePhysics.js';

export class EnemyAI {
    constructor(scene, player, assetLoader, startX = 4, startZ = 30) {
        this.scene = scene;
        this.player = player; // Note: using 'player' instead of 'playerBike'
        this.loader = assetLoader;
        this.startX = startX;
        this.startZ = startZ;
        
        this.initMesh();
        
        this.physics = new BikePhysics(this.mesh);
        this.physics.speed = 30;
        
        this.keys = { w: true, s: false, a: false, d: false, j: false, k: false };
        this.attackCooldown = 1.5;
        this.lastAttack = 0;
        this.state = "CHASE"; // CHASE | ATTACK | CRASHED
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
        
        this.mesh.position.set(this.startX, 0.1, this.startZ);
        this.scene.add(this.mesh);
    }
    
    update(delta, totalTime) {
        if (!this.mesh) return;
        
        const playerPos = this.player.position;
        const myPos = this.mesh.position;
        const distZ = playerPos.z - myPos.z;
        const distX = playerPos.x - myPos.x;

        // CRASH RECOVERY
        if (this.physics.isCrashed || this.physics.isFalling) {
            this.state = "CRASHED";
        }

        if (this.state === "CRASHED") {
            this.keys.w = false;
            this.physics.update(delta, this.keys);
            
            if (this.physics.fallTimer > 3 || (!this.physics.isFalling && this.physics.crashTimer > 3)) {
                this.state = "CHASE";
                this.physics.resetFall();
                this.mesh.position.z = this.player.position.z + 30; // Teleport ahead for pressure
            }
            return;
        }

        // STATE MACHINE
        switch (this.state) {
            case "CHASE":
                this.keys.w = true;
                // Move toward player X
                this.mesh.position.x += distX * 0.03;
                
                // Close enough -> attack
                if (Math.abs(distZ) < 5 && Math.abs(distX) < 3) {
                    this.state = "ATTACK";
                }
                
                // Match player speed + a bit
                this.physics.speed = Math.max(30, distZ > 0 ? 70 : 30);
                break;

            case "ATTACK":
                this.keys.w = true;
                // Aggressive side movement (ramming/blocking)
                this.mesh.position.x += Math.sign(distX) * 0.15; 
                
                // Swing!
                if (totalTime - this.lastAttack > this.attackCooldown) {
                    this.keys.j = true;
                    this.lastAttack = totalTime;
                } else {
                    this.keys.j = false;
                }

                if (Math.abs(distZ) > 8 || Math.abs(distX) > 4) {
                    this.state = "CHASE";
                    this.keys.j = false;
                }
                break;
        }

        // Smoothly clamp to road
        const ROAD_LIMIT = 10.0;
        this.mesh.position.x = THREE.MathUtils.clamp(this.mesh.position.x, -ROAD_LIMIT, ROAD_LIMIT);
        
        this.physics.update(delta, this.keys);
    }
}
