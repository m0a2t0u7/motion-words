// salty：スープをスプーンで一口飲んで、しょっぱすぎて顔をしかめる（例文 This soup is too salty.）
import { seg, lerp, easeInOut, easeOut, hump, wobble, clamp } from '../ease.js';
import { P, blinkAt } from './run-after.js';
import { kitchenBg } from './weigh.js';
import { hp, reach } from './dig.js';

export const meta = { duration: 4.2, beats: [[0, 'スープ'], [1.6, '一口飲む'], [2.7, 'しょっぱい']] };

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
  // 塩のびん
  el('rect', { x: 330, y: 176, width: 18, height: 22, rx: 5, fill: '#fff', stroke: pal.line, 'stroke-width': 1.5 });
  el('rect', { x: 331, y: 170, width: 16, height: 8, rx: 3, fill: pal.sub });
  [334, 339, 344].forEach((x) => el('circle', { cx: x, cy: 174, r: 1, fill: '#fff' }));
  // 水のコップ
  el('path', { d: 'M 296 178 H 316 L 314 198 H 298 Z', fill: pal.water, opacity: 0.55, stroke: pal.line, 'stroke-width': 1.2 });
  const b = k.buddy({ x: 130, y: FY, scale: S });
  P(b, {});
  const aT = reach(b, S, 'R', 198, 185), aM = 128;
  const sp = g({});
  el('line', { x1: 0, y1: 0, x2: 17, y2: 5, stroke: '#9AA5B5', 'stroke-width': 3.4, 'stroke-linecap': 'round' }, sp);
  el('ellipse', { cx: 21, cy: 6, rx: 6.5, ry: 4, fill: '#C9D1DC', stroke: '#9AA5B5', 'stroke-width': 1.2 }, sp);
  const soup = el('ellipse', { cx: 21, cy: 5, rx: 5, ry: 2.6, fill: '#E7B866' }, sp);
  const grains = [0, 1, 2, 3, 4].map(() => el('rect', { x: -2.5, y: -2.5, width: 5, height: 5, rx: 1, fill: '#fff', stroke: pal.line, 'stroke-width': 1 }));
  const drop = el('path', { d: 'M 0 -6 Q 5 1 0 5 Q -5 1 0 -6 Z', fill: pal.water, stroke: pal.blue, 'stroke-width': 1 });
  return {
    update(t) {
      const a = kf(t, [[0, 8], [0.7, 8], [1.3, aT], [1.7, aT], [2.4, aM], [3.0, aM], [3.6, 12]]);
      const rot = kf(t, [[0, 80], [0.7, 80], [1.3, 0], [1.7, 0], [2.4, -45], [3.0, -45], [3.6, 70]]);
      const bit = seg(t, 2.5, 2.8);
      P(b, { armR: a, lean: 3 * seg(t, 2.1, 2.5), look: 0.4, squash: 1 - 0.04 * hump(bit), mood: t < 2.5 ? 'smile' : 'sad', blink: t > 2.6 && t < 3.7 ? 1 : blinkAt(t) });
      const h = hp(b, S, 'R');
      tf(sp, h.x, h.y, rot, S);
      soup.setAttribute('opacity', t > 1.7 && t < 3.0 ? 1 : 0);
      const hx = 130, hy = FY - 84 * S;
      grains.forEach((gr, i) => {
        const on = seg(t, 2.7, 3.0) * (1 - seg(t, 3.9, 4.2)), ang = t * 1.6 + i * 1.26;
        tf(gr, hx + Math.cos(ang) * 52, hy + 4 + Math.sin(ang) * 14 - i * 3, ang * 40, 1);
        gr.setAttribute('opacity', on);
      });
      tf(drop, hx + 40, hy + 14 + easeOut(seg(t, 2.8, 3.8)) * 22, 0, 1);
      drop.setAttribute('opacity', seg(t, 2.8, 2.9) * (1 - seg(t, 3.6, 3.9)));
    }
  };
}
