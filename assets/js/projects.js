/* Project cards: a light that follows the pointer, plus live repo activity from the GitHub API
   (last update, stars once there are any, latest commit message). Responses are cached for an
   hour per visitor and failures are silent (e.g. when rate-limited). */
import {t, getLang, onLangChange} from './i18n.js';

const TTL = 3600e3;

async function cached(key, url, pick) {
  try {
    const hit = JSON.parse(sessionStorage.getItem(key) || 'null');
    if (hit && Date.now() - hit.at < TTL) return hit.data;
    /* after a rate-limit answer, leave the API alone for a while */
    if (Date.now() < +sessionStorage.getItem('gh:pause')) throw new Error('paused');
  } catch (e) { if (e.message === 'paused') throw e; }
  const r = await fetch(url, {headers: {Accept: 'application/vnd.github+json'}});
  if (r.status === 403 || r.status === 429) try { sessionStorage.setItem('gh:pause', Date.now() + 15 * 60e3); } catch {}
  if (!r.ok) throw new Error(r.status);
  const data = pick(await r.json());
  try { sessionStorage.setItem(key, JSON.stringify({at: Date.now(), data})); } catch {}
  return data;
}

const repoInfo = repo => cached('repo:' + repo, `https://api.github.com/repos/${repo}`,
  j => ({stars: j.stargazers_count, pushed: j.pushed_at}));
const lastCommit = repo => cached('commit:' + repo, `https://api.github.com/repos/${repo}/commits?per_page=1`,
  j => ({msg: (j[0]?.commit?.message || '').split('\n')[0], url: j[0]?.html_url}));

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

  const state = new Map();
  const render = () => state.forEach((s, card) => {
    const meta = card.querySelector('[data-repo-meta]'), commit = card.querySelector('[data-commit]');
    if (s.info) {
      meta.textContent = (s.info.stars > 0 ? `★ ${s.info.stars} · ` : '') + `${t('js.updated')} ${ago(s.info.pushed)}`;
      meta.classList.add('ready');
    }
    if (s.commit?.msg) {
      commit.replaceChildren(Object.assign(document.createElement('span'), {textContent: t('js.latest')}), ` ${s.commit.msg}`);
      commit.title = s.commit.msg;
      commit.classList.add('ready');
    }
  });

  /* only ask GitHub once the cards are about to be seen */
  const io = new IntersectionObserver(entries => entries.forEach(e => {
    if (!e.isIntersecting) return;
    io.unobserve(e.target);
    const card = e.target, repo = card.dataset.repo, s = {};
    state.set(card, s);
    repoInfo(repo).then(d => { s.info = d; render(); }).catch(() => {});
    lastCommit(repo).then(d => { s.commit = d; render(); }).catch(() => {});
  }), {rootMargin: '300px'});
  cards.forEach(c => io.observe(c));
  onLangChange(render);
}
