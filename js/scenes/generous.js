// generous：まめが募金箱に硬貨を何枚も入れ、そのあと重い箱を運ぶ人を手伝う。お金も時間も惜しまない（例文 He is generous with his time and money.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';
import { P, blinkAt, hp, aim, walkTo, path, person, streetBg, coin, box, heart } from './confused.js';

export const meta = { duration: 4.4, beats: [[0.0, 'たっぷり寄付'], [1.91, '手を貸す'], [3.44, '惜しまない']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 1;
  const FY = streetBg(k);
  const coral = person(k, 'coral', { x: 120, y: FY, scale: 0.95, facing: 1 });
  const dbox = g({});
  el('rect', { x: -16, y: -14, width: 32, height: 26, rx: 4, fill: pal.yellow, stroke: pal.yellowDark, 'stroke-width': 2 }, dbox);
  el('rect', { x: -8, y: -15, width: 16, height: 3, rx: 1.5, fill: pal.ink }, dbox);
  el('path', { d: 'M 0 7 C -7 1 -5 -4 0 -1 C 5 -4 7 1 0 7 Z', fill: pal.red }, dbox);
  const blue = person(k, 'blue', { x: 350, y: FY, scale: 0.95, facing: -1 });
  const crate = box(k, 50, 36, '#E3B77E'); const csh = k.shadow(0, 0, 28, 4);
  const b = k.buddy({ x: 214, y: FY, scale: S, facing: -1 });
  const coins = [0, 1, 2, 3].map(() => coin(k, undefined, 6.5));
  const hs = [0, 1, 2].map(() => heart(k));
  const xf = path([[1.9, 214], [2.5, 244]]);
  return {
    update(t) {
      t *= 4.6 / 4.4; // 4.4 秒に収める
      // 募金：硬貨を4枚、続けて入れる
      P(coral, { x: 120, facing: 1, armR: 60, armL: 20, mood: t > 0.8 ? 'grin' : 'smile', look: 0.6, blink: blinkAt(t, 1) });
      const bxp = hp(coral, 0.95, 'R'); tf(dbox, bxp.x + 8, bxp.y - 4, 0, 1);
      const w = walkTo(xf, t, 214, 1);
      const lift = easeInOut(seg(t, 2.8, 3.4)), carry = path([[3.4, 0], [4.4, 40]])(t);
      P(b, { x: w.x + carry, walk: w.walk + carry * 0.1, facing: t < 1.95 ? -1 : 1, armL: w.armL, armR: w.armR, lean: w.lean, mood: 'grin', look: 0.6, blink: blinkAt(t) });
      if (t < 1.9) aim(b, S, 'R', bxp.x + 8, bxp.y - 18 + 4 * Math.sin(t * 9));
      coins.forEach((c, i) => {
        const q = seg(t, 0.3 + i * 0.35, 0.6 + i * 0.35);
        const h = hp(b, S, 'R');
        const x = q < 1 ? h.x : bxp.x + 8, y = q < 1 ? h.y - 4 + 12 * easeOut(q) : 0;
        tf(c, x, y, 0, t > 0.3 + i * 0.35 - 0.2 && q < 1 ? 1 : 0.001);
      });
      // 手伝う：2人で箱を持ち上げて運ぶ
      const cx = 296 + carry, cy = FY - 30 * lift;
      tf(crate, cx, cy, 0, 1); k.set(csh, { cx, cy: FY + 1, rx: 28 - 8 * lift });
      P(blue, { x: 350 + carry, walk: carry * 0.1, facing: -1, lean: 10 * (1 - lift) + 4, mood: t > 2.8 ? 'grin' : 'sad', look: 0.4, blink: blinkAt(t, 2) });
      aim(blue, 0.95, 'R', cx + 22, cy - 18);
      if (t > 2.5) { aim(b, S, 'R', cx - 22, cy - 18); b.pose({ lean: 10 * (1 - lift) + 4 }); aim(b, S, 'R', cx - 22, cy - 18); }
      hs.forEach((n, i) => { const q = seg(t, [0.9, 1.4, 3.6][i], [1.9, 2.4, 4.6][i]); tf(n, [100, 140, 290][i] + carry * (i === 2), FY - 120 - 22 * q, 0, q > 0 ? 1.2 * hump(q * 0.7 + 0.3) : 0.001); });
    }
  };
}
