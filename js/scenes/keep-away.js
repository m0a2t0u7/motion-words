// keep away：がけの手前に注意の看板。端へ歩きかけた人が気づいて、端から離れた所にとどまる（例文 Keep away from the edge of the cliff.）
import { seg, lerp, easeInOut, hump, wobble } from '../ease.js';
import { path, walk, sign } from './queue-up.js';

export const meta = { duration: 4.0, beats: [[0, 'がけの端'], [1.6, '気づく'], [3.4, '離れている']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  k.backdrop({ floorY: 300, mood: 'outdoor' });
  const FY = 220;
  el('rect', { x: 0, y: 248, width: 400, height: 52, fill: '#8FD3F4' });
  for (let i = 0; i < 6; i++) el('path', { d: `M ${i * 70} 262 q 12 -6 24 0`, stroke: '#fff', 'stroke-width': 2.5, fill: 'none', opacity: 0.7 });
  el('path', { d: `M 0 ${FY} L 286 ${FY} L 300 ${FY + 18} L 292 ${FY + 40} L 306 300 L 0 300 Z`, fill: '#B9A27E' });
  el('rect', { x: 0, y: FY, width: 286, height: 8, fill: '#8CC97E' });
  el('path', { d: `M 286 ${FY} L 300 ${FY + 18} L 292 ${FY + 40} L 306 300`, stroke: '#9A845F', 'stroke-width': 3, fill: 'none' });
  const sg = sign(k, 220, FY, '', { w: 40, h: 36, post: 30 });
  el('path', { d: `M 220 ${FY - 62} L 236 ${FY - 36} L 204 ${FY - 36} Z`, fill: pal.yellow, stroke: pal.ink, 'stroke-width': 2, 'stroke-linejoin': 'round' }, sg);
  k.text(220, FY - 42, '!', { 'font-size': 15 }, sg);
  const S = 0.85;
  const b = k.buddy({ x: 40, y: FY + 4, scale: S });
  const xf = path([[0, 40], [1.4, 250], [1.8, 250], [3.0, 120]]);
  return {
    update(t) {
      const back = t > 1.8;
      const p = walk(b, xf, t, { y: FY + 4, facing: 1, look: t < 1.4 ? 0.6 : 0.8, mood: t < 1.4 ? 'smile' : t < 3.0 ? 'open' : 'flat' });
      const jolt = hump(seg(t, 1.4, 1.8));
      if (t > 1.4) b.pose({ lean: back ? -6 * (1 - seg(t, 2.6, 3.2)) : -10 * jolt, lift: 6 * jolt, armR: 30 + 40 * jolt, armL: 30 + 40 * jolt });
      void wobble; void lerp; void easeInOut; void p; void tf; void g;
    }
  };
}
