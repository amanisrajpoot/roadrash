import * as THREE from 'three';

export class EffectsManager {
    constructor(camera) {
        this.camera = camera;
        this.shakeIntensity = 0;
        this.shakeDecay = 4.0;
        this.baseFOV = camera.fov;
    }
    
    shake(intensity) {
        this.shakeIntensity = Math.max(this.shakeIntensity, intensity);
    }
    
    update(delta, currentSpeed) {
        // Camera shake effect
        if (this.shakeIntensity > 0) {
            const offset = new THREE.Vector3(
                (Math.random() - 0.5) * this.shakeIntensity,
                (Math.random() - 0.5) * this.shakeIntensity,
                0
            );
            this.camera.position.add(offset);
            this.shakeIntensity = Math.max(0, this.shakeIntensity - this.shakeDecay * delta);
        }
        
        // Speed FOV effect
        const targetFOV = this.baseFOV + (currentSpeed * 0.25);
        this.camera.fov = THREE.MathUtils.lerp(this.camera.fov, targetFOV, 3 * delta);
        this.camera.updateProjectionMatrix();
    }
}
