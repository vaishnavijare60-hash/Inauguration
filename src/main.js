// ====== MODULE IMPORTS ======
import { initBgParticles } from './modules/bgParticles.js';
import { initRibbonPhysics } from './modules/ribbonPhysics.js';
import { initScanScreen } from './modules/scanScreen.js';
import { soundEngine } from './modules/soundEngine.js';

// ====== APPLICATION INITIALIZATION ======
document.addEventListener('DOMContentLoaded', () => {
  // Initialize Scan Screen Background Particles
  initBgParticles();

  // Traditional Indian Background Music Auto-Start on First Interaction
  const startMusicOnInteraction = () => {
    soundEngine.ensureContext();
    soundEngine.startBackgroundMusic();
    document.removeEventListener('pointerdown', startMusicOnInteraction);
    document.removeEventListener('keydown', startMusicOnInteraction);
  };
  document.addEventListener('pointerdown', startMusicOnInteraction);
  document.addEventListener('keydown', startMusicOnInteraction);

  // Initialize Ribbon Physics Engine
  const { initCloth, loop } = initRibbonPhysics();
  let ceremonyActive = false;

  window.addEventListener('resize', () => {
    if (ceremonyActive) {
      initCloth();
    }
  });

  // Initialize Multi-Phase Scan & Curtain Flow
  initScanScreen(() => {
    ceremonyActive = true;
    initCloth();
    loop();
  });
});
