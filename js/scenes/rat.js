// rat：路地のごみ置き場で、しっぽの長い大きなネズミがごみ袋のそばをかぎまわる。まめと友だちが見つけて指さす（例文 We saw a rat near the trash.）
import { seg, lerp, easeInOut, easeOut, hump, clamp } from '../ease.js';
import { P, blinkAt, walkTo } from './run-after.js';
import { beast } from './animal.js';
import { reach } from './dig.js';
import { mark } from './nature.js';

export const meta = { duration: 4.2, beats: [[0, '路地を歩く'], [1.6, 'ごみのそば'], [2.6, 'ネズミを見た']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'outdoor' });
  el('rect', { x: 0, y: 40, width: 400, height: 196, fill: '#E8DED2' });
  for (let y = 52; y < 236; y += 22) el('line', { x1: 0, y1: y, x2: 400, y2: y, stroke: '#D9CDBF', 'stroke-width': 2 });
  el('rect', { x: 0, y: FY, width: 400, height: 64, fill: '#CED4DC' });
  // ごみ箱とごみ袋（右）
  k.shadow(310, FY + 2, 70, 5);
  el('rect', { x: 262, y: FY - 70, width: 60, height: 70, rx: 4, fill: '#5E8C6A' }); el('rect', { x: 258, y: FY - 78, width: 68, height: 10, rx: 4, fill: '#4A7356' });
  el('rect', { x: 276, y: FY - 54, width: 32, height: 4, rx: 2, fill: '#fff', opacity: 0.3 });
  el('path', { d: `M 320 ${FY} Q 316 ${FY - 40} 340 ${FY - 44} Q 364 ${FY - 40} 362 ${FY} Z`, fill: '#4A5160' }); el('path', { d: `M 336 ${FY - 44} l 4 -8 l 4 8`, stroke: '#4A5160', 'stroke-width': 3, fill: 'none' });
  el('path', { d: `M 352 ${FY} Q 352 ${FY - 30} 372 ${FY - 32} Q 392 ${FY - 28} 390 ${FY} Z`, fill: '#5A6272' });
  el('rect', { x: 236, y: FY - 6, width: 18, height: 6, rx: 2, fill: '#E9C99A', transform: `rotate(-12 245 ${FY - 3})` });
  const rt = beast(k, 'rat');
  const fr = k.buddy({ x: -20, y: FY + 30, scale: 0.85, color: pal.coral, dark: pal.coralDark });
  const me = k.buddy({ x: 20, y: FY + 34, scale: 0.9 });
  const ex = mark(k, '!', pal.coralDark);
  const xa = (t) => lerp(20, 130, easeInOut(seg(t, 0.1, 1.6))), xb = (t) => xa(t) - 58;
  return {
    update(t) {
      const sn = Math.sin(t * 3.2);
      rt.set({ x: 214 + 14 * sn, y: FY + 10, s: 1.25, face: Math.cos(t * 3.2) >= 0 ? 1 : -1, ph: t * 14, m: Math.abs(Math.cos(t * 3.2)) > 0.3 ? 0.8 : 0, head: Math.sin(t * 20) * 6, tail: Math.sin(t * 5) * 10 });
      const wa = walkTo(xa, t, 20), wb = walkTo(xb, t, -38), pt = easeOut(seg(t, 2.2, 2.6));
      P(fr, { x: wb.x, y: FY + 30, walk: wb.walk, armL: wb.armL, armR: wb.armR, lean: wb.lean, look: 0.8, mood: t > 2.2 ? 'open' : 'smile', blink: blinkAt(t, 1) });
      P(me, { x: wa.x, y: FY + 34, walk: wa.walk, armL: wa.armL, armR: wa.armR, lean: wa.lean - 4 * pt, look: 0.8, mood: t > 2.2 ? 'open' : 'smile', blink: blinkAt(t), lift: 6 * hump(seg(t, 2.0, 2.3)) });
      if (pt > 0) me.pose({ armR: lerp(wa.armR, reach(me, 0.9, 'R', 214, FY), pt) });
      ex.show(seg(t, 2.0, 2.3), wa.x, FY - 60);
    }
  };
}
