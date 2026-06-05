/* ── FIREFLIES ────────────────────────────────────────── */
(function () {
  const canvas = document.getElementById('fireflies');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, particles = [];

  function resize() { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; }

  function makeParticle() {
    return {
      x: Math.random() * W, y: Math.random() * H,
      r: Math.random() * 1.8 + 0.4,
      vx: (Math.random() - 0.5) * 0.3,
      vy: -(Math.random() * 0.38 + 0.06),
      alpha: Math.random(), aDir: (Math.random() > 0.5 ? 1 : -1) * 0.004,
      phase: Math.random() * Math.PI * 2,
      hue: Math.random() * 35 + 68,
    };
  }

  function loop() {
    ctx.clearRect(0, 0, W, H);
    for (const p of particles) {
      p.x += p.vx + Math.sin(p.phase) * 0.16; p.y += p.vy; p.phase += 0.017;
      p.alpha += p.aDir;
      if (p.alpha <= 0 || p.alpha >= 0.82) p.aDir *= -1;
      if (p.y < -10) { p.y = H + 10; p.x = Math.random() * W; }
      ctx.save();
      ctx.globalAlpha = Math.max(0, p.alpha) * 0.58;
      ctx.shadowBlur = 9; ctx.shadowColor = `hsla(${p.hue},75%,60%,0.9)`;
      ctx.fillStyle = `hsla(${p.hue},80%,72%,1)`;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    }
    requestAnimationFrame(loop);
  }

  window.addEventListener('resize', resize, { passive: true });
  resize();
  particles = Array.from({ length: 45 }, makeParticle);
  loop();
})();

/* ── NAVBAR SCROLL SHADOW ─────────────────────────────── */
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 10);
}, { passive: true });

/* ── MOBILE MENU ──────────────────────────────────────── */
const hamburger = document.getElementById('hamburger');
const navMenu   = document.getElementById('navMenu');

hamburger.addEventListener('click', () => {
  const open = navMenu.classList.toggle('open');
  hamburger.classList.toggle('open', open);
  hamburger.setAttribute('aria-expanded', String(open));
});

function closeMobileMenu() {
  navMenu.classList.remove('open');
  hamburger.classList.remove('open');
  hamburger.setAttribute('aria-expanded', 'false');
}

/* ── SPA NAVIGATION ───────────────────────────────────── */
const PAGES = ['home', 'projects', 'about', 'resume', 'contact'];

function navigate(id) {
  if (!PAGES.includes(id)) id = 'home';

  // Hide all sections, deactivate all nav links
  PAGES.forEach(p => {
    const el = document.getElementById(p);
    if (el) el.classList.remove('active');
  });
  document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));

  // Show target
  const target = document.getElementById(id);
  if (target) {
    target.classList.add('active');
    window.scrollTo(0, 0);

    // Fire reveal animations for this page
    setTimeout(() => {
      target.querySelectorAll('.reveal').forEach(el => {
        const delay = parseInt(el.dataset.delay || '0', 10);
        // Reset first so re-visiting a page re-animates
        el.classList.remove('visible');
        setTimeout(() => el.classList.add('visible'), delay + 20);
      });

      if (id === 'projects') {
        const line = document.getElementById('trailLine');
        if (line) { line.classList.remove('visible'); setTimeout(() => line.classList.add('visible'), 350); }
      }
    }, 30);
  }

  // Mark active nav link
  document.querySelectorAll(`[data-nav="${id}"]`).forEach(l => l.classList.add('active'));

  // Update URL hash silently
  history.replaceState(null, '', id === 'home' ? window.location.pathname : '#' + id);

  closeMobileMenu();
}

/* ── WIRE UP ALL NAV BUTTONS ──────────────────────────── */
document.querySelectorAll('[data-nav]').forEach(el => {
  el.addEventListener('click', () => navigate(el.dataset.nav));
});

/* ── INITIAL LOAD FROM HASH ───────────────────────────── */
(function () {
  const hash = window.location.hash.replace('#', '');
  navigate(PAGES.includes(hash) ? hash : 'home');
})();

/* ── SCROLL REVEAL (for elements already visible) ─────── */
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const delay = parseInt(entry.target.dataset.delay || '0', 10);
    setTimeout(() => entry.target.classList.add('visible'), delay);
    revealObserver.unobserve(entry.target);
  });
}, { threshold: 0.08 });

// Observe all reveals so scroll within long pages also works
document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));
