import * as THREE from 'three';

export function createScene() {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87ceeb); // Sky blue
    
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);
    
    // Directional light (Sun)
    const sunLight = new THREE.DirectionalLight(0xffffff, 1);
    sunLight.position.set(100, 100, 50);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 500;
    sunLight.shadow.camera.left = -100;
    sunLight.shadow.camera.right = 100;
    sunLight.shadow.camera.top = 100;
    sunLight.shadow.camera.bottom = -100;
    
    scene.add(sunLight);
    
    // Fog for depth
    scene.fog = new THREE.Fog(0x87ceeb, 10, 200);
    
    return scene;
}
