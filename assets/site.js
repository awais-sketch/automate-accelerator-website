// Automate Accelerator — shared site behaviour
(function () {
  var $$ = function (q, r) { return [].slice.call((r || document).querySelectorAll(q)); };

  // Reveal-on-scroll
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -50px 0px' });
  $$('.reveal,.reveal-up,.reveal-left,.reveal-right').forEach(function (el) { io.observe(el); });

  // Nav shadow on scroll
  var nav = document.querySelector('.nav');
  if (nav) {
    var onScroll = function () { nav.classList.toggle('scrolled', (window.scrollY || 0) > 8); };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }
})();
