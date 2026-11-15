const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
document.getElementById('year').textContent = new Date().getFullYear();

/* ---------- Intro ---------- */
const intro = document.getElementById('intro');
const introX = document.getElementById('introX');
const introY = document.getElementById('introY');
const target = { x: 5681750.00, y: 7442950.00 };
const introStart = performance.now();
const introDuration = reduceMotion ? 0 : 1800;

function tickIntro(now) {
  const p = Math.min((now - introStart) / (introDuration || 1), 1);
  const e = 1 - Math.pow(1 - p, 3);
  introX.textContent = (target.x * e + Math.random() * (1 - p) * 9999).toFixed(2).padStart(10, '0');
  introY.textContent = (target.y * e + Math.random() * (1 - p) * 9999).toFixed(2).padStart(10, '0');
  if (p < 1) requestAnimationFrame(tickIntro);
  else setTimeout(endIntro, reduceMotion ? 0 : 350);
}
function endIntro() {
  intro.classList.add('done');
  document.body.classList.remove('is-loading');
  setTimeout(startHero, reduceMotion ? 0 : 450);
  setTimeout(() => intro.classList.add('gone'), 1200);
}
requestAnimationFrame(tickIntro);

/* ---------- Hero: split title + typer ---------- */
document.querySelectorAll('.split').forEach((el) => {
  const text = el.textContent;
  el.textContent = '';
  [...text].forEach((c, i) => {
    const s = document.createElement('span');
    s.className = 'ch';
    s.textContent = c === ' ' ? '\u00A0' : c;
    s.style.animationDelay = `${i * 35}ms`;
    el.appendChild(s);
  });
});

function startHero() {
  document.querySelectorAll('.split').forEach((el, i) => setTimeout(() => el.classList.add('play'), i * 500));
  document.querySelectorAll('.reveal-hero').forEach((el, i) => setTimeout(() => el.classList.add('in'), 300 + i * 250));
  typer();
}

const words = ['operaty geodezyjne', 'pliki wsadowe GML / KCD / GIV', 'mapy do celów projektowych', 'inwentaryzacje powykonawcze', 'mapy z projektem podziału'];
const typerEl = document.getElementById('typer');
function typer() {
  let w = 0, i = 0, del = false;
  (function step() {
    const word = words[w];
    i += del ? -1 : 1;
    typerEl.textContent = word.slice(0, i);
    let delay = del ? 35 : 70;
    if (!del && i === word.length) { del = true; delay = 1600; }
    else if (del && i === 0) { del = false; w = (w + 1) % words.length; delay = 300; }
    setTimeout(step, delay);
  })();
}

/* ---------- Hero: animated contour map ---------- */
const canvas = document.getElementById('contours');
const ctx = canvas.getContext('2d');
const hero = document.querySelector('.hero');
let W, H, hills = [], mouse = { x: -9999, y: -9999 };

function resize() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  W = canvas.clientWidth; H = canvas.clientHeight;
  canvas.width = W * dpr; canvas.height = H * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  hills = [
    { x: W * 0.78, y: H * 0.35, r: Math.max(W, H) * 0.06, n: 14, seed: 1.3 },
    { x: W * 0.18, y: H * 0.82, r: Math.max(W, H) * 0.05, n: 11, seed: 4.1 },
    { x: W * 0.55, y: H * 0.95, r: Math.max(W, H) * 0.04, n: 9, seed: 7.7 },
  ];
}
resize();
window.addEventListener('resize', resize);

function drawContours(t) {
  ctx.clearRect(0, 0, W, H);
  // grid
  ctx.strokeStyle = 'rgba(232,242,236,0.05)';
  ctx.lineWidth = 1;
  const g = 80;
  ctx.beginPath();
  for (let x = 0; x < W; x += g) { ctx.moveTo(x, 0); ctx.lineTo(x, H); }
  for (let y = 0; y < H; y += g) { ctx.moveTo(0, y); ctx.lineTo(W, y); }
  ctx.stroke();

  hills.forEach((h) => {
    const dx = mouse.x - h.x, dy = mouse.y - h.y;
    const pull = Math.max(0, 1 - Math.hypot(dx, dy) / 600);
    for (let k = 1; k <= h.n; k++) {
      const base = h.r * k * 0.55;
      ctx.beginPath();
      for (let a = 0; a <= Math.PI * 2 + 0.01; a += 0.06) {
        const wobble = 1
          + 0.18 * Math.sin(3 * a + h.seed + t * 0.0003 + k * 0.2)
          + 0.10 * Math.sin(5 * a - h.seed + t * 0.0002 - k * 0.15)
          + 0.12 * pull * Math.cos(a - Math.atan2(dy, dx));
        const r = base * wobble;
        const px = h.x + Math.cos(a) * r * 1.3;
        const py = h.y + Math.sin(a) * r;
        a === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
      }
      const major = k % 5 === 0;
      ctx.strokeStyle = major ? 'rgba(242,177,52,0.35)' : `rgba(47,191,113,${0.08 + 0.12 * (1 - k / h.n)})`;
      ctx.lineWidth = major ? 1.4 : 1;
      ctx.stroke();
    }
  });
  if (!reduceMotion) requestAnimationFrame(drawContours);
}
requestAnimationFrame(drawContours);

const crosshair = document.getElementById('crosshair');
const chX = document.getElementById('chX');
const chY = document.getElementById('chY');
hero.addEventListener('mousemove', (e) => {
  const r = hero.getBoundingClientRect();
  mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top;
  crosshair.style.left = `${mouse.x}px`; crosshair.style.top = `${mouse.y}px`;
  chX.textContent = `X ${(5681000 + (H - mouse.y) * 1.37).toFixed(2)}`;
  chY.textContent = `Y ${(7442000 + mouse.x * 1.37).toFixed(2)}`;
});
hero.addEventListener('mouseleave', () => { mouse.x = mouse.y = -9999; });

/* ---------- Cursor glow, header, progress ---------- */
const glow = document.getElementById('cursorGlow');
window.addEventListener('mousemove', (e) => { glow.style.left = `${e.clientX}px`; glow.style.top = `${e.clientY}px`; });

const header = document.getElementById('header');
const progress = document.getElementById('progress');
function onScroll() {
  const y = window.scrollY;
  header.classList.toggle('scrolled', y > 40);
  const max = document.documentElement.scrollHeight - window.innerHeight;
  progress.style.width = `${max > 0 ? (y / max) * 100 : 0}%`;
}
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

/* ---------- Nav ---------- */
const toggle = document.querySelector('.nav-toggle');
const nav = document.querySelector('.nav');
toggle.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  toggle.setAttribute('aria-expanded', String(open));
});
nav.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => nav.classList.remove('open')));

const navLinks = [...nav.querySelectorAll('a:not(.btn)')];
const spy = new IntersectionObserver((entries) => {
  entries.forEach((en) => {
    if (en.isIntersecting) navLinks.forEach((a) => a.classList.toggle('active', a.getAttribute('href') === `#${en.target.id}`));
  });
}, { rootMargin: '-45% 0px -50% 0px' });
navLinks.forEach((a) => { const s = document.querySelector(a.getAttribute('href')); if (s) spy.observe(s); });

/* ---------- Scroll reveal, counters ---------- */
function countUp(el) {
  const end = Number(el.dataset.count);
  const start = performance.now();
  (function f(now) {
    const p = Math.min((now - start) / 1500, 1);
    el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3)));
    if (p < 1) requestAnimationFrame(f);
  })(start);
}

const revealObs = new IntersectionObserver((entries) => {
  entries.forEach((en) => {
    if (!en.isIntersecting) return;
    const el = en.target;
    const siblings = [...el.parentElement.children].filter((c) => c.classList.contains('reveal'));
    el.style.transitionDelay = `${Math.max(0, siblings.indexOf(el)) * 90}ms`;
    el.classList.add('in');
    el.querySelectorAll('[data-count]').forEach(countUp);
    revealObs.unobserve(el);
  });
}, { threshold: 0.15 });
document.querySelectorAll('.reveal').forEach((el) => revealObs.observe(el));

/* ---------- Tilt + spotlight cards ---------- */
if (!reduceMotion && window.matchMedia('(hover: hover)').matches) {
  document.querySelectorAll('.tilt').forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      card.style.transform = `rotateY(${(x - 0.5) * 12}deg) rotateX(${(0.5 - y) * 12}deg) translateY(-4px)`;
      card.style.setProperty('--mx', `${x * 100}%`);
      card.style.setProperty('--my', `${y * 100}%`);
    });
    card.addEventListener('mouseleave', () => { card.style.transform = ''; });
  });

  document.querySelectorAll('.magnetic').forEach((btn) => {
    btn.addEventListener('mousemove', (e) => {
      const r = btn.getBoundingClientRect();
      btn.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.25}px, ${(e.clientY - r.top - r.height / 2) * 0.35}px)`;
    });
    btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
  });
}

/* ---------- Gallery filter + lightbox ---------- */
const shots = document.querySelectorAll('.shot');
document.querySelectorAll('.filter').forEach((btn) => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter').forEach((b) => b.classList.toggle('is-active', b === btn));
    const f = btn.dataset.filter;
    shots.forEach((s) => s.classList.toggle('is-hidden', f !== 'all' && s.dataset.cat !== f));
  });
});

const lightbox = document.getElementById('lightbox');
const lbImg = lightbox.querySelector('img');
const lbCap = lightbox.querySelector('.lightbox__cap');
shots.forEach((s) => s.addEventListener('click', () => {
  const img = s.querySelector('img');
  lbImg.src = img.src;
  lbImg.alt = img.alt;
  lbCap.textContent = s.querySelector('figcaption').textContent;
  lightbox.hidden = false;
}));
function closeLb() { lightbox.hidden = true; lightbox.classList.remove('is-zoomed'); }
lightbox.addEventListener('click', (e) => {
  if (e.target !== lbImg) { closeLb(); return; }
  const zoom = !lightbox.classList.contains('is-zoomed');
  const r = lbImg.getBoundingClientRect();
  const fx = (e.clientX - r.left) / r.width, fy = (e.clientY - r.top) / r.height;
  lightbox.classList.toggle('is-zoomed', zoom);
  if (zoom) lightbox.scrollTo(fx * lbImg.offsetWidth - innerWidth / 2, fy * lbImg.offsetHeight - innerHeight / 2);
});
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeLb(); });

/* ---------- Copy e-mail ---------- */
const copyBtn = document.getElementById('copyEmail');
copyBtn.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText('geodetazdalny@wp.pl');
    copyBtn.textContent = 'Skopiowano ✓';
  } catch {
    copyBtn.textContent = 'geodetazdalny@wp.pl';
  }
  setTimeout(() => { copyBtn.textContent = 'Kopiuj e-mail'; }, 2000);
});

/* ---------- Contact form ---------- */
const form = document.getElementById('contact-form');
const statusEl = document.getElementById('form-status');
const submitBtn = form.querySelector('button[type="submit"]');

function setStatus(text, type) {
  statusEl.textContent = text;
  statusEl.className = `form__status ${type}`;
}

form.addEventListener('submit', (e) => {
  let valid = true;
  form.querySelectorAll('input, select, textarea').forEach((el) => {
    if (el.type === 'hidden' || el.name === '_honey') return;
    const ok = el.checkValidity();
    el.classList.toggle('invalid', !ok);
    if (!ok) valid = false;
  });
  if (!valid) {
    e.preventDefault();
    setStatus('Uzupełnij poprawnie wymagane pola.', 'error');
    return;
  }
  submitBtn.disabled = true;
  setStatus('Wysyłanie wiadomości...', '');
});
