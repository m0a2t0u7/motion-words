// sudden：突然の物音。本を読んでいたまめが、いきなり鳴った大きな音に飛び上がる（例文 A sudden noise made me jump.）
import { seg, lerp, easeOut, backOut, hump } from '../ease.js';
import { P, blinkAt } from './run-after.js';
import { roomBg } from './look-over.js';
import { held } from './dig.js';

export const meta = { duration: 3.6, beats: [[0, '静かに読書'], [1.4, '突然の音'], [2.2, '飛び上がる']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 0.95;
  const FY = roomBg(k, 'home', 240);
  const b = k.buddy({ x: 150, y: FY, scale: S });
  const book = g({});
  el('rect', { x: -14, y: -16, width: 28, height: 32, rx: 3, fill: pal.blue }, book);
  el('rect', { x: -10, y: -12, width: 20, height: 24, rx: 2, fill: '#fff' }, book);
  [-6, 0, 6].forEach((y) => el('line', { x1: -6, x2: 6, y1: y, y2: y, stroke: pal.line, 'stroke-width': 2 }, book));
  const burst = g({});
  el('path', { d: 'M 0 -34 L 8 -12 L 30 -22 L 16 -2 L 36 10 L 12 12 L 14 34 L -2 18 L -22 32 L -16 10 L -38 4 L -16 -6 L -24 -28 L -6 -16 Z', fill: pal.yellow, stroke: pal.yellowDark, 'stroke-width': 3, 'stroke-linejoin': 'round' }, burst);
  k.text(0, 8, '!', { 'font-size': 30, 'font-weight': 800, fill: pal.red, 'text-anchor': 'middle' }, burst);
  return {
    update(t) {
      const hit = seg(t, 1.4, 1.5), jump = hump(seg(t, 1.5, 2.2)), after = seg(t, 1.5, 1.8);
      tf(burst, 320, 120, 8 * Math.sin(t * 30) * (1 - seg(t, 1.4, 2.6)), backOut(seg(t, 1.4, 1.7)) * (1 - seg(t, 2.6, 3.0)));
      P(b, { armR: lerp(60, 150, after), armL: lerp(70, 150, after), lean: -6 * after, lift: 26 * jump, squash: 1 - 0.1 * hump(seg(t, 1.45, 1.6)), mood: t < 1.45 ? 'smile' : 'open', look: lerp(0.2, 0.9, hit), blink: t < 1.4 ? blinkAt(t) : 0 });
      held(k, b, S, book, 'R', 0);
    }
  };
}
