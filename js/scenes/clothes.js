// clothes：雪の季節、服屋でまめがラックからセーターとコートを選んで手に取る（例文 I need to buy some new clothes for winter.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';
import { flat } from './shirt.js';
import { hp, reach, gait } from './dig.js';

export const meta = { duration: 4.4, beats: [[0, '冬が来た'], [1.0, '服を選ぶ'], [3.3, '新しい冬服']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 240, mood: 'indoor' });
  // 雪の窓
  el('rect', { x: 26, y: 50, width: 110, height: 80, rx: 6, fill: '#C9D6E4', stroke: '#fff', 'stroke-width': 5 });
  const snow = g({}); snow.setAttribute('clip-path', k.clip((c) => el('rect', { x: 29, y: 53, width: 104, height: 74 }, c)));
  el('path', { d: 'M 29 118 Q 80 108 133 116 V 127 H 29 Z', fill: '#fff' }, snow);
  const flakes = Array.from({ length: 10 }, () => el('circle', { r: 2.4, fill: '#fff' }, snow));
  // 服のラック
  const RY = 142;
  el('rect', { x: 214, y: RY - 4, width: 176, height: 6, rx: 3, fill: '#9AA4B4' });
  [218, 382].forEach((x) => el('rect', { x: x - 3, y: RY, width: 6, height: FY - RY, fill: '#9AA4B4' }));
  k.shadow(300, FY + 1, 92, 4);
  const items = [['sweater', '#F2A33A', '#C97E1E', 246], ['coat', '#9A6A47', '#6E4A30', 290], ['jacket', pal.blue, pal.blueDark, 330], ['shirt', '#fff', '#AEB9C8', 366]]
    .map(([kind, c, d, x]) => ({ n: flat(k, kind, c, d), x }));
  items.forEach((it) => tf(it.n, it.x, RY - 2, 0, 0.92));
  const S = 0.98, b = k.buddy({ x: 60, y: FY, scale: S });
  const xf = (t) => t < 1.8 ? lerp(60, 200, easeInOut(seg(t, 0.1, 1.0))) : lerp(200, 236, easeInOut(seg(t, 1.8, 2.3)));
  return {
    update(t) {
      flakes.forEach((f, i) => { const p = (t * 0.3 + i * 0.1) % 1; k.set(f, { cx: 34 + ((i * 29) % 96) + 4 * Math.sin(t * 2 + i), cy: 50 + p * 70 }); });
      const p = gait(xf, t, 60);
      b.pose({ x: p.x, walk: p.walk, lean: p.lean, armL: p.armL, armR: p.armR, look: 0.6, mood: t > 3.2 ? 'grin' : 'smile', squash: 1 + 0.03 * hump(seg(t, 3.3, 3.7)) });
      const r1 = hump(seg(t, 1.0, 1.75)) , r2 = hump(seg(t, 2.3, 3.05));
      const tgt = (it) => ({ x: it.x, y: RY + 16 });
      let armR = p.armR;
      if (t > 1.0 && t < 1.75) armR = lerp(p.armR, reach(b, S, 'R', tgt(items[0]).x, tgt(items[0]).y), easeOut(Math.min(1, r1 * 1.6)));
      if (t > 2.3 && t < 3.05) armR = lerp(30, reach(b, S, 'R', tgt(items[1]).x, tgt(items[1]).y), easeOut(Math.min(1, r2 * 1.6)));
      if (t >= 1.75 && t <= 2.3) armR = 30;
      if (t >= 3.05) armR = lerp(30, 58, easeOut(seg(t, 3.05, 3.4)));
      b.pose({ armR, lean: 4 * (r1 + r2) + p.lean });
      const h = hp(b, S, 'R', 28);
      [[0, 1.38], [1, 2.68]].forEach(([i, tg]) => {
        const it = items[i];
        if (t < tg) tf(it.n, it.x, RY - 2, 0, 0.92);
        else tf(it.n, h.x + (i ? 0 : 4), h.y - 14 + (i ? 0 : 4), Math.sin((t - tg) * 7) * 6 * Math.exp(-(t - tg) * 3), 0.92);
      });
    }
  };
}
