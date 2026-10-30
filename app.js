// Progressive enhancement only — every page is fully readable without this file.
(() => {
  const d = document, root = d.documentElement;
  root.classList.add("js");
  const still = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Header glass + sticky mobile CTA after scrolling past the hero
  const header = d.querySelector("header.site"), cta = d.querySelector(".mobile-cta");
  const onScroll = () => {
    const y = scrollY;
    header && header.classList.toggle("scrolled", y > 24);
    cta && cta.classList.toggle("show", y > innerHeight * 0.6);
  };
  addEventListener("scroll", onScroll, { passive: true }); onScroll();

  // Staggered reveal on scroll
  const items = [...d.querySelectorAll(".reveal")];
  const groups = new Map();
  items.forEach(el => { const i = groups.get(el.parentElement) || 0; el.style.setProperty("--d", `${Math.min(i, 5) * 0.08}s`); groups.set(el.parentElement, i + 1); });
  if (still || !("IntersectionObserver" in window)) items.forEach(el => el.classList.add("in"));
  else {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { rootMargin: "0px 0px -8% 0px" });
    items.forEach(el => io.observe(el));
  }

  // Count-up numbers
  const counters = d.querySelectorAll("[data-count]");
  if (!still && "IntersectionObserver" in window) {
    const co = new IntersectionObserver(es => es.forEach(e => {
      if (!e.isIntersecting) return; co.unobserve(e.target);
      const el = e.target, end = +el.dataset.count, suf = el.dataset.suffix || "", t0 = performance.now();
      const tick = t => { const p = Math.min((t - t0) / 1400, 1); el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3))) + suf; if (p < 1) requestAnimationFrame(tick); };
      requestAnimationFrame(tick);
    }), { threshold: 0.6 });
    counters.forEach(el => co.observe(el));
  }

  // Cursor spotlight on cards
  d.addEventListener("pointermove", e => {
    const c = e.target.closest && e.target.closest(".tile, .card, .ucard");
    if (!c) return; const r = c.getBoundingClientRect();
    c.style.setProperty("--mx", `${e.clientX - r.left}px`); c.style.setProperty("--my", `${e.clientY - r.top}px`);
  }, { passive: true });
})();

// Pricing page: cost-per-person calculator
(() => {
  const c = document.querySelector("[data-calc]"); if (!c) return;
  const $ = s => c.querySelector(s), out = $("[data-out]");
  const run = () => {
    const rate = parseFloat($("[data-rate]").value), hrs = parseFloat($("[data-hours]").value), n = parseInt($("[data-players]").value, 10);
    if (!(rate > 0 && hrs > 0 && n > 0)) { out.textContent = "Enter the hourly rate from the booking page."; return; }
    const total = rate * hrs, each = total / n;
    out.innerHTML = `<b>$${each.toFixed(2)}</b> per player · $${total.toFixed(2)} total`;
  };
  c.addEventListener("input", run); run();
})();
