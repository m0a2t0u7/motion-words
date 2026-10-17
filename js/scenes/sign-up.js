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

// sign-up：名簿に名前を書いて、参加者の一覧に加わる（I signed up for a cooking class.）
export const meta = { duration: 4.0, beats: [[0, '参加者の名簿'], [1.2, '名前を書く'], [3.0, '名簿に加わる']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  const S = 1.1;
  k.shadow(290, 234, 62, 5);
  el('rect', { x: 284, y: 190, width: 14, height: 44, fill: pal.woodDark });
  el('rect', { x: 230, y: 40, width: 118, height: 156, rx: 10, fill: pal.wood, stroke: pal.woodDark, 'stroke-width': 3 });
  el('rect', { x: 240, y: 56, width: 98, height: 132, rx: 4, fill: '#fff' });
  el('rect', { x: 268, y: 34, width: 42, height: 14, rx: 5, fill: '#9AA6B6' });
  // 見出し（コック帽）
  const hat = g({ transform: 'translate(260 74)' });
  el('circle', { cx: -6, cy: -3, r: 6, fill: '#fff', stroke: '#C7CFDA', 'stroke-width': 2 }, hat);
  el('circle', { cx: 6, cy: -3, r: 6, fill: '#fff', stroke: '#C7CFDA', 'stroke-width': 2 }, hat);
  el('circle', { cx: 0, cy: -8, r: 7, fill: '#fff', stroke: '#C7CFDA', 'stroke-width': 2 }, hat);
  el('rect', { x: -9, y: -2, width: 18, height: 10, rx: 2, fill: '#fff', stroke: '#C7CFDA', 'stroke-width': 2 }, hat);
  el('rect', { x: 276, y: 70, width: 50, height: 7, rx: 3.5, fill: '#D5DBE5' });
  const cols = [pal.blue, pal.coral, pal.yellow, pal.mint];
  const ROW = (i) => 104 + i * 22;
  const rows = [0, 1, 2, 3].map((i) => {
    const r = g({});
    el('line', { x1: 248, y1: ROW(i) + 10, x2: 330, y2: ROW(i) + 10, stroke: '#E3E9F1', 'stroke-width': 2 }, r);
    if (i < 3) {
      el('circle', { cx: 256, cy: ROW(i), r: 7, fill: cols[i] }, r);
      el('rect', { x: 270, y: ROW(i) - 4, width: 40 - i * 8, height: 8, rx: 4, fill: '#C7CFDA' }, r);
    }
    return r;
  });
  const dot = el('circle', { cx: 256, cy: ROW(3), r: 7, fill: pal.mint });
  const name = el('path', { d: `M 272 ${ROW(3) + 2} q 4 -12 6 0 q 2 -8 6 0 q 2 6 6 -2 q 4 -8 8 0 q 4 6 8 0`, stroke: pal.mintDark, 'stroke-width': 2.6, fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', pathLength: 1, 'stroke-dasharray': 1, 'stroke-dashoffset': 1 });
  const ck = el('path', { d: `M 321 ${ROW(3) - 1} L 326 ${ROW(3) + 5} L 334 ${ROW(3) - 7}`, stroke: pal.green, 'stroke-width': 3.4, fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', pathLength: 1, 'stroke-dasharray': 1, 'stroke-dashoffset': 1 });
  const hl = el('rect', { x: 242, y: ROW(3) - 13, width: 94, height: 26, rx: 6, fill: pal.mint, opacity: 0 });
  const b = k.buddy({ x: 212, y: FY, scale: S });
  const pn = pen(k, undefined);
  return {
    update(t) {
      const reach = easeInOut(seg(t, 0.6, 1.2)) * (1 - easeInOut(seg(t, 2.9, 3.4)));
      const w = seg(t, 1.4, 2.7);
      const wy = ROW(3) + 2;
      const wx = 272 + w * 52;
      const jig = t > 1.4 && t < 2.7 ? Math.sin(t * 22) * 2.5 : 0;
      const tgt = aim(b, S, Math.min(wx, 262), wy + jig);
      b.pose({ armR: lerp(8, tgt, reach), lean: 8 * reach, look: 1, mood: t > 2.8 ? 'grin' : 'smile', blink: t > 0.3 && t < 0.4 ? 1 : 0 });
      const h = b.handPos('R');
      tf(pn, h.x + 3, h.y + 3, 18);
      k.set(pn, { opacity: reach > 0.02 && t < 3.0 ? 1 : 0 });
      k.set(name, { 'stroke-dashoffset': 1 - w });
      k.set(dot, { opacity: 1 });
      tf(dot, 0, 0, 0, 1);
      k.set(dot, { r: 7 * easeOut(seg(t, 2.6, 2.95)), opacity: seg(t, 2.6, 2.7) });
      k.set(ck, { 'stroke-dashoffset': 1 - seg(t, 2.95, 3.3) });
      k.set(hl, { opacity: 0.22 * hump(seg(t, 2.9, 3.9)) * 1.0 + (t > 3.4 ? 0.1 : 0) });
    }
  };
}
