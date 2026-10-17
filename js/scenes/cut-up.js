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

// cut-up：野菜を包丁で切り分け、いくつもの片にする（Cut up the vegetables for the soup.）
export const meta = { duration: 4.2, beats: [[0, 'まるごとの野菜'], [1.3, '切り分ける'], [3.5, '片に分かれた']] };

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
  // まな板
  el('rect', { x: 182, y: 198, width: 200, height: 12, rx: 5, fill: pal.wood });
  el('rect', { x: 182, y: 206, width: 200, height: 4, rx: 2, fill: pal.woodDark });
  // にんじん（まるごと→6片）
  const X0 = 214, X1 = 334, N = 6, LEN = (X1 - X0) / N;
  const pieces = [];
  for (let i = 0; i < N; i++) {
    const p = g({});
    const x = X0 + i * LEN, hh = lerp(11, 5, i / (N - 1));
    el('rect', { x: 0, y: -hh * 2, width: LEN - 0.5, height: hh * 2, rx: 2, fill: i === 0 ? '#F28C38' : '#F5963F' }, p);
    el('line', { x1: 3, y1: -hh * 1.4, x2: LEN - 4, y2: -hh * 1.4, stroke: '#FFC48A', 'stroke-width': 2, 'stroke-linecap': 'round' }, p);
    pieces.push([p, x, i]);
  }
  const leaf = el('path', { d: 'M 212 198 q -10 -8 -6 -16 q 8 2 12 12 q 2 -12 10 -14 q 2 8 -6 18 Z', fill: pal.green });
  const kn = knife(k);
  const cuts = [0, 1, 2, 3, 4];
  const T = (i) => 1.0 + i * 0.55;
  return {
    update(t) {
      // 何回目の切断か
      let n = 0;
      cuts.forEach((c) => { if (t >= T(c) + 0.2) n++; });
      const cur = Math.min(4, Math.floor(clamp((t - 0.8) / 0.55) ) );
      const ph = (t - T(Math.min(4, Math.max(0, Math.floor((t - 0.75) / 0.55))))) ;
      const i = Math.min(4, Math.max(0, Math.floor((t - 0.75) / 0.55)));
      const cx = X0 + (i + 1) * LEN;
      const kx = t < 0.75 ? X0 + LEN : cx;
      const down = t > 0.75 && t < T(4) + 0.45 ? hump(((t - T(i) + 0.25) / 0.5)) : 0;
      const bx = kx - 56;
      const move = easeInOut(seg(t, 0.2, 0.8));
      b.pose({ x: t < 0.75 ? lerp(130, X0 + LEN - 56, move) : bx, armR: lerp(150, 88, down), armL: 20, lean: 6, look: 1, mood: t > 3.6 ? 'grin' : 'smile', blink: t > 0.2 && t < 0.3 ? 1 : 0 });
      const h = b.handPos('R');
      tf(kn, h.x + 2, h.y + 2, 0);
      // 片を左へ少しずつ離す
      pieces.forEach(([p, x, idx]) => {
        const gap = idx - (idx < 0 ? 0 : 0);
        let sep = 0;
        for (let c = 0; c < 5; c++) if (idx <= c) sep += 0;
        // c番目の切断より左にある片は、その切断のあと左へ4pxずつ動く
        let shift = 0;
        for (let c = idx; c < 5; c++) shift -= 7 * easeOut(seg(t, T(c) + 0.15, T(c) + 0.5));
        tf(p, x + shift, 202);
      });
      k.set(leaf, { opacity: 1 });
      tf(leaf, -4 * 0 + (-4) * 5 * easeOut(seg(t, T(4) + 0.15, T(4) + 0.5)) * 0, 0);
    }
  };
}
