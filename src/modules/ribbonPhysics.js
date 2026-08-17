import { soundEngine } from './soundEngine.js';

export function initRibbonPhysics() {
  const canvas = document.getElementById('c');
  if (!canvas) return { initCloth: () => {}, loop: () => {} };

  const ctx = canvas.getContext('2d');

  let width, height;
  let points = [];
  let constraints = [];
  let trail = [];
  let confetti = [];
  let sparks = [];
  let activeHoriz = null;

  const friction = 0.99;
  let gravity = 0.3;
  let isSevered = false;

  const spacing = 34;
  const rows = 4;
  let cols;

  let mouse = { down: false, x: -1000, y: -1000 };
  let lastMouse = { x: -1000, y: -1000 };

  class Point {
    constructor(x, y, col, row) {
      this.x = x;
      this.y = y;
      this.px = x;
      this.py = y;
      this.vx = 0;
      this.vy = 0;
      this.pin_x = null;
      this.pin_y = null;
      this.col = col;
      this.row = row;
    }

    update() {
      if (this.pin_x !== null) {
        this.x = this.pin_x;
        this.y = this.pin_y;
        return;
      }

      this.vx = (this.x - this.px) * friction;
      this.vy = (this.y - this.py) * friction;

      this.px = this.x;
      this.py = this.y;

      this.x += this.vx;
      this.y += this.vy + gravity;
    }
  }

  class Constraint {
    constructor(p1, p2, isShear = false, isHorizontal = false) {
      this.p1 = p1;
      this.p2 = p2;
      this.length = isShear ? spacing * Math.SQRT2 : spacing;
      this.stiffness = 1.0;
      this.isHorizontal = isHorizontal;
    }

    resolve() {
      let dx = this.p1.x - this.p2.x;
      let dy = this.p1.y - this.p2.y;
      let distSq = dx * dx + dy * dy;
      if (distSq === 0) return;

      let dist = Math.sqrt(distSq);
      let diff = ((this.length - dist) / dist) * this.stiffness;

      if (this.p1.pin_x === null && this.p2.pin_x === null) {
        let px = dx * diff * 0.5;
        let py = dy * diff * 0.5;
        this.p1.x += px;
        this.p1.y += py;
        this.p2.x -= px;
        this.p2.y -= py;
      } else if (this.p1.pin_x !== null && this.p2.pin_x === null) {
        this.p2.x -= dx * diff;
        this.p2.y -= dy * diff;
      } else if (this.p1.pin_x === null && this.p2.pin_x !== null) {
        this.p1.x += dx * diff;
        this.p1.y += dy * diff;
      }
    }
  }

  function initCloth() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;

    points = [];
    constraints = [];
    confetti = [];
    sparks = [];
    isSevered = false;
    gravity = 0.3;
    
    const statusEl = document.getElementById('ceremony-status');
    if (statusEl) statusEl.classList.remove('visible');

    cols = Math.floor(width / spacing);
    activeHoriz = new Uint8Array(rows * cols);
    activeHoriz.fill(1);

    const startY = height / 2;

    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        let pX = (x / (cols - 1)) * width;
        let pY = startY + y * spacing;
        let p = new Point(pX, pY, x, y);

        if (x === 0 || x === cols - 1) {
          p.pin_x = p.x;
          p.pin_y = p.y;
        }
        points.push(p);
      }
    }

    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        let p = points[y * cols + x];
        if (x > 0) {
          constraints.push(new Constraint(p, points[y * cols + (x - 1)], false, true));
        }
        if (y > 0) {
          constraints.push(new Constraint(p, points[(y - 1) * cols + x], false, false));
        }
        if (x > 0 && y > 0) {
          constraints.push(new Constraint(p, points[(y - 1) * cols + (x - 1)], true, false));
        }
        if (x < cols - 1 && y > 0) {
          constraints.push(new Constraint(p, points[(y - 1) * cols + (x + 1)], true, false));
        }
      }
    }
  }

  function spawnSparks(x, y) {
    if (sparks.length > 25) return;
    for (let i = 0; i < 5; i++) {
      sparks.push({
        x: x,
        y: y,
        vx: (Math.random() - 0.5) * 8,
        vy: (Math.random() - 0.5) * 8 - 2,
        size: Math.random() * 3 + 2,
        color: Math.random() > 0.3 ? '#ffd700' : '#ffffff',
        life: 1.0
      });
    }
  }

  function triggerCelebration() {
    if (isSevered) return;
    isSevered = true;

    soundEngine.playCut();

    setTimeout(() => {
      const logo = document.getElementById('ceremony-logo');
      if (logo) logo.classList.add('revealed');
    }, 300);

    setTimeout(() => {
      const status = document.getElementById('ceremony-status');
      if (status) status.classList.add('visible');
    }, 600);

    setTimeout(() => {
      const msg = document.getElementById('post-cut-message');
      if (msg) msg.classList.add('visible');
    }, 1000);

    // ====== Traditional Indian Ceremonial Celebration Particles (Phool Varsha) ======
    const particleTypes = ['marigold', 'rose', 'gold_star', 'rice'];
    const marigoldColors = ['#ff8c00', '#ffd700', '#ffa000', '#ff7f00', '#ff9900'];
    const roseColors = ['#dc2626', '#e11d48', '#b91c1c', '#f43f5e', '#be123c'];
    const goldColors = ['#ffd700', '#f59e0b', '#ffffff', '#fbbf24'];

    for (let i = 0; i < 220; i++) {
      let pType = particleTypes[Math.floor(Math.random() * particleTypes.length)];
      let color;
      if (pType === 'marigold') color = marigoldColors[Math.floor(Math.random() * marigoldColors.length)];
      else if (pType === 'rose') color = roseColors[Math.floor(Math.random() * roseColors.length)];
      else if (pType === 'gold_star') color = goldColors[Math.floor(Math.random() * goldColors.length)];
      else color = '#fef3c7';

      confetti.push({
        x: Math.random() * width,
        y: Math.random() * (height * 0.45),
        vx: (Math.random() - 0.5) * 14,
        vy: Math.random() * -8 - 3,
        size: pType === 'rice' ? Math.random() * 4 + 3 : Math.random() * 8 + 6,
        color: color,
        type: pType,
        rotation: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.18,
        osc: Math.random() * 10
      });
    }
  }

  function update() {
    if (mouse.x > 0 && mouse.y > 0) {
      trail.push({ x: mouse.x, y: mouse.y, age: 1.0 });
    }
    for (let i = trail.length - 1; i >= 0; i--) {
      trail[i].age -= 0.1;
      if (trail[i].age <= 0) trail.splice(i, 1);
    }

    let cutOccurred = false;
    if (mouse.down && mouse.x > 0 && mouse.y > 0 && points.length > 0) {
      let severedCols = new Set();

      for (let x = 0; x < cols - 1; x++) {
        let pTop = points[x];
        let pBottom = points[(rows - 1) * cols + x];
        if (!pTop || !pBottom) continue;

        let colX = (pTop.x + pBottom.x) / 2;
        let minY = Math.min(pTop.y, pBottom.y) - 30;
        let maxY = Math.max(pTop.y, pBottom.y) + 30;

        if (mouse.y >= minY && mouse.y <= maxY) {
          if (Math.abs(mouse.x - colX) <= spacing * 0.9) {
            severedCols.add(x);
          }
          if (lastMouse.x > 0 && ((lastMouse.x <= colX && mouse.x >= colX) || (lastMouse.x >= colX && mouse.x <= colX))) {
            severedCols.add(x);
          }
        }
      }

      if (severedCols.size > 0) {
        for (let colIdx of severedCols) {
          let midPointX = (colIdx / (cols - 1)) * width;
          spawnSparks(midPointX, height / 2);

          for (let y = 0; y < rows; y++) {
            activeHoriz[y * cols + colIdx] = 0;
          }

          for (let i = constraints.length - 1; i >= 0; i--) {
            let c = constraints[i];
            let minC = Math.min(c.p1.col, c.p2.col);
            let maxC = Math.max(c.p1.col, c.p2.col);
            if (minC === colIdx && maxC === colIdx + 1) {
              constraints.splice(i, 1);
            }
          }

          for (let p of points) {
            if (Math.abs(p.col - colIdx) <= 3 && p.pin_x === null) {
              p.vy += 14;
            }
          }
        }
        gravity = 1.0;
        cutOccurred = true;
      }

      if (cutOccurred) {
        triggerCelebration();
      }
    }

    for (let p of points) p.update();
    for (let i = 0; i < 10; i++) {
      for (let c of constraints) c.resolve();
    }

    for (let i = sparks.length - 1; i >= 0; i--) {
      let s = sparks[i];
      s.x += s.vx;
      s.y += s.vy;
      s.vy += 0.2;
      s.life -= 0.05;
      if (s.life <= 0) sparks.splice(i, 1);
    }

    for (let c of confetti) {
      c.x += c.vx + Math.sin(c.osc) * 1.5;
      c.y += c.vy + 3.0;
      c.vy = Math.min(c.vy + 0.1, 4.0);
      c.rotation += c.vRot;
      c.osc += 0.05;
    }

    lastMouse.x = mouse.x;
    lastMouse.y = mouse.y;
  }

  const quadColors = ['#ba0d0d', '#cc1111', '#ba0d0d'];

  function draw() {
    ctx.clearRect(0, 0, width, height);
    if (!activeHoriz) return;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
    for (let y = 0; y < rows - 1; y++) {
      for (let x = 0; x < cols - 1; x++) {
        if (activeHoriz[y * cols + x] === 1) {
          let p1 = points[y * cols + x];
          let p2 = points[y * cols + x + 1];
          let p3 = points[(y + 1) * cols + x + 1];
          let p4 = points[(y + 1) * cols + x];

          ctx.beginPath();
          ctx.moveTo(p1.x + 6, p1.y + 10);
          ctx.lineTo(p2.x + 6, p2.y + 10);
          ctx.lineTo(p3.x + 6, p3.y + 10);
          ctx.lineTo(p4.x + 6, p4.y + 10);
          ctx.closePath();
          ctx.fill();
        }
      }
    }

    for (let y = 0; y < rows - 1; y++) {
      ctx.fillStyle = quadColors[y] || quadColors[0];
      ctx.strokeStyle = quadColors[y] || quadColors[0];
      ctx.lineWidth = 1.0;

      for (let x = 0; x < cols - 1; x++) {
        if (activeHoriz[y * cols + x] === 1) {
          let p1 = points[y * cols + x];
          let p2 = points[y * cols + x + 1];
          let p3 = points[(y + 1) * cols + x + 1];
          let p4 = points[(y + 1) * cols + x];

          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.lineTo(p3.x, p3.y);
          ctx.lineTo(p4.x, p4.y);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
        }
      }
    }

    // ====== Traditional Golden Indian Lace & Rangoli Motifs on Ribbon ======
    for (let x = 0; x < cols - 1; x++) {
      if (activeHoriz[x] === 1) {
        let pTop1 = points[x];
        let pTop2 = points[x + 1];
        let pBot1 = points[(rows - 1) * cols + x];
        let pBot2 = points[(rows - 1) * cols + x + 1];

        // 1. Top Golden Lace Border Trim
        ctx.beginPath();
        ctx.moveTo(pTop1.x, pTop1.y);
        ctx.lineTo(pTop2.x, pTop2.y);
        ctx.strokeStyle = '#ffd700';
        ctx.lineWidth = 3.0;
        ctx.stroke();

        // 2. Bottom Golden Lace Border Trim
        ctx.beginPath();
        ctx.moveTo(pBot1.x, pBot1.y);
        ctx.lineTo(pBot2.x, pBot2.y);
        ctx.strokeStyle = '#ffd700';
        ctx.lineWidth = 3.0;
        ctx.stroke();

        // 3. Inner Gold Stitching Thread
        let pMid1 = points[cols + x];
        let pMid2 = points[cols + x + 1];
        ctx.beginPath();
        ctx.moveTo(pMid1.x, pMid1.y);
        ctx.lineTo(pMid2.x, pMid2.y);
        ctx.strokeStyle = 'rgba(255, 235, 120, 0.5)';
        ctx.lineWidth = 1.2;
        ctx.stroke();

        // 4. Traditional 8-Point Golden Star & Rangoli Emblem every 3 cols
        if (x % 3 === 1) {
          let midX = (pTop1.x + pTop2.x + pBot1.x + pBot2.x) / 4;
          let midY = (pTop1.y + pTop2.y + pBot1.y + pBot2.y) / 4;

          ctx.save();
          ctx.translate(midX, midY);

          // Star Petal Vertical
          ctx.fillStyle = '#ffd700';
          ctx.beginPath();
          ctx.moveTo(0, -6);
          ctx.lineTo(3.5, 0);
          ctx.lineTo(0, 6);
          ctx.lineTo(-3.5, 0);
          ctx.closePath();
          ctx.fill();

          // Star Petal Horizontal
          ctx.beginPath();
          ctx.moveTo(-6, 0);
          ctx.lineTo(0, 3.5);
          ctx.lineTo(6, 0);
          ctx.lineTo(0, -3.5);
          ctx.closePath();
          ctx.fill();

          // Center Bead Highlight
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(0, 0, 1.8, 0, Math.PI * 2);
          ctx.fill();

          ctx.restore();
        }
      }
    }

    // ====== Ceremonial Traditional Knots / Bows at Ribbon Ends ======
    drawRibbonKnots();

    for (let s of sparks) {
      ctx.fillStyle = s.color;
      ctx.globalAlpha = s.life;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1.0;

    if (trail.length > 1) {
      ctx.beginPath();
      ctx.moveTo(trail[0].x, trail[0].y);
      for (let i = 1; i < trail.length; i++) {
        ctx.lineTo(trail[i].x, trail[i].y);
      }
      ctx.strokeStyle = '#d4af37';
      ctx.lineWidth = 3.5;
      ctx.stroke();
    }

    // ====== Traditional Indian Phool Varsha (Flower Petal & Gold Rain) ======
    for (let c of confetti) {
      ctx.save();
      ctx.translate(c.x, c.y);
      ctx.rotate(c.rotation);
      ctx.scale(Math.sin(c.osc), 1); // Realistic 3D organic fluttering flip effect

      if (c.type === 'marigold' || c.type === 'rose') {
        // Organic Petal Shape
        ctx.fillStyle = c.color;
        ctx.beginPath();
        ctx.moveTo(0, -c.size);
        ctx.bezierCurveTo(c.size * 0.95, -c.size * 0.6, c.size * 0.85, c.size * 0.7, 0, c.size);
        ctx.bezierCurveTo(-c.size * 0.85, c.size * 0.7, -c.size * 0.95, -c.size * 0.6, 0, -c.size);
        ctx.fill();

        // Delicate Petal Vein Highlight
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(0, -c.size * 0.7);
        ctx.lineTo(0, c.size * 0.6);
        ctx.stroke();
      } else if (c.type === 'gold_star') {
        // Sparkling 4-point Golden Rangoli Star
        ctx.fillStyle = c.color;
        ctx.beginPath();
        ctx.moveTo(0, -c.size);
        ctx.lineTo(c.size * 0.3, -c.size * 0.3);
        ctx.lineTo(c.size, 0);
        ctx.lineTo(c.size * 0.3, c.size * 0.3);
        ctx.lineTo(0, c.size);
        ctx.lineTo(-c.size * 0.3, c.size * 0.3);
        ctx.lineTo(-c.size, 0);
        ctx.lineTo(-c.size * 0.3, -c.size * 0.3);
        ctx.closePath();
        ctx.fill();
      } else {
        // Slender Akshata Rice Grain
        ctx.fillStyle = c.color;
        ctx.beginPath();
        ctx.ellipse(0, 0, c.size * 0.35, c.size * 0.9, 0.4, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }
  }

  function drawRibbonKnots() {
    if (!points || points.length === 0) return;

    let pLeftTop = points[0];
    let pLeftBot = points[(rows - 1) * cols];
    let pRightTop = points[cols - 1];
    let pRightBot = points[(rows - 1) * cols + cols - 1];

    if (pLeftTop && pLeftBot) {
      let lx = pLeftTop.x;
      let ly = (pLeftTop.y + pLeftBot.y) / 2;
      drawKnotMotif(lx + 22, ly, false);
    }

    if (pRightTop && pRightBot) {
      let rx = pRightTop.x;
      let ry = (pRightTop.y + pRightBot.y) / 2;
      drawKnotMotif(rx - 22, ry, true);
    }
  }

  function drawKnotMotif(cx, cy, isRight) {
    ctx.save();
    ctx.translate(cx, cy);

    // Ceremonial Ribbon Tail / Tassels (Dangling downward)
    ctx.fillStyle = '#991b1b';
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 2.0;

    // Tail 1
    ctx.beginPath();
    ctx.moveTo(-4, 6);
    ctx.lineTo(isRight ? -18 : 18, 55);
    ctx.lineTo(isRight ? -8 : 8, 58);
    ctx.lineTo(4, 6);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Tail 2
    ctx.beginPath();
    ctx.moveTo(-6, 4);
    ctx.lineTo(isRight ? -30 : 30, 48);
    ctx.lineTo(isRight ? -20 : 20, 52);
    ctx.lineTo(2, 4);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Golden Tassel Fringe Pearls
    ctx.fillStyle = '#ffd700';
    ctx.beginPath();
    ctx.arc(isRight ? -13 : 13, 56, 3.5, 0, Math.PI * 2);
    ctx.arc(isRight ? -25 : 25, 50, 3.5, 0, Math.PI * 2);
    ctx.fill();

    // Ceremonial Red Bow Loops
    ctx.fillStyle = '#b91c1c';
    ctx.lineWidth = 2.5;

    // Top Bow Loop
    ctx.beginPath();
    ctx.ellipse(isRight ? 6 : -6, -18, 14, 24, isRight ? 0.3 : -0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Bottom Bow Loop
    ctx.beginPath();
    ctx.ellipse(isRight ? 6 : -6, 18, 14, 24, isRight ? -0.3 : 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Side Bow Loop
    ctx.beginPath();
    ctx.ellipse(isRight ? -18 : 18, 0, 24, 14, isRight ? 0.15 : -0.15, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Center Gold Knot Ring Motif
    ctx.fillStyle = '#d4af37';
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2.0;
    ctx.beginPath();
    ctx.arc(0, 0, 11, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Center Pearl Gem Highlight
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(0, 0, 4.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
  }

  window.addEventListener('mousedown', (e) => {
    soundEngine.ensureContext();
    mouse.down = true;
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    lastMouse.x = mouse.x;
    lastMouse.y = mouse.y;
  });

  window.addEventListener('mouseup', () => { mouse.down = false; });
  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  window.addEventListener('touchstart', (e) => {
    soundEngine.ensureContext();
    mouse.down = true;
    mouse.x = e.touches[0].clientX;
    mouse.y = e.touches[0].clientY;
    lastMouse.x = mouse.x;
    lastMouse.y = mouse.y;
  }, { passive: true });

  window.addEventListener('touchend', () => { mouse.down = false; });
  window.addEventListener('touchmove', (e) => {
    mouse.x = e.touches[0].clientX;
    mouse.y = e.touches[0].clientY;
  });

  return { initCloth, loop };
}
