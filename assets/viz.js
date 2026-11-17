// Draws the small animated visuals for project cards and project pages.
// Usage: <div class="viz" data-viz="acoustic"></div>
// Available: acoustic, energy, services, mea, circuit, music, awards
// Everything is plain SVG + CSS animation, coloured with the site's --accent, so it follows light/dark mode.

(function () {
  const NS = 'http://www.w3.org/2000/svg';
  const W = 320, H = 180;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Seeded random, so each visual looks the same on every visit.
  function rng(seed) {
    return () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  }
  function el(name, attrs, parent) {
    const n = document.createElementNS(NS, name);
    for (const k in attrs) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  }
  const r2 = x => Math.round(x * 100) / 100;

  const css = `
  .viz .grow { transform-box: fill-box; transform-origin: center; animation: v-grow var(--d,1.2s) ease-in-out var(--t,0s) infinite alternate; }
  .viz .grow-b { transform-box: fill-box; transform-origin: bottom; animation: v-grow var(--d,1.2s) ease-in-out var(--t,0s) infinite alternate; }
  .viz .blink { animation: v-blink var(--d,4s) ease-in-out var(--t,0s) infinite; }
  .viz .fire { transform-box: fill-box; transform-origin: center; animation: v-fire 3.2s ease-out var(--t,0s) infinite; }
  .viz .flow { animation: v-flow var(--d,1.6s) linear infinite; }
  .viz .draw { animation: v-draw 6s ease-in-out infinite; }
  .viz .scan { animation: v-scan 5s ease-in-out infinite alternate; }
  .viz .ring { transform-box: fill-box; transform-origin: center; animation: v-ring 3.6s ease-out var(--t,0s) infinite; }
  .viz .spin { transform-origin: 160px 90px; animation: v-spin 40s linear infinite; }
  .viz .twinkle { transform-box: fill-box; transform-origin: center; animation: v-twinkle var(--d,3s) ease-in-out var(--t,0s) infinite; }
  @keyframes v-grow { from { transform: scaleY(.15); } to { transform: scaleY(1); } }
  @keyframes v-blink { 0%,100% { opacity: .18; } 45%,55% { opacity: 1; } }
  @keyframes v-fire { 0% { opacity: 1; transform: scale(1.8); } 35%,100% { opacity: .2; transform: scale(1); } }
  @keyframes v-flow { to { stroke-dashoffset: -24; } }
  @keyframes v-draw { 0% { stroke-dashoffset: 600; } 60%,100% { stroke-dashoffset: 0; } }
  @keyframes v-scan { from { transform: translateX(0); } to { transform: translateX(220px); } }
  @keyframes v-ring { from { transform: scale(.2); opacity: .9; } to { transform: scale(1.6); opacity: 0; } }
  @keyframes v-spin { to { transform: rotate(360deg); } }
  @keyframes v-twinkle { 0%,100% { transform: scale(.3); opacity: .25; } 50% { transform: scale(1); opacity: 1; } }`;
  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  const draw = {
    // Waveform with a sliding analysis window: audio classification.
    acoustic(svg) {
      const rand = rng(7), n = 56, bw = W / n;
      for (let i = 0; i < n; i++) {
        const env = 0.35 + 0.65 * Math.abs(Math.sin(i / 7) * Math.cos(i / 17));
        const h = r2(20 + env * 110 * (0.6 + 0.4 * rand()));
        const b = el('rect', { x: r2(i * bw + bw * 0.2), y: r2(90 - h / 2), width: r2(bw * 0.6), height: h, rx: 1.2,
          fill: 'currentColor', class: 'grow', style: `--d:${r2(0.6 + rand() * 0.9)}s;--t:-${r2(rand() * 2)}s` }, svg);
      }
      const win = el('g', { class: 'scan' }, svg);
      el('rect', { x: 20, y: 22, width: 80, height: 136, rx: 6, fill: 'currentColor', 'fill-opacity': .08,
        stroke: 'currentColor', 'stroke-width': 1.5, 'stroke-dasharray': '4 4' }, win);
    },

    // Grid of smart meters lighting up, with a load curve being drawn.
    energy(svg) {
      const rand = rng(11), cols = 22, rows = 7;
      for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
        el('circle', { cx: 18 + c * 13.5, cy: 18 + r * 13, r: 3, fill: 'currentColor', class: 'blink',
          style: `--d:${r2(2 + rand() * 4)}s;--t:-${r2(rand() * 6)}s` }, svg);
      }
      let d = '';
      for (let x = 10; x <= 310; x += 6) {
        const y = 150 - 22 * Math.sin(x / 30) * Math.sin(x / 90 + 1) - 10 * Math.sin(x / 9) * rand();
        d += `${d ? ' L' : 'M'} ${x} ${r2(y)}`;
      }
      el('path', { d, fill: 'none', stroke: 'currentColor', 'stroke-width': 2, 'stroke-linejoin': 'round',
        'stroke-dasharray': 600, class: 'draw' }, svg);
    },

    // Hub and outer nodes with data packets travelling along the links.
    services(svg) {
      const cx = 160, cy = 90, nodes = [];
      for (let i = 0; i < 7; i++) {
        const a = (i / 7) * Math.PI * 2 - Math.PI / 2;
        nodes.push([r2(cx + Math.cos(a) * 120), r2(cy + Math.sin(a) * 62)]);
      }
      nodes.forEach(([x, y], i) => {
        el('line', { x1: cx, y1: cy, x2: x, y2: y, class: 'dim', 'stroke-width': 1.2 }, svg);
        const [nx, ny] = nodes[(i + 1) % nodes.length];
        el('line', { x1: x, y1: y, x2: nx, y2: ny, class: 'dim', 'stroke-width': 1, 'stroke-dasharray': '3 4' }, svg);
      });
      nodes.forEach(([x, y], i) => {
        const p = el('circle', { r: 3.2, fill: 'currentColor' }, svg);
        const out = i % 2 === 0;
        if (!reduce) {
          el('animateMotion', { dur: `${2 + (i % 3) * 0.6}s`, repeatCount: 'indefinite', begin: `${-i * 0.4}s`,
            path: out ? `M ${cx} ${cy} L ${x} ${y}` : `M ${x} ${y} L ${cx} ${cy}` }, p);
        } else { p.setAttribute('cx', (x + cx) / 2); p.setAttribute('cy', (y + cy) / 2); }
        el('circle', { cx: x, cy: y, r: 9, fill: 'var(--card)', stroke: 'currentColor', 'stroke-width': 1.8 }, svg);
      });
      el('circle', { cx, cy, r: 26, fill: 'currentColor', class: 'ring', style: '--t:0s', 'fill-opacity': .25 }, svg);
      el('circle', { cx, cy, r: 16, fill: 'currentColor' }, svg);
    },

    // Electrode array: activity spreads from one patterned network to the other and back.
    mea(svg) {
      const cols = 20, rows = 9, sx = 15, sy = 18, ox = 17.5, oy = 18;
      const src = [3, 4], period = 3.2;
      for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
        const x = ox + c * sx, y = oy + r * sy;
        const inA = Math.hypot(c - 4, (r - 4) * 1.3) < 3.3;
        const inB = Math.hypot(c - 15, (r - 4) * 1.3) < 3.3;
        const bridge = r === 4 && c > 6 && c < 13;
        if (inA || inB || bridge) {
          const dist = Math.hypot(c - src[0], r - src[1]);
          el('circle', { cx: x, cy: y, r: 2.4, fill: 'currentColor', class: 'fire',
            style: `--t:${r2((dist * 0.11) % period)}s` }, svg);
        } else {
          el('circle', { cx: x, cy: y, r: 1.6, class: 'dimfill' }, svg);
        }
      }
    },

    // Circuit traces with current flowing towards a chip.
    circuit(svg) {
      const traces = [
        'M 0 40 H 70 L 90 60 H 120', 'M 0 90 H 120', 'M 0 140 H 60 L 80 120 H 120',
        'M 200 60 H 240 L 260 30 H 320', 'M 200 90 H 320', 'M 200 120 H 230 L 260 150 H 320',
        'M 140 0 V 50', 'M 180 0 V 50', 'M 140 130 V 180', 'M 180 130 V 180'
      ];
      traces.forEach((d, i) => {
        el('path', { d, fill: 'none', class: 'dim', 'stroke-width': 2 }, svg);
        el('path', { d, fill: 'none', stroke: 'currentColor', 'stroke-width': 2, 'stroke-linecap': 'round',
          'stroke-dasharray': '6 18', class: 'flow', style: `--d:${1.2 + (i % 4) * 0.3}s` }, svg);
      });
      el('rect', { x: 120, y: 50, width: 80, height: 80, rx: 6, fill: 'var(--card)', stroke: 'currentColor', 'stroke-width': 2 }, svg);
      el('circle', { cx: 160, cy: 90, r: 8, fill: 'currentColor', class: 'blink', style: '--d:2s' }, svg);
    },

    // Radial equaliser with a slow rotation and pulsing rings.
    music(svg) {
      const rand = rng(3), cx = 160, cy = 90, n = 48;
      [0, 1.2, 2.4].forEach(t => el('circle', { cx, cy, r: 40, fill: 'none', stroke: 'currentColor', 'stroke-width': 1,
        class: 'ring', style: `--t:-${t}s` }, svg));
      const g = el('g', { class: 'spin' }, svg);
      for (let i = 0; i < n; i++) {
        const a = (i / n) * 360, len = r2(14 + rand() * 30);
        const bar = el('g', { transform: `rotate(${a} ${cx} ${cy})` }, g);
        el('rect', { x: cx - 1.6, y: cy - 34 - len, width: 3.2, height: len, rx: 1.6, fill: 'currentColor', class: 'grow-b',
          style: `--d:${r2(0.4 + rand() * 0.7)}s;--t:-${r2(rand())}s` }, bar);
      }
      el('circle', { cx, cy, r: 22, fill: 'currentColor', 'fill-opacity': .2, stroke: 'currentColor', 'stroke-width': 1.5 }, svg);
      el('circle', { cx, cy, r: 4, fill: 'currentColor' }, svg);
    },

    // Twinkling four-point stars.
    awards(svg) {
      const rand = rng(5);
      const star = (x, y, s) => `M ${x} ${y - s} Q ${x} ${y} ${x + s} ${y} Q ${x} ${y} ${x} ${y + s} Q ${x} ${y} ${x - s} ${y} Q ${x} ${y} ${x} ${y - s} Z`;
      for (let i = 0; i < 26; i++) {
        const x = r2(16 + rand() * 288), y = r2(14 + rand() * 152), s = r2(4 + rand() * 9);
        el('path', { d: star(x, y, s), fill: 'currentColor', class: 'twinkle',
          style: `--d:${r2(2 + rand() * 3)}s;--t:-${r2(rand() * 4)}s` }, svg);
      }
      el('path', { d: star(160, 90, 30), fill: 'currentColor', class: 'twinkle', style: '--d:4s' }, svg);
    }
  };

  function render(box) {
    const kind = box.dataset.viz;
    if (!draw[kind] || box.firstChild) return;
    const svg = el('svg', { viewBox: `0 0 ${W} ${H}`, preserveAspectRatio: 'xMidYMid slice', 'aria-hidden': 'true' });
    draw[kind](svg);
    box.appendChild(svg);
  }

  function init() { document.querySelectorAll('.viz[data-viz]').forEach(render); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
