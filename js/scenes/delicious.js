// delicious：スープをスプーンで一口飲んで、うっとり笑顔になる（例文 The soup was absolutely delicious.）
import { seg, lerp, easeInOut, easeOut, hump, wobble, clamp } from '../ease.js';
import { P, blinkAt } from './run-after.js';
import { kitchenBg } from './weigh.js';
import { hp, reach } from './dig.js';

export const meta = { duration: 4.2, beats: [[0, 'スープ'], [1.6, '一口飲む'], [2.7, 'おいしい']] };

const kf = (t, pts) => {
  for (let i = 1; i < pts.length; i++) if (t < pts[i][0]) return lerp(pts[i - 1][1], pts[i][1], easeInOut(seg(t, pts[i - 1][0], pts[i][0])));
  return pts[pts.length - 1][1];
};

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = kitchenBg(k);
  const S = 1.2;
  k.shadow(290, FY, 110, 7);
  el('rect', { x: 176, y: 198, width: 214, height: 9, rx: 3, fill: pal.wood });
  [[190, 207], [368, 207]].forEach(([x, y]) => el('rect', { x, y, width: 9, height: 29, rx: 2, fill: pal.woodDark }));
  // スープ皿
  el('ellipse', { cx: 222, cy: 197, rx: 30, ry: 5, fill: '#EEF1F5', stroke: pal.line, 'stroke-width': 1.5 });
  el('path', { d: 'M 198 188 H 246 Q 246 197 222 198 Q 198 197 198 188 Z', fill: '#fff', stroke: pal.line, 'stroke-width': 1.5 });
  el('ellipse', { cx: 222, cy: 188, rx: 24, ry: 4, fill: '#E7B866' });
  // 水のコップ
  el('path', { d: 'M 296 178 H 316 L 314 198 H 298 Z', fill: pal.water, opacity: 0.55, stroke: pal.line, 'stroke-width': 1.2 });
  const b = k.buddy({ x: 130, y: FY, scale: S });
  P(b, {});
  const aT = reach(b, S, 'R', 198, 185), aM = 128;
  const sp = g({});
  el('line', { x1: 0, y1: 0, x2: 17, y2: 5, stroke: '#9AA5B5', 'stroke-width': 3.4, 'stroke-linecap': 'round' }, sp);
  el('ellipse', { cx: 21, cy: 6, rx: 6.5, ry: 4, fill: '#C9D1DC', stroke: '#9AA5B5', 'stroke-width': 1.2 }, sp);
  const soup = el('ellipse', { cx: 21, cy: 5, rx: 5, ry: 2.6, fill: '#E7B866' }, sp);
  const hearts = [0, 1, 2].map(() => el('path', { d: 'M 0 5 C -9 -2 -6 -9 0 -4 C 6 -9 9 -2 0 5 Z', fill: pal.coral }));
  const steam = [-6, 0, 6].map((x) => el('path', { d: `M ${222 + x * 2} 184 q -4 -6 0 -11 q 4 -5 0 -10`, fill: 'none', stroke: '#fff', 'stroke-width': 2.4, 'stroke-linecap': 'round' }));
  return {
    update(t) {
      const a = kf(t, [[0, 8], [0.7, 8], [1.3, aT], [1.7, aT], [2.4, aM], [3.0, aM], [3.6, 12]]);
      const rot = kf(t, [[0, 80], [0.7, 80], [1.3, 0], [1.7, 0], [2.4, -45], [3.0, -45], [3.6, 70]]);
      const bit = seg(t, 2.5, 2.8);
      P(b, { armR: a, lean: 3 * seg(t, 2.1, 2.5) - 4 * seg(t, 2.6, 3.0), look: 0.4, squash: 1 - 0.04 * hump(bit), mood: t < 2.5 ? 'smile' : 'grin', blink: t > 2.6 && t < 3.7 ? 1 : blinkAt(t) });
      const h = hp(b, S, 'R');
      tf(sp, h.x, h.y, rot, S);
      soup.setAttribute('opacity', t > 1.7 && t < 3.0 ? 1 : 0);
      const hx = 130, hy = FY - 84 * S;
      hearts.forEach((hr, i) => {
        const u = (t * 0.8 + i / 3) % 1, on = seg(t, 2.7, 3.0);
        tf(hr, hx - 36 + i * 36, hy - 8 - u * 26, 0, 0.9 + 0.3 * wobble(t * 3 + i));
        hr.setAttribute('opacity', on * hump(u) * 1.2);
      });
      steam.forEach((p, i) => p.setAttribute('opacity', 0.3 + 0.4 * Math.abs(Math.sin(t * 2.2 + i * 2))));
    }
  };
}
