// flower：彼女が後ろに隠していた花束を差し出し、まめが受け取ってにっこり（例文 She gave me some flowers.）
import { seg, lerp, easeInOut, easeOut, clamp, hump } from '../ease.js';
import { flowerG, hp, P, blinkAt, popIn } from './nature.js';

export function bouquet(k, parent) {
  const g = k.g({}, parent);
  const fs = [['#FF8FB1', -10, 34, -14], ['#FFCF5C', 0, 40, 0], ['#A58BF3', 10, 34, 14], ['#F2685B', -4, 30, -6], ['#FF8FB1', 6, 30, 8]].map(([c, x, s, r]) => { const f = flowerG(k, c, g, s); k.tf(f.g, x * 0.3, 10, r); f.set(1); return f; });
  k.el('path', { d: 'M -12 -4 L 12 -4 L 5 18 L -5 18 Z', fill: '#FFF1D6', stroke: '#E3CFA8', 'stroke-width': 1.5 }, g);
  k.el('path', { d: 'M -6 4 h 12', stroke: '#F2685B', 'stroke-width': 3 }, g);
  return g;
}

export const meta = { duration: 4.2, beats: [[0, '花束を出す'], [1.3, '手わたす'], [2.6, '花をもらった']] };

export function create(k) {
  const { el, tf, pal } = k, S = 1;
  const FY = k.backdrop({ floorY: 240, mood: 'indoor' });
  el('rect', { x: 0, y: FY, width: 400, height: 60, fill: '#EADFD2' });
  el('rect', { x: 160, y: 40, width: 80, height: 60, rx: 6, fill: '#DDEFFA', stroke: '#fff', 'stroke-width': 5 });
  const her = k.buddy({ x: 130, y: FY, scale: S, color: pal.coral, dark: pal.coralDark });
  const me = k.buddy({ x: 270, y: FY, scale: S, facing: -1 });
  const bq = bouquet(k);
  const hearts = [0, 1, 2].map(() => el('path', { d: 'M 0 6 C -12 -2 -8 -12 0 -5 C 8 -12 12 -2 0 6 Z', fill: pal.red }));
  return {
    update(t) {
      const out = easeInOut(seg(t, 0.3, 1.3)), give = easeInOut(seg(t, 1.3, 2.1)), take = seg(t, 2.0, 2.1) >= 1;
      P(her, { armR: lerp(lerp(-30, 70, out), 80, give) * (take ? 1 - easeInOut(seg(t, 2.3, 2.8)) : 1) + (take ? 8 * easeInOut(seg(t, 2.3, 2.8)) : 0), lean: 6 * give, look: 0.6, mood: 'grin', blink: blinkAt(t), armL: 10 });
      P(me, { facing: -1, armR: lerp(8, 70, easeOut(seg(t, 1.5, 2.1))) + (take ? 30 * easeInOut(seg(t, 2.3, 2.9)) : 0), look: -0.6, lean: 3, mood: t > 2.1 ? 'grin' : 'open', blink: blinkAt(t, 1) });
      const h = take ? hp(me, S, 'R', 28) : hp(her, S, 'R', 28);
      tf(bq, h.x, h.y - 2, take ? -10 : 10, S);
      hearts.forEach((n, i) => { const q = seg(t, 2.6 + i * 0.2, 3.1 + i * 0.2); tf(n, 250 + i * 22, FY - 128 - 10 * easeOut(q) + (i % 2) * 8 + 2 * Math.sin(t * 3 + i), 0, popIn(q)); });
    }
  };
}
