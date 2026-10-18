// SPDX-FileCopyrightText: 2026 Jie Ma
// SPDX-License-Identifier: AGPL-3.0-only
/* Background music: "A Memory Among the Stars", an original piece for this book (piano, violin,
   cello and harp, about 91 seconds) that loops without a seam. The file holds the loop with a few
   tenths of a second of its own end before it and its own start after it; playback loops between
   the two marks, so the joins are exact however much padding the decoder adds.
   The file is fetched only when it is first needed. The music fades in after the visitor's first
   click or key (browsers allow sound only then), fades out while the tab is hidden, follows the
   sound switch, and remembers if the visitor turned it off. */
const SRC = 'assets/audio/a-memory-among-the-stars.m4a';
const PAD = .3, LOOP = 4010899 / 44100;   /* seconds: the padding, and the loop itself */
const LEVEL = .42;

export function createMusic({sound}) {
  let wanted = true;
  try { wanted = localStorage.getItem('music') !== 'off'; } catch {}
  let buffer = null, loading = null, src = null, gain = null, started = false;

  const audible = () => wanted && sound.on && !document.hidden;

  function load(ctx) {
    loading ??= fetch(SRC)
      .then(r => { if (!r.ok) throw new Error(r.status); return r.arrayBuffer(); })
      .then(data => new Promise((res, rej) => ctx.decodeAudioData(data, res, rej)))
      .then(b => (buffer = b))
      .catch(() => { loading = null; });
    return loading;
  }

  function fade(to, seconds) {
    const ctx = sound.context;
    if (!gain || !ctx) return;
    const now = ctx.currentTime;
    gain.gain.cancelScheduledValues(now);
    gain.gain.setValueAtTime(gain.gain.value, now);
    gain.gain.linearRampToValueAtTime(to, now + seconds);
  }

  async function play() {
    const ctx = sound.context;
    if (!ctx || !audible()) return;
    if (!buffer) await load(ctx);
    if (!buffer || !audible()) return;
    if (!src) {
      gain = ctx.createGain();
      gain.gain.value = 0;
      gain.connect(ctx.destination);
      src = ctx.createBufferSource();
      src.buffer = buffer;
      src.loop = true;
      src.loopStart = PAD;
      src.loopEnd = PAD + LOOP;
      src.connect(gain);
      src.start(0, PAD);
    }
    fade(LEVEL, 4);
  }

  function hush(seconds = 1.2) { fade(0, seconds); }

  /** bring the music in or out to match the switches and the tab */
  function sync() { if (audible()) play(); else hush(); }

  /* a hidden tab: fade out, then let the audio rest; back again: wake it and fade in */
  document.addEventListener('visibilitychange', () => {
    if (!started || !sound.context) return;
    if (document.hidden) { hush(.5); setTimeout(() => { if (document.hidden) sound.context.suspend(); }, 600); }
    else sound.context.resume().then(sync);
  });

  return {
    /** the first click or key: from now on the music may play */
    start() { started = true; sync(); },
    sync,
    get on() { return wanted; },
    set on(v) {
      wanted = v;
      try { localStorage.setItem('music', v ? 'on' : 'off'); } catch {}
      if (started) sync();
    },
  };
}
