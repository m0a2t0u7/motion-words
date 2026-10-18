// ceiling：天井の高い部屋。まめが両手を伸ばしてジャンプしても、天井ははるか上にある（例文 The ceiling in this room is high.）
import { seg, lerp, easeInOut, easeOut, hump, backOut } from '../ease.js';

export const meta = { duration: 4.4, beats: [[0, '部屋に立つ'], [1.2, '手を伸ばす'], [3.0, '天井が高い']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 238, mood: 'indoor' });
  // 天井面（奥行き）と回り縁
  const ce = el('path', { d: 'M 0 0 H 400 V 22 L 372 40 H 28 L 0 22 Z', fill: '#E9E2D6' });
  const ceHi = el('path', { d: 'M 0 0 H 400 V 22 L 372 40 H 28 L 0 22 Z', fill: pal.yellow, opacity: 0 });
  el('rect', { x: 28, y: 40, width: 344, height: 6, fill: '#FFFFFF' }); el('rect', { x: 28, y: 46, width: 344, height: 2, fill: pal.line });
  [100, 300].forEach((x) => el('rect', { x: x - 5, y: 0, width: 10, height: 40, fill: pal.woodDark, opacity: 0.5 }));
  // 背の高い窓・ドア・本棚（高さの目安）
  el('rect', { x: 50, y: 70, width: 62, height: 120, rx: 30, fill: '#DDEFFA', stroke: '#fff', 'stroke-width': 5 }); el('line', { x1: 81, y1: 70, x2: 81, y2: 190, stroke: '#fff', 'stroke-width': 3 });
  el('rect', { x: 290, y: 110, width: 66, height: 128, rx: 4, fill: pal.wood, stroke: pal.woodDark, 'stroke-width': 3 }); el('circle', { cx: 342, cy: 176, r: 4, fill: pal.yellowDark });
  // ペンダントライト（天井から長く下がる）
  const lampG = g({}); tf(lampG, 200, 40);
  el('line', { x1: 0, y1: 0, x2: 0, y2: 38, stroke: pal.sub, 'stroke-width': 2 }, lampG);
  el('path', { d: 'M -20 56 Q -18 38 0 38 Q 18 38 20 56 Z', fill: pal.yellow, stroke: pal.yellowDark, 'stroke-width': 2 }, lampG);
  el('ellipse', { cx: 0, cy: 58, rx: 12, ry: 3, fill: '#FFF3C4' }, lampG);
  const b = k.buddy({ x: 190, y: FY });
  const arrow = g({}); tf(arrow, 330, 0);
  const aline = el('line', { x1: 0, y1: 0, x2: 0, y2: 0, stroke: pal.red, 'stroke-width': 3, 'stroke-dasharray': '6 5', 'stroke-linecap': 'round' }, arrow);
  const ah1 = el('path', { d: 'M -7 8 L 0 0 L 7 8', fill: 'none', stroke: pal.red, 'stroke-width': 3, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, arrow);
  const ah2 = el('path', { d: 'M -7 -8 L 0 0 L 7 -8', fill: 'none', stroke: pal.red, 'stroke-width': 3, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, arrow);
  return {
    update(t) {
      const st = easeOut(seg(t, 0.8, 1.4)), jp = seg(t, 1.5, 2.3), lift = 38 * Math.sin(jp * Math.PI) * (1 - 0.0);
      const cr = hump(seg(t, 1.2, 1.55)) * 0.5, land = t > 2.3 ? Math.max(0, 1 - (t - 2.3) * 4) : 0;
      b.pose({ x: 190, lift, armL: lerp(8, 172, st), armR: lerp(8, 172, st), squash: 1 - 0.1 * cr - 0.08 * land + 0.04 * Math.sin(jp * Math.PI), mood: t > 2.6 ? 'open' : 'flat', look: 0, lean: -2 * st });
      // 天井までの距離：手の先（地面に立った高さ）から天井まで
      const a = backOut(seg(t, 2.6, 3.2), 1.2), y0 = 28, y1 = 142;
      tf(arrow, 330, 0);
      k.set(aline, { y1: y0 + 10, y2: lerp(y0 + 10, y1 - 10, a), opacity: a });
      tf(ah2, 0, y0, 0, 1, 1); tf(ah1, 0, lerp(y0 + 10, y1 - 10, a) + 0, 0, 1, 1);
      ah1.setAttribute('opacity', a); ah2.setAttribute('opacity', a);
      k.set(ceHi, { opacity: 0.45 * hump(seg(t, 2.5, 3.6)) });
      tf(lampG, 200, 40, 2.5 * Math.sin(t * 1.6), 1, 1);
    }
  };
}
