/* ============================================================
   Motion+ : reveals triggered by IntersectionObserver (reliable on
   any scroll speed, never leaves content hidden) and animated with
   GSAP for a smooth staggered entrance. Reduced-motion safe.
   ============================================================ */
(function(){
  var rm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var rv = [].slice.call(document.querySelectorAll('.rv'));
  if(!rv.length) return;

  function showAll(){ rv.forEach(function(e){ e.classList.add('in'); e.style.opacity=''; e.style.transform=''; }); }

  // reduced motion or GSAP unavailable -> show everything immediately (app.js CSS fallback also runs)
  if(rm || !window.gsap){ showAll(); return; }

  gsap.set(rv, {opacity:0, y:18});

  var io = new IntersectionObserver(function(entries){
    var batch = [];
    entries.forEach(function(en){ if(en.isIntersecting){ batch.push(en.target); io.unobserve(en.target); } });
    if(batch.length){
      batch.forEach(function(e){ e.classList.add('in'); });               // triggers icon settle (CSS)
      gsap.to(batch, {opacity:1, y:0, duration:.6, stagger:.08, ease:'power2.out', overwrite:true});
    }
  }, {threshold:.12, rootMargin:'0px 0px -6% 0px'});

  rv.forEach(function(e){ io.observe(e); });

  // safety net: never leave anything hidden
  setTimeout(function(){
    rv.forEach(function(e){
      if(parseFloat(getComputedStyle(e).opacity) === 0){ e.classList.add('in'); gsap.to(e,{opacity:1,y:0,duration:.4}); }
    });
  }, 2200);
})();
