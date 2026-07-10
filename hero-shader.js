/* Animated hero background: Swirl · ChromaFlow · FlutedGlass · FilmGrain.
   Mounts into #heroShader on any page that has it. */
const mount = document.getElementById('heroShader');

if (mount) {
  const DEPS = 'deps=react@18.3.1,react-dom@18.3.1';
  Promise.all([
    import('https://esm.sh/react@18.3.1'),
    import('https://esm.sh/react-dom@18.3.1/client'),
    import('https://esm.sh/shaders@2.5.135/react?' + DEPS),
  ]).then(([React, ReactDOM, S]) => {
    const h = React.default.createElement;
    ReactDOM.createRoot(mount).render(
      h(S.Shader, { style: { position: 'absolute', inset: 0, width: '100%', height: '100%' } },
        h(S.Swirl,       { colorA: '#ffffff', colorB: '#f0f0f0', detail: 1.7 }),
        h(S.ChromaFlow,  { baseColor: '#ffffff', downColor: '#ff5f03', leftColor: '#ff5f03', rightColor: '#ff5f03', upColor: '#ff5f03', momentum: 13, radius: 3.5 }),
        h(S.FlutedGlass, { aberration: 0.26, angle: 31, frequency: 8, highlight: 0.08, highlightSoftness: 0.5, lightAngle: -90, refraction: 2.4, shape: 'rounded', softness: 1, speed: 0.15 }),
        h(S.FilmGrain,   { strength: 0.05 })
      )
    );
    setTimeout(() => mount.classList.add('is-ready'), 140);
    startAutoFlow();
  }).catch(err => console.error('[hero-shader] failed to load:', err));
}

/* ChromaFlow follows the pointer; synthesize a slow drifting pointer so the orange
   flow keeps moving with no cursor (hold a press on the canvas, then feed mousemove). */
function startAutoFlow() {
  if (!mount) return;
  const opts = (x, y) => ({ clientX: x, clientY: y, bubbles: true, cancelable: true, view: window, button: 0 });
  let lastX = 0, lastY = 0, lastReal = -1e9, dispatching = false;

  function arm() {
    const c = mount.querySelector('canvas');
    if (!c) return;
    const r = c.getBoundingClientRect();
    if (!lastX) { lastX = r.left + r.width / 2; lastY = r.top + r.height / 2; }
    c.dispatchEvent(new MouseEvent('mousedown', opts(lastX, lastY)));
  }
  arm();
  window.addEventListener('mouseup', () => setTimeout(arm, 40), { passive: true });
  setInterval(arm, 2500);
  window.addEventListener('mousemove', (e) => { if (!dispatching) lastReal = e.timeStamp; }, { passive: true });

  function frame(now) {
    if (now - lastReal > 1500) {
      const c = mount.querySelector('canvas');
      if (c) {
        const r = c.getBoundingClientRect();
        const t = now / 1000;
        const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
        const ax = r.width * 0.34, ay = r.height * 0.34;
        lastX = cx + ax * (Math.sin(t * 0.72) * 0.8 + Math.sin(t * 1.7) * 0.2);
        lastY = cy + ay * (Math.sin(t * 0.54 + 1.3) * 0.8 + Math.cos(t * 1.4) * 0.2);
        dispatching = true;
        window.dispatchEvent(new MouseEvent('mousemove', opts(lastX, lastY)));
        dispatching = false;
      }
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}
