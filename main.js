import * as THREE from 'three';
import { createRenderer } from './src/core/renderer.js';
import { createScene } from './src/core/scene.js';
import { createCamera, updateCameraFollow } from './src/core/camera.js';
import { createLoop } from './src/core/loop.js';
import { BikeController } from './src/bike/BikeController.js';
import { BikePhysics } from './src/bike/BikePhysics.js';
import { RoadManager } from './src/world/Road.js';
import { TrafficManager } from './src/traffic/TrafficManager.js';
import { CombatSystem } from './src/combat/CombatSystem.js';
import { EnemyAI } from './src/ai/EnemyAI.js';
import { EffectsManager } from './src/utils/effects.js';

const renderer = createRenderer();
const scene = createScene();
const camera = createCamera();

const controller = new BikeController();
const effectsManager = new EffectsManager(camera);

// Better Bike Placeholder (Group)
const bike = new THREE.Group();

// Main body
const bodyGeo = new THREE.BoxGeometry(0.4, 0.8, 1.8);
const bodyMat = new THREE.MeshStandardMaterial({ color: 0xff0000, roughness: 0.5, metalness: 0.5 });
const body = new THREE.Mesh(bodyGeo, bodyMat);
body.castShadow = true;
bike.add(body);

// Front wheel
const wheelGeo = new THREE.CylinderGeometry(0.4, 0.4, 0.2, 12);
const wheelMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.9 });
const frontWheel = new THREE.Mesh(wheelGeo, wheelMat);
frontWheel.rotation.z = Math.PI / 2;
frontWheel.position.set(0, -0.2, 0.7);
bike.add(frontWheel);

// Back wheel
const backWheel = new THREE.Mesh(wheelGeo, wheelMat);
backWheel.rotation.z = Math.PI / 2;
backWheel.position.set(0, -0.2, -0.7);
bike.add(backWheel);

bike.position.set(0, 0.6, 0);
scene.add(bike);

const bikePhysics = new BikePhysics(bike);

// Infinite Road
const roadManager = new RoadManager(scene);

// Traffic System
const trafficManager = new TrafficManager(scene);

// Enemy AI
const enemyAI = new EnemyAI(scene, bike);

// Combat System (Tracks both traffic and enemy AI)
const combatSystem = new CombatSystem(bike, [trafficManager, enemyAI], effectsManager);

let totalTime = 0;
let timeScale = 1.0;
const speedFill = document.getElementById('speed-fill');
const healthFill = document.getElementById('health-fill');

function update(delta) {
    // Recover from hit-stop
    timeScale = THREE.MathUtils.lerp(timeScale, 1.0, 6 * delta);
    const scaledDelta = delta * timeScale;
    
    totalTime += scaledDelta;
    
    // Update bike physics with keyboard input
    bikePhysics.update(scaledDelta, controller.keys);
    
    // Update road recycling
    roadManager.update(bike.position.z);
    
    // Update traffic
    trafficManager.update(scaledDelta, bike.position.z);
    
    // Update Enemy AI
    enemyAI.update(scaledDelta, totalTime);
    
    // Update effects (FOV, Shake)
    effectsManager.update(delta, bikePhysics.speed);
    
    // Update UI Bars
    if (speedFill) {
        const speedPercent = (bikePhysics.speed / bikePhysics.maxSpeed) * 100;
        speedFill.style.width = `${Math.min(100, speedPercent)}%`;
    }
    if (healthFill) {
        // Simple placeholder for health (decrease on crash)
        const healthPercent = bikePhysics.isCrashed ? 20 : 100;
        healthFill.style.width = `${healthPercent}%`;
    }
    
    // Update combat
    if (!bikePhysics.isCrashed) {
        const hit = combatSystem.update(scaledDelta, totalTime, controller.keys);
        if (hit) {
            timeScale = 0.15; // "Hit Stop" effect
        }
    }
    
    // Update camera follow
    updateCameraFollow(camera, bike, delta);
    
    // Check collisions if not already crashed
    if (!bikePhysics.isCrashed) {
        checkCollisions();
    }
}

function checkCollisions() {
    const playerPos = bike.position;
    const cars = trafficManager.activeCars;
    
    for (const car of cars) {
        const dx = playerPos.x - car.position.x;
        const dz = playerPos.z - car.position.z;
        
        // Simple bounding box check
        if (Math.abs(dx) < 1.5 && Math.abs(dz) < 3.2) {
            bikePhysics.isCrashed = true;
            effectsManager.shake(2.0); // Big shake on crash
            console.log("CRASH DETECTED!");
            break;
        }
    }
}

function render() {
    renderer.render(scene, camera);
}

// Start Game Loop
createLoop(update, render);

console.log('Road Rash Clone Prototype Initialized');
