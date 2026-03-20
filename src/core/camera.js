import * as THREE from 'three';

export function createCamera() {
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 10000);
    camera.position.set(0, 4, -10);
    camera.lookAt(0, 2, 10);
    
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
    });
    
    return camera;
}

export function updateCameraFollow(camera, target, delta) {
    if (!target) return;
    
    // Position camera higher and further back - For proper 3rd person view
    const offset = new THREE.Vector3(0, 3.0, -8.0);
    const targetPos = target.position.clone().add(offset);
    
    // Near-instant follow for Z axis to prevent "pulling away"
    camera.position.lerp(targetPos, Math.min(1.0, 50 * delta));
    
    // Look ahead but keeping focus lower to show more road
    const lookAtPoint = target.position.clone().add(new THREE.Vector3(0, 0, 6));
    camera.lookAt(lookAtPoint);
}
