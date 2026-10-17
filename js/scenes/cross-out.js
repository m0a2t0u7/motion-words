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

// cross-out：間違った答えの上に線を引いて、使えなくする（He crossed out the wrong word.）
export const meta = { duration: 3.8, beats: [[0, '間違い'], [1.1, '線を引く'], [2.8, '消した']] };

function card(k, x, y, w, h) {
  const c = k.g({ transform: `translate(${x} ${y})` });
  k.el('rect', { x: 3, y: 4, width: w, height: h, rx: 10, fill: k.pal.shadow }, c);
  k.el('rect', { width: w, height: h, rx: 10, fill: '#fff', stroke: '#D5DBE5', 'stroke-width': 2 }, c);
  const m = k.g({ transform: `translate(${w - 14} 14)` }, c);
  k.el('circle', { r: 5, fill: 'none', stroke: k.pal.sub, 'stroke-width': 2 }, m);
  k.el('line', { x1: 4, y1: 4, x2: 9, y2: 9, stroke: k.pal.sub, 'stroke-width': 2.4, 'stroke-linecap': 'round' }, m);
  return c;
}
// まめが胸の前でメモ帳を持つ
function padFront(k, b, S, dx = 14) {
  const p = k.g({});
  k.el('rect', { x: -2, y: -3, width: 40 * S, height: 30 * S, rx: 4, fill: '#FFF8DC', stroke: k.pal.yellowDark, 'stroke-width': 2 }, p);
  k.el('rect', { x: -2, y: -3, width: 40 * S, height: 6, rx: 3, fill: k.pal.yellowDark }, p);
  for (let i = 0; i < 3; i++) k.el('line', { x1: 5, y1: 12 + i * 7, x2: 32 * S, y2: 12 + i * 7, stroke: '#E8D9A8', 'stroke-width': 1.6 }, p);
  return p;
}

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  const S = 1.1;
  const cd = card(k, 150, 40, 210, 110);
  const eq = k.text(105, 56, '2 + 2 = 5', { 'font-size': 38 }, cd);
  const mark = el('path', { d: 'M 150 78 Q 162 66 176 52 T 188 34', fill: 'none' }, cd);
  const line = el('path', { d: 'M 150 78 L 184 32', stroke: pal.red, 'stroke-width': 5, 'stroke-linecap': 'round', pathLength: 1, 'stroke-dasharray': 1, 'stroke-dashoffset': 1 }, cd);
  const wrong = el('rect', { x: 150, y: 26, width: 38, height: 58, rx: 6, fill: pal.red, opacity: 0 }, cd);
  mark.remove();
  const b = k.buddy({ x: 95, y: FY, scale: S });
  const pad = padFront(k, b, S);
  tf(pad, 95 + 2, FY - 42 * S + 4, -6);
  const pn = pen(k, undefined, pal.red);
  const line2 = el('line', { x1: 0, y1: 0, x2: 0, y2: 0, stroke: pal.red, 'stroke-width': 3, 'stroke-linecap': 'round' }, pad);
  return {
    update(t) {
      const w = seg(t, 1.2, 2.2);
      k.set(line, { 'stroke-dashoffset': 1 - easeInOut(w) });
      k.set(wrong, { opacity: 0.12 * smooth(seg(t, 2.2, 2.6)) });
      const writing = t > 1.1 && t < 2.3;
      const sw = writing ? Math.sin(t * 20) : 0;
      k.set(line2, { x2: 38 * easeInOut(w), y2: -8 * easeInOut(w) + 24, y1: 24, x1: 0 });
      b.pose({ armR: 40 + sw * 11, armL: 52, lean: 5, look: writing ? 0.2 : 1, blink: t > 0.2 && t < 0.3 ? 1 : 0, mood: t > 2.6 ? 'flat' : 'smile' });
      const h = b.handPos('R');
      tf(pn, h.x + 2, h.y + 1, 14);
      k.set(pn, { opacity: t > 0.9 ? 1 : 0 });
    }
  };
}
