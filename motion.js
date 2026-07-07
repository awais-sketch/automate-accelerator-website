/* ============================================================
   Automate Accelerator — Motion Layer (v2)
   Additive only. Reads the existing DOM, adds no markup of its
   own except a single scroll-progress bar. All effects respect
   prefers-reduced-motion.
   ============================================================ */
(function(){
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(reduced) return;

  var root = document.documentElement;
  var raf = window.requestAnimationFrame;

  /* 1. Scroll progress bar ----------------------------------- */
  var bar = document.createElement('div');
  bar.className = 'mo-progress';
  document.body.appendChild(bar);
  var ticking = false;
  function onScroll(){
    if(ticking) return;
    ticking = true;
    raf(function(){
      var h = document.documentElement;
      var max = h.scrollHeight - h.clientHeight;
      bar.style.setProperty('--mo-scroll', max > 0 ? (h.scrollTop / max).toFixed(4) : 0);
      ticking = false;
    });
  }
  window.addEventListener('scroll', onScroll, {passive:true});
  onScroll();

  /* 2. Heading reveal (gradient wipe) + metric underline ----- */
  var heads = document.querySelectorAll('h2.sec, .home-hero h1, .cs-hero h1, .metric');
  heads.forEach(function(el){ if(el.matches('h2.sec, .home-hero h1, .cs-hero h1')) el.classList.add('mo-head'); });
  var hio = new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      if(e.isIntersecting){ e.target.classList.add('mo-in'); hio.unobserve(e.target); }
    });
  },{threshold:.35});
  heads.forEach(function(el){ hio.observe(el); });

  /* 3. Isometric engine: pointer parallax -------------------- */
  var iso = document.querySelector('.iso');
  var plane = document.querySelector('.iso-plane');
  if(iso && plane){
    var rx = 0, ry = 0, trx = 0, tryy = 0, animating = false;
    function loop(){
      rx += (trx - rx) * 0.08;
      ry += (tryy - ry) * 0.08;
      plane.style.setProperty('--mo-rx', rx.toFixed(2) + 'deg');
      plane.style.setProperty('--mo-ry', ry.toFixed(2) + 'deg');
      if(Math.abs(trx-rx) > 0.01 || Math.abs(tryy-ry) > 0.01){ raf(loop); }
      else { animating = false; }
    }
    function kick(){ if(!animating){ animating = true; raf(loop); } }
    iso.addEventListener('pointermove', function(ev){
      var r = iso.getBoundingClientRect();
      var px = (ev.clientX - r.left) / r.width - 0.5;   // -0.5 .. 0.5
      var py = (ev.clientY - r.top) / r.height - 0.5;
      trx = py * -6;   // tilt range, degrees
      tryy = px * 8;
      kick();
    });
    iso.addEventListener('pointerleave', function(){ trx = 0; tryy = 0; kick(); });
  }

  /* 4. Cursor-tracked sheen on cards ------------------------- */
  var cards = document.querySelectorAll('.card, .path, .quote, .svc-block');
  cards.forEach(function(card){
    card.addEventListener('pointermove', function(ev){
      var r = card.getBoundingClientRect();
      card.style.setProperty('--mo-mx', ((ev.clientX - r.left)/r.width*100).toFixed(1) + '%');
      card.style.setProperty('--mo-my', ((ev.clientY - r.top)/r.height*100).toFixed(1) + '%');
    });
  });

  /* 5. Dark-band spotlight follows cursor -------------------- */
  var bands = document.querySelectorAll('.industries, .final');
  bands.forEach(function(band){
    band.addEventListener('pointermove', function(ev){
      var r = band.getBoundingClientRect();
      band.style.setProperty('--mo-sx', (ev.clientX - r.left) + 'px');
      band.style.setProperty('--mo-sy', (ev.clientY - r.top) + 'px');
    });
  });
})();
