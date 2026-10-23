import { seg, lerp, easeInOut, easeOut, backOut, hump, clamp } from '../ease.js';
import { P, blinkAt, walkTo } from './run-after.js';
import { hp } from './dig.js';
import { grip } from './hand-over.js';
import { roomBg, say, desk } from './look-over.js';
// domestic：日本列島の上を、飛行機が国内の線を飛んで大阪へ。まめは手を振って見送る（例文 I took a domestic flight to Osaka.）
export const meta = { duration: 4.4, beats: [[0, '出発'], [1.0, '国内を飛ぶ'], [3.4, '大阪に着く']] };
export function create(k) {
  const { el, g, tf, pal, text } = k, S = 0.9;
  const FY = 236;
  k.backdrop({ floorY: FY, mood: 'outdoor' });
  el('ellipse', { cx: 235, cy: 120, rx: 130, ry: 50, fill: '#BFE3C4', stroke: '#9BCDA3', 'stroke-width': 3, transform: 'rotate(-10 235 120)' });
  el('path', { d: 'M 140 140 Q 220 70 320 110', fill: 'none', stroke: pal.blue, 'stroke-width': 3, 'stroke-dasharray': '7 6' });
  el('circle', { cx: 320, cy: 110, r: 7, fill: pal.coral }); text(320, 98, 'OSAKA', { 'font-size': 11, 'font-weight': 700, fill: pal.ink, 'text-anchor': 'middle' });
  const pl = g({}); el('ellipse', { rx: 16, ry: 5, fill: pal.ink }, pl); el('path', { d: 'M -2 0 L -12 -16 L -6 -16 L 6 0 L -6 16 L -12 16 Z', fill: pal.ink }, pl); el('path', { d: 'M -14 0 L -18 -8 L -13 -8 L -8 0 Z', fill: pal.ink }, pl);
  const b = k.buddy({ x: 70, y: FY, scale: S });
  const bag = g({}); el('rect', { x: -12, y: -26, width: 24, height: 26, rx: 4, fill: pal.coral }, bag); el('rect', { x: -6, y: -32, width: 12, height: 6, rx: 3, fill: 'none', stroke: pal.coralDark, 'stroke-width': 2.5 }, bag);
  const gr = grip(k, pal.mint, pal.mintDark, S);
  return {
    update(t) {
      const q = easeInOut(seg(t, 0.8, 3.4)), u = q, x = (1 - u) * (1 - u) * 140 + 2 * u * (1 - u) * 220 + u * u * 320, y = (1 - u) * (1 - u) * 140 + 2 * u * (1 - u) * 70 + u * u * 110;
      const ang = Math.atan2(2 * (1 - u) * (70 - 140) + 2 * u * (110 - 70), 2 * (1 - u) * 80 + 2 * u * 100) * 57.3;
      tf(pl, x, y, ang, 1 + 0.25 * hump(seg(t, 3.2, 4.0)));
      P(b, { x: 70, armR: t > 0.8 ? 120 + 30 * Math.sin(t * 7) : 20, armL: 8, look: 0.8, mood: 'smile', blink: blinkAt(t) });
      const h = hp(b, S, 'L'); tf(bag, h.x, h.y + 22, 0, S);
      gr(h);
    }
  };
}
