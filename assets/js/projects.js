/* Project cards: a light that follows the pointer, and the repo's last update from the GitHub API.
   The API call is cached for an hour per visitor and fails silently (e.g. when rate-limited). */
import {t, getLang, onLangChange} from './i18n.js';

const TTL = 3600e3;

async function repoInfo(repo) {
  const key = 'repo:' + repo;
  try {
    const hit = JSON.parse(sessionStorage.getItem(key) || 'null');
    if (hit && Date.now() - hit.at < TTL) return hit.data;
  } catch {}
  const r = await fetch(`https://api.github.com/repos/${repo}`, {headers: {Accept: 'application/vnd.github+json'}});
  if (!r.ok) throw new Error(r.status);
  const j = await r.json();
  const data = {stars: j.stargazers_count, pushed: j.pushed_at};
  try { sessionStorage.setItem(key, JSON.stringify({at: Date.now(), data})); } catch {}
  return data;
}

function ago(iso) {
  const rtf = new Intl.RelativeTimeFormat(getLang() === 'zh' ? 'zh-CN' : 'en', {numeric: 'auto'});
  const s = (new Date(iso) - Date.now()) / 1000;
  for (const [unit, n] of [['year', 31536e3], ['month', 2592e3], ['week', 604800], ['day', 86400], ['hour', 3600]])
    if (Math.abs(s) >= n) return rtf.format(Math.round(s / n), unit);
  return rtf.format(Math.round(s / 60), 'minute');
}

export function initProjects() {
  const cards = [...document.querySelectorAll('.project[data-repo]')];

  /* pointer-following light, only on devices with a real hover */
  if (matchMedia('(hover: hover)').matches) for (const card of cards) {
    card.addEventListener('pointermove', e => {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', `${e.clientX - r.left}px`);
      card.style.setProperty('--my', `${e.clientY - r.top}px`);
    });
  }

  const loaded = new Map();
  const render = () => loaded.forEach((data, el) => {
    const parts = [`${t('js.updated')} ${ago(data.pushed)}`];
    if (data.stars > 0) parts.unshift(`★ ${data.stars}`);
    el.textContent = parts.join(' · ');
    el.classList.add('ready');
  });

  /* only ask GitHub once the cards are about to be seen */
  const io = new IntersectionObserver(entries => entries.forEach(e => {
    if (!e.isIntersecting) return;
    io.unobserve(e.target);
    const el = e.target.querySelector('[data-repo-meta]');
    repoInfo(e.target.dataset.repo).then(d => { loaded.set(el, d); render(); }).catch(() => {});
  }), {rootMargin: '200px'});
  cards.forEach(c => io.observe(c));
  onLangChange(render);
}
