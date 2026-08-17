/**
 * Traditional Indian Ambient Background Particles for Phase 1 Scan Screen.
 * Features floating golden Rangoli stars, marigold petal sparks, and warm amber light motes.
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
    
    // Spawn 85 traditional ambient particles
    for (let i = 0; i < 85; i++) {
      const type = Math.random();
      bgParticles.push({
        x: Math.random() * bgCanvas.width,
        y: Math.random() * bgCanvas.height,
        radius: Math.random() * 3 + 1.2,
        vy: -Math.random() * 0.45 - 0.15,
        vx: Math.sin(Math.random() * Math.PI * 2) * 0.2,
        alpha: Math.random() * 0.5 + 0.2,
        pulseSpeed: Math.random() * 0.02 + 0.005,
        pulse: Math.random() * Math.PI,
        color: type > 0.6 ? '#ff8c00' : (type > 0.3 ? '#ffd700' : '#b8860b'),
        isStar: Math.random() > 0.7
      });
    }
  }

  function drawStar(ctx, cx, cy, spikes, outerRadius, innerRadius) {
    let rot = Math.PI / 2 * 3;
    let x = cx;
    let y = cy;
    let step = Math.PI / spikes;

    ctx.beginPath();
    ctx.moveTo(cx, cy - outerRadius);
    for (let i = 0; i < spikes; i++) {
      x = cx + Math.cos(rot) * outerRadius;
      y = cy + Math.sin(rot) * outerRadius;
      ctx.lineTo(x, y);
      rot += step;

      x = cx + Math.cos(rot) * innerRadius;
      y = cy + Math.sin(rot) * innerRadius;
      ctx.lineTo(x, y);
      rot += step;
    }
    ctx.lineTo(cx, cy - outerRadius);
    ctx.closePath();
    ctx.fill();
  }

  function animateBgParticles() {
    const scanScreen = document.getElementById('scan-screen');
    if (scanScreen && scanScreen.classList.contains('hidden')) return;

    bgCtx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);
    for (let p of bgParticles) {
      p.y += p.vy;
      p.x += p.vx;
      p.pulse += p.pulseSpeed;

      if (p.y < -10) {
        p.y = bgCanvas.height + 10;
        p.x = Math.random() * bgCanvas.width;
      }

      const alpha = p.alpha + Math.sin(p.pulse) * 0.2;
      bgCtx.globalAlpha = Math.max(0.1, Math.min(1.0, alpha));
      bgCtx.fillStyle = p.color;

      if (p.isStar) {
        drawStar(bgCtx, p.x, p.y, 4, p.radius * 2, p.radius * 0.8);
      } else {
        bgCtx.beginPath();
        bgCtx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        bgCtx.fill();
      }
    }
    bgCtx.globalAlpha = 1.0;
    requestAnimationFrame(animateBgParticles);
  }

  resizeParticles();
  animateBgParticles();
  window.addEventListener('resize', resizeParticles);
}
