// ====== MODULE IMPORTS ======
import { initBgParticles } from './modules/bgParticles.js';
import { initRibbonPhysics } from './modules/ribbonPhysics.js';
import { initScanScreen } from './modules/scanScreen.js';

// ====== APPLICATION INITIALIZATION ======
document.addEventListener('DOMContentLoaded', () => {
  // Initialize Scan Screen Background Particles
  initBgParticles();

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
