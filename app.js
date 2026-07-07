(function(){
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* scroll reveal — fallback only; GSAP + IntersectionObserver (motion-plus.js) owns this when GSAP is present */
  if(!window.gsap){
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } });
    },{threshold:.15});
    document.querySelectorAll('.rv').forEach(function(el){ io.observe(el); });
  }

  /* count-ups */
  function animateCount(el){
    var target = parseInt(el.getAttribute('data-count'),10);
    if(reduced){ el.textContent = target.toLocaleString('en-AU'); return; }
    var start=null, dur=1300;
    function step(ts){ if(!start)start=ts; var p=Math.min((ts-start)/dur,1);
      el.textContent = Math.floor(target*(1-Math.pow(1-p,3))).toLocaleString('en-AU');
      if(p<1) requestAnimationFrame(step); }
    requestAnimationFrame(step);
  }
  var cio = new IntersectionObserver(function(entries){
    entries.forEach(function(e){ if(e.isIntersecting){ animateCount(e.target); cio.unobserve(e.target); } });
  },{threshold:.4});
  document.querySelectorAll('[data-count]').forEach(function(el){ cio.observe(el); });

  /* sticky header shadow */
  var header = document.querySelector('header');
  window.addEventListener('scroll', function(){ header.classList.toggle('scrolled', window.scrollY > 8); }, {passive:true});

  /* testimonials slider */
  var track = document.getElementById('ttrack');
  if(track){
    var slides = track.children.length;
    var dotsEl = document.getElementById('tdots');
    var i = 0, timer = null;
    for(var d=0; d<slides; d++){
      var b = document.createElement('button'); b.className='tdot'+(d===0?' on':''); b.setAttribute('aria-label','Testimonial '+(d+1));
      (function(idx){ b.addEventListener('click', function(){ go(idx, true); }); })(d);
      dotsEl.appendChild(b);
    }
    function render(){ track.style.transform = 'translateX(-'+(i*100)+'%)';
      Array.prototype.forEach.call(dotsEl.children, function(dot,k){ dot.classList.toggle('on', k===i); }); }
    function go(n, manual){ i = (n+slides)%slides; render(); if(manual) restart(); }
    function next(){ go(i+1); }
    function restart(){ if(timer){ clearInterval(timer); } if(!reduced){ timer = setInterval(next, 6000); } }
    document.getElementById('tnext').addEventListener('click', function(){ go(i+1, true); });
    document.getElementById('tprev').addEventListener('click', function(){ go(i-1, true); });
    var slider = document.getElementById('tslider');
    slider.addEventListener('mouseenter', function(){ if(timer) clearInterval(timer); });
    slider.addEventListener('mouseleave', restart);
    document.addEventListener('visibilitychange', function(){ if(document.hidden){ if(timer) clearInterval(timer); } else { restart(); } });
    render(); restart();
  }
})();

/* Mobile nav hamburger — injected on every page for consistency */
(function(){
  var nav = document.querySelector('.nav');
  if(!nav || nav.querySelector('.nav-toggle')) return;
  var b = document.createElement('button');
  b.className = 'nav-toggle'; b.type = 'button';
  b.setAttribute('aria-label','Toggle menu'); b.setAttribute('aria-expanded','false');
  b.innerHTML = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="4" y1="7" x2="20" y2="7"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="17" x2="20" y2="17"/></svg>';
  nav.appendChild(b);
  b.addEventListener('click', function(){ var o = nav.classList.toggle('open'); b.setAttribute('aria-expanded', o?'true':'false'); });
  nav.querySelectorAll('ul a').forEach(function(a){ a.addEventListener('click', function(){ nav.classList.remove('open'); b.setAttribute('aria-expanded','false'); }); });
})();

/* Hero entrance safety net — the intro animation plays regardless of the
   reduced-motion setting, but the hero must never stay hidden. If the
   animation hasn't revealed the content shortly after load (e.g. a
   throttled/paused compositor), force it visible. */
(function(){
  var hero = document.querySelector('.home-hero');
  if(!hero) return;
  var els = [].slice.call(hero.querySelectorAll('.hh-in, h1 .w'));
  if(!els.length) return;
  setTimeout(function(){
    els.forEach(function(el){
      if(parseFloat(getComputedStyle(el).opacity) < 1){
        el.style.animation = 'none';
        el.style.opacity = '1';
        el.style.transform = 'none';
      }
    });
  }, 1700);
})();
