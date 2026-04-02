export class ProgressionSystem {
    constructor() {
        this.level = 1;
        this.wins = 0;
        this.requiredWins = 2;
    }

    registerWin() {
        this.wins++;

        if (this.wins >= this.requiredWins) {
            this.level++;
            this.wins = 0;

            console.log("🔥 LEVEL UP:", this.level);
        }
    }
}