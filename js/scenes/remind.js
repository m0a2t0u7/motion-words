// remind：忘れかけている「私」に、相手が牛乳のメモを見せて思い出させる（例文 Please remind me to buy milk.）
import { seg, lerp, easeInOut, easeOut, backOut, hump } from '../ease.js';
import { hp } from './dig.js';

export const meta = { duration: 4.2, beats: [[0, '思い出せない'], [1.6, 'メモを見せる'], [3.0, '思い出した']] };

function carton(k, parent, s = 1) {
  const c = k.g({}, parent);
  k.el('path', { d: 'M -9 -10 L -9 12 L 9 12 L 9 -10 L 0 -17 Z', fill: '#fff', stroke: k.pal.blueDark, 'stroke-width': 2, 'stroke-linejoin': 'round', transform: `scale(${s})` }, c);
  k.el('rect', { x: -9 * s, y: -3 * s, width: 18 * s, height: 9 * s, fill: k.pal.blue }, c);
  return c;
}
export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  el('rect', { x: 150, y: 46, width: 100, height: 64, rx: 6, fill: '#DDEFFA', stroke: '#fff', 'stroke-width': 5 });
  el('ellipse', { cx: 200, cy: 262, rx: 150, ry: 14, fill: '#F1D9CF' });
  const G = k.buddy({ x: 140, y: FY, facing: 1 });
  const C = k.buddy({ x: 262, y: FY, facing: -1, color: pal.coral, dark: pal.coralDark });
  const P = (b, o) => b.pose({ armL: 8, armR: 8, lean: 0, squash: 1, walk: 0, look: 0, mood: 'smile', blink: 0, lift: 0, ...o });
  const th = g({}); tf(th, 120, 100);
  const dots = [[10, 62, 3], [20, 50, 5]].map(([x, y, r]) => el('circle', { cx: x - 10, cy: y - 10, r, fill: '#fff', stroke: pal.line, 'stroke-width': 2 }, th));
  el('ellipse', { cx: 0, cy: 0, rx: 34, ry: 24, fill: '#fff', stroke: pal.line, 'stroke-width': 2 }, th);
  el('ellipse', { cx: 0, cy: 0, rx: 32, ry: 22, fill: '#fff' }, th);
  const q = k.text(0, 1, '...', { 'font-size': 20, fill: pal.sub }, th);
  const cartonB = carton(k, th, 1.15);
  const note = g({});
  el('rect', { x: -15, y: -15, width: 30, height: 30, rx: 3, fill: pal.yellow, stroke: pal.yellowDark, 'stroke-width': 2 }, note);
  carton(k, note, 0.7);
  const ex = el('path', { d: 'M 0 -8 L 0 2 M 0 7 L 0 7.1', stroke: pal.red, 'stroke-width': 4, 'stroke-linecap': 'round' });
  return {
    update(t) {
      const show = easeInOut(seg(t, 0.8, 1.7)), talk = t > 0.9 && t < 1.9 && Math.sin(t * 20) > 0;
      const get = easeOut(seg(t, 2.3, 2.7));
      P(C, { armR: lerp(8, 82, show) - 30 * seg(t, 3.2, 3.8), look: 0.6, mood: talk ? 'open' : 'smile', lean: 4 * show });
      P(G, { look: t < 1.0 ? -0.3 + 0.3 * Math.sin(t * 3) : 0.6, armR: t < 2.2 ? 150 + 8 * Math.sin(t * 8) * (t < 1.7 ? 1 : 0) : lerp(150, 20, seg(t, 2.2, 2.8)), mood: t > 2.3 ? 'grin' : 'flat', lean: -3 * (1 - get) + 4 * get, squash: 1 + 0.03 * Math.sin(t * 3) - 0.05 * hump(seg(t, 2.2, 2.6)), blink: 0 });
      const h = hp(C, 1, 'R');
      tf(note, h.x - 6, h.y - 6, 8, show > 0.02 ? 1 : 0.001);
      tf(cartonB, 0, 0, 0, get > 0 ? backOut(get) + 0.001 : 0.001);
      tf(q, 0, 1, 0, get > 0 ? 0.001 : 1);
      tf(ex, 140, 128, 0, hump(seg(t, 2.2, 2.9)) + 0.001);
    }
  };
}
