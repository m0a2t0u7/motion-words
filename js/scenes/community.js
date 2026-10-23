// community：地域の人たちがそろって公園のごみを拾い、公園がきれいになる（例文 The community came together to clean the park.）
import { seg, lerp, easeInOut, easeOut, hump, clamp } from '../ease.js';
import { CO, BL, YE, hp, reach, P, blinkAt, sc } from './member.js';
import { parkBg, tree } from './run-after.js';
import { sparkle } from './furniture.js';

export const meta = { duration: 4.4, beats: [[0, 'みんなで集まる'], [1.2, 'ごみを拾う'], [3.6, '公園がきれいに']] };

function bag(k, col) {
  const g = k.g({});
  k.el('path', { d: 'M -5 0 Q 0 -6 5 0', stroke: col, 'stroke-width': 3, fill: 'none' }, g);
  k.el('path', { d: 'M -10 2 L 10 2 L 13 30 Q 0 36 -13 30 Z', fill: col, opacity: 0.85 }, g);
  return g;
}
function litter(k, i) {
  const g = k.g({}), { el, pal } = k;
  if (i % 2) { el('rect', { x: -4, y: -10, width: 8, height: 10, rx: 2, fill: '#C9D1DC' }, g); el('rect', { x: -4, y: -10, width: 8, height: 3, fill: pal.red }, g); }
  else el('path', { d: 'M -6 0 L -4 -8 L 3 -9 L 6 -2 L 1 1 Z', fill: '#fff', stroke: pal.sub, 'stroke-width': 1.2 }, g);
  return g;
}

export function create(k) {
  const { el, tf, pal } = k, FY = 236;
  parkBg(k, FY);
  tree(k, 40, FY - 2, 1.2); tree(k, 360, FY - 4, 1);
  el('rect', { x: 120, y: 24, width: 160, height: 26, rx: 6, fill: '#fff', stroke: pal.green, 'stroke-width': 3 });
  k.text(200, 38, 'PARK CLEAN-UP', { 'font-size': 13, fill: pal.green });
  const ppl = [[110, 0.9, {}], [210, 0.8, CO(k)], [300, 0.85, BL(k)]].map(([x, s, c], i) => ({
    x, s, b: k.buddy({ x, y: FY, scale: s, ...c }), bag: bag(k, ['#7FA6D9', '#9ACB84', '#E9B43A'][i]),
    items: [0, 1].map((j) => ({ n: litter(k, i + j), ix: x + 34 * s + j * 14, t0: 0.8 + i * 0.25 + j * 1.25 }))
  }));
  const sp = [0, 1, 2, 3].map(() => sparkle(k));
  return {
    update(t) {
      ppl.forEach(({ x, s, b, bag: bg, items }, i) => {
        // いま拾っている1個
        let lean = 0, arm = 8, cur = null, q = 0;
        items.forEach((it) => { const p = seg(t, it.t0, it.t0 + 1.1); if (p > 0 && p < 1) { cur = it; q = p; } });
        const dn = hump(seg(q, 0, 0.7));
        lean = 34 * dn;
        P(b, { x, lean, squash: 1 - 0.05 * dn, armL: 20, blink: blinkAt(t, i * 0.6), look: 0.6, mood: t > 3.6 ? 'grin' : 'smile' });
        if (cur) b.pose({ armR: lerp(reach(b, s, 'R', cur.ix, FY - 6), 20, easeInOut(seg(q, 0.5, 0.85))) });
        const hL = hp(b, s, 'L', 30); tf(bg, hL.x, hL.y, 0, s);
        items.forEach((it) => {
          const p = seg(t, it.t0, it.t0 + 1.1);
          if (p < 0.35) tf(it.n, it.ix, FY);
          else if (p < 0.85) { const h = hp(b, s, 'R', 32); tf(it.n, h.x, h.y + 6); }
          else tf(it.n, hL.x, hL.y + 14 * s, 0, sc(1 - seg(p, 0.85, 1)));
        });
      });
      sp.forEach((g, j) => { const p = seg(t, 3.6 + j * 0.12, 4.3); tf(g, 90 + j * 80, FY - 10 - 20 * p, 0, sc(Math.sin(p * Math.PI))); });
    }
  };
}
