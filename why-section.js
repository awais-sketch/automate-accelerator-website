/* ============================================================
   Why Automate Accelerator — v2 expanding panel rail.
   Desktop: hover (with hover-intent delay) expands a panel; click /
   keyboard also work. Touch: tap toggles. One panel active at a time.
   Reveal-on-scroll for .why-reveal. Imported into index.html.
   ============================================================ */
(function () {
  const whySection = document.getElementById("why-section");
  if (!whySection) return;

  const whyEls = whySection.querySelectorAll(".why-reveal");
  function revealAll() { whyEls.forEach((el) => el.classList.add("visible")); }

  if (!("IntersectionObserver" in window)) {
    revealAll();
  } else {
    const whyObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("visible");
        whyObserver.unobserve(entry.target);
      });
    }, { threshold: 0.16 });

    whyEls.forEach((el) => whyObserver.observe(el));

    // Safety net: never leave the section stuck at opacity 0 if the
    // observer never fires (headless render, odd viewport, etc.).
    window.setTimeout(revealAll, 1400);
  }

  const panels = Array.from(whySection.querySelectorAll(".why-panel"));
  const hoverCapable = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const touchAccordion = !hoverCapable;

  function activate(targetPanel) {
    panels.forEach(function (panel) {
      const isTarget = panel === targetPanel;
      panel.classList.toggle("active", isTarget);
      panel.setAttribute("aria-expanded", isTarget ? "true" : "false");
      panel.setAttribute("aria-selected", isTarget ? "true" : "false");
    });
  }

  function deactivateAll() {
    panels.forEach(function (panel) {
      panel.classList.remove("active");
      panel.setAttribute("aria-expanded", "false");
      panel.setAttribute("aria-selected", "false");
    });
  }

  activate(panels.find(function (panel) { return panel.classList.contains("active"); }) || panels[0]);

  const HOVER_INTENT_MS = 140;
  let hoverIntentTimer = null;

  function queueActivate(targetPanel) {
    window.clearTimeout(hoverIntentTimer);
    hoverIntentTimer = window.setTimeout(function () {
      activate(targetPanel);
    }, HOVER_INTENT_MS);
  }

  function cancelQueuedActivate() {
    window.clearTimeout(hoverIntentTimer);
  }

  panels.forEach(function (panel) {
    panel.addEventListener("click", function () {
      cancelQueuedActivate();
      if (!touchAccordion && panel.classList.contains("active")) {
        deactivateAll();
      } else {
        activate(panel);
      }
    });

    panel.addEventListener("focus", function () {
      cancelQueuedActivate();
      activate(panel);
    });

    if (hoverCapable) {
      panel.addEventListener("mouseenter", function () {
        queueActivate(panel);
      });

      panel.addEventListener("mouseleave", function () {
        cancelQueuedActivate();
      });
    }

    panel.addEventListener("keydown", function (event) {
      if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
      event.preventDefault();

      cancelQueuedActivate();
      const currentIndex = panels.indexOf(panel);
      const nextIndex = event.key === "ArrowRight"
        ? (currentIndex + 1) % panels.length
        : (currentIndex - 1 + panels.length) % panels.length;

      panels[nextIndex].focus();
      activate(panels[nextIndex]);
    });
  });
})();
