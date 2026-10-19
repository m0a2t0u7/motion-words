// lie：お昼ごはんのあと、まめがソファに横になる（例文 I lie on the sofa after lunch.）
import { seg, lerp, easeInOut, easeOut, hump, wobble } from '../ease.js';
import { sofa, clock, win } from './run-after.js';
import { lie as lying } from './surgery.js';
import { gait } from './dig.js';

export const meta = { duration: 4.2, beats: [[0, 'お昼のあと'], [1.3, 'ソファへ'], [2.6, '横になる']] };

export function create(k) {
  const { el, tf, pal } = k, S = 0.8;
  const FY = k.backdrop({ floorY: 238, mood: 'indoor' });
  const w = win(k, 40, 44, 80, 60); w.frame();
  clock(k, 160, 70, 18).set(1, 0);
  el('ellipse', { cx: 230, cy: 258, rx: 150, ry: 13, fill: '#E6DCEF' });
  // 小さなテーブルと、食べ終わったお皿
  k.shadow(70, FY + 1, 34, 4);
  el('rect', { x: 36, y: FY - 52, width: 68, height: 7, rx: 3, fill: pal.wood });
  el('rect', { x: 44, y: FY - 45, width: 6, height: 45, fill: pal.woodDark });
  el('rect', { x: 90, y: FY - 45, width: 6, height: 45, fill: pal.woodDark });
  el('ellipse', { cx: 70, cy: FY - 55, rx: 20, ry: 4.5, fill: '#fff', stroke: pal.line, 'stroke-width': 2 });
  [[-6, 0], [4, 1], [9, -1]].forEach(([x, y]) => el('circle', { cx: 70 + x, cy: FY - 57 + y, r: 1.6, fill: '#E9B43A' }));
  el('line', { x1: 52, y1: FY - 60, x2: 66, y2: FY - 56, stroke: pal.sub, 'stroke-width': 2.2, 'stroke-linecap': 'round' });
  const so = sofa(k, 265, FY, 150);
  const L = lying(k, { scale: S });
  so.front();
  const zz = [0, 1].map(() => k.text(0, 0, 'z', { 'font-size': 15, fill: pal.sub }));
  const bx = (t) => lerp(118, 172, easeInOut(seg(t, 0.5, 1.4)));
  return {
    update(t) {
      const lp = easeInOut(seg(t, 1.6, 2.6));
      const g = gait(bx, t, 118);
      const land = wobble(seg(t, 2.6, 3.3), 2, 6);
      // 立つ位置（足元＝床）→ ソファの座面に横たわる
      const x = lerp(g.x, 262, lp), y = lerp(FY - 12 * S, FY - 34 - 28 * S, lp) - 14 * hump(lp);
      L.set(x, y, -90 * lp);
      L.b.pose({ x: 0, y: 12, walk: lp > 0 ? 0 : g.walk, lean: 0, armL: lerp(g.armL, 20, lp), armR: lerp(g.armR, 150 * easeOut(seg(t, 2.8, 3.4)), lp),
        squash: 1 - 0.05 * land, look: lp > 0.5 ? -0.3 : 0.5, mood: t > 2.8 ? 'grin' : 'smile', blink: easeInOut(seg(t, 3.3, 3.8)) * 0.85 });
      zz.forEach((z, i) => { const q = seg(t, 3.5 + i * 0.25, 4.2); z.setAttribute('opacity', q > 0 ? 0.8 * Math.sin(q * Math.PI * 0.9) + 0.1 : 0); tf(z, 196 + i * 12, FY - 112 - q * 18 - i * 10); });
    }
  };
}
