// 240p boot screen, once per session. Any key or click skips it.
// The LOADING dots run until app.js fires portfolio:ready.
import { flash } from './theme.js';

const KEY = 'pixel-portfolio:booted';
const TICK = { type: 60, load: 150, spin: 120 };
const HOLD = { hello: 300, ok: 350, end: 900, fonts: 1500, ready: 3000 };

// 16x16 globe: a 32-column world map scrolls through a circle
const GLOBE = 16;
const SPAN = [[5, 10], [3, 12], [2, 13], [1, 14], [1, 14], [0, 15], [0, 15], [0, 15], [0, 15], [0, 15], [0, 15], [1, 14], [1, 14], [2, 13], [3, 12], [5, 10]];
const MAP = [
  '................................',
  '....gggg..............gggggg....',
  '..ggggggg..........gggggggggggg.',
  '..gggggg..........ggggggggggggg.',
  '...ggggg.........gggggggggggg...',
  '....ggg...........ggggggggggg...',
  '.....gg...........gggggg.ggg....',
  '......ggg.........gggg....gg....',
  '......gggg........gggg..........',
  '.......ggg........ggg.....gg....',
  '.......gg..........gg....gggg...',
  '.......gg...........g.....gg....',
  '........g.......................',
  '................................',
  '................................',
  '................................',
];
const INK = { sea: '#5f8fbf', seaDark: '#3d6a99', land: '#7fb069', landDark: '#5b8a49' };

function drawGlobe(ctx, offset) {
  ctx.clearRect(0, 0, GLOBE, GLOBE);
  SPAN.forEach(([x0, x1], y) => {
    const w = x1 - x0 + 1;
    for (let i = 0; i < w; i++) {
      const tx = (Math.floor((i * 16) / w) + offset) % 32;
      const land = MAP[y][tx] === 'g';
      const dark = i >= w - 2;   // shaded edge
      ctx.fillStyle = land ? (dark ? INK.landDark : INK.land) : dark ? INK.seaDark : INK.sea;
      ctx.fillRect(x0 + i, y, 1, 1);
    }
  });
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function shouldBoot() {
  if (document.documentElement.dataset.theme === 'modern') return false;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
  try {
    if (sessionStorage.getItem(KEY)) return false;
    sessionStorage.setItem(KEY, '1');
  } catch {}
  return true;
}

function build() {
  const el = document.createElement('div');
  el.className = 'boot';
  el.setAttribute('aria-hidden', 'true');
  el.innerHTML = `
    <div class="boot__screen">
      <canvas class="boot__globe" width="${GLOBE}" height="${GLOBE}"></canvas>
      <span class="boot__line" data-line="hello"></span>
      <span class="boot__line" data-line="load"></span>
      <span class="boot__line" data-line="key"></span>
    </div>`;
  document.body.append(el);
  return el;
}

// give up waiting for portfolio:ready after HOLD.ready
function waitReady() {
  return new Promise((resolve) => {
    const t = setTimeout(resolve, HOLD.ready);
    document.addEventListener('portfolio:ready', () => { clearTimeout(t); resolve(); }, { once: true });
  });
}

async function run() {
  if (!shouldBoot()) return;
  const el = build();
  const line = (name) => el.querySelector(`[data-line="${name}"]`);
  let alive = true;

  const ctx = el.querySelector('.boot__globe').getContext('2d');
  let frame = 0;
  drawGlobe(ctx, 0);
  const spin = setInterval(() => drawGlobe(ctx, ++frame), TICK.spin);

  const dismiss = () => {
    if (!alive) return;
    alive = false;
    clearInterval(spin);
    el.remove();
    window.removeEventListener('keydown', dismiss);
    window.removeEventListener('pointerdown', dismiss);
    flash();
  };
  window.addEventListener('keydown', dismiss);
  window.addEventListener('pointerdown', dismiss);
  document.addEventListener('themechange', (e) => e.detail === 'modern' && dismiss(), { once: true });

  const ready = waitReady();
  await Promise.race([document.fonts?.ready, sleep(HOLD.fonts)]);

  const hello = 'HELLO, WORLD';
  for (let i = 1; i <= hello.length && alive; i++) {
    line('hello').textContent = hello.slice(0, i);
    await sleep(TICK.type);
  }
  await sleep(HOLD.hello);

  let got = false;
  ready.then(() => { got = true; });
  let dots = 0;
  while (alive && (!got || dots < 4)) {
    line('load').textContent = `LOADING ${'.'.repeat(++dots)}`;
    await sleep(TICK.load);
  }
  if (!alive) return;
  line('load').textContent += ' OK';
  await sleep(HOLD.ok);

  line('key').innerHTML = 'PRESS ANY KEY<span class="boot__cursor">_</span>';
  await sleep(HOLD.end);
  dismiss();
}

run();
