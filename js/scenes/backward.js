// backward：まめが前を向いたまま、一歩後ろへ下がる（例文 She took a step backward.）
import { seg, lerp, easeInOut, easeOut, hump, wobble } from '../ease.js';
import { P, blinkAt } from './run-after.js';
import { roomBg } from './look-over.js';

export const meta = { duration: 3.4, beats: [[0, '立っている'], [1.0, '一歩下がる'], [2.4, '下がった']] };

export function create(k) {
  const { el, pal } = k;
  const FY = roomBg(k, 'home', 240);
  const X0 = 240, X1 = 188;
  // 前にある物（大きな箱）と、元いた位置の足あと
  k.shadow(332, FY, 34, 5);
  el('rect', { x: 300, y: FY - 56, width: 64, height: 56, rx: 4, fill: pal.wood });
  el('rect', { x: 300, y: FY - 56, width: 64, height: 10, rx: 3, fill: pal.woodDark });
  const foot = el('ellipse', { cx: X0, cy: FY + 4, rx: 16, ry: 3.5, fill: 'none', stroke: pal.sub, 'stroke-width': 2, 'stroke-dasharray': '4 3' });
  const arrow = el('path', { d: 'M 0 0 L -34 0 M -22 -8 L -34 0 L -22 8', fill: 'none', stroke: pal.coral, 'stroke-width': 4, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' });
  const b = k.buddy({ x: X0, y: FY, scale: 1, color: pal.coral, dark: pal.coralDark });
  return {
    update(t) {
      const u = seg(t, 1.0, 2.2), e = easeInOut(u);
      const x = lerp(X0, X1, e);
      const step = Math.sin(Math.PI * u);
      P(b, { x, walk: Math.PI * e, armL: 8 + 26 * step, armR: 8 - 14 * step, lean: -7 * step, lift: 3 * step, mood: u > 0 ? 'open' : 'smile', look: 0.6, blink: blinkAt(t), squash: 1 - 0.03 * wobble(seg(t, 2.1, 2.9)) });
      k.tf(arrow, 214, FY - 100);
      arrow.setAttribute('opacity', hump(seg(t, 0.8, 2.6)));
    }
  };
}
