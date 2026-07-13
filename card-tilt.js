/* Interactive 3D tilt for the big service cards (.svc-block).
   Each card tilts toward the cursor with inertia damping; a glare highlight
   tracks the cursor and the shadow deepens. Pointer-fine devices only. */
(function () {
  if (!window.matchMedia || !window.matchMedia('(pointer:fine)').matches) return;
  if (window.matchMedia('(prefers-reduced-motion:reduce)').matches) return;

  const cards = Array.from(document.querySelectorAll('.svc-block'));
  if (!cards.length) return;

  const st = cards.map((c) => {
    c.classList.add('tilt-on');
    const g = document.createElement('div');
    g.className = 'tilt-glare';
    g.setAttribute('aria-hidden', 'true');
    c.appendChild(g);
    return { rx: 0, ry: 0, trx: 0, tryy: 0, lift: 0, tl: 0 };
  });

  const MAX_TILT_Y = 9;   // left-right (deg)
  const MAX_TILT_X = 7;   // up-down (deg)
  let mx = -99999, my = -99999;

  window.addEventListener('mousemove', (e) => { mx = e.clientX; my = e.clientY; }, { passive: true });
  window.addEventListener('mouseleave', () => { mx = -99999; my = -99999; });

  function frame() {
    const vh = window.innerHeight;
    for (let i = 0; i < cards.length; i++) {
      const c = cards[i], s = st[i];
      const r = c.getBoundingClientRect();

      // cursor offset from this card's centre, normalised to ~[-1,1]
      const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
      let nx = (mx - cx) / (r.width / 2);
      let ny = (my - cy) / (r.height / 2);
      const onscreen = r.bottom > -120 && r.top < vh + 120;
      const near = onscreen && mx > -9000 && Math.abs(nx) < 1.4 && Math.abs(ny) < 1.7;
      nx = Math.max(-1, Math.min(1, nx));
      ny = Math.max(-1, Math.min(1, ny));

      s.tryy = near ? nx * MAX_TILT_Y : 0;
      s.trx  = near ? -ny * MAX_TILT_X : 0;
      s.tl   = near ? 1 : 0;

      // inertia: current value lags toward target
      s.ry   += (s.tryy - s.ry)   * 0.08;
      s.rx   += (s.trx  - s.rx)   * 0.08;
      s.lift += (s.tl   - s.lift) * 0.10;

      // near-flat and idle → clear inline transform so the CSS hover can breathe
      if (!near && Math.abs(s.rx) < 0.02 && Math.abs(s.ry) < 0.02 && s.lift < 0.01) {
        if (c.style.transform) { c.style.transform = ''; c.style.boxShadow = ''; c.classList.remove('lit'); }
        continue;
      }

      c.style.transform =
        `perspective(1200px) translateZ(${(10 * s.lift).toFixed(2)}px) ` +
        `rotateX(${s.rx.toFixed(2)}deg) rotateY(${s.ry.toFixed(2)}deg)`;

      if (near) {
        c.classList.add('lit');
        c.style.setProperty('--gx', (((nx + 1) / 2) * 100).toFixed(1) + '%');
        c.style.setProperty('--gy', (((ny + 1) / 2) * 100).toFixed(1) + '%');
        c.style.boxShadow = '0 40px 80px -34px rgba(60,45,110,.4)';
      } else {
        c.classList.remove('lit');
        c.style.boxShadow = '';
      }
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
