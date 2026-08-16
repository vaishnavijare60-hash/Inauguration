import { soundEngine } from './soundEngine.js';

/**
 * Multi-Phase Ceremony Orchestration Module (Scanner -> Lock Overlay -> Curtains -> Ribbon)
 * @param {Function} onCeremonyStart Callback triggered when curtains open to start ribbon physics
 */
export function initScanScreen(onCeremonyStart) {
  const handArea = document.getElementById('hand-area');
  const scanStatus = document.getElementById('scan-status');
  const scanProgress = document.getElementById('scan-progress');
  const scanPercent = document.getElementById('scan-percent');

  if (!handArea) return;

  handArea.addEventListener('mouseenter', () => soundEngine.playHover());

  function startScan() {
    if (handArea.classList.contains('scanning') || handArea.classList.contains('granted')) return;

    soundEngine.ensureContext();
    soundEngine.startScan();

    handArea.classList.add('scanning');
    scanStatus.innerHTML = '<span class="status-symbol">❖</span> AUTHENTICATING AUTHORIZED GUEST...';

    let pct = 0;
    const interval = setInterval(() => {
      pct += Math.floor(Math.random() * 8) + 4;
      if (pct > 100) pct = 100;

      scanProgress.style.width = pct + '%';
      scanPercent.textContent = 'AUTHORIZATION MATCH: ' + pct + '%';

      if (pct >= 100) {
        clearInterval(interval);
        soundEngine.stopScan();
        soundEngine.playGranted();

        handArea.classList.remove('scanning');
        handArea.classList.add('granted');
        scanStatus.innerHTML = '<span class="status-symbol">✓</span> AUTHORIZATION CONFIRMED • WELCOME';
        scanStatus.classList.add('granted');

        setTimeout(startLockPhase, 700);
      }
    }, 70);
  }

  handArea.addEventListener('click', startScan);
  handArea.addEventListener('touchstart', (e) => {
    e.preventDefault();
    startScan();
  });

  function startLockPhase() {
    document.getElementById('scan-screen').classList.add('hidden');
    const lockOverlay = document.getElementById('lock-overlay');
    lockOverlay.classList.add('visible');

    setTimeout(() => {
      soundEngine.playUnlock();
      document.getElementById('lock-shackle').classList.add('unlocked-shackle');

      setTimeout(startCurtainPhase, 700);
    }, 800);
  }

  function startCurtainPhase() {
    document.getElementById('lock-overlay').classList.add('hidden');
    soundEngine.playCurtain();

    setTimeout(() => {
      document.querySelector('.curtain-left').classList.add('open');
      document.querySelector('.curtain-right').classList.add('open');

      setTimeout(() => {
        document.getElementById('college-title').classList.add('animate');
        document.getElementById('ceremony-logo').classList.add('animate');
        document.getElementById('ceremony-title').classList.add('animate');
        if (typeof onCeremonyStart === 'function') {
          onCeremonyStart();
        }
      }, 600);
    }, 300);
  }
}
