// squeeze：レモンを手で握りしめ、しぼり汁を魚の上にかける（例文 Squeeze a lemon over the fish.）
import { seg, lerp, easeInOut, easeOut, smooth, clamp } from '../ease.js';
import { hp, table } from './dig.js';

export const meta = { duration: 4.0, beats: [[0, 'レモンを構える'], [1.2, 'ぎゅっとしぼる'], [3.2, '汁がかかった']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  table(k, 150);
  const b = k.buddy({ x: 150, y: 236 });
  b.pose({ armR: 150, lean: 4 });
  const H = hp(b, 1, 'R', 26);
  b.pose({ armR: 8, lean: 0 });
  const FX = H.x + 2, FY = 199;
  // 皿と魚
  el('ellipse', { cx: FX, cy: FY + 3, rx: 44, ry: 10, fill: '#fff', stroke: '#DDE3EA', 'stroke-width': 2 });
  el('ellipse', { cx: FX, cy: FY + 1, rx: 33, ry: 6.5, fill: '#F3F6FA' });
  const fish = g({}); tf(fish, FX, FY - 6);
  el('path', { d: 'M 22 0 L 38 -9 L 38 9 Z', fill: '#8FB7D6' }, fish);
  el('ellipse', { cx: 0, cy: 0, rx: 26, ry: 11, fill: '#A9CDE6' }, fish);
  el('path', { d: 'M -22 4 Q 0 12 22 3 Q 0 8 -22 4 Z', fill: '#E4F0F8' }, fish);
  el('path', { d: 'M -6 -9 Q 0 -17 8 -9 Z', fill: '#8FB7D6' }, fish);
  el('circle', { cx: -16, cy: -3, r: 2.4, fill: pal.ink }, fish);
  el('path', { d: 'M -9 -8 Q -5 0 -9 8', fill: 'none', stroke: '#8FB7D6', 'stroke-width': 1.5 }, fish);
  const glaze = [[-10, -3, 7], [2, -5, 8], [13, -2, 6], [-2, 3, 6]].map(([x, y, r]) => el('ellipse', { cx: x, cy: y, rx: r, ry: r * 0.45, fill: '#FFF59A', opacity: 0 }, fish));
  // レモン（半割り）
  const lem = g({});
  const lb = g({}, lem);
  el('path', { d: 'M -14 -2 Q -14 -16 0 -16 Q 14 -16 14 -2 Z', fill: pal.yellow }, lb);
  el('path', { d: 'M -14 -2 L 14 -2 L 12 2 Q 0 6 -12 2 Z', fill: '#FFF6C4' }, lb);
  el('path', { d: 'M -8 -4 L 8 -4 M 0 -4 L 0 1', stroke: '#F7E27E', 'stroke-width': 1.2 }, lb);
  const drops = [0, 1, 2, 3, 4].map(() => el('path', { d: 'M 0 -4 Q 3 1 0 3 Q -3 1 0 -4 Z', fill: '#FFF08A' }));
  return {
    update(t) {
      const sq = seg(t, 1.1, 3.0);
      const pulse = sq > 0 && sq < 1 ? 0.5 - 0.5 * Math.cos(sq * Math.PI * 4) : 0; // 握って緩めて、を2回
      const up = easeInOut(seg(t, 0.3, 1.1)) * (1 - easeInOut(seg(t, 3.3, 3.9)));
      b.pose({ armR: lerp(8, 150, up), lean: 4 * up, look: 0.7, mood: pulse > 0.6 ? 'grin' : 'smile', squash: 1 - 0.03 * pulse, armL: 8 });
      const h = hp(b, 1, 'R', 26);
      const s = 1 - 0.22 * easeOut(seg(t, 1.1, 3.2));
      tf(lem, h.x, h.y + 12 - 0 * pulse, 0, (1 + 0.18 * pulse) * s, (1 - 0.3 * pulse) * s);
      // しずく：握るたびに落ちる
      drops.forEach((d, i) => {
        const t0 = 1.35 + i * 0.42, u = (t - t0) / 0.5;
        if (u > 0 && u < 1) {
          const x0 = h.x + (i % 2 ? 4 : -4);
          k.set(d, { opacity: 1, transform: `translate(${x0} ${lerp(h.y + 14, FY - 10, u * u).toFixed(1)}) scale(${(1 - 0.3 * u).toFixed(2)})` });
        } else k.set(d, { opacity: 0 });
      });
      glaze.forEach((gl, i) => gl.setAttribute('opacity', smooth(seg(t, 1.8 + i * 0.35, 2.2 + i * 0.35)) * 0.85));
    }
  };
}
