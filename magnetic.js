/* ============================================================
   Magnetic CTA buttons — vanilla take on the Aceternity
   <MagneticButton/>. Each .btn eases toward the cursor while
   hovered and springs back to centre on leave.
   Loaded ONLY from index.html. Skips touch / coarse pointers.
   The nav button is left out so it can't overlap its neighbours.
   ============================================================ */
(function(){
  if(!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

  var btns = [].slice.call(document.querySelectorAll('.btn')).filter(function(b){
    return !b.closest('.nav');   // keep the compact menu button steady
  });
  if(!btns.length) return;

  var STRENGTH = 0.35;   // fraction of the cursor offset the button follows
  var MAXPULL  = 12;     // clamp, px

  btns.forEach(function(btn){
    btn.classList.add('magnetic');

    var raf = null;
    var curX = 0, curY = 0;   // current offset
    var tgtX = 0, tgtY = 0;   // target offset

    function frame(){
      curX += (tgtX - curX) * 0.2;
      curY += (tgtY - curY) * 0.2;
      btn.style.transform = 'translate(' + curX.toFixed(2) + 'px,' + curY.toFixed(2) + 'px)';
      if(Math.abs(tgtX - curX) > 0.05 || Math.abs(tgtY - curY) > 0.05){
        raf = requestAnimationFrame(frame);
      } else {
        raf = null;
        if(tgtX === 0 && tgtY === 0){ btn.style.transform = ''; }  // back to CSS at rest
      }
    }
    function kick(){ if(!raf) raf = requestAnimationFrame(frame); }

    btn.addEventListener('pointermove', function(ev){
      if(ev.pointerType === 'touch') return;
      var r = btn.getBoundingClientRect();
      var dx = ev.clientX - (r.left + r.width  / 2);
      var dy = ev.clientY - (r.top  + r.height / 2);
      tgtX = Math.max(-MAXPULL, Math.min(MAXPULL, dx * STRENGTH));
      tgtY = Math.max(-MAXPULL, Math.min(MAXPULL, dy * STRENGTH));
      kick();
    });

    btn.addEventListener('pointerleave', function(){
      tgtX = 0; tgtY = 0;
      kick();
    });
  });
})();
