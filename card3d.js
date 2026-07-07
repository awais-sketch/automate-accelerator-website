/* ============================================================
   3D tilt for cards — vanilla take on the Aceternity <CardContainer/>.
   Every card tilts toward the cursor as ONE plane using its own
   perspective (perspective-origin at each card's centre), so cards
   sit perfectly flat and aligned at rest — regardless of where they
   land in a grid. The big .path product cards are left flat on
   purpose. Skips touch / coarse pointers.
   ============================================================ */
(function(){
  if(!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

  var groups = [
    { sel: '.card',                   max: 8 },   // small feature cards
    { sel: '.svc-block, .case, .vid', max: 6 }    // larger content cards
  ];

  groups.forEach(function(g){
    [].forEach.call(document.querySelectorAll(g.sel), function(card){
      if(card.classList.contains('is3d')) return;   // avoid double-binding
      card.classList.add('is3d');
      attachTilt(card, g.max);
    });
  });

  function attachTilt(card, MAX){
    var raf = null;
    var curX = 0, curY = 0;   // current rotation (deg)
    var tgtX = 0, tgtY = 0;   // target rotation (deg)

    function frame(){
      curX += (tgtX - curX) * 0.18;
      curY += (tgtY - curY) * 0.18;
      card.style.transform =
        'perspective(900px) rotateX(' + curY.toFixed(2) + 'deg) rotateY(' + curX.toFixed(2) + 'deg)';
      if(Math.abs(tgtX - curX) > 0.04 || Math.abs(tgtY - curY) > 0.04){
        raf = requestAnimationFrame(frame);
      } else {
        raf = null;
        if(tgtX === 0 && tgtY === 0){ card.style.transform = ''; }   // fully flat at rest
      }
    }
    function kick(){ if(!raf) raf = requestAnimationFrame(frame); }

    card.addEventListener('pointermove', function(ev){
      if(ev.pointerType === 'touch') return;
      var r = card.getBoundingClientRect();
      var px = (ev.clientX - r.left) / r.width  - 0.5;   // -0.5 .. 0.5
      var py = (ev.clientY - r.top)  / r.height - 0.5;
      tgtX = px * (MAX * 2);     // rotateY  (left/right)
      tgtY = py * -(MAX * 2);    // rotateX  (up/down, inverted)
      card.classList.add('tilting');
      kick();
    });

    card.addEventListener('pointerleave', function(){
      tgtX = 0; tgtY = 0;
      card.classList.remove('tilting');
      kick();
    });
  }
})();
