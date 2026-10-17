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

// write-down：相手が言った電話番号を聞きながら、紙に書き留める（Let me write down your phone number.）
export const meta = { duration: 4.2, beats: [[0, '番号を聞く'], [1.4, '書き留める'], [3.4, '紙に残った']] };

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
  const you = k.buddy({ x: 330, y: FY, scale: S, facing: -1, color: pal.coral, dark: pal.coralDark });
  const b = k.buddy({ x: 105, y: FY, scale: S });
  const pad = padFront(k, b, S);
  tf(pad, 105 + 2, FY - 42 * S + 4, -6);
  const pn = pen(k, undefined);
  // 吹き出し（相手の声）
  const bub = g({ transform: 'translate(262 70)' });
  el('path', { d: 'M 52 36 L 58 62 L 74 38 Z', fill: '#fff', stroke: '#CBD3DE', 'stroke-width': 2.5, 'stroke-linejoin': 'round' }, bub);
  el('rect', { x: 0, y: 0, width: 120, height: 42, rx: 16, fill: '#fff', stroke: '#CBD3DE', 'stroke-width': 2.5 }, bub);
  el('rect', { x: 52, y: 34, width: 22, height: 6, fill: '#fff' }, bub);
  const NUM = '555-0123';
  const say = k.text(60, 21, '', { 'font-size': 19, fill: pal.coralDark }, bub);
  // 手元の拡大カード
  const cd = card(k, 40, 22, 150, 78);
  k.text(75, 33, 'TEL', { 'font-size': 10, fill: pal.sub }, cd);
  el('line', { x1: 14, y1: 66, x2: 134, y2: 66, stroke: '#E8D9A8', 'stroke-width': 2 }, cd);
  const wr = k.text(75, 53, '', { 'font-size': 22, fill: pal.ink }, cd);
  el('path', { d: 'M 112 -10', fill: 'none' }, cd);
  return {
    update(t) {
      const n = Math.floor(clamp((t - 0.5) / 1.6) * NUM.length);
      say.textContent = NUM.slice(0, n);
      k.set(bub, { opacity: seg(t, 0.4, 0.55) * (1 - seg(t, 3.6, 3.9)) });
      const m = Math.floor(clamp((t - 1.3) / 2.0) * NUM.length);
      wr.textContent = NUM.slice(0, m);
      const writing = t > 1.1 && t < 3.4;
      const w = writing ? Math.sin(t * 17) : 0;
      you.pose({ look: 1, mood: t > 0.4 && t < 2.2 ? 'open' : 'smile', armL: 8 });
      const fl = writing ? 0 : 1;
      b.pose({ armR: 38 + w * 9 + (writing ? 0 : -10 * 0), armL: 52, lean: 5, look: writing ? 0.2 : 1, mood: 'smile', blink: t > 0.2 && t < 0.3 ? 1 : 0 });
      const h = b.handPos('R');
      tf(pn, h.x + 2, h.y + 1, 14);
      k.set(pn, { opacity: t > 1.0 ? 1 : 0 });
    }
  };
}
