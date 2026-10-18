// take in：ボードから大量の情報（図・表・文書）がまめの頭へ飛んでくる。最初は吸い込めるが、多すぎてあふれ、目が回る（例文 It was hard to take in so much information.）
import { seg, lerp, easeInOut, easeOut, easeIn, hump, clamp } from '../ease.js';
import { officeBg } from './get-on-with.js';

export const meta = { duration: 4.4, beats: [[0, '情報が来る'], [1.6, '頭に入れる'], [3.4, '入りきらない']] };

function icon(k, kind) {
  const { el, g, pal } = k;
  const n = g({});
  el('rect', { x: -12, y: -10, width: 24, height: 20, rx: 3, fill: '#fff', stroke: pal.line, 'stroke-width': 1.5 }, n);
  if (kind === 0) [[-7, 4, 6], [-1, 0, 10], [5, -4, 14]].forEach(([x, , h]) => el('rect', { x, y: 6 - h, width: 4, height: h, fill: pal.blue }, n));
  else if (kind === 1) [-4, 0, 4].forEach((y) => el('line', { x1: -8, x2: 8, y1: y, y2: y, stroke: pal.sub, 'stroke-width': 1.6 }, n));
  else { el('circle', { cx: 0, cy: 0, r: 6, fill: pal.coral }, n); el('path', { d: 'M 0 0 L 0 -6 A 6 6 0 0 1 6 0 Z', fill: pal.yellow }, n); }
  return n;
}

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = officeBg(k, 236, 400);
  // 左のボード
  el('rect', { x: 20, y: 40, width: 120, height: 110, rx: 6, fill: '#fff', stroke: pal.sub, 'stroke-width': 3 });
  el('rect', { x: 76, y: 150, width: 8, height: 86, fill: pal.sub });
  for (let i = 0; i < 4; i++) el('line', { x1: 34, x2: 126, y1: 62 + i * 22, y2: 62 + i * 22, stroke: pal.line, 'stroke-width': 4, 'stroke-linecap': 'round' });
  const b = k.buddy({ x: 270, y: FY, scale: 1.05, facing: -1 });
  const N = 14;
  const items = Array.from({ length: N }, (_, i) => icon(k, i % 3));
  const spin = g({});
  el('path', { d: 'M -8 0 A 8 8 0 1 1 0 8 A 5 5 0 1 1 3 -2', fill: 'none', stroke: pal.violet, 'stroke-width': 2.4, 'stroke-linecap': 'round' }, spin);
  const sweat = el('path', { d: 'M 0 -6 Q 4 0 0 4 Q -4 0 0 -6 Z', fill: pal.water });
  return {
    update(t) {
      const over = easeInOut(seg(t, 2.6, 3.2));
      const HX = 262, HY = 180;
      items.forEach((n, i) => {
        const s = 0.3 + i * 0.17, q = seg(t, s, s + 0.55);
        const sx = 50 + (i % 4) * 22, sy = 60 + (i % 5) * 18;
        if (i < 4) {
          // 最初の数個：頭に吸い込まれて小さくなる
          const e = easeIn(q);
          tf(n, lerp(sx, HX, e), lerp(sy, HY - 10, e) - hump(q) * 20, 0, 1 - e * 0.9);
          n.setAttribute('opacity', q > 0 && q < 1 ? 1 : 0);
        } else {
          // 残り：頭に当たってはね返り、まわりに積もる
          const hit = seg(q, 0, 0.6), bo = seg(q, 0.6, 1);
          const ex = 196 + ((i * 37) % 120), ey = 128 + ((i * 23) % 40) - (i % 3) * 14;
          const x = q < 0.6 ? lerp(sx, HX - 20, easeIn(hit)) : lerp(HX - 20, ex, easeOut(bo));
          const y = q < 0.6 ? lerp(sy, HY - 30, easeIn(hit)) - hump(hit) * 24 : lerp(HY - 30, ey, easeOut(bo)) - hump(bo) * 18;
          tf(n, x, y, (i % 2 ? 1 : -1) * bo * 25, 1);
          n.setAttribute('opacity', q > 0 ? 1 : 0);
        }
      });
      const hitN = items.filter((_, i) => i >= 4 && seg(t, 0.3 + i * 0.17 + 0.33, 0.3 + i * 0.17 + 0.36) > 0 && seg(t, 0.3 + i * 0.17 + 0.33, 0.3 + i * 0.17 + 0.45) < 1).length;
      b.pose({ armL: lerp(20, 150, over), armR: lerp(20, 150, over), lean: lerp(4, -8, over) + Math.sin(t * 6) * 3 * over, look: lerp(0.5, Math.sin(t * 7), over),
        blink: 0, mood: over > 0.5 ? 'open' : t > 1.5 ? 'flat' : 'smile', squash: 1 - 0.05 * hitN });
      tf(spin, 270, 112, t * 300); spin.setAttribute('opacity', over);
      k.set(sweat, { transform: `translate(${300} ${130 + seg(t, 3.2, 4.2) * 14})`, opacity: over * (1 - seg(t, 4.0, 4.4)) });
    }
  };
}
