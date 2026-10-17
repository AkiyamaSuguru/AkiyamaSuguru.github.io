/* Entry point. Each module owns one part of the page; see the README for the map. */
import {initI18n} from './i18n.js';
import {initSky} from './sky.js';
import {initNav} from './nav.js';
import {initReveal} from './reveal.js';
import {initResearch} from './research.js';
import {initCite} from './cite.js';
import {initProjects} from './projects.js';
import {initExtras} from './extras.js';

const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const still = reduce || new URLSearchParams(location.search).has('still');

initI18n();
initSky({still});
initNav();
initReveal({reduce});
initResearch();
initCite();
initProjects();
initExtras({reduce});
