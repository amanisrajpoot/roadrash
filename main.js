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

// ... Bike Setup
const bikeGeometry = new THREE.BoxGeometry(0.5, 1, 2);
const bikeMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 });
const bike = new THREE.Mesh(bikeGeometry, bikeMaterial);
bike.position.set(0, 0.5, 0);
bike.castShadow = true;
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
const uiElement = document.getElementById('ui');

function update(delta) {
    totalTime += delta;
    
    // Update bike physics with keyboard input
    bikePhysics.update(delta, controller.keys);
    
    // Update road recycling
    roadManager.update(bike.position.z);
    
    // Update traffic
    trafficManager.update(delta, bike.position.z);
    
    // Update Enemy AI
    enemyAI.update(delta, totalTime);
    
    // Update effects (FOV, Shake)
    effectsManager.update(delta, bikePhysics.speed);
    
    // Update UI
    uiElement.innerHTML = `
        <h1>ROAD RASH CLONE</h1>
        <p>SPEED: ${Math.round(bikePhysics.speed)} MPH</p>
        <p>J: PUNCH | K: KICK | WASD: MOVE</p>
    `;
    
    // Update combat
    if (!bikePhysics.isCrashed) {
        combatSystem.update(delta, totalTime, controller.keys);
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
