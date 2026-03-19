import * as THREE from 'three';

export class RoadManager {
    constructor(scene) {
        this.scene = scene;
        this.tiles = [];
        this.tileSize = 100;
        this.numTiles = 6;
        this.roadWidth = 20;
        this.shoulderWidth = 50;
        
        this.init();
    }
    
    init() {
        // Road surface geometry
        const roadGeometry = new THREE.PlaneGeometry(this.roadWidth, this.tileSize);
        const roadMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x222222, 
            roughness: 0.8,
            metalness: 0.2
        });
        
        // Shoulder/Grass geometry
        const grassGeometry = new THREE.PlaneGeometry(this.shoulderWidth, this.tileSize);
        const grassMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x1a4a1a, 
            roughness: 0.9 
        });
        
        // Stripe geometry
        const stripeGeometry = new THREE.PlaneGeometry(0.4, 12);
        const stripeMaterial = new THREE.MeshStandardMaterial({ 
            color: 0xffcc00, 
            emissive: 0xffcc00,
            emissiveIntensity: 0.2
        });
        
        for (let i = 0; i < this.numTiles; i++) {
            const tile = new THREE.Group();
            
            // Road surface
            const road = new THREE.Mesh(roadGeometry, roadMaterial);
            road.rotation.x = -Math.PI / 2;
            road.receiveShadow = true;
            tile.add(road);
            
            // Grass Left
            const grassL = new THREE.Mesh(grassGeometry, grassMaterial);
            grassL.rotation.x = -Math.PI / 2;
            grassL.position.x = -(this.roadWidth / 2 + this.shoulderWidth / 2);
            grassL.position.y = -0.05;
            tile.add(grassL);
            
            // Grass Right
            const grassR = new THREE.Mesh(grassGeometry, grassMaterial);
            grassR.rotation.x = -Math.PI / 2;
            grassR.position.x = (this.roadWidth / 2 + this.shoulderWidth / 2);
            grassR.position.y = -0.05;
            tile.add(grassR);
            
            // Stripes
            for (let j = 0; j < 4; j++) {
                const stripe = new THREE.Mesh(stripeGeometry, stripeMaterial);
                stripe.rotation.x = -Math.PI / 2;
                stripe.position.y = 0.02;
                stripe.position.z = -this.tileSize / 2 + (j * 25) + 12.5;
                tile.add(stripe);
            }
            
            // Position tile along Z
            tile.position.z = i * this.tileSize;
            this.scene.add(tile);
            this.tiles.push(tile);
        }
    }
    
    update(playerZ) {
        // Logic to recycle tiles
        for (const tile of this.tiles) {
            if (playerZ - tile.position.z > this.tileSize) {
                tile.position.z += this.numTiles * this.tileSize;
            }
        }
    }
}
