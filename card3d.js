/* ============================================================
   3D tilt for the small feature cards (.card). Each card tilts toward
   the cursor using its own perspective, flat and aligned at rest.
   Only .card gets this — larger content cards do not. Skips touch.
   ============================================================ */
(function () {
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

  var cards = document.querySelectorAll('.card');
  if (!cards.length) return;

  var MAX = 8, SPEED = 0.18;

  [].forEach.call(cards, function (card) {
    if (card.classList.contains('is3d')) return;
    card.classList.add('is3d');
    attachTilt(card);
  });

  function attachTilt(card) {
    var raf = null, curX = 0, curY = 0, tgtX = 0, tgtY = 0;

    function frame() {
      curX += (tgtX - curX) * SPEED;
      curY += (tgtY - curY) * SPEED;
      card.style.transform =
        'perspective(900px) rotateX(' + curY.toFixed(2) + 'deg) rotateY(' + curX.toFixed(2) + 'deg)';
      if (Math.abs(tgtX - curX) > 0.04 || Math.abs(tgtY - curY) > 0.04) {
        raf = requestAnimationFrame(frame);
      } else {
        raf = null;
        if (tgtX === 0 && tgtY === 0) card.style.transform = '';
      }
    }
    function kick() { if (!raf) raf = requestAnimationFrame(frame); }

    card.addEventListener('pointermove', function (ev) {
      if (ev.pointerType === 'touch') return;
      var r = card.getBoundingClientRect();
      var px = (ev.clientX - r.left) / r.width - 0.5;
      var py = (ev.clientY - r.top) / r.height - 0.5;
      tgtX = px * (MAX * 2);
      tgtY = py * -(MAX * 2);
      card.classList.add('tilting');
      kick();
    });

    card.addEventListener('pointerleave', function () {
      tgtX = 0; tgtY = 0;
      card.classList.remove('tilting');
      kick();
    });
  }
})();
