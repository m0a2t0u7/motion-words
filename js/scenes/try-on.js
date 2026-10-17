// try on：ハンガーのジャケットを着て、鏡の前で合うか確かめる（例文 Can I try on this jacket?）
import { seg, lerp, easeInOut, easeOut, backOut, wobble, hump } from '../ease.js';

export const meta = { duration: 4.0, beats: [[0, 'ジャケットを手に取る'], [1.3, '着てみる'], [2.6, '鏡で確かめる']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 248, mood: 'indoor' });
  // 鏡
  el('rect', { x: 262, y: 40, width: 100, height: 190, rx: 14, fill: pal.woodDark });
  el('rect', { x: 270, y: 48, width: 84, height: 174, rx: 8, fill: '#E8F3FA' });
  const sh = el('path', { d: 'M 280 56 L 300 56 L 278 120 Z M 310 56 L 318 56 L 280 150 L 280 134 Z', fill: '#fff', opacity: 0.7 });
  // 服掛け
  el('line', { x1: 60, y1: 40, x2: 60, y2: FY, stroke: pal.woodDark, 'stroke-width': 5 });
  el('line', { x1: 60, y1: 40, x2: 124, y2: 40, stroke: pal.woodDark, 'stroke-width': 5, 'stroke-linecap': 'round' });
  const hanger = g({});
  el('path', { d: 'M 0 -4 q 0 -8 6 -8 M -26 18 L 0 0 L 26 18 Z', fill: 'none', stroke: pal.ink, 'stroke-width': 2.5, 'stroke-linejoin': 'round' }, hanger);
  tf(hanger, 110, 46);
  const jacket = (parent) => {
    const j = g({}, parent);
    el('path', { d: 'M -26 0 Q 0 8 26 0 L 36 8 L 40 46 L 28 48 L 26 22 L 24 70 L -24 70 L -26 22 L -28 48 L -40 46 L -36 8 Z', fill: pal.coral, stroke: pal.coralDark, 'stroke-width': 3, 'stroke-linejoin': 'round' }, j);
    el('line', { x1: 0, y1: 6, x2: 0, y2: 70, stroke: pal.coralDark, 'stroke-width': 3 }, j);
    [22, 36, 50].forEach((y) => el('circle', { cx: 6, cy: y, r: 2.5, fill: pal.yellow }, j));
    return j;
  };
  const J1 = jacket(k.root);
  const b = k.buddy({ x: 100, y: FY, scale: 1.0 });
  const wear = g({});
  const J2 = jacket(wear);
  const q = k.text(0, 0, '?', { 'font-size': 26, fill: pal.violet });
  const ok = el('path', { d: 'M 0 0 l 8 8 l 18 -20', fill: 'none', stroke: pal.green, 'stroke-width': 6, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' });
  return {
    update(t) {
      const reach = easeOut(seg(t, 0.3, 1.0));
      const don = easeInOut(seg(t, 1.1, 1.8));
      const h = b.handPos('R');
      // 前半：ジャケットはハンガーに掛かり、まめが手をのばす
      const wearing = t >= 1.8;
      J1.setAttribute('opacity', t < 1.5 ? 1 : 0);
      tf(J1, 110, 62);
      const travel = easeInOut(seg(t, 1.0, 1.7));
      tf(hanger, 110, 46);
      hanger.setAttribute('opacity', 1);
      // 着ている間はまめの胴にジャケットを重ねる
      const sc = 1.0;
      wear.setAttribute('opacity', seg(t, 1.5, 1.8));
      const tilt = hump(seg(t, 2.4, 3.4));
      const walk = easeInOut(seg(t, 2.0, 2.9));
      const bx = lerp(100, 190, walk);
      b.pose({
        x: bx,
        walk: walk > 0 && walk < 1 ? t * 9 : 0,
        armR: t < 1.0 ? lerp(8, 75, reach) : t < 1.7 ? lerp(75, 20, easeInOut(seg(t, 1.0, 1.7))) : lerp(20, 60, seg(t, 2.9, 3.4)) ,
        armL: t < 1.7 ? 8 : lerp(8, 60, seg(t, 2.9, 3.4)),
        facing: 1, look: 0.6, mood: t > 2.9 ? 'grin' : 'smile', lean: 3 * tilt - 2
      });
      tf(wear, bx, FY - 62, 3 * tilt - 2, 1.15, 1.0);
      // 鏡の前で ? → ✓
      tf(q, bx + 20, FY - 108, 0, seg(t, 2.6, 2.9) * (1 - seg(t, 3.3, 3.5)), seg(t, 2.6, 2.9) * (1 - seg(t, 3.3, 3.5)));
      const op = seg(t, 3.4, 3.7);
      tf(ok, 302, 90, 0, op, op);
      ok.setAttribute('opacity', op);
    }
  };
}
