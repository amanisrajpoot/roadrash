export class EconomySystem {
    constructor() {
        this.money = 0;
    }

    reward(position) {
        if (position === 1) this.money += 100;
        else if (position === 2) this.money += 60;
        else this.money += 30;

        console.log("💰 Money:", this.money);
    }

    penalty() {
        this.money = Math.max(0, this.money - 50);
        console.log("💸 Crash penalty");
    }
}