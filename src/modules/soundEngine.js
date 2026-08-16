/**
 * Web Audio Synthesizer Sound Engine for ceremony audio feedback.
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
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1200, this.ctx.currentTime + 0.08);
    gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.08);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.08);
  }

  startScan() {
    this.ensureContext();
    if (!this.ctx || this.scanOsc) return;

    this.scanOsc = this.ctx.createOscillator();
    const lfo = this.ctx.createOscillator();
    const lfoGain = this.ctx.createGain();
    this.scanGain = this.ctx.createGain();

    this.scanOsc.type = 'sine';
    this.scanOsc.frequency.setValueAtTime(440, this.ctx.currentTime);

    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(6, this.ctx.currentTime);
    lfoGain.gain.setValueAtTime(80, this.ctx.currentTime);

    lfo.connect(this.scanOsc.frequency);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1000, this.ctx.currentTime);

    this.scanGain.gain.setValueAtTime(0.01, this.ctx.currentTime);
    this.scanGain.gain.linearRampToValueAtTime(0.12, this.ctx.currentTime + 0.2);

    this.scanOsc.connect(filter);
    filter.connect(this.scanGain);
    this.scanGain.connect(this.ctx.destination);

    lfo.start();
    this.scanOsc.start();
    this.lfo = lfo;
  }

  stopScan() {
    if (this.scanGain && this.ctx) {
      this.scanGain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 0.2);
      setTimeout(() => {
        if (this.scanOsc) {
          try { this.scanOsc.stop(); this.scanOsc.disconnect(); } catch (e) { }
          this.scanOsc = null;
        }
        if (this.lfo) {
          try { this.lfo.stop(); this.lfo.disconnect(); } catch (e) { }
          this.lfo = null;
        }
      }, 200);
    }
  }

  playGranted() {
    this.ensureContext();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    const notes = [523.25, 659.25, 783.99, 1046.50];
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);
      gain.gain.setValueAtTime(0.001, now + idx * 0.08);
      gain.gain.linearRampToValueAtTime(0.18, now + idx * 0.08 + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.6);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.6);
    });

    const subOsc = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(150, now);
    subOsc.frequency.exponentialRampToValueAtTime(40, now + 0.8);
    subGain.gain.setValueAtTime(0.3, now);
    subGain.gain.exponentialRampToValueAtTime(0.01, now + 0.8);
    subOsc.connect(subGain);
    subGain.connect(this.ctx.destination);
    subOsc.start(now);
    subOsc.stop(now + 0.8);
  }

  playUnlock() {
    this.ensureContext();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(1200, now);
    osc.frequency.exponentialRampToValueAtTime(180, now + 0.15);
    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.15);

    const energyOsc = this.ctx.createOscillator();
    const energyGain = this.ctx.createGain();
    energyOsc.type = 'sine';
    energyOsc.frequency.setValueAtTime(1800, now + 0.1);
    energyOsc.frequency.exponentialRampToValueAtTime(2400, now + 0.4);
    energyGain.gain.setValueAtTime(0.15, now + 0.1);
    energyGain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
    energyOsc.connect(energyGain);
    energyGain.connect(this.ctx.destination);
    energyOsc.start(now + 0.1);
    energyOsc.stop(now + 0.4);
  }

  playCurtain() {
    this.ensureContext();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    const bufferSize = Math.floor(this.ctx.sampleRate * 1.2);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(150, now);
    filter.frequency.exponentialRampToValueAtTime(600, now + 0.6);
    filter.frequency.exponentialRampToValueAtTime(100, now + 1.2);
    filter.Q.setValueAtTime(2, now);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.18, now + 0.5);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

    whiteNoise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    whiteNoise.start(now);
    whiteNoise.stop(now + 1.2);
  }

  playCut() {
    this.ensureContext();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    const sliceOsc = this.ctx.createOscillator();
    const sliceGain = this.ctx.createGain();
    sliceOsc.type = 'sawtooth';
    sliceOsc.frequency.setValueAtTime(2800, now);
    sliceOsc.frequency.exponentialRampToValueAtTime(300, now + 0.12);
    sliceGain.gain.setValueAtTime(0.3, now);
    sliceGain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
    sliceOsc.connect(sliceGain);
    sliceGain.connect(this.ctx.destination);
    sliceOsc.start(now);
    sliceOsc.stop(now + 0.12);

    const chord = [293.66, 369.99, 440.00, 587.33, 739.99, 880.00];
    chord.forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + 0.05 + i * 0.04);
      gain.gain.setValueAtTime(0.001, now + 0.05 + i * 0.04);
      gain.gain.linearRampToValueAtTime(0.15, now + 0.08 + i * 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.8);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + 0.05 + i * 0.04);
      osc.stop(now + 1.8);
    });

    for (let i = 0; i < 6; i++) {
      const chimeOsc = this.ctx.createOscillator();
      const chimeGain = this.ctx.createGain();
      chimeOsc.type = 'sine';
      const chimeFreq = 1200 + Math.random() * 2000;
      const startTime = now + 0.3 + i * 0.15;
      chimeOsc.frequency.setValueAtTime(chimeFreq, startTime);
      chimeGain.gain.setValueAtTime(0.08, startTime);
      chimeGain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.4);
      chimeOsc.connect(chimeGain);
      chimeGain.connect(this.ctx.destination);
      chimeOsc.start(startTime);
      chimeOsc.stop(startTime + 0.4);
    }
  }
}

export const soundEngine = new SoundEngine();
