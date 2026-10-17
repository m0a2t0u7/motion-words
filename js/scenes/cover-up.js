// cover up：机にこぼれたシミの上に、まめが布をかけて隠す（例文 She covered up the stain with a cloth.）
import { seg, lerp, easeInOut, easeOut, backOut, wobble, hump } from '../ease.js';

export const meta = { duration: 3.8, beats: [[0, 'シミがある'], [1.2, '布をかける'], [2.6, '見えなくなる']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 252, mood: 'indoor' });
  // テーブル
  el('rect', { x: 196, y: 150, width: 8, height: 102, fill: pal.woodDark });
  el('rect', { x: 340, y: 150, width: 8, height: 102, fill: pal.woodDark });
  el('rect', { x: 176, y: 136, width: 190, height: 16, rx: 6, fill: pal.wood });
  k.shadow(270, 254, 100, 5);
  // シミ
  const stain = el('path', { d: 'M 250 134 q -10 -4 -2 -9 q 4 -8 14 -3 q 12 -6 18 3 q 12 2 4 10 q 4 8 -10 7 q -10 6 -20 0 q -10 2 -4 -8 Z', fill: pal.coffee });
  el('path', { d: 'M 268 128 q 4 -2 8 0', stroke: '#B07A55', 'stroke-width': 2, fill: 'none', 'stroke-linecap': 'round' });
  const b = k.buddy({ x: 120, y: FY, scale: 1.1 });
  // 布
  const cloth = g({});
  el('path', { d: 'M -38 0 Q -38 -6 -30 -5 L 30 -5 Q 38 -6 38 0 L 42 12 Q 40 18 30 16 Q 22 22 12 16 Q 0 22 -12 16 Q -22 22 -30 16 Q -42 18 -42 12 Z', fill: '#fff', stroke: pal.blue, 'stroke-width': 3, 'stroke-linejoin': 'round' }, cloth);
  el('path', { d: 'M -30 4 L 30 4', stroke: pal.blue, 'stroke-width': 2, 'stroke-dasharray': '4 4', opacity: 0.7 }, cloth);
  const ok = el('path', { d: 'M 0 0 l 7 7 l 16 -18', fill: 'none', stroke: pal.green, 'stroke-width': 5, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' });
  return {
    update(t) {
      const p1 = easeInOut(seg(t, 0.5, 1.2));   // 布を取り上げ運ぶ
      const p2 = easeInOut(seg(t, 1.2, 2.2));   // 布をシミの上へ降ろす
      const bx = lerp(120, 170, easeOut(seg(t, 0.4, 1.2)));
      const hand = lerp(0, 1, p1);
      const hx = lerp(bx + 40, 270, p2);
      const hy = lerp(FY - 36 - 24 * p1, 108, p1 * (1 - p2) + 0) ;
      const targetY = t < 1.2 ? lerp(FY - 40, 100, p1) : lerp(100, 120, p2);
      const targetX = t < 1.2 ? lerp(bx + 40, bx + 70, p1) : lerp(bx + 70, 270, p2);
      const sx = bx + 27 * 1.1, sy = FY - 56 * 1.1;
      const d = Math.hypot(targetX - sx, targetY - sy);
      const a = Math.atan2(targetX - sx, targetY - sy) * 180 / Math.PI;
      b.pose({ x: bx, armR: Math.min(a, 125), armL: 8, lean: 6 * hump(seg(t, 1.0, 2.4)) + 3, look: 0.9, mood: t > 2.4 ? 'grin' : 'smile' });
      const ph = b.handPos('R');
      const settle = wobble(seg(t, 2.2, 3.0), 2, 5) * 1.5;
      const cx = t < 2.2 ? ph.x + 4 : 270, cy = t < 2.2 ? ph.y - 6 : 130;
      tf(cloth, t < 0.5 ? ph.x : cx, t < 2.2 ? Math.min(cy, 128 + (1 - p2) * 0 + (t < 1.2 ? 0 : 0)) + (t < 2.2 ? 0 : 0) : 128 + settle * 0.3, t < 2.2 ? 20 * (1 - p2) : 0, 1 + 0.5 * p2, 1 + 0.15 * p2);
      cloth.setAttribute('opacity', 1);
      ok.setAttribute('opacity', seg(t, 2.6, 2.9));
      tf(ok, 300, 96, 0, 1, 1);
      stain.setAttribute('opacity', t < 2.0 ? 1 : 1);
    }
  };
}
