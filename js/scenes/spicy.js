// spicy：カレーをスプーンで一口食べて、辛くて顔が赤くなり口から火が出そう（例文 I love spicy curry with lots of pepper.）
import { seg, lerp, easeInOut, easeOut, hump, wobble, clamp } from '../ease.js';
import { P, blinkAt } from './run-after.js';
import { kitchenBg } from './weigh.js';
import { hp, reach } from './dig.js';

export const meta = { duration: 4.2, beats: [[0, 'カレー'], [1.6, '一口食べる'], [2.7, 'ひりひり辛い']] };

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
  el('ellipse', { cx: 222, cy: 188, rx: 24, ry: 4, fill: '#B8741F' });
  el('path', { d: 'M 204 188 Q 210 176 222 180 Q 230 184 232 188 Z', fill: '#fff' });
  // 唐辛子
  [[336, 192, -10], [352, 194, 8]].forEach(([x, y, r]) => { const c = el('path', { d: 'M 0 0 Q 14 -2 20 6 Q 8 8 0 4 Z', fill: pal.red }); tf(c, x, y, r); el('path', { d: `M ${x} ${y} l -4 -3`, stroke: pal.green, 'stroke-width': 2.4, 'stroke-linecap': 'round' }); });
  // 水のコップ
  el('path', { d: 'M 296 178 H 316 L 314 198 H 298 Z', fill: pal.water, opacity: 0.55, stroke: pal.line, 'stroke-width': 1.2 });
  const b = k.buddy({ x: 130, y: FY, scale: S });
  P(b, {});
  const red = el('ellipse', { cx: 130, cy: FY - 60, rx: 33, ry: 46, fill: '#FF5A4D', opacity: 0 });
  const aT = reach(b, S, 'R', 198, 185), aM = 128;
  const sp = g({});
  el('line', { x1: 0, y1: 0, x2: 17, y2: 5, stroke: '#9AA5B5', 'stroke-width': 3.4, 'stroke-linecap': 'round' }, sp);
  el('ellipse', { cx: 21, cy: 6, rx: 6.5, ry: 4, fill: '#C9D1DC', stroke: '#9AA5B5', 'stroke-width': 1.2 }, sp);
  const soup = el('ellipse', { cx: 21, cy: 5, rx: 5, ry: 2.6, fill: '#B8741F' }, sp);
  const flames = [-1, 0, 1].map(() => el('path', { d: 'M 0 0 Q -9 -10 -3 -22 Q -2 -14 3 -17 Q 4 -8 0 0 Z', fill: '#FF8A3D', stroke: '#FFD24D', 'stroke-width': 1.5 }));
  const drop = el('path', { d: 'M 0 -6 Q 5 1 0 5 Q -5 1 0 -6 Z', fill: pal.water, stroke: pal.blue, 'stroke-width': 1 });
  return {
    update(t) {
      const a = kf(t, [[0, 8], [0.7, 8], [1.3, aT], [1.7, aT], [2.4, aM], [3.0, aM], [3.6, 12]]);
      const rot = kf(t, [[0, 80], [0.7, 80], [1.3, 0], [1.7, 0], [2.4, -45], [3.0, -45], [3.6, 70]]);
      const bit = seg(t, 2.5, 2.8);
      P(b, { armL: t > 2.9 ? 100 + 25 * Math.sin(t * 20) : 8, armR: a, lean: 3 * seg(t, 2.1, 2.5), look: 0.4, squash: 1 - 0.04 * hump(bit), mood: t < 2.5 ? 'smile' : 'open', blink: blinkAt(t) });
      red.setAttribute('opacity', 0.28 * seg(t, 2.5, 3.1));
      const h = hp(b, S, 'R');
      tf(sp, h.x, h.y, rot, S);
      soup.setAttribute('opacity', t > 1.7 && t < 3.0 ? 1 : 0);
      const hx = 130, hy = FY - 84 * S;
      flames.forEach((f, i) => {
        const on = seg(t, 2.8, 3.2), fl = 1 + 0.25 * Math.sin(t * 14 + i * 2);
        tf(f, hx + i * 22, hy - 30, i * 12, 1.1 * on, on * fl);
        f.setAttribute('opacity', on);
      });
      tf(drop, hx - 44, hy + 14 + easeOut(seg(t, 2.8, 3.8)) * 26, 0, 1);
      drop.setAttribute('opacity', seg(t, 2.8, 2.9) * (1 - seg(t, 3.6, 3.9)));
    }
  };
}
