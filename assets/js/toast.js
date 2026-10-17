/* Small status toast and a clipboard helper that reports through it. */
import {t} from './i18n.js';

let timer;
export function toast(msg, ok = true) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.toggle('err', !ok);
  el.classList.add('show');
  clearTimeout(timer);
  timer = setTimeout(() => el.classList.remove('show'), 2200);
}

export async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    /* older browsers / insecure contexts */
    const ta = Object.assign(document.createElement('textarea'), {value: text});
    ta.style.cssText = 'position:fixed;opacity:0';
    document.body.append(ta); ta.select();
    const ok = document.execCommand('copy');
    ta.remove();
    if (!ok) return toast(t('js.copyFail'), false);
  }
  toast(t('js.copied'));
}
