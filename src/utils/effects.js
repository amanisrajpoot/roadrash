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
        
        // Speed FOV effect (Mapped 0-80 speed to 60-70 FOV)
        const speedPerc = Math.min(1.0, currentSpeed / 80);
        const targetFOV = 60 + (speedPerc * 10); // Reduced stretch
        this.camera.fov = THREE.MathUtils.lerp(this.camera.fov, targetFOV, Math.min(1.0, 5 * delta));
        this.camera.updateProjectionMatrix();
    }
}
