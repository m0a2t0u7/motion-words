import { seg, lerp, easeInOut, easeOut, easeIn, backOut, smooth, wobble, hump, clamp } from '../ease.js';
const D = Math.PI / 180;
// 手(R/L)を点(tx,ty)へ向ける腕の角度
function aim(b, S, tx, ty, side = 'R') {
  const s = b.state, f = s.facing, o = side === 'R' ? 1 : -1;
  return Math.atan2((tx - (s.x + 27 * S * f * o)) * f * o, ty - (s.y - 56 * S - s.lift)) / D;
}
function cursor(k, parent) {
  return k.el('path', { d: 'M0 0 L0 15 L4 11.5 L7 18 L10 16.5 L7 10.5 L12 10.5 Z', fill: k.pal.ink, stroke: '#fff', 'stroke-width': 1.4, 'stroke-linejoin': 'round' }, parent);
}
function pen(k, parent, c) {
  const p = k.g({}, parent);
  k.el('line', { x1: 0, y1: 0, x2: -22, y2: -6, stroke: c || k.pal.coralDark, 'stroke-width': 5, 'stroke-linecap': 'round' }, p);
  k.el('path', { d: 'M 0 0 L 6 1.6 L 0 3 Z', fill: '#F4D9B5' }, p);
  k.el('circle', { cx: 5.2, cy: 1.7, r: 1.1, fill: k.pal.ink }, p);
  return p;
}

// slice-up：パンを包丁で薄く何枚にも切り分ける（He sliced up the bread for breakfast.）
export const meta = { duration: 4.2, beats: [[0, 'パン一本'], [1.3, '薄く切っていく'], [3.5, '何枚にもなった']] };

function counter(k, FY) {
  const { el, pal } = k;
  el('rect', { x: 0, y: 214, width: 400, height: 22, fill: '#D9C3A0' });
  el('rect', { x: 0, y: 194, width: 400, height: 20, fill: '#F0DFC2' });
  el('rect', { x: 0, y: 214, width: 400, height: 3, fill: '#B89F78' });
}
function knife(k, parent) {
  const n = k.g({}, parent);
  k.el('rect', { x: -4, y: -14, width: 8, height: 16, rx: 3, fill: k.pal.woodDark }, n);
  k.el('path', { d: 'M -5 2 L 5 2 L 5 26 Q 2 32 -5 28 Z', fill: '#DDE3EA', stroke: '#9AA6B6', 'stroke-width': 1.5, 'stroke-linejoin': 'round' }, n);
  return n;
}

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = 232, S = 1.1;
  k.backdrop({ floorY: 236, mood: 'indoor' });
  const b = k.buddy({ x: 150, y: FY, scale: S });
  counter(k, FY);
  el('rect', { x: 182, y: 198, width: 200, height: 12, rx: 5, fill: pal.wood });
  el('rect', { x: 182, y: 206, width: 200, height: 4, rx: 2, fill: pal.woodDark });
  const N = 8, TH = 11, X0 = 236;
  // 残りのパン（左端が切られて短くなる）
  const loaf = g({});
  const LW = N * TH + 8;
  el('rect', { x: 0, y: -34, width: LW, height: 34, rx: 14, fill: '#D99A4E' }, loaf);
  el('rect', { x: 3, y: -31, width: LW - 6, height: 27, rx: 11, fill: '#EBB36B' }, loaf);
  el('path', { d: `M 14 -30 l 6 -2 M 30 -31 l 6 -2 M 46 -30 l 6 -2`, stroke: '#D99A4E', 'stroke-width': 3, 'stroke-linecap': 'round' }, loaf);
  const slices = [];
  for (let i = 0; i < N; i++) {
    const s = g({});
    el('rect', { x: 0, y: -34, width: TH - 1.5, height: 34, rx: 3, fill: '#D99A4E' }, s);
    el('rect', { x: 1.2, y: -31.5, width: TH - 4, height: 29, rx: 2, fill: '#FFE3A8' }, s);
    slices.push(s);
  }
  const kn = knife(k);
  const T = (i) => 1.0 + i * 0.32;
  return {
    update(t) {
      const i = Math.min(N - 1, Math.max(0, Math.floor((t - 0.8) / 0.32)));
      const cut = t > 0.8 && t < T(N - 1) + 0.4;
      const ph = ((t - 0.8) / 0.32) % 1;
      const down = cut ? 0.5 - 0.5 * Math.cos(ph * Math.PI * 2) : 0;
      const kx = X0 + (Math.min(N, Math.max(0, (t - 0.8) / 0.32)) + 0.2) * TH;
      const move = easeInOut(seg(t, 0.2, 0.8));
      b.pose({ x: t < 0.8 ? lerp(130, X0 - 56, move) : kx - 56, armR: lerp(150, 88, down) + (cut ? Math.sin(t * 25) * 3 : 0), armL: 20, lean: 6, look: 1, mood: t > 3.6 ? 'grin' : 'smile', blink: t > 0.2 && t < 0.3 ? 1 : 0 });
      const h = b.handPos('R');
      tf(kn, h.x + 2, h.y + 2, 0);
      // 切り終えたパンは、ゆっくりドミノのように傾く
      let nCut = 0;
      for (let j = 0; j < N; j++) if (t >= T(j) + 0.1) nCut = j + 1;
      const rem = Math.max(0, (N - nCut) * TH + 8);
      tf(loaf, X0 + nCut * TH, 202, 0);
      k.set(loaf, { opacity: nCut >= N ? 0 : 1 });
      slices.forEach((s, j) => {
        const p = easeOut(seg(t, T(j) + 0.05, T(j) + 0.45));
        tf(s, X0 + j * TH + p * j * 1.8, 202, -p * (5 + j * 0.5), 1, 1);
        k.set(s, { opacity: t >= T(j) ? 1 : 0 });
      });
    }
  };
}
