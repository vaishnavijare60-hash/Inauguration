import { soundEngine } from './soundEngine.js';

/**
 * Executive Ceremony Flow: Biometric Scanner Touch -> Silk Curtains Reveal -> Ribbon Cutting Page
 * @param {Function} onCeremonyStart Callback triggered when curtains open to start ribbon physics
 */
export function initScanScreen(onCeremonyStart) {
  const handArea = document.getElementById('hand-area');
  const handWrapper = document.getElementById('hand-scanner-wrapper');

  if (!handArea) return;

  // Reset scanner state on initialization
  handArea.classList.remove('scanning', 'granted');

  try {
    handArea.addEventListener('mouseenter', () => {
      try { soundEngine.playHover(); } catch (e) {}
    });
  } catch (e) {}

  let isScanningActive = false;

  function startScan() {
    if (isScanningActive || handArea.classList.contains('scanning') || handArea.classList.contains('granted')) return;

    isScanningActive = true;

    try {
      soundEngine.ensureContext();
      soundEngine.startScan();
    } catch (e) {}

    handArea.classList.add('scanning');

    let pct = 0;
    // Exactly 1.0 second scanning duration (25 increments of 4% every 40ms = 1000ms)
    const interval = setInterval(() => {
      pct += 4;
      if (pct > 100) pct = 100;

      if (pct >= 100) {
        clearInterval(interval);
        try { soundEngine.stopScan(); } catch (e) {}
        try { soundEngine.playGranted(); } catch (e) {}

        handArea.classList.remove('scanning');
        handArea.classList.add('granted');

        // Trigger curtain reveal transition after 200ms
        setTimeout(startCurtainPhase, 200);
      }
    }, 40);
  }

  // Handle all interaction pointer events cleanly
  const handleInteraction = (e) => {
    if (e && e.cancelable) e.preventDefault();
    startScan();
  };

  handArea.addEventListener('click', handleInteraction);
  handArea.addEventListener('pointerdown', handleInteraction);
  handArea.addEventListener('touchstart', handleInteraction, { passive: false });

  if (handWrapper) {
    handWrapper.addEventListener('click', handleInteraction);
    handWrapper.addEventListener('pointerdown', handleInteraction);
  }

  function startCurtainPhase() {
    const scanScreen = document.getElementById('scan-screen');
    const curtainLeft = document.querySelector('.curtain-left');
    const curtainRight = document.querySelector('.curtain-right');

    // Stop scan page background music when transitioning to inauguration ceremony page
    try {
      soundEngine.stopBackgroundMusic();
    } catch (e) {}

    try {
      soundEngine.playCurtain();
    } catch (e) {}

    // 1. Hide hand scan screen smoothly
    if (scanScreen) {
      scanScreen.classList.add('hidden');
      setTimeout(() => {
        scanScreen.style.display = 'none';
      }, 600);
    }

    // 2. Open silk curtains to left and right
    if (curtainLeft) curtainLeft.classList.add('open');
    if (curtainRight) curtainRight.classList.add('open');

    // 3. Reveal ceremony titles and start ribbon cloth physics
    setTimeout(() => {
      const colTitle = document.getElementById('college-title');
      const cerLogo = document.getElementById('ceremony-logo');
      const cerTitle = document.getElementById('ceremony-title');

      if (colTitle) colTitle.classList.add('animate');
      if (cerLogo) cerLogo.classList.add('animate');
      if (cerTitle) cerTitle.classList.add('animate');

      if (typeof onCeremonyStart === 'function') {
        onCeremonyStart();
      }
    }, 400);
  }
}
