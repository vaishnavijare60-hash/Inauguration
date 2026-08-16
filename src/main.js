// ====== VITE STYLES IMPORTS ======
import './styles/variables.css';
import './styles/base.css';
import './styles/scan-screen.css';
import './styles/lock-overlay.css';
import './styles/curtains.css';
import './styles/ceremony.css';

// ====== MODULE IMPORTS ======
import { initAutoFullscreen } from './modules/fullscreen.js';
import { initBgParticles } from './modules/bgParticles.js';
import { initRibbonPhysics } from './modules/ribbonPhysics.js';
import { initScanScreen } from './modules/scanScreen.js';

// ====== APPLICATION INITIALIZATION ======
document.addEventListener('DOMContentLoaded', () => {
  // Initialize Auto-Fullscreen
  initAutoFullscreen();

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
