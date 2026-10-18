// SPDX-FileCopyrightText: 2026 Jie Ma
// SPDX-License-Identifier: AGPL-3.0-only
/* Sounds, synthesised with Web Audio so there are no recordings to license or download:
   a latch click, a soft chime, the doors' air and creak, page and cover turns, a riffle.
   Audio starts only after the visitor's first click (browser autoplay rules). */
import {motion} from './motion.js';

let ctx = null, master = null, noise = null;
let enabled = true;
try { enabled = localStorage.getItem('sound') !== 'off'; } catch {}

function makeNoise() {
  const len = ctx.sampleRate * 2, buf = ctx.createBuffer(1, len, ctx.sampleRate), d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  return buf;
}

/** filtered noise burst */
function burst({t, dur, type = 'bandpass', freq = 1800, freqTo, q = .8, gain = .3, attack = .005}) {
  const src = ctx.createBufferSource(), filt = ctx.createBiquadFilter(), g = ctx.createGain();
  src.buffer = noise;
  filt.type = type;
  filt.Q.value = q;
  filt.frequency.setValueAtTime(freq, t);
  if (freqTo) filt.frequency.exponentialRampToValueAtTime(freqTo, t + dur);
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(gain, t + attack);
  g.gain.exponentialRampToValueAtTime(.0008, t + dur);
  src.connect(filt).connect(g).connect(master);
  src.start(t, Math.random() * 1.5);
  src.stop(t + dur + .05);
}

/** pitched tone with a fast attack and exponential decay */
function tone({t, f0, f1 = f0, dur, gain, type = 'sine', attack = .004}) {
  const o = ctx.createOscillator(), g = ctx.createGain();
  o.type = type;
  o.frequency.setValueAtTime(f0, t);
  if (f1 !== f0) o.frequency.exponentialRampToValueAtTime(f1, t + dur);
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(gain, t + attack);
  g.gain.exponentialRampToValueAtTime(.0005, t + dur);
  o.connect(g).connect(master);
  o.start(t);
  o.stop(t + dur + .05);
}

const SOUNDS = {
  click: t => { burst({t, dur: .05, freq: 3200, q: 2.5, gain: .3}); tone({t, f0: 180, f1: 90, dur: .09, gain: .2}); },
  latch: t => {
    burst({t, dur: .04, freq: 2600, q: 3, gain: .35});
    burst({t: t + .08, dur: .05, freq: 1900, q: 3, gain: .32});
    tone({t: t + .08, f0: 150, f1: 70, dur: .14, gain: .28});
  },
  chime: t => [1318.5, 1760, 2093, 2637].forEach((f, i) =>
    tone({t: t + i * .07, f0: f, dur: 1.9 - i * .2, gain: .06 - i * .01, attack: .012})),
  doors: t => {
    burst({t, dur: 1.4, type: 'lowpass', freq: 260, freqTo: 1300, q: .6, gain: .14, attack: .4});
    for (let i = 0; i < 8; i++) burst({t: t + .04 + i * .05 + Math.random() * .02, dur: .03, freq: 560 + Math.random() * 320, q: 10, gain: .05});
  },
  land: t => { tone({t, f0: 150, f1: 72, dur: .2, gain: .2}); burst({t, dur: .1, type: 'lowpass', freq: 700, q: .7, gain: .18}); },
  lift: t => burst({t, dur: 1.1, type: 'lowpass', freq: 220, freqTo: 900, q: .5, gain: .1, attack: .45}),
  page: t => {
    const k = .85 + Math.random() * .3;   /* no two pages sound quite alike */
    burst({t, dur: .45 * k, freq: 2300 * k, freqTo: 900, q: .7, gain: .28 * k, attack: .07});
    burst({t: t + .3 * k, dur: .08, type: 'highpass', freq: 2600, q: .5, gain: .11});
  },
  slide: t => burst({t, dur: .42, type: 'lowpass', freq: 1300, freqTo: 420, q: .5, gain: .09, attack: .1}),
  seal: t => {
    burst({t, dur: .06, freq: 1500, q: 4, gain: .35});
    burst({t: t + .05, dur: .05, freq: 900, q: 4, gain: .25});
    burst({t: t + .14, dur: .5, freq: 2200, freqTo: 1200, q: .7, gain: .16, attack: .08});
  },
  cover: t => {
    burst({t, dur: .8, freq: 900, freqTo: 480, q: .6, gain: .18, attack: .15});
    tone({t: t + .98, f0: 110, f1: 52, dur: .28, gain: .32});
    burst({t: t + .96, dur: .14, type: 'lowpass', freq: 700, q: .7, gain: .26});
  },
  riffle: t => { for (let i = 0; i < 7; i++) burst({t: t + i * .06, dur: .14, freq: 2700 - i * 130, q: .8, gain: .14}); },
};

export const sound = {
  unlock() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = .75;
      master.connect(ctx.destination);
      noise = makeNoise();
    }
    if (ctx.state === 'suspended') ctx.resume();
  },
  play(name) {
    if (!enabled || !ctx || motion.skipping) return;
    try { SOUNDS[name](ctx.currentTime + .01); } catch {}
  },
  /** the shared audio context, once a click has unlocked it (the music plays through it too) */
  get context() { return ctx; },
  get on() { return enabled; },
  set on(v) {
    enabled = v;
    try { localStorage.setItem('sound', v ? 'on' : 'off'); } catch {}
  },
};
