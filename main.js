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
import { AssetLoader } from './src/utils/AssetLoader.js';
import { PropManager } from './src/world/PropManager.js';
import { AudioManager } from './src/utils/AudioManager.js';

// --- Essential Setup ---
const renderer = createRenderer();
const scene = createScene();
const camera = createCamera();
const controller = new BikeController();
const effectsManager = new EffectsManager(camera);
const assetLoader = new AssetLoader();
const audioManager = new AudioManager();

// --- Game State Vars ---
let bike, bikePhysics, roadManager, trafficManager, enemyAI, combatSystem, propManager;
let gameState = 'LOADING'; // Start in LOADING state
let totalTime = 0;
let timeScale = 1.0;
let raceTimer = 90;
const finishZ = 5000;

// UI Elements
const speedFill = document.getElementById('speed-fill');
const healthFill = document.getElementById('health-fill');
const timerDisplay = document.getElementById('timer-display');
const victoryOverlay = document.getElementById('victory-overlay');
const defeatOverlay = document.getElementById('defeat-overlay');
const defeatReason = document.getElementById('defeat-reason');

// Global Debug Access
window.game = {
    get bike() { return bike; },
    get bikePhysics() { return bikePhysics; },
    get raceTimer() { return raceTimer; },
    get gameState() { return gameState; },
    get camera() { return camera; },
    get audioManager() { return audioManager; },
    get scene() { return scene; }
};

// --- Initialization ---
async function initGame() {
    console.log('Loading assets...');
    await assetLoader.loadAll();
    
    // Player Bike Setup
    bike = assetLoader.getClone('bike');
    if (!bike) {
        bike = new THREE.Group();
        const bodyGeo = new THREE.BoxGeometry(0.4, 0.8, 1.8);
        const bodyMat = new THREE.MeshStandardMaterial({ color: 0xff0000 });
        bike.add(new THREE.Mesh(bodyGeo, bodyMat));
    } else {
        // Precise scale and orientation fix
        bike.rotation.y = Math.PI; 
        bike.scale.set(0.02, 0.02, 0.02); 
    }
    bike.position.set(0, 0.1, 0); // Lowered Y to match smaller scale
    scene.add(bike);
    
    // Core Component Setup
    bikePhysics = new BikePhysics(bike);
    roadManager = new RoadManager(scene);
    trafficManager = new TrafficManager(scene, assetLoader);
    enemyAI = new EnemyAI(scene, bike, assetLoader);
    propManager = new PropManager(scene, assetLoader);
    combatSystem = new CombatSystem(bike, [trafficManager, enemyAI], effectsManager);
    
    // Scene Finalization (already handled in createScene, but ensuring visibility)
    scene.background = new THREE.Color(0x87ceeb);
    
    // Unlock Audio Context
    window.addEventListener('mousedown', () => audioManager.init(), { once: true });
    window.addEventListener('keydown', () => audioManager.init(), { once: true });
    
    gameState = 'RUNNING'; // NOW switch to running
    console.log('Game Ready!');
}

// --- Main Loop ---
function update(delta) {
    if (gameState !== 'RUNNING') return;

    const safeDelta = Math.min(delta, 0.1);
    timeScale = THREE.MathUtils.lerp(timeScale, 1.0, 6 * safeDelta);
    const scaledDelta = safeDelta * timeScale;
    totalTime += scaledDelta;
    
    // Timer
    raceTimer -= scaledDelta;
    if (raceTimer <= 0) {
        raceTimer = 0;
        endGame('DEFEAT', 'OUT OF TIME');
    }
    
    if (timerDisplay) {
        const mins = Math.floor(raceTimer / 60);
        const secs = Math.floor(raceTimer % 60);
        timerDisplay.innerText = `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }

    // Bike & System Updates
    bikePhysics.update(scaledDelta, controller.keys);
    roadManager.update(bike.position.z);
    propManager.update(bike.position.z);
    trafficManager.update(scaledDelta, bike.position.z);
    enemyAI.update(scaledDelta, totalTime);
    
    // Effects & Audio
    effectsManager.update(delta, bikePhysics.speed);
    
    // Update Audio
    const speedPerc = Math.min(1.0, bikePhysics.speed / (bikePhysics.maxSpeed || 80));
    audioManager.update(speedPerc);
    
    // Camera Follow
    updateCameraFollow(camera, bike, delta);
    
    // Combat & Collisions
    if (!bikePhysics.isCrashed) {
        const hit = combatSystem.update(scaledDelta, totalTime, controller.keys);
        if (hit) {
            timeScale = 0.15;
            audioManager.playCombatHit('punch');
        }
        
        // AI Attacks
        if (enemyAI.keys.j || enemyAI.keys.k) {
            const distZ = Math.abs(bike.position.z - enemyAI.mesh.position.z);
            const distX = Math.abs(bike.position.x - enemyAI.mesh.position.x);
            if (distZ < 2.5 && distX < 1.5) {
                bikePhysics.takeDamage(15);
                effectsManager.shake(0.8);
                audioManager.playCombatHit('kick');
                enemyAI.keys.j = enemyAI.keys.k = false;
            }
        }
        
        checkCollisions();
    }
    
    // HUD Sync
    if (speedFill) speedFill.style.width = `${(bikePhysics.speed / bikePhysics.maxSpeed) * 100}%`;
    if (healthFill) healthFill.style.width = `${bikePhysics.health}%`;
    
    // Game Over Checks
    if (bike.position.z >= finishZ) endGame('VICTORY');
    if (bikePhysics.isDead) endGame('DEFEAT', 'BIKE DESTROYED');
}

function checkCollisions() {
    const playerPos = bike.position;
    for (const car of trafficManager.activeCars) {
        const dx = playerPos.x - car.position.x;
        const dz = playerPos.z - car.position.z;
        if (Math.abs(dx) < 2.5 && Math.abs(dz) < 5.0) {
            bikePhysics.isCrashed = true;
            bikePhysics.takeDamage(25);
            effectsManager.shake(2.0);
            audioManager.playCrash();
            break;
        }
    }
}

function endGame(state, reason) {
    gameState = state;
    if (state === 'VICTORY') victoryOverlay.style.visibility = 'visible';
    else {
        defeatOverlay.style.visibility = 'visible';
        defeatReason.innerText = reason || 'WASTED';
    }
}

function render() {
    renderer.render(scene, camera);
}

// --- Bootstrap ---
initGame();
createLoop(update, render);
