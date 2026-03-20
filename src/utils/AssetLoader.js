import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export class AssetLoader {
    constructor() {
        this.loader = new GLTFLoader();
        this.cache = new Map();
        this.assets = {
            bike: '/src/assets/models/bike.glb',
            car: '/src/assets/models/car.glb',
            tree: '/src/assets/models/tree.glb',
            pole: '/src/assets/models/pole.glb'
        };
    }

    async loadAll() {
        const promises = Object.entries(this.assets).map(async ([key, url]) => {
            try {
                const gltf = await this.loadModel(url);
                this.cache.set(key, gltf);
                console.log(`Loaded asset: ${key}`);
            } catch (err) {
                console.error(`Failed to load asset: ${key}`, err);
            }
        });
        await Promise.all(promises);
    }

    loadModel(url) {
        return new Promise((resolve, reject) => {
            this.loader.load(url, 
                (gltf) => resolve(gltf),
                undefined,
                (err) => reject(err)
            );
        });
    }

    get(key) {
        const gltf = this.cache.get(key);
        if (!gltf) return null;
        // Return a clone to allow multiple instances
        return THREE.PropertyBinding.clone(gltf.scene); 
        // Note: Simple clone() might not work for skinned meshes, but for these it should be okay.
        // Better way for GLTF:
        // return gltf.scene.clone();
    }
    
    // Improved clone for GLTF scenes
    getClone(key) {
        const gltf = this.cache.get(key);
        if (!gltf) return null;
        const newScene = gltf.scene.clone();
        
        // Ensure materials are shared but hierarchies are unique
        newScene.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });
        
        return newScene;
    }
}
