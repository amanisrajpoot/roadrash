import * as THREE from 'three';

export function createScene() {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87ceeb); // Sky blue
    
    // Hemisphere Light (Sky/Ground)
    const hemiLight = new THREE.HemisphereLight(0x87ceeb, 0x444444, 1.0);
    scene.add(hemiLight);
    
    // Directional light (Sun)
    const sunLight = new THREE.DirectionalLight(0xffffff, 1.2);
    sunLight.position.set(50, 100, 50);
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
    
    // Fog for depth (closer and thicker)
    scene.fog = new THREE.Fog(0x87ceeb, 20, 150);
    
    return scene;
}
