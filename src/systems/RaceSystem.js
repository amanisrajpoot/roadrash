export class RaceSystem {
    constructor(player, enemies) {
        this.player = player;
        this.enemies = enemies;

        this.raceDistance = 2000;
        this.startZ = player.position.z;
        this.finished = false;
    }

    update() {
        const progress = this.player.position.z - this.startZ;

        if (progress >= this.raceDistance && !this.finished) {
            this.finished = true;
            console.log("🏁 RACE FINISHED");
        }
    }

    getPosition() {
        let rank = 1;

        for (const enemy of this.enemies) {
            if (enemy.mesh.position.z > this.player.position.z) {
                rank++;
            }
        }

        return rank;
    }
}