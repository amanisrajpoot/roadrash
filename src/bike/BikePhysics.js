import * as THREE from 'three';

export class BikePhysics {
    constructor(bikeMesh) {
        this.mesh = bikeMesh;
        this.speed = 20;
        this.minSpeed = 5;
        this.maxSpeed = 80;
        this.turnSpeed = 25;
        this.tiltMax = 0.6;
        this.acceleration = 15;
        this.deceleration = 20;
        
        // Internal state
        this.currentTilt = 0;
        this.currentTurn = 0;
        this.isCrashed = false;
        this.crashTimer = 0;
    }
    
    update(delta, keys) {
        if (this.isCrashed) {
            this.handleCrashState(delta);
            return;
        }
        
        // Forward speed control
        if (keys.w) {
            this.speed += this.acceleration * delta;
        } else if (keys.s) {
            this.speed -= this.deceleration * delta;
        } else {
            // Natural drag
            this.speed -= 5 * delta;
        }
        
        this.speed = Math.max(this.minSpeed, Math.min(this.maxSpeed, this.speed));
        
        // Steering
        let turnInput = 0;
        if (keys.a) turnInput += 1;
        if (keys.d) turnInput -= 1;
        
        // Smooth steering input
        this.currentTurn = THREE.MathUtils.lerp(this.currentTurn, turnInput, 10 * delta);
        
        // Movement
        this.mesh.position.x += this.currentTurn * this.turnSpeed * delta;
        this.mesh.position.z += this.speed * delta;
        
        // Road Boundaries & Off-road Physics
        const ROAD_EDGE = 10.0;
        const WORLD_LIMIT = 15.0;
        
        if (Math.abs(this.mesh.position.x) > ROAD_EDGE) {
            this.speed *= 0.97; // Grass drag
            // Subtly push back towards road
            this.mesh.position.x = THREE.MathUtils.lerp(this.mesh.position.x, Math.sign(this.mesh.position.x) * ROAD_EDGE, 2 * delta);
        }
        
        // Hard clamp to prevent escaping the map
        this.mesh.position.x = THREE.MathUtils.clamp(this.mesh.position.x, -WORLD_LIMIT, WORLD_LIMIT);
        
        // Tilt effect (rotation.z)
        const targetTilt = this.currentTurn * this.tiltMax;
        this.currentTilt = THREE.MathUtils.lerp(this.currentTilt, targetTilt, 8 * delta);
        this.mesh.rotation.z = this.currentTilt;
        
        // Slight steering rotation (y-axis) for visual feedback
        this.mesh.rotation.y = THREE.MathUtils.lerp(this.mesh.rotation.y, this.currentTurn * 0.15, 8 * delta);
    }
    
    handleCrashState(delta) {
        this.crashTimer += delta;
        
        // Spin and tumble
        this.mesh.rotation.x += 10 * delta;
        this.mesh.rotation.y += 8 * delta;
        this.mesh.rotation.z += 5 * delta;
        
        // Friction/Deceleration
        this.speed *= 0.98;
        this.mesh.position.z += this.speed * delta;
        
        // Knockback (slight random X movement)
        this.mesh.position.x += (Math.random() - 0.5) * 5 * delta;
        
        // Reset after 3 seconds
        if (this.crashTimer > 3) {
            this.reset();
        }
    }
    
    reset() {
        this.isCrashed = false;
        this.crashTimer = 0;
        this.speed = 20;
        this.mesh.rotation.set(0, 0, 0);
        this.mesh.position.y = 0.5;
        this.currentTilt = 0;
        this.currentTurn = 0;
    }
}
