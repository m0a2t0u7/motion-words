// hand：先生が黒板の問題を出すと、答えがわかった子がまっすぐ手をあげる（例文 Raise your hand if you know the answer.）
import { seg, lerp, easeInOut, easeOut, backOut, hump, clamp } from '../ease.js';
import { hp, reach, P, blinkAt, bp, spot } from './body.js';
import { desk } from './get-on-with.js';
import { mark } from './so-far-so-good.js';

export const meta = { duration: 4.2, beats: [[0, 'わかる人？'], [1.2, '答えがわかる'], [2.0, '手をあげる']] };

export function create(k) {
  const { el, g, tf, pal } = k, FY = 240;
  k.backdrop({ floorY: FY, mood: 'indoor' });
  el('rect', { x: 150, y: 30, width: 230, height: 110, rx: 4, fill: '#3E6B5A', stroke: pal.woodDark, 'stroke-width': 6 });
  k.text(250, 84, '3 + 4 = ?', { 'font-size': 26, fill: '#fff' });
  const T = k.buddy({ x: 340, y: FY, scale: 1.0, facing: -1, color: pal.coral, dark: pal.coralDark });
  const A = k.buddy({ x: 80, y: FY - 2, scale: 1.05, facing: 1 });
  const C = k.buddy({ x: 196, y: FY - 2, scale: 0.9, facing: 1, color: pal.yellow, dark: pal.yellowDark });
  desk(k, 92, 70, FY); desk(k, 206, 60, FY);
  const bang = mark(k, 'bang', null, 1.2);
  const ring = spot(k);
  return {
    update(t) {
      P(T, { armR: lerp(10, 120, easeOut(seg(t, 0.2, 0.6))) * (1 - 0.5 * seg(t, 2.6, 3.0)), mood: t > 2.4 ? 'grin' : 'smile', look: 0.4, blink: blinkAt(t, 1) });
      const raise = backOut(clamp(seg(t, 1.8, 2.3)));
      P(A, { y: FY - 2, armR: lerp(10, 176, raise) + (t > 2.3 ? 4 * Math.sin(t * 8) : 0), lift: 6 * clamp(raise), mood: t > 1.2 ? 'grin' : 'flat', look: 0.6, blink: blinkAt(t) });
      P(C, { y: FY - 2, mood: 'flat', look: -0.2, blink: blinkAt(t, 0.6) });
      const top = bp(A, 1.05, 0, -86);
      tf(bang, top.x - 30, top.y - 6, 0, Math.max(0.001, 1.2 * backOut(clamp(seg(t, 1.2, 1.5)))));
      const h = hp(A, 1.05, 'R', 26);
      ring.set(seg(t, 2.4, 2.8), h.x, h.y, 16, t);
    }
  };
}
