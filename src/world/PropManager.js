import * as THREE from 'three';

export class PropManager {
    constructor(scene, assetLoader) {
        this.scene = scene;
        this.loader = assetLoader;
        this.activeProps = [];
        this.spacing = 150; // Spacing between clusters of props
        this.lastSpawnZ = 0;
        
        // Define roadside limits for spawning (grass areas) - Pushed way back for safety
        this.leftGrass = { min: -65, max: -50 };
        this.rightGrass = { min: 50, max: 65 };
    }

    update(playerZ) {
        // Spawn more props if we've moved far enough
        if (playerZ + 800 > this.lastSpawnZ) {
            this.spawnCluster(this.lastSpawnZ + this.spacing);
            this.lastSpawnZ += this.spacing;
        }

        // Recycle distant props
        this.activeProps = this.activeProps.filter(prop => {
            if (prop.position.z < playerZ - 100) {
                this.scene.remove(prop);
                return false;
            }
            return true;
        });
    }

    spawnCluster(z) {
        // Spawn trees on both sides
        this.spawnProp('tree', z, this.leftGrass, 3);
        this.spawnProp('tree', z, this.rightGrass, 3);
        
        // Spawn light poles consistently on the right
        this.spawnProp('pole', z, { min: 11, max: 11 }, 1);
    }

    spawnProp(key, z, xRange, count) {
        for (let i = 0; i < count; i++) {
            const prop = this.loader.getClone(key);
            if (!prop) continue;

            const randomX = xRange.min + Math.random() * (xRange.max - xRange.min);
            
            // Absolute safeguard: Reject anything that somehow ends up in the road
            if (Math.abs(randomX) < 18) continue;

            const randomScale = (0.5 + (Math.random() - 0.5) * 0.2); // Base 0.5 verified
            
            prop.position.set(randomX, 0, z + (Math.random() - 0.5) * 10);
            prop.scale.set(randomScale, randomScale, randomScale);
            prop.rotation.y = Math.random() * Math.PI * 2;
            
            this.scene.add(prop);
            this.activeProps.push(prop);
        }
    }
}
