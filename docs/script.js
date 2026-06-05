/* ── FIREFLIES ────────────────────────────────────────── */
(function initFireflies() {
  const canvas = document.getElementById('fireflies');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, particles = [], raf;

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function makeParticle() {
    return {
      x:      Math.random() * W,
      y:      Math.random() * H,
      r:      Math.random() * 1.8 + 0.5,
      vx:     (Math.random() - 0.5) * 0.35,
      vy:     -(Math.random() * 0.4 + 0.05),
      alpha:  Math.random(),
      aDir:   (Math.random() > 0.5 ? 1 : -1) * 0.004,
      phase:  Math.random() * Math.PI * 2,
      hue:    Math.random() * 30 + 70,   // warm yellow-green (70–100)
    };
  }

  function init() {
    resize();
    particles = Array.from({ length: 45 }, makeParticle);
    loop();
  }

  function loop() {
    ctx.clearRect(0, 0, W, H);
    for (const p of particles) {
      p.x    += p.vx + Math.sin(p.phase) * 0.18;
      p.y    += p.vy;
      p.phase += 0.018;
      p.alpha += p.aDir;
      if (p.alpha <= 0 || p.alpha >= 0.85) p.aDir *= -1;
      if (p.y < -10) {
        p.y = H + 10;
        p.x = Math.random() * W;
      }
      ctx.save();
      ctx.globalAlpha = Math.max(0, p.alpha) * 0.65;
      ctx.shadowBlur  = 10;
      ctx.shadowColor = `hsla(${p.hue},75%,60%,0.9)`;
      ctx.fillStyle   = `hsla(${p.hue},80%,72%,1)`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    raf = requestAnimationFrame(loop);
  }

  window.addEventListener('resize', resize, { passive: true });
  init();
})();

/* ── PAGE NAVIGATION ─────────────────────────────────── */
const PAGES = ['home', 'projects', 'about', 'contact'];

function navigateTo(id) {
  if (!PAGES.includes(id)) return;

  // hide current
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));

  // show target
  const target = document.getElementById(id);
  if (target) {
    target.classList.add('active');
    window.scrollTo({ top: 0, behavior: 'instant' });

    // trigger reveal for the new page
    setTimeout(() => triggerReveal(target), 50);

    // trigger trail line if projects
    if (id === 'projects') {
      setTimeout(() => {
        const line = document.getElementById('trailLine');
        if (line) line.classList.add('visible');
      }, 300);
    }
  }

  // update nav links
  document.querySelectorAll(`.nav-link[data-target="${id}"]`).forEach(l => l.classList.add('active'));
  document.querySelectorAll(`.nav-brand[data-target="${id}"]`).forEach(l => l.classList.add('active'));

  // update URL hash without scroll
  history.pushState(null, '', '#' + id);

  // close mobile menu
  closeMobileMenu();
}

function triggerReveal(container) {
  container.querySelectorAll('.reveal').forEach((el, i) => {
    const delay = parseInt(el.dataset.delay || 0, 10);
    setTimeout(() => el.classList.add('visible'), delay);
  });
}

/* ── WIRING UP NAV LINKS ─────────────────────────────── */
document.querySelectorAll('[data-target]').forEach(el => {
  el.addEventListener('click', e => {
    e.preventDefault();
    navigateTo(el.dataset.target);
  });
});
document.querySelectorAll('[data-nav]').forEach(el => {
  el.addEventListener('click', () => navigateTo(el.dataset.nav));
});

/* ── HASH ROUTING ────────────────────────────────────── */
function handleHash() {
  const hash = window.location.hash.replace('#', '') || 'home';
  navigateTo(PAGES.includes(hash) ? hash : 'home');
}
window.addEventListener('popstate', handleHash);
handleHash();

/* ── MOBILE NAV TOGGLE ───────────────────────────────── */
const hamburger = document.getElementById('hamburger');
const navMenu   = document.getElementById('navMenu');

function closeMobileMenu() {
  hamburger.classList.remove('open');
  hamburger.setAttribute('aria-expanded', 'false');
  navMenu.classList.remove('open');
}

hamburger.addEventListener('click', () => {
  const open = navMenu.classList.toggle('open');
  hamburger.classList.toggle('open', open);
  hamburger.setAttribute('aria-expanded', String(open));
});

/* ── NAVBAR SCROLL SHADOW ────────────────────────────── */
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 20);
}, { passive: true });

/* ── SCROLL REVEAL (within active page) ─────────────── */
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const delay = parseInt(entry.target.dataset.delay || 0, 10);
      setTimeout(() => entry.target.classList.add('visible'), delay);
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

function observePage(container) {
  container.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));
}

// Observe all pages on load
document.querySelectorAll('.page').forEach(page => observePage(page));

/* ── HOME PAGE REVEAL ────────────────────────────────── */
window.addEventListener('load', () => {
  const homePage = document.getElementById('home');
  if (homePage && homePage.classList.contains('active')) {
    setTimeout(() => triggerReveal(homePage), 100);
  }
});

/* ── CONTACT FORM ────────────────────────────────────── */
document.getElementById('contactForm')?.addEventListener('submit', function (e) {
  const name    = document.getElementById('cf-name')?.value.trim();
  const email   = document.getElementById('cf-email')?.value.trim();
  const message = document.getElementById('cf-message')?.value.trim();

  if (!name || !email || !message) {
    e.preventDefault();
    alert('Please fill in all fields.');
    return;
  }
  // mailto: form submits naturally; no extra handling needed
});
