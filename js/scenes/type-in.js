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

function desk(k) {
  const { el, g, pal } = k;
  el('rect', { x: 226, y: 206, width: 170, height: 10, rx: 4, fill: pal.wood });
  el('rect', { x: 236, y: 216, width: 10, height: 20, fill: pal.woodDark });
  el('rect', { x: 376, y: 216, width: 10, height: 20, fill: pal.woodDark });
  el('rect', { x: 303, y: 186, width: 22, height: 20, fill: '#B9C2CF' });
  el('rect', { x: 240, y: 58, width: 148, height: 130, rx: 10, fill: '#3A4456' });
  const scr = g({ transform: 'translate(248 66)' });
  el('rect', { width: 132, height: 114, rx: 4, fill: '#FFFFFF' }, scr);
  el('rect', { x: 250, y: 196, width: 70, height: 10, rx: 3, fill: '#DDE3EA' });
  for (let i = 0; i < 9; i++) el('rect', { x: 253 + i * 7.4, y: 198, width: 5.4, height: 5, rx: 1.5, fill: '#fff' });
  return scr;
}

// type-in：キーボードで入力欄に名前を打ち込む（Type in your name here.）
export const meta = { duration: 3.8, beats: [[0, '空の入力欄'], [0.9, '打ち込む'], [2.8, '入力できた']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  const scr = desk(k);
  const S = 1.1;
  const b = k.buddy({ x: 205, y: FY, scale: S });
  el('rect', { width: 132, height: 114, fill: '#F7F9FC' }, scr);
  el('rect', { width: 132, height: 22, fill: pal.violet }, scr);
  k.text(66, 11, 'FORM', { 'font-size': 10, fill: '#fff' }, scr);
  k.text(20, 40, 'Name', { 'font-size': 9, fill: pal.sub, 'text-anchor': 'start' }, scr);
  const field = el('rect', { x: 14, y: 48, width: 104, height: 24, rx: 5, fill: '#fff', stroke: pal.violet, 'stroke-width': 2 }, scr);
  const txt = k.text(22, 60.5, '', { 'font-size': 14, 'text-anchor': 'start' }, scr);
  const caret = el('rect', { y: 53, width: 1.6, height: 14, fill: pal.violet }, scr);
  el('rect', { x: 14, y: 82, width: 60, height: 8, rx: 4, fill: '#E3E9F1' }, scr);
  const ck = el('path', { d: 'M 104 54 L 110 66 L 124 40', transform: 'translate(-8 4) scale(0.7)', stroke: pal.green, 'stroke-width': 4, fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', pathLength: 1, 'stroke-dasharray': 1 }, scr);
  const NAME = 'Mia Sato';
  return {
    update(t) {
      const n = Math.floor(clamp((t - 0.9) / 1.6) * NAME.length);
      txt.textContent = NAME.slice(0, n);
      tf(caret, 22 + n * 8.1, 0);
      k.set(caret, { opacity: t < 3.3 && Math.floor(t * 4) % 2 === 0 ? 1 : 0 });
      k.set(ck, { 'stroke-dashoffset': 1 - seg(t, 2.7, 3.1) });
      k.set(field, { stroke: t > 2.7 ? pal.green : pal.violet });
      const press = t > 0.9 && t < 2.55 ? Math.abs(Math.sin(t * 13)) : 0;
      b.pose({ armR: aim(b, S, 262, 196 - 5 * press), lean: 6, look: 1, mood: t > 3 ? 'grin' : 'smile', blink: t > 0.3 && t < 0.4 ? 1 : 0 });
    }
  };
}
