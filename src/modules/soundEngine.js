/**
 * Executive Acoustic Sound Engine & Voice Synthesizer for Official Ceremony Feedback.
 * Clean, warm, high-end acoustic harmonics + Natural Voice Announcements.
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

  /* Professional Executive Speech Voice Announcement */
  speakVoice(text) {
    if (!('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const msg = new SpeechSynthesisUtterance(text);
      msg.rate = 0.92; // Warm, executive pacing
      msg.pitch = 1.0;
      msg.volume = 1.0;

      const voices = window.speechSynthesis.getVoices();
      const chosenVoice = voices.find(v => v.lang.startsWith('en') && (
        v.name.includes('Google') || 
        v.name.includes('Natural') || 
        v.name.includes('Samantha') || 
        v.name.includes('Daniel') || 
        v.name.includes('Karen') || 
        v.name.includes('Serena') || 
        v.name.includes('Oliver')
      )) || voices.find(v => v.lang.startsWith('en'));

      if (chosenVoice) {
        msg.voice = chosenVoice;
      }
      window.speechSynthesis.speak(msg);
    } catch (e) {
      console.warn("Voice Synthesis warning:", e);
    }
  }

  /* Soft, warm acoustic hover chime */
  playHover() {
    this.ensureContext();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(523.25, now); // C5
    osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.12); // E5

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.08, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.12);
  }

  /* Warm ambient scan resonance */
  startScan() {
    this.ensureContext();
    if (!this.ctx || this.scanOsc) return;

    const now = this.ctx.currentTime;
    this.scanOsc = this.ctx.createOscillator();
    const subOsc = this.ctx.createOscillator();
    this.scanGain = this.ctx.createGain();

    this.scanOsc.type = 'sine';
    this.scanOsc.frequency.setValueAtTime(220, now); // Warm A3 tone
    this.scanOsc.frequency.linearRampToValueAtTime(329.63, now + 2.0); // Smooth rise to E4

    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(110, now); // A2 fundamental octave

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(600, now);

    this.scanGain.gain.setValueAtTime(0.001, now);
    this.scanGain.gain.linearRampToValueAtTime(0.08, now + 0.3);

    this.scanOsc.connect(filter);
    subOsc.connect(filter);
    filter.connect(this.scanGain);
    this.scanGain.connect(this.ctx.destination);

    this.scanOsc.start(now);
    subOsc.start(now);
    this.lfo = subOsc;
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

  /* Executive Inauguration Harmonic Fanfare Chord */
  playGranted() {
    this.ensureContext();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    // Warm Major 9th Acoustic Chord (A - C# - E - G# - B)
    const chordNotes = [220.00, 277.18, 329.63, 415.30, 493.88, 659.25];
    chordNotes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.05);

      gain.gain.setValueAtTime(0.001, now + idx * 0.05);
      gain.gain.linearRampToValueAtTime(0.12, now + idx * 0.05 + 0.06);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.05 + 1.4);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + idx * 0.05);
      osc.stop(now + idx * 0.05 + 1.4);
    });
  }

  /* Acoustic Silk Curtain Motion Sweep */
  playCurtain() {
    this.ensureContext();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    const bufferSize = Math.floor(this.ctx.sampleRate * 1.0);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(200, now);
    filter.frequency.exponentialRampToValueAtTime(800, now + 0.5);
    filter.frequency.exponentialRampToValueAtTime(150, now + 1.0);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.1, now + 0.4);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.0);

    whiteNoise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    whiteNoise.start(now);
    whiteNoise.stop(now + 1.0);
  }

  /* Metallic Ribbon Cut Celebration Chime */
  playCut() {
    this.ensureContext();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    // Crisp metallic shear accent
    const sliceOsc = this.ctx.createOscillator();
    const sliceGain = this.ctx.createGain();
    sliceOsc.type = 'triangle';
    sliceOsc.frequency.setValueAtTime(1800, now);
    sliceOsc.frequency.exponentialRampToValueAtTime(400, now + 0.1);
    sliceGain.gain.setValueAtTime(0.2, now);
    sliceGain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
    sliceOsc.connect(sliceGain);
    sliceGain.connect(this.ctx.destination);
    sliceOsc.start(now);
    sliceOsc.stop(now + 0.1);

    // Warm resonant celebration chord
    const chord = [293.66, 369.99, 440.00, 587.33, 739.99, 880.00, 1174.66];
    chord.forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + 0.04 + i * 0.03);
      gain.gain.setValueAtTime(0.001, now + 0.04 + i * 0.03);
      gain.gain.linearRampToValueAtTime(0.14, now + 0.06 + i * 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 2.0);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + 0.04 + i * 0.03);
      osc.stop(now + 2.0);
    });
  }
}

export const soundEngine = new SoundEngine();
