// financial：まめが会社の机で、お金が足りなくて頭をかかえる（例文 The company is having financial problems.）
import { seg, lerp, easeInOut, hump } from '../ease.js';
import { P, blinkAt } from './run-after.js';
import { roomBg, desk, held } from './look-over.js';

export const meta = { duration: 4.0, beats: [[0, '帳簿をつける'], [1.2, 'お金が減る'], [2.8, '足りない']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 0.95;
  const FY = roomBg(k, 'office', 240);
  const b = k.buddy({ x: 140, y: FY, scale: S });
  desk(k, 80, 250, 196);
  const bk = g({}); tf(bk, 250, 194);
  el('rect', { x: -34, y: -50, width: 68, height: 52, rx: 4, fill: '#fff', stroke: pal.line, 'stroke-width': 2 }, bk);
  [-36, -26, -16].forEach((y, i) => { el('line', { x1: -26, x2: 8, y1: y, y2: y, stroke: pal.sub, 'stroke-width': 2.4, 'stroke-linecap': 'round' }, bk); });
  const neg = k.text(22, -22, '-', { 'font-size': 22, 'font-weight': 700, fill: pal.red, 'text-anchor': 'middle' }, bk);
  const arrow = el('path', { d: 'M 14 -44 L 28 -26 M 28 -26 L 20 -26 M 28 -26 L 28 -34', fill: 'none', stroke: pal.red, 'stroke-width': 3, 'stroke-linecap': 'round' }, bk);
  const purse = g({}); tf(purse, 340, 194);
  el('path', { d: 'M -18 0 Q -22 -30 0 -30 Q 22 -30 18 0 Z', fill: pal.coral }, purse);
  el('rect', { x: -10, y: -34, width: 20, height: 6, rx: 3, fill: pal.coralDark }, purse);
  const coins = [0, 1, 2, 3].map(() => el('circle', { r: 7, fill: pal.yellow, stroke: pal.yellowDark, 'stroke-width': 2 }));
  return {
    update(t) {
      const lose = seg(t, 1.0, 2.6), sad = easeInOut(seg(t, 2.4, 3.1));
      P(b, { x: 140, armR: lerp(60, 150, sad), armL: lerp(40, 150, sad), lean: 8 * sad, mood: sad > 0.2 ? 'sad' : 'flat', look: 0.5, blink: blinkAt(t) });
      arrow.setAttribute('opacity', seg(t, 1.2, 1.8));
      coins.forEach((c, i) => { const u = seg(lose, i * 0.18, i * 0.18 + 0.45); k.set(c, { cx: 330 + u * 55 + i * 4, cy: 170 - hump(u) * 40 + u * 70, opacity: u > 0 && u < 1 ? 1 : (u === 0 ? (lose < 1 ? 1 : 0) : 0) }); });
      tf(purse, 340, 194, 0, 1, 1 - 0.3 * lose);
    }
  };
}
