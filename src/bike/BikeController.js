export class BikeController {
    constructor() {
        this.keys = {
            w: false,
            s: false,
            a: false,
            d: false,
            j: false,
            k: false
        };
        
        window.addEventListener('keydown', (e) => this.handleKey(e.key.toLowerCase(), true));
        window.addEventListener('keyup', (e) => this.handleKey(e.key.toLowerCase(), false));
    }
    
    handleKey(key, isPressed) {
        if (Object.prototype.hasOwnProperty.call(this.keys, key)) {
            this.keys[key] = isPressed;
        }
    }
}
