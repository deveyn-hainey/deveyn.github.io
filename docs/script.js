/* ── FIREFLIES ────────────────────────────────────────── */
(function () {
  const canvas = document.getElementById('fireflies');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, particles = [];

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

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
      p.x += p.vx + Math.sin(p.phase) * 0.16;
      p.y += p.vy;
      p.phase += 0.017;
      p.alpha += p.aDir;
      if (p.alpha <= 0 || p.alpha >= 0.82) p.aDir *= -1;
      if (p.y < -10) { p.y = H + 10; p.x = Math.random() * W; }
      ctx.save();
      ctx.globalAlpha = Math.max(0, p.alpha) * 0.6;
      ctx.shadowBlur  = 9;
      ctx.shadowColor = `hsla(${p.hue},75%,60%,0.9)`;
      ctx.fillStyle   = `hsla(${p.hue},80%,72%,1)`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    requestAnimationFrame(loop);
  }

  window.addEventListener('resize', resize, { passive: true });
  resize();
  particles = Array.from({ length: 45 }, makeParticle);
  loop();
})();

/* ── NAVBAR ───────────────────────────────────────────── */
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 20);
}, { passive: true });

/* ── MOBILE MENU ──────────────────────────────────────── */
const hamburger = document.getElementById('hamburger');
const navMenu   = document.getElementById('navMenu');

hamburger.addEventListener('click', () => {
  const open = navMenu.classList.toggle('open');
  hamburger.classList.toggle('open', open);
  hamburger.setAttribute('aria-expanded', String(open));
});

// Close menu when a link is clicked
navMenu.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navMenu.classList.remove('open');
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
  });
});

/* ── ACTIVE NAV ON SCROLL ─────────────────────────────── */
const sections  = document.querySelectorAll('section[id]');
const navLinks  = document.querySelectorAll('.nav-link[data-section]');
const NAV_H     = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 66;

const sectionObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const id = entry.target.id;
      navLinks.forEach(l => l.classList.toggle('active', l.dataset.section === id));
    }
  });
}, { rootMargin: `-${NAV_H}px 0px -55% 0px`, threshold: 0 });

sections.forEach(s => sectionObserver.observe(s));

/* ── TRAIL LINE ───────────────────────────────────────── */
const trailLineObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      trailLineObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.05 });

const trailLine = document.getElementById('trailLine');
if (trailLine) trailLineObserver.observe(trailLine);

/* ── SCROLL REVEAL ────────────────────────────────────── */
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const delay = parseInt(entry.target.dataset.delay || '0', 10);
    setTimeout(() => entry.target.classList.add('visible'), delay);
    revealObserver.unobserve(entry.target);
  });
}, { threshold: 0.1 });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));
