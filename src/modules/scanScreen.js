import { soundEngine } from './soundEngine.js';

/**
 * Executive Ceremony Flow: Biometric Scanner Touch -> Silk Curtains Reveal -> Ribbon Cutting Page
 * (Bypasses lock overlay completely for a clean, direct executive transition)
 * @param {Function} onCeremonyStart Callback triggered when curtains open to start ribbon physics
 */
export function initScanScreen(onCeremonyStart) {
  const handArea = document.getElementById('hand-area');
  const scanStatus = document.getElementById('scan-status');
  const scanProgress = document.getElementById('scan-progress');

  if (!handArea) return;

  handArea.addEventListener('mouseenter', () => soundEngine.playHover());

  function startScan() {
    if (handArea.classList.contains('scanning') || handArea.classList.contains('granted')) return;

    soundEngine.ensureContext();
    soundEngine.startScan();

    handArea.classList.add('scanning');

    let pct = 0;
    const interval = setInterval(() => {
      pct += Math.floor(Math.random() * 8) + 4;
      if (pct > 100) pct = 100;

      if (scanProgress) scanProgress.style.width = pct + '%';

      if (pct >= 100) {
        clearInterval(interval);
        soundEngine.stopScan();
        soundEngine.playGranted();

        handArea.classList.remove('scanning');
        handArea.classList.add('granted');

        setTimeout(startCurtainPhase, 600);
      }
    }, 60);
  }

  handArea.addEventListener('click', startScan);
  handArea.addEventListener('touchstart', (e) => {
    e.preventDefault();
    startScan();
  });

  function startCurtainPhase() {
    const scanScreen = document.getElementById('scan-screen');
    if (scanScreen) scanScreen.classList.add('hidden');

    soundEngine.playCurtain();

    setTimeout(() => {
      const curtainLeft = document.querySelector('.curtain-left');
      const curtainRight = document.querySelector('.curtain-right');
      if (curtainLeft) curtainLeft.classList.add('open');
      if (curtainRight) curtainRight.classList.add('open');

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
      }, 500);
    }, 250);
  }
}
