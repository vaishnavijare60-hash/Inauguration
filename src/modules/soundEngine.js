import bgMusicUrl from '../assets/background_music.mp3';

/**
 * Traditional Indian Ceremonial Sound Engine & Acoustic Synthesizer.
 * Features synthesized Indian Tanpura Drone, Shehnai Melodic Swells, Temple Ghanti Chimes, 
 * Shankhnad (Conch Shell) resonance, Dhol/Nagada celebration beats, Silk Curtain Swells, and Looping Background Music.
 */
export class SoundEngine {
  constructor() {
    this.ctx = null;
    this.scanOsc = null;
    this.scanGain = null;
    this.lfo = null;
    this.initialized = false;
    this.bgGain = null;
    this.isPlayingMusic = false;
    this.isMuted = false;
    this.bgTimer = null;
    this.tanpuraNodes = [];
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
      try { this.ctx.resume(); } catch (e) { }
    }
  }

  /* ====== Traditional Indian Ceremonial Looping Background Music ====== */
  startBackgroundMusic() {
    try {
      this.ensureContext();

      if (!this.bgAudio) {
        this.bgAudio = new Audio(bgMusicUrl || '/assets/background_music.mp3');
        this.bgAudio.loop = true;
        this.bgAudio.volume = 0.65;

        // Gapless seamless loop listener
        this.bgAudio.addEventListener('timeupdate', () => {
          if (this.bgAudio.duration && this.bgAudio.currentTime >= this.bgAudio.duration - 0.25) {
            this.bgAudio.currentTime = 0;
          }
        });
      }

      if (this.bgAudio.paused) {
        const playPromise = this.bgAudio.play();
        if (playPromise !== undefined) {
          playPromise.then(() => {
            this.isPlayingMusic = true;
          }).catch(err => {
            console.warn("Background music waiting for user gesture", err);
          });
        }
      }
    } catch (e) {
      console.warn("Background music error", e);
    }
  }

  stopBackgroundMusic() {
    this.isPlayingMusic = false;
    if (this.bgAudio) {
      try {
        let vol = this.bgAudio.volume;
        const fadeInterval = setInterval(() => {
          vol -= 0.1;
          if (vol <= 0) {
            clearInterval(fadeInterval);
            this.bgAudio.pause();
            this.bgAudio.currentTime = 0;
            this.bgAudio.volume = 0.65;
          } else {
            this.bgAudio.volume = Math.max(0, vol);
          }
        }, 40);
      } catch (e) {
        try {
          this.bgAudio.pause();
          this.bgAudio.currentTime = 0;
        } catch (err) {}
      }
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.bgAudio) {
      this.bgAudio.muted = this.isMuted;
    }
    return this.isMuted;
  }

  /* Dholak / Bayan Warm Bass Stroke */
  playDholakBass() {
    try {
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(120, now);
      osc.frequency.exponentialRampToValueAtTime(50, now + 0.3);

      gain.gain.setValueAtTime(0.45, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.32);

      osc.connect(gain);
      gain.connect(this.bgGain || this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.35);
    } catch (e) {}
  }

  /* Temple Ghanti / Jalra Metallic Chime */
  playTempleChime() {
    try {
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const freqs = [1046.50, 1318.51, 1567.98, 2093.00];

      freqs.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.04);

        gain.gain.setValueAtTime(0.25, now + idx * 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.04 + 1.2);

        osc.connect(gain);
        gain.connect(this.bgGain || this.ctx.destination);
        osc.start(now + idx * 0.04);
        osc.stop(now + idx * 0.04 + 1.2);
      });
    } catch (e) {}
  }

  /* Shehnai Melodic Phrase Swell */
  playShehnaiMelody() {
    try {
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const notes = [277.18, 311.13, 349.23, 415.30, 466.16, 554.37];
      
      notes.slice(0, 5).forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, now + idx * 0.28);
        osc.frequency.linearRampToValueAtTime(freq * 1.05, now + idx * 0.28 + 0.22);

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(900, now + idx * 0.28);
        filter.Q.setValueAtTime(2.5, now + idx * 0.28);

        gain.gain.setValueAtTime(0.001, now + idx * 0.28);
        gain.gain.linearRampToValueAtTime(0.35, now + idx * 0.28 + 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.28 + 0.4);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.bgGain || this.ctx.destination);
        osc.start(now + idx * 0.3);
        osc.stop(now + idx * 0.3 + 0.4);
      });
    } catch (e) {}
  }

  /* Royal Silk Curtain Opening Sound Effect */
  playCurtain() {
    try {
      this.ensureContext();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      // Soft sweeping noise for silk fabric movement
      const bufferSize = Math.floor(this.ctx.sampleRate * 1.0);
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(300, now);
      filter.frequency.exponentialRampToValueAtTime(1000, now + 0.5);
      filter.frequency.exponentialRampToValueAtTime(200, now + 1.0);
      filter.Q.setValueAtTime(1.5, now);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.08, now + 0.3);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.0);

      whiteNoise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      whiteNoise.start(now);
      whiteNoise.stop(now + 1.05);

      this.playTempleChime();
    } catch (e) {
      console.warn("Curtain sound error", e);
    }
  }

  /* Traditional Ghungroo / Jalra Hover Chime */
  playHover() {
    try {
      this.ensureContext();
      if (!this.ctx) return;
      this.playTempleChime();
    } catch (e) {}
  }

  /* Temple Bell & Tanpura Scan Resonance */
  startScan() {
    try {
      this.ensureContext();
      if (!this.ctx || this.scanOsc) return;

      const now = this.ctx.currentTime;
      this.scanOsc = this.ctx.createOscillator();
      const subOsc = this.ctx.createOscillator();
      this.scanGain = this.ctx.createGain();

      this.scanOsc.type = 'sine';
      this.scanOsc.frequency.setValueAtTime(277.18, now);
      this.scanOsc.frequency.linearRampToValueAtTime(415.30, now + 1.0);

      subOsc.type = 'sawtooth';
      subOsc.frequency.setValueAtTime(138.59, now);

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(600, now);

      this.scanGain.gain.setValueAtTime(0.001, now);
      this.scanGain.gain.linearRampToValueAtTime(0.07, now + 0.2);

      this.scanOsc.connect(filter);
      subOsc.connect(filter);
      filter.connect(this.scanGain);
      this.scanGain.connect(this.ctx.destination);

      this.scanOsc.start(now);
      subOsc.start(now);
      this.lfo = subOsc;
    } catch (e) {}
  }

  stopScan() {
    try {
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
    } catch (e) {}
  }

  /* Traditional Shankhnad (Conch Shell) & Temple Bell Celebration Flourish */
  playGranted() {
    try {
      this.ensureContext();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      const shankhOsc = this.ctx.createOscillator();
      const shankhGain = this.ctx.createGain();
      const shankhFilter = this.ctx.createBiquadFilter();

      shankhOsc.type = 'sawtooth';
      shankhOsc.frequency.setValueAtTime(220, now);
      shankhOsc.frequency.linearRampToValueAtTime(293.66, now + 0.4);
      shankhOsc.frequency.linearRampToValueAtTime(277.18, now + 1.2);

      shankhFilter.type = 'bandpass';
      shankhFilter.frequency.setValueAtTime(550, now);
      shankhFilter.Q.setValueAtTime(4.0, now);

      shankhGain.gain.setValueAtTime(0.001, now);
      shankhGain.gain.linearRampToValueAtTime(0.18, now + 0.3);
      shankhGain.gain.exponentialRampToValueAtTime(0.001, now + 1.4);

      shankhOsc.connect(shankhFilter);
      shankhFilter.connect(shankhGain);
      shankhGain.connect(this.ctx.destination);
      shankhOsc.start(now);
      shankhOsc.stop(now + 1.4);

      this.playTempleChime();
    } catch (e) {}
  }

  /* Shehnai Fanfare & Dhol Celebration Beat for Ribbon Cutting */
  playCut() {
    try {
      this.ensureContext();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      for (let i = 0; i < 6; i++) {
        setTimeout(() => {
          this.playDholakBass();
        }, i * 120);
      }

      const chord = [277.18, 349.23, 415.30, 554.37, 698.46, 830.61];
      chord.forEach((freq, i) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, now + 0.05 + i * 0.04);
        osc.frequency.linearRampToValueAtTime(freq * 1.03, now + 0.05 + i * 0.04 + 0.2);

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1200, now);

        gain.gain.setValueAtTime(0.001, now + 0.05 + i * 0.04);
        gain.gain.linearRampToValueAtTime(0.12, now + 0.08 + i * 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 2.5);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + 0.05 + i * 0.04);
        osc.stop(now + 2.5);
      });
    } catch (e) {}
  }
}

export const soundEngine = new SoundEngine();
