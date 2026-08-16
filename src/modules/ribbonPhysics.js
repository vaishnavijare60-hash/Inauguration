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

    const colors = ['#ffd700', '#ba0d0d', '#ffffff', '#e6b800', '#ff4d4d', '#c0c0c0'];
    for (let i = 0; i < 160; i++) {
      confetti.push({
        x: Math.random() * width,
        y: Math.random() * (height * 0.4),
        vx: (Math.random() - 0.5) * 12,
        vy: Math.random() * -6 - 2,
        size: Math.random() * 9 + 5,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.2,
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

    for (let c of confetti) {
      ctx.save();
      ctx.translate(c.x, c.y);
      ctx.rotate(c.rotation);
      ctx.fillStyle = c.color;
      ctx.fillRect(-c.size / 2, -c.size / 4, c.size, c.size / 2);
      ctx.restore();
    }
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
