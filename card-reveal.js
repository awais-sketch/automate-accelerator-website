/* ============================================================
   Card entrance reveal — gives every card the hero-heading blur reveal
   (blur + rise + fade) as it scrolls into view. Replaces the old tilt
   and scroll-fold effects. Runs regardless of reduced-motion; a safety
   net guarantees cards never stay hidden. Loaded per page.
   ============================================================ */
(function () {
  var cards = [].slice.call(document.querySelectorAll('.svc-block'));
  if (!cards.length) return;

  // clear any leftover reveal/tilt state, then apply the blur-reveal start
  cards.forEach(function (c) {
    c.classList.remove('rv', 'in', 'is3d', 'tilting', 'js-fold', 'js-foldsrc', 'js-scroll', 'folded');
    c.style.opacity = '';
    c.style.transform = '';
    c.style.filter = '';
    c.classList.add('card-reveal');
  });

  function revealAll() { cards.forEach(function (c) { c.classList.add('in'); }); }

  if (!('IntersectionObserver' in window)) { revealAll(); return; }

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      e.target.classList.add('in');
      io.unobserve(e.target);
    });
  }, { threshold: 0.14, rootMargin: '0px 0px -6% 0px' });

  cards.forEach(function (c) { io.observe(c); });

  // safety net: never leave a card stuck hidden
  window.setTimeout(revealAll, 2500);
})();
