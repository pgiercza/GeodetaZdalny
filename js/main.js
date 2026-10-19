document.getElementById('year').textContent = new Date().getFullYear();

const toggle = document.querySelector('.nav-toggle');
const nav = document.querySelector('.nav');
toggle.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  toggle.setAttribute('aria-expanded', String(open));
});
nav.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => nav.classList.remove('open')));

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
    setStatus('Uzupełnij poprawnie wymagane pola.', 'error');
    return;
  }

  submitBtn.disabled = true;
  setStatus('Wysyłanie wiadomości...', '');
});
