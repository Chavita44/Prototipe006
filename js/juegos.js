(() => {
  const $ = id => document.getElementById(id);
  const save = (k, v) => { if (Consent.ok()) try { localStorage.setItem(k, v); } catch {} };
  const load = k => { if (!Consent.ok()) return 0; try { return +localStorage.getItem(k) || 0; } catch { return 0; } };
  const C = { bg: '#3A5A40', fg: '#DAD7CD', dk: '#1f3326', soft: 'rgba(218,215,205,.2)' };
  const pad = n => String(n).padStart(5, '0');
  const say = (ctx, w, h, txt) => { ctx.fillStyle = C.fg; ctx.font = '600 24px "JetBrains Mono",monospace'; ctx.textAlign = 'center'; ctx.fillText(txt, w / 2, h / 2); };
  let cur = 'runner';

  /* ---------- Chavita Runner ---------- */
  const rc = $('rcv'), r = rc.getContext('2d'), RW = rc.width, RH = rc.height, GY = RH - 50, PW = 44, PH = 48;
  const cube = new Image(); cube.src = '../assets/minilogo.png';
  const R = { s: 'idle', hi: load('chavita-runner'), looping: false, last: 0 };
  const rReset = () => Object.assign(R, { y: GY - PH, vy: 0, obs: [], sp: 420, d: 0, gap: 500, cl: [120, 400, 700, 880] });
  rReset();
  function rJump() {
    if (cur !== 'runner') return;
    if (R.s === 'over' && performance.now() - R.end < 450) return;
    if (R.s !== 'run') { rReset(); R.s = 'run'; }
    if (R.y >= GY - PH - 1) R.vy = -820;
  }
  function rUpdate(dt) {
    if (R.s !== 'run') return;
    R.sp = Math.min(R.sp + dt * 16, 1400); R.d += R.sp * dt;
    R.vy += 2300 * dt; R.y = Math.min(GY - PH, R.y + R.vy * dt); if (R.y >= GY - PH) R.vy = 0;
    R.gap -= R.sp * dt;
    if (R.gap <= 0) { R.obs.push({ x: RW + 10, w: 22 + Math.random() * 20, h: 34 + Math.random() * 34 }); R.gap = R.sp * (1.05 - Math.min((R.sp - 420) / 2400, .25) + Math.random() * .9); }
    R.obs.forEach(o => o.x -= R.sp * dt); R.obs = R.obs.filter(o => o.x + o.w > 0);
    R.cl = R.cl.map(x => (x - R.sp * dt * .15 + RW + 70) % (RW + 70) - 70 + 70 - 70);
    const px = 76, py = R.y + 6, pw = PW - 12, ph = PH - 10;
    if (R.obs.some(o => px < o.x + o.w - 6 && px + pw > o.x + 6 && py < GY - 4 && py + ph > GY - o.h + 8)) {
      R.s = 'over'; R.end = performance.now();
      const sc = Math.floor(R.d / 20); if (sc > R.hi) { R.hi = sc; save('chavita-runner', sc); }
    }
  }
  function rDraw() {
    r.fillStyle = C.bg; r.fillRect(0, 0, RW, RH);
    r.fillStyle = C.soft; R.cl.forEach((x, i) => r.fillRect(x, 50 + (i % 2) * 45, 80, 10));
    r.fillStyle = C.fg; r.fillRect(0, GY, RW, 3);
    for (let x = -(R.d % 80); x < RW; x += 80) r.fillRect(x, GY + 16, 24, 3);
    R.obs.forEach(o => { r.beginPath(); r.moveTo(o.x, GY); r.lineTo(o.x + o.w / 2, GY - o.h); r.lineTo(o.x + o.w, GY); r.fill(); });
    if (cube.complete && cube.naturalWidth) r.drawImage(cube, 70, R.y, PW, PH); else r.fillRect(70, R.y, PW, PH);
    r.font = '600 20px "JetBrains Mono",monospace'; r.textAlign = 'right';
    r.fillText('HI ' + pad(R.hi) + '   ' + pad(Math.floor(R.d / 20)), RW - 20, 36); r.textAlign = 'left'; r.fillText('VELOCIDAD x' + (R.sp / 420).toFixed(1), 20, 36);
    if (R.s === 'idle') say(r, RW, RH - 40, 'ESPACIO O TOQUE PARA EMPEZAR');
    if (R.s === 'over') say(r, RW, RH - 40, 'GAME OVER · TOCA PARA REINTENTAR');
  }
  function rLoop(t) {
    if (cur !== 'runner') { R.looping = false; return; }
    const dt = Math.min((t - R.last) / 1000, .05) || 0; R.last = t;
    rUpdate(dt); rDraw(); requestAnimationFrame(rLoop);
  }
  rc.addEventListener('pointerdown', e => { e.preventDefault(); rJump(); });

  /* ---------- Culebra ---------- */
  const sc = $('scv'), s = sc.getContext('2d'), N = 20, CS = sc.width / N;
  const S = { st: 'idle', hi: load('chavita-culebra'), looping: false, last: 0 };
  function food() { do S.f = { x: Math.random() * N | 0, y: Math.random() * N | 0 }; while (S.b.some(p => p.x === S.f.x && p.y === S.f.y)); }
  function sReset() { Object.assign(S, { b: [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }], d: { x: 1, y: 0 }, q: [], n: 0, acc: 0, step: .12 }); food(); }
  sReset();
  function turn(dx, dy) {
    if (cur !== 'snake') return;
    if (S.st === 'over' && performance.now() - S.end < 400) return;
    if (S.st !== 'run') { sReset(); S.st = 'run'; }
    const l = S.q.length ? S.q[S.q.length - 1] : S.d;
    if (S.q.length < 2 && !(l.x === -dx && l.y === -dy)) S.q.push({ x: dx, y: dy });
  }
  function sStep() {
    if (S.q.length) S.d = S.q.shift();
    const h = { x: S.b[0].x + S.d.x, y: S.b[0].y + S.d.y };
    if (h.x < 0 || h.y < 0 || h.x >= N || h.y >= N || S.b.some(p => p.x === h.x && p.y === h.y)) {
      S.st = 'over'; S.end = performance.now(); if (S.n > S.hi) { S.hi = S.n; save('chavita-culebra', S.n); } return;
    }
    S.b.unshift(h);
    if (h.x === S.f.x && h.y === S.f.y) { S.n++; S.step = Math.max(.06, S.step - .003); food(); } else S.b.pop();
  }
  function sDraw() {
    s.fillStyle = C.bg; s.fillRect(0, 0, sc.width, sc.height);
    s.fillStyle = 'rgba(0,0,0,.08)';
    for (let x = 0; x < N; x++) for (let y = 0; y < N; y++) if ((x + y) % 2) s.fillRect(x * CS, y * CS, CS, CS);
    const cx = (S.f.x + .5) * CS, cy = (S.f.y + .5) * CS, k = CS * .38;
    s.fillStyle = C.fg; s.beginPath(); s.moveTo(cx, cy - k); s.lineTo(cx + k, cy); s.lineTo(cx, cy + k); s.lineTo(cx - k, cy); s.fill();
    S.b.forEach((p, i) => { s.fillStyle = C.fg; s.fillRect(p.x * CS + 2, p.y * CS + 2, CS - 4, CS - 4); if (!i) { s.fillStyle = C.dk; s.fillRect(p.x * CS + CS * .35, p.y * CS + CS * .35, CS * .3, CS * .3); } });
    s.font = '600 18px "JetBrains Mono",monospace'; s.textAlign = 'left'; s.fillStyle = C.fg;
    s.fillText('PUNTOS ' + S.n + ' · RÉCORD ' + S.hi, 10, 24);
    if (S.st === 'idle') say(s, sc.width, sc.height, 'FLECHAS O DESLIZA');
    if (S.st === 'over') say(s, sc.width, sc.height, 'GAME OVER · TOCA PARA REINTENTAR');
  }
  function sLoop(t) {
    if (cur !== 'snake') { S.looping = false; return; }
    const dt = Math.min((t - S.last) / 1000, .1) || 0; S.last = t;
    if (S.st === 'run') { S.acc += dt; while (S.acc >= S.step && S.st === 'run') { S.acc -= S.step; sStep(); } }
    sDraw(); requestAnimationFrame(sLoop);
  }
  let p0;
  sc.addEventListener('pointerdown', e => { p0 = [e.clientX, e.clientY]; });
  sc.addEventListener('pointerup', e => {
    if (!p0) return; const dx = e.clientX - p0[0], dy = e.clientY - p0[1]; p0 = null;
    if (Math.hypot(dx, dy) < 20) { if (S.st !== 'run') turn(1, 0); return; }
    Math.abs(dx) > Math.abs(dy) ? turn(Math.sign(dx), 0) : turn(0, Math.sign(dy));
  });

  /* ---------- Teclado y pestañas ---------- */
  const DIRS = { ArrowUp: [0, -1], w: [0, -1], W: [0, -1], ArrowDown: [0, 1], s: [0, 1], S: [0, 1], ArrowLeft: [-1, 0], a: [-1, 0], A: [-1, 0], ArrowRight: [1, 0], d: [1, 0], D: [1, 0] };
  addEventListener('keydown', e => {
    if (e.target.closest && e.target.closest('button,a')) return;
    const jump = [' ', 'ArrowUp', 'w', 'W'].includes(e.key);
    if (cur === 'runner' && jump) { e.preventDefault(); rJump(); }
    else if (cur === 'snake' && DIRS[e.key]) { e.preventDefault(); turn(...DIRS[e.key]); }
  });
  const seen = new Set(), pz = $('pausa'); let act = '';
  function go(g) {
    cur = g; dispatchEvent(new CustomEvent('game', { detail: g }));
    if (g === 'runner' && !R.looping) { R.looping = true; requestAnimationFrame(rLoop); }
    if (g === 'snake' && !S.looping) { S.looping = true; requestAnimationFrame(sLoop); }
  }
  function show(g) {
    act = g;
    document.querySelectorAll('[data-g]').forEach(b => b.setAttribute('aria-pressed', b.dataset.g === g));
    document.querySelectorAll('.arena').forEach(a => { a.hidden = a.id !== g; a.classList.remove('dim'); });
    const paused = seen.has(g); seen.add(g);
    pz.hidden = !paused; if (paused) $(g).classList.add('dim');
    go(paused ? '' : g);
  }
  function resume() { if (!pz.hidden) { pz.hidden = true; $(act).classList.remove('dim'); go(act); } }
  pz.addEventListener('click', resume);
  document.querySelectorAll('.arena').forEach(a => a.addEventListener('pointerdown', resume));
  document.querySelectorAll('[data-g]').forEach(b => b.addEventListener('click', () => { show(b.dataset.g); b.blur(); }));
  show('runner');
  addEventListener('consent', e => { if (e.detail === 'yes') { save('chavita-runner', R.hi); save('chavita-culebra', S.hi); } });
})();
