/**
 * Web Audio Synthesizer Executive Sound Engine for ceremony audio feedback.
 * Custom crafted harmonic acoustics for inauguration authorization.
 */
export class SoundEngine {
  constructor() {
    this.ctx = null;
    this.scanOsc = null;
    this.scanGain = null;
    this.lfo = null;
    this.initialized = false;
  }

  init() {
    if (this.initialized) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
      this.initialized = true;
    } catch (e) {
      console.warn("Web Audio API not supported", e);
    }
  }

  ensureContext() {
    this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playHover() {
    this.ensureContext();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1046.50, now); // High C6 crystal note
    osc.frequency.exponentialRampToValueAtTime(1318.51, now + 0.1); // E6
    
    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.1);
  }

  startScan() {
    this.ensureContext();
    if (!this.ctx || this.scanOsc) return;

    const now = this.ctx.currentTime;
    this.scanOsc = this.ctx.createOscillator();
    const lfo = this.ctx.createOscillator();
    const lfoGain = this.ctx.createGain();
    this.scanGain = this.ctx.createGain();

    // Warm executive resonance hum
    this.scanOsc.type = 'sine';
    this.scanOsc.frequency.setValueAtTime(523.25, now); // C5

    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(4, now); // Gentle 4Hz swell
    lfoGain.gain.setValueAtTime(30, now);

    lfo.connect(this.scanOsc.frequency);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1200, now);

    this.scanGain.gain.setValueAtTime(0.001, now);
    this.scanGain.gain.linearRampToValueAtTime(0.12, now + 0.3);

    this.scanOsc.connect(filter);
    filter.connect(this.scanGain);
    this.scanGain.connect(this.ctx.destination);

    lfo.start();
    this.scanOsc.start();
    this.lfo = lfo;
  }

  stopScan() {
    if (this.scanGain && this.ctx) {
      const now = this.ctx.currentTime;
      this.scanGain.gain.linearRampToValueAtTime(0.001, now + 0.15);
      setTimeout(() => {
        if (this.scanOsc) {
          try { this.scanOsc.stop(); this.scanOsc.disconnect(); } catch (e) { }
          this.scanOsc = null;
        }
        if (this.lfo) {
          try { this.lfo.stop(); this.lfo.disconnect(); } catch (e) { }
          this.lfo = null;
        }
      }, 150);
    }
  }

  playGranted() {
    this.ensureContext();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    // Majestic Executive Arpeggio Chime (C-Major Executive Fanfare: C5, E5, G5, C6)
    const chord = [523.25, 659.25, 783.99, 1046.50, 1318.51];
    chord.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.07);
      
      gain.gain.setValueAtTime(0.001, now + idx * 0.07);
      gain.gain.linearRampToValueAtTime(0.2, now + idx * 0.07 + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.07 + 0.9);
      
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + idx * 0.07);
      osc.stop(now + idx * 0.07 + 0.9);
    });

    // Deep luxury gold bass anchor
    const bassOsc = this.ctx.createOscillator();
    const bassGain = this.ctx.createGain();
    bassOsc.type = 'sine';
    bassOsc.frequency.setValueAtTime(130.81, now); // Low C3
    bassGain.gain.setValueAtTime(0.25, now);
    bassGain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
    bassOsc.connect(bassGain);
    bassGain.connect(this.ctx.destination);
    bassOsc.start(now);
    bassOsc.stop(now + 1.2);
  }

  playCurtain() {
    this.ensureContext();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    // Soft silk curtain ambient air sweep
    const bufferSize = Math.floor(this.ctx.sampleRate * 1.4);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(200, now);
    filter.frequency.exponentialRampToValueAtTime(800, now + 0.7);
    filter.frequency.exponentialRampToValueAtTime(150, now + 1.4);
    filter.Q.setValueAtTime(1.5, now);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.12, now + 0.6);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.4);

    whiteNoise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    whiteNoise.start(now);
    whiteNoise.stop(now + 1.4);
  }

  playCut() {
    this.ensureContext();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    // Sparkling Executive Ribbon Cutting Celebration Fanfare
    const sliceOsc = this.ctx.createOscillator();
    const sliceGain = this.ctx.createGain();
    sliceOsc.type = 'sine';
    sliceOsc.frequency.setValueAtTime(1800, now);
    sliceOsc.frequency.exponentialRampToValueAtTime(400, now + 0.15);
    sliceGain.gain.setValueAtTime(0.25, now);
    sliceGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
    sliceOsc.connect(sliceGain);
    sliceGain.connect(this.ctx.destination);
    sliceOsc.start(now);
    sliceOsc.stop(now + 0.15);

    // Warm golden acoustic chord resonance
    const chord = [392.00, 493.88, 587.33, 783.99, 987.77, 1174.66];
    chord.forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + 0.04 + i * 0.03);
      gain.gain.setValueAtTime(0.001, now + 0.04 + i * 0.03);
      gain.gain.linearRampToValueAtTime(0.16, now + 0.08 + i * 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 2.0);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + 0.04 + i * 0.03);
      osc.stop(now + 2.0);
    });
  }
}

export const soundEngine = new SoundEngine();
