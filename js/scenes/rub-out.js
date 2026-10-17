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

// rub-out：消しゴムでこすって、鉛筆の書き間違いを消す（Rub out the mistake with an eraser.）
export const meta = { duration: 4.0, beats: [[0, '書き間違い'], [1.2, '消しゴムでこする'], [3.0, '消えた']] };

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
  const word = k.text(105, 55, 'Cta', { 'font-size': 44, fill: '#7A8190' }, cd);
  const er = g({}, cd);
  el('rect', { x: -22, y: -13, width: 44, height: 26, rx: 6, fill: '#FFB3C1', stroke: '#F08BA0', 'stroke-width': 2 }, er);
  el('rect', { x: -22, y: -13, width: 16, height: 26, rx: 6, fill: '#6AA8F7' }, er);
  const crumbs = [0, 1, 2, 3, 4, 5].map((i) => el('rect', { width: 5, height: 3, rx: 1.5, fill: '#F6C6D0' }, cd));
  const b = k.buddy({ x: 95, y: FY, scale: S });
  const pad = padFront(k, b, S);
  tf(pad, 95 + 2, FY - 42 * S + 4, -6);
  const er2 = g({});
  el('rect', { x: -9, y: -6, width: 18, height: 12, rx: 3, fill: '#FFB3C1', stroke: '#F08BA0', 'stroke-width': 1.5 }, er2);
  el('rect', { x: -9, y: -6, width: 7, height: 12, rx: 3, fill: '#6AA8F7' }, er2);
  return {
    update(t) {
      const w = seg(t, 1.1, 2.9);
      const rub = t > 1.1 && t < 2.9 ? Math.sin(t * 15) : 0;
      k.set(word, { opacity: 1 - smooth(seg(w, 0.1, 1)) });
      tf(er, 105 + rub * 48, 38 + Math.sin(t * 30) * 1.5, rub * 3);
      k.set(er, { opacity: t > 0.9 && t < 3.2 ? 1 : 0 });
      crumbs.forEach((c, i) => {
        const ph = (w * 3 + i * 0.37) % 1;
        const on = w > 0 && w < 1 ? 1 : 0;
        tf(c, 62 + i * 18 + rub * 10, 56 + ph * 22, ph * 200 + i * 40);
        k.set(c, { opacity: on * (1 - ph) });
      });
      b.pose({ armR: 38 + rub * 10, armL: 52, lean: 5, look: rub ? 0.2 : 1, blink: t > 0.2 && t < 0.3 ? 1 : 0, mood: t > 3 ? 'grin' : 'smile' });
      const h = b.handPos('R');
      tf(er2, h.x + 2, h.y - 1, 10);
      k.set(er2, { opacity: t > 0.9 ? 1 : 0 });
    }
  };
}
