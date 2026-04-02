import * as THREE from 'three';

export class PoliceSystem {
    constructor(scene, player, loader) {
        this.scene = scene;
        this.player = player;
        this.loader = loader;

        this.police = null;
        this.active = false;
    }

    spawn() {
        this.police = this.loader.getClone('bike');

        if (!this.police) return;

        this.police.scale.set(0.02, 0.02, 0.02);
        this.police.position.copy(this.player.position);
        this.police.position.z -= 50;

        this.scene.add(this.police);
        this.active = true;
    }

    update(delta) {
        if (!this.active || !this.police) return;

        const dz = this.player.position.z - this.police.position.z;
        const dx = this.player.position.x - this.police.position.x;

        this.police.position.z += dz * 0.03;
        this.police.position.x += dx * 0.05;

        if (Math.abs(dz) < 2 && Math.abs(dx) < 2) {
            console.log("🚓 BUSTED!");
            this.active = false;
        }
    }
}