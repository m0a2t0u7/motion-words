// avenue：両側に並木が続く広い大通りを、2人で並んで歩いていく（例文 We walked down a wide avenue lined with trees.）
import { seg, lerp, easeInOut } from '../ease.js';
import { P, blinkAt, face } from './bag.js';
import { tree } from './run-after.js';

export const meta = { duration: 4.4, beats: [[0, '広い大通り'], [1.4, '並木の間を'], [3.0, '歩いていく']] };

export function create(k) {
  const { el, tf, pal } = k, FY = 250;
  k.backdrop({ floorY: FY });
  // 奥の並木・広い車道（4車線）・手前の歩道
  const far = k.g({});
  el('rect', { x: 0, y: 120, width: 400, height: 40, fill: '#E3F2E0' });
  el('rect', { x: 0, y: 160, width: 400, height: 56, fill: '#B9C3D0' });
  [174, 188, 202].forEach((y, i) => el('line', { x1: 0, y1: y, x2: 400, y2: y, stroke: '#fff', 'stroke-width': i === 1 ? 2.5 : 1.5, 'stroke-dasharray': i === 1 ? '' : '12 10' }));
  el('rect', { x: 0, y: 216, width: 400, height: 84, fill: '#EDE3D3' });
  const farTrees = k.g({}); const nearTrees = k.g({});
  for (let i = 0; i < 12; i++) { const t1 = tree(k, i * 60, 160, 0.55); farTrees.appendChild(t1.t); }
  const a = k.buddy({ x: 170, y: FY, scale: 0.95 });
  const c = k.buddy({ x: 230, y: FY - 6, scale: 0.9, color: pal.coral, dark: pal.coralDark });
  for (let i = 0; i < 6; i++) { const t2 = tree(k, i * 130, 286, 1.1); nearTrees.appendChild(t2.t); }
  void far;
  return {
    update(t) {
      // 歩いていくぶん、景色が左へ流れる（手前ほど速い）
      tf(farTrees, -((t * 22) % 60), 0);
      tf(nearTrees, -((t * 60) % 130), 0);
      const ph = t * 8;
      P(a, { x: 170, walk: ph, armL: 8 + Math.sin(ph) * 18, armR: 8 - Math.sin(ph) * 18, lean: 3, look: 0.8, blink: blinkAt(t), mood: 'grin' });
      P(c, { x: 230, y: FY - 6, walk: ph + 1, armL: 8 + Math.sin(ph + 1) * 18, armR: 8 - Math.sin(ph + 1) * 18, lean: 3, facing: 1, look: -0.6, blink: blinkAt(t, 1), mood: 'smile' });
      face(a, 4, -2); face(c, -2, -2);
    }
  };
}
