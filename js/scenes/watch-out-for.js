// watch out for：「路面の氷に注意して」と言われ、まめが凍った道で足元を見ながら、そろそろと氷をまたぐ（例文 Watch out for ice on the road.）
import { seg, lerp, easeInOut, easeOut, hump, wobble } from '../ease.js';
import { say, faceAt } from './look-over.js';
import { road } from './look-out.js';

export const meta = { duration: 4.4, beats: [[0, '氷に注意して'], [1.5, '足元をよく見る'], [3.6, 'そっとまたぐ']] };

export function create(k) {
  const { el, pal } = k;
  k.backdrop({ floorY: 236, mood: 'evening' });
  [[10, 80], [110, 110], [220, 70], [320, 100]].forEach(([x, h]) => { el('rect', { x, y: 220 - h, width: 82, height: h, rx: 4, fill: '#EBDDD6' }); el('rect', { x: x - 2, y: 216 - h, width: 86, height: 8, rx: 4, fill: '#fff' }); });
  road(k, 222);
  // 氷（光る薄い青）
  el('ellipse', { cx: 236, cy: 242, rx: 34, ry: 7, fill: '#CDEBFA', stroke: '#9FD6F2', 'stroke-width': 2 });
  el('path', { d: 'M 218 240 L 232 238 M 240 244 L 254 241', stroke: '#fff', 'stroke-width': 2.5, 'stroke-linecap': 'round' });
  const fr = k.buddy({ x: 60, y: 240, scale: 0.78, color: pal.coral, dark: pal.coralDark });
  const b = k.buddy({ x: 150, y: 240, scale: 0.85 });
  const bub = say(k, 40, 34, -1);
  const ice = k.g({}, bub.g);
  [0, 60, 120].forEach((r) => el('line', { x1: 0, y1: -10, x2: 0, y2: 10, stroke: '#6FC3EA', 'stroke-width': 3, 'stroke-linecap': 'round', transform: `rotate(${r})` }, ice));
  return {
    update(t) {
      bub.show(seg(t, 0.2, 0.4) * (1 - seg(t, 1.8, 2.0)), 96, 140);
      fr.pose({ armR: 8 + 80 * easeOut(seg(t, 0.2, 0.5)) * (1 - seg(t, 1.8, 2.2)), look: 0.6, mood: 'open' });
      // 小さく慎重な歩み→大きくまたぐ
      const s1 = easeInOut(seg(t, 1.2, 2.0)) * 26, s2 = easeInOut(seg(t, 2.6, 3.8)) * 84;
      const x = 150 + s1 + s2, st = hump(seg(t, 2.6, 3.8));
      b.pose({ x, walk: Math.sin(seg(t, 1.2, 2.0) * Math.PI * 2) * 0.4 + st * 1.1, lift: st * 8, armL: 8 + 70 * seg(t, 1.0, 1.4) * (1 - seg(t, 3.8, 4.3)), armR: 8 + 70 * seg(t, 1.0, 1.4) * (1 - seg(t, 3.8, 4.3)),
        lean: 6 * seg(t, 1.0, 1.4) * (1 - seg(t, 3.8, 4.3)) + 3 * wobble(seg(t, 3.7, 4.4), 2, 4), mood: t > 3.9 ? 'smile' : 'flat', look: 0.5 });
      faceAt(b, 4, 8 * seg(t, 1.0, 1.4) * (1 - seg(t, 3.9, 4.3)));
    }
  };
}
