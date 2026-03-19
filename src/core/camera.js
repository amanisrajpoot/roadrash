import * as THREE from 'three';

export function createCamera() {
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    
    // Initial position, will be updated by the follow logic
    camera.position.set(0, 5, 10);
    camera.lookAt(0, 0, 0);
    
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
    });
    
    return camera;
}

export function updateCameraFollow(camera, target, delta) {
    if (!target) return;
    
    // Position camera behind and above
    const offset = new THREE.Vector3(0, 4.5, -10.0);
    offset.applyAxisAngle(new THREE.Vector3(0, 1, 0), target.rotation.y);
    const targetPos = target.position.clone().add(offset);
    
    // Smooth lerp
    camera.position.lerp(targetPos, 0.1);
    
    // Look ahead of the bike
    const lookOffset = new THREE.Vector3(0, 1, 15);
    lookOffset.applyAxisAngle(new THREE.Vector3(0, 1, 0), target.rotation.y);
    const lookAtPoint = target.position.clone().add(lookOffset);
    
    // Force upright and look at
    camera.up.set(0, 1, 0);
    camera.lookAt(lookAtPoint);
}
