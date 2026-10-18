// bring out in：まめがいちごを手に取って食べると、体に赤い発疹のぶつぶつが出てきて、かゆくてかく（例文 Strawberries bring me out in a rash.）
import { seg, lerp, easeInOut, easeOut, easeIn, hump } from '../ease.js';
import { hp, table } from './dig.js';

export const meta = { duration: 4.2, beats: [[0, 'いちごを食べる'], [1.8, 'ぶつぶつが出る'], [3.2, 'かゆい']] };

function berry(k, parent) {
  const g = k.g({}, parent);
  k.el('path', { d: 'M 0 8 C -9 2 -8 -6 0 -5 C 8 -6 9 2 0 8 Z', fill: k.pal.red }, g);
  k.el('path', { d: 'M -4 -5 L 0 -9 L 4 -5 Z', fill: k.pal.green }, g);
  return g;
}

export function create(k) {
  const { el, g, tf, pal } = k;
  const TY = table(k, 220);
  el('ellipse', { cx: 300, cy: TY - 2, rx: 34, ry: 6, fill: '#fff', stroke: pal.line, 'stroke-width': 2 });
  [[284, 0], [300, -3], [316, 0], [292, -9], [308, -9]].forEach(([x, dy]) => tf(berry(k), x, TY - 8 + dy));
  const b = k.buddy({ x: 180, y: 236, scale: 1 });
  const bit = berry(k);
  const spots = [[-14, -30], [12, -24], [-6, -16], [16, -40], [-18, -48], [4, -64], [20, -58], [-10, -70]].map(([x, y]) => el('circle', { cx: x, cy: y, r: 3.2, fill: pal.red, opacity: 0 }, b.body));
  return {
    update(t) {
      const reach = easeInOut(seg(t, 0.3, 0.7)), toMouth = easeInOut(seg(t, 0.8, 1.2)), chew = t > 1.2 && t < 1.8;
      const scratch = t > 2.6;
      b.pose({ armR: scratch ? 40 + Math.sin(t * 24) * 12 : lerp(lerp(10, 80, reach), 150, toMouth) * (1 - seg(t, 1.3, 1.6)) + 10 * seg(t, 1.3, 1.6),
        armL: scratch ? 30 + Math.sin(t * 24 + 2) * 10 : 10, mood: chew ? 'grin' : t > 2.0 ? 'sad' : 'smile', lean: scratch ? Math.sin(t * 12) * 3 : 4 * reach, look: t > 2.0 ? -0.4 : 0.6,
        squash: chew ? 1 + 0.02 * Math.sin(t * 20) : 1 });
      const h = hp(b, 1);
      const has = t > 0.65 && t < 1.25;
      tf(bit, has ? h.x : 316, has ? h.y - 4 : TY - 8, 0, t < 1.25 ? 1 : 0.001);
      bit.setAttribute('opacity', t < 1.25 ? 1 : 0);
      spots.forEach((s, i) => { const q = seg(t, 1.9 + i * 0.12, 2.2 + i * 0.12); k.set(s, { opacity: q, r: 3.2 * easeOut(q) + 0.01 }); });
    }
  };
}
