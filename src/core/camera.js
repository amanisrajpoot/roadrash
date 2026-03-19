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
    
    // Ideal offset from target
    const idealOffset = new THREE.Vector3(0, 2.5, -6);
    idealOffset.applyQuaternion(target.quaternion);
    idealOffset.add(target.position);
    
    // Ideal look at point
    const idealLookAt = new THREE.Vector3(0, 1.5, 5);
    idealLookAt.applyQuaternion(target.quaternion);
    idealLookAt.add(target.position);
    
    // Lerp camera position for smoothness
    const t = 1.0 - Math.pow(0.001, delta);
    camera.position.lerp(idealOffset, t);
    camera.lookAt(idealLookAt);
}
