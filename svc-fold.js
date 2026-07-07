/* ============================================================
   Scroll-linked reveal for the service cards.
   Each .svc-block rises in from the bottom, stays visible through the
   middle band, then fades + drifts up as it leaves the top. Driven by
   scroll position — smooth and fully reversible.

   Smoothness rules (see ui-ux-animation skill):
   - Only transform + opacity are touched (GPU-composited, no reflow).
   - No layout thrash: ALL getBoundingClientRect reads happen first,
     then ALL style writes — never interleaved (interleaving forces a
     reflow per card = jank).
   - translate3d promotes each card to its own compositor layer.
   - Redundant writes skipped (value unchanged → no style recalc).
   - Scroll work throttled to one rAF per frame.
   Loaded on services.html.
   ============================================================ */
(function () {
  var blocks = [].slice.call(document.querySelectorAll('.svc-block'));
  if (!blocks.length) return;

  blocks.forEach(function (b) {
    b.classList.remove('js-fold', 'folded');
    b.classList.add('js-scroll');
  });

  var state = blocks.map(function () { return { o: -1, ty: -9999 }; });
  var rects = new Array(blocks.length);
  var ticking = false;

  function clamp01(x) { return x < 0 ? 0 : x > 1 ? 1 : x; }
  function smooth(t) { return t * t * (3 - 2 * t); }   // smoothstep

  // Bands as a fraction of viewport height (0 = top, 1 = bottom):
  var ENTER_TOP = 0.72, ENTER_BOT = 1.05;   // rising in from the bottom
  var EXIT_TOP = -0.05, EXIT_BOT = 0.14;     // leaving through the top
  var RISE = 42, DROP = 28;                  // travel distance, px

  function update() {
    ticking = false;
    var vh = window.innerHeight || document.documentElement.clientHeight;
    var i, b, r, p, o, ty, t;

    // ---- PHASE 1: read all layout (no writes) ----
    for (i = 0; i < blocks.length; i++) rects[i] = blocks[i].getBoundingClientRect();

    // ---- PHASE 2: write all styles (no reads) ----
    for (i = 0; i < blocks.length; i++) {
      r = rects[i];
      p = (r.top + r.height / 2) / vh;

      if (p >= ENTER_BOT)      { o = 0; ty = RISE; }
      else if (p > ENTER_TOP)  { t = smooth(clamp01((ENTER_BOT - p) / (ENTER_BOT - ENTER_TOP))); o = t; ty = RISE * (1 - t); }
      else if (p >= EXIT_BOT)  { o = 1; ty = 0; }
      else if (p > EXIT_TOP)   { t = smooth(clamp01((p - EXIT_TOP) / (EXIT_BOT - EXIT_TOP))); o = t; ty = -DROP * (1 - t); }
      else                     { o = 0; ty = -DROP; }

      b = blocks[i];
      var ro = Math.round(o * 1000) / 1000;
      var rty = Math.round(ty * 10) / 10;
      if (ro !== state[i].o)  { b.style.opacity = ro; state[i].o = ro; }
      if (rty !== state[i].ty){ b.style.transform = 'translate3d(0,' + rty + 'px,0)'; state[i].ty = rty; }
    }
  }

  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  update();
})();
