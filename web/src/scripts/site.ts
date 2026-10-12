import { loadThirdParties, mountConsent, readConsent } from './consent';
import { mountEasterEggs } from './easter-eggs';
import { mountSearch } from './search';

const today = document.querySelector('#hoy');
if (today) {
  today.textContent = new Intl.DateTimeFormat('es-MX', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    timeZone: 'America/Mexico_City',
  }).format(new Date());
}

mountSearch();
mountConsent();
if (readConsent()) loadThirdParties();
mountEasterEggs(document);

document.querySelectorAll<HTMLFormElement>('[data-subscribe]').forEach((form) => {
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const response = await fetch('/api/v3/subscribe.php', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: data.get('email'), recaptchaToken: 'pending' }),
    });
    const status = form.querySelector('[data-status]');
    if (status) status.textContent = response.ok ? 'Listo. Revisa tu correo.' : 'No se pudo suscribir. Intenta de nuevo.';
  });
});

document.querySelectorAll<HTMLElement>('[data-views]').forEach(async (node) => {
  const slug = node.dataset.views;
  if (!slug) return;
  const response = await fetch('/api/v3/views.php', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ slug }),
  });
  if (!response.ok) return;
  const payload = (await response.json()) as { count: number };
  node.textContent = `${payload.count} vistas`;
});

const bar = document.querySelector<HTMLElement>('.progress');
if (bar) {
  document.addEventListener('scroll', () => {
    const height = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.width = `${height > 0 ? (window.scrollY / height) * 100 : 0}%`;
  }, { passive: true });
}

const list = document.querySelector<HTMLElement>('[data-paginate]');
if (list) {
  const items = [...list.querySelectorAll<HTMLElement>('[data-item]')];
  const pager = document.querySelector<HTMLElement>('[data-pager]');
  const size = () => (window.innerWidth <= 480 ? 4 : 6);
  let page = 1;
  const draw = () => {
    const pageSize = size();
    const pages = Math.max(1, Math.ceil(items.length / pageSize));
    page = Math.min(page, pages);
    items.forEach((item, index) => {
      item.hidden = index < (page - 1) * pageSize || index >= page * pageSize;
    });
    if (!pager) return;
    pager.replaceChildren();
    for (let number = 1; number <= pages; number += 1) {
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = String(number);
      button.addEventListener('click', () => {
        page = number;
        draw();
      });
      pager.append(button);
    }
  };
  draw();
  window.addEventListener('resize', draw);
}
