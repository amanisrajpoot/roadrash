export class AudioManager {
    constructor() {
        this.ctx = null;
        this.engineOsc = null;
        this.engineGain = null;
        this.windSource = null;
        this.windGain = null;
        this.isStarted = false;
    }

    init() {
        if (this.ctx) return;
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        this.setupEngine();
        this.setupWind();
        this.isStarted = true;
    }

    setupEngine() {
        // Simple Sawtooth for engine "growl"
        this.engineOsc = this.ctx.createOscillator();
        this.engineOsc.type = 'sawtooth';
        this.engineOsc.frequency.value = 50;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 400;

        this.engineGain = this.ctx.createGain();
        this.engineGain.gain.value = 0; // Start silent

        this.engineOsc.connect(filter);
        filter.connect(this.engineGain);
        this.engineGain.connect(this.ctx.destination);

        this.engineOsc.start();
    }

    setupWind() {
        // Procedural White Noise for wind
        const bufferSize = 2 * this.ctx.sampleRate;
        const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            output[i] = Math.random() * 2 - 1;
        }

        this.windSource = this.ctx.createBufferSource();
        this.windSource.buffer = noiseBuffer;
        this.windSource.loop = true;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 200;

        this.windGain = this.ctx.createGain();
        this.windGain.gain.value = 0;

        this.windSource.connect(filter);
        filter.connect(this.windGain);
        this.windGain.connect(this.ctx.destination);

        this.windSource.start();
    }

    update(speedPerc) {
        if (!this.isStarted) return;
        
        // SpeedPerc: 0.0 to 1.0
        
        // Update Engine (Pitch & Volume)
        const baseFreq = 40;
        const maxFreq = 120;
        this.engineOsc.frequency.setTargetAtTime(baseFreq + speedPerc * maxFreq, this.ctx.currentTime, 0.1);
        this.engineGain.gain.setTargetAtTime(0.05 + speedPerc * 0.1, this.ctx.currentTime, 0.1);

        // Update Wind (Volume)
        this.windGain.gain.setTargetAtTime(speedPerc * 0.15, this.ctx.currentTime, 0.2);
    }

    playCombatHit(type = 'punch') {
        if (!this.isStarted) return;
        
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.type = type === 'punch' ? 'square' : 'triangle';
        osc.frequency.setValueAtTime(150, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(40, this.ctx.currentTime + 0.15);
        
        gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.15);
        
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        
        osc.start();
        osc.stop(this.ctx.currentTime + 0.15);
    }

    playCrash() {
        if (!this.isStarted) return;
        
        const noiseBuffer = this.ctx.createBuffer(1, this.ctx.sampleRate * 0.5, this.ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        for (let i = 0; i < output.length; i++) output[i] = Math.random() * 2 - 1;

        const source = this.ctx.createBufferSource();
        source.buffer = noiseBuffer;
        
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(800, this.ctx.currentTime);
        filter.frequency.exponentialRampToValueAtTime(100, this.ctx.currentTime + 0.4);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.4, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.4);

        source.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);
        
        source.start();
        source.stop(this.ctx.currentTime + 0.4);
    }
}
