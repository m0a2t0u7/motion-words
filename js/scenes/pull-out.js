// pull out：まめが雑草を根元からつかみ、体を後ろへ反らして土から根ごと引き抜く（例文 He pulled out a weed from the soil.）
import { seg, lerp, easeInOut, easeIn, easeOut, backOut, wobble, clamp } from '../ease.js';
import { reach } from './dig.js';

export const meta = { duration: 4.0, beats: [[0, '雑草をつかむ'], [1.6, '力いっぱい引く'], [3.0, '根ごと抜けた']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 220, mood: 'outdoor' });
  el('rect', { x: 0, y: FY, width: 400, height: 80, fill: '#A27A55' });
  el('rect', { x: 0, y: FY, width: 400, height: 5, fill: '#8C6644' });
  [[40, 0.8], [330, 1], [370, 0.7]].forEach(([x, s]) => el('path', { d: `M ${x} ${FY} l -6 ${-20 * s} l 6 ${8 * s} l 4 ${-24 * s} l 4 ${22 * s} l 6 ${-14 * s} l -4 ${28 * s} Z`, fill: '#6DB37A' }));
  const W = { x: 228, y: FY };
  const hole = el('ellipse', { cx: W.x, cy: FY + 3, rx: 12, ry: 3, fill: '#6E5038', opacity: 0 });
  const weed = g({});
  el('path', { d: 'M 0 0 C -2 10 -8 16 -12 26 M 0 0 C 2 12 6 18 10 30 M 0 0 L 0 34 M 0 18 L -6 24 M 0 22 L 7 26', stroke: '#E0C9A6', 'stroke-width': 2.4, fill: 'none', 'stroke-linecap': 'round' }, weed);
  el('path', { d: 'M 0 0 L -14 -26 Q -4 -20 -2 -10 L 0 -36 L 4 -12 Q 10 -24 18 -28 Z', fill: '#59A866' }, weed);
  const soil = el('rect', { x: 0, y: FY + 4, width: 400, height: 76, fill: '#A27A55' }); // 根を隠す土
  const crumbs = [0, 1, 2, 3].map(() => el('circle', { r: 3, fill: '#8C6644' }));
  const B = k.buddy({ x: 196, y: FY, scale: 0.9 });
  return {
    update(t) {
      const crouch = easeInOut(seg(t, 0.2, 0.9));
      const strain = seg(t, 1.0, 2.0);
      const pop = seg(t, 2.0, 2.25);
      const rise = easeOut(seg(t, 2.0, 2.6));
      const shake = strain > 0 && strain < 1 ? Math.sin(t * 40) * 1.5 * strain : 0;
      const wy = FY - 6 * strain - 54 * rise;
      tf(weed, W.x + shake, wy, -10 * rise + 4 * wobble(seg(t, 2.6, 3.2), 2, 5));
      // 抜けたら根が見えるよう、土の手前を外す
      soil.setAttribute('opacity', rise > 0.05 ? 0 : 1);
      if (rise > 0.05) soil.after(weed); else soil.before(weed);
      hole.setAttribute('opacity', pop > 0 ? 1 : 0);
      crumbs.forEach((c, i) => { const u = seg(t, 2.0, 2.7); k.set(c, { cx: W.x + (i - 1.5) * 10 * (1 + u * 2), cy: FY - 20 * Math.sin(u * Math.PI) * (1 + i % 2) + u * 4, opacity: u > 0 && u < 1 ? 1 : 0 }); });
      const lean = lerp(0, 24, crouch) * (1 - strain) - 16 * strain * (1 - rise) - 8 * rise * (1 - seg(t, 2.8, 3.4)) + 2 * pop;
      B.pose({ lean, squash: 1 - 0.08 * crouch * (1 - rise) + 0.04 * Math.sin(pop * Math.PI), x: 196 - 8 * strain - 10 * rise, mood: strain > 0 && rise < 0.1 ? 'flat' : rise > 0.5 ? 'grin' : 'smile', look: 0.6, lift: 0 });
      const hx = W.x + shake, hy = wy - 18;
      B.pose({ armR: reach(B, 0.9, 'R', hx, hy), armL: t > 2.8 ? lerp(reach(B, 0.9, 'L', hx, hy), 150, easeOut(seg(t, 2.8, 3.2))) : reach(B, 0.9, 'L', hx - 2, hy + 4) });
    }
  };
}
