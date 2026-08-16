/**
 * Ambient background particle manager for Phase 1 Scan Screen.
 */
export function initBgParticles() {
  const bgCanvas = document.getElementById('bg-cyber-canvas');
  if (!bgCanvas) return;
  
  const bgCtx = bgCanvas.getContext('2d');
  let bgParticles = [];

  function resizeParticles() {
    bgCanvas.width = window.innerWidth;
    bgCanvas.height = window.innerHeight;
    bgParticles = [];
    for (let i = 0; i < 45; i++) {
      bgParticles.push({
        x: Math.random() * bgCanvas.width,
        y: Math.random() * bgCanvas.height,
        radius: Math.random() * 2.5 + 1,
        vy: -Math.random() * 0.4 - 0.15,
        alpha: Math.random() * 0.45 + 0.15
      });
    }
  }

  function animateBgParticles() {
    const scanScreen = document.getElementById('scan-screen');
    if (scanScreen && scanScreen.classList.contains('hidden')) return;

    bgCtx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);
    for (let p of bgParticles) {
      p.y += p.vy;
      if (p.y < 0) p.y = bgCanvas.height;
      bgCtx.fillStyle = '#b8860b';
      bgCtx.globalAlpha = p.alpha;
      bgCtx.beginPath();
      bgCtx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      bgCtx.fill();
    }
    bgCtx.globalAlpha = 1.0;
    requestAnimationFrame(animateBgParticles);
  }

  resizeParticles();
  animateBgParticles();
  window.addEventListener('resize', resizeParticles);
}
