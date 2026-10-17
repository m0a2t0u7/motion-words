// fill up：まめが給水機の下でボトルを持ち、水をいっぱい（口まで）満たす（例文 Fill up the bottle with water.）
import { seg, lerp, easeInOut, easeOut, backOut, hump } from '../ease.js';

export const meta = { duration: 4.4, beats: [[0, '空のボトル'], [1.7, '水を入れる'], [3.5, '満タンにした']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  el('rect', { x: 30, y: 44, width: 70, height: 60, rx: 6, fill: '#DDEFFA' });
  el('line', { x1: 65, y1: 44, x2: 65, y2: 104, stroke: '#fff', 'stroke-width': 4 });
  // 給水機
  k.shadow(338, FY, 52, 6);
  el('rect', { x: 302, y: 62, width: 76, height: 176, rx: 10, fill: '#E6ECF3' });
  el('rect', { x: 310, y: 72, width: 60, height: 40, rx: 6, fill: pal.ink });
  const lvBar = el('rect', { x: 316, y: 104, width: 48, height: 0, rx: 3, fill: pal.water });
  el('rect', { x: 316, y: 78, width: 48, height: 26, rx: 3, fill: 'none', stroke: '#fff', 'stroke-width': 1.5, opacity: 0.5 });
  const led = el('circle', { cx: 340, cy: 130, r: 5.5, fill: pal.blue });
  el('rect', { x: 284, y: 142, width: 22, height: 10, rx: 5, fill: '#B9C3D0' });
  el('rect', { x: 278, y: 146, width: 12, height: 10, rx: 3, fill: '#9AA5B5' });
  el('rect', { x: 316, y: 190, width: 48, height: 30, rx: 4, fill: '#D5DCE6' });

  const S = 1;
  const stream = el('line', { x1: 284, y1: 156, x2: 284, y2: 156, stroke: pal.water, 'stroke-width': 4.5, 'stroke-linecap': 'round' });
  const bottle = g({});
  const bp = 'M -6 -34 L 6 -34 L 6 -24 Q 15 -20 15 -10 L 15 24 Q 15 32 7 32 L -7 32 Q -15 32 -15 24 L -15 -10 Q -15 -20 -6 -24 Z';
  el('path', { d: bp, fill: '#EEF6FC' }, bottle);
  const wc = k.clip((c) => el('path', { d: bp }, c));
  const wg = g({ 'clip-path': wc }, bottle);
  const water = el('rect', { x: -20, y: 32, width: 40, height: 70, fill: pal.water }, wg);
  const surf = el('rect', { x: -20, y: 32, width: 40, height: 2.5, fill: '#C4EAFB' }, wg);
  el('path', { d: bp, fill: 'none', stroke: pal.blue, 'stroke-width': 2.8, 'stroke-linejoin': 'round' }, bottle);
  el('rect', { x: -7, y: -40, width: 14, height: 7, rx: 3, fill: pal.blueDark }, bottle);
  el('rect', { x: -9, y: -6, width: 18, height: 14, rx: 3, fill: pal.blue, opacity: 0.35 }, bottle);
  const b = k.buddy({ x: 150, y: FY, scale: S });
  const spark = g({});
  [[-12, -4], [12, -10], [0, -18]].forEach(([x, y]) => el('path', { d: `M ${x} ${y - 5} L ${x + 1.5} ${y - 1.5} L ${x + 5} ${y} L ${x + 1.5} ${y + 1.5} L ${x} ${y + 5} L ${x - 1.5} ${y + 1.5} L ${x - 5} ${y} L ${x - 1.5} ${y - 1.5} Z`, fill: pal.yellow }, spark));
  const drip = el('circle', { r: 2.4, fill: pal.water });

  return {
    update(t) {
      const walk = easeInOut(seg(t, 0.2, 1.1)), back = easeInOut(seg(t, 3.15, 3.9));
      const walking = (t > 0.2 && t < 1.1) || (t > 3.15 && t < 3.9);
      const x = lerp(150, 217, walk) - 38 * back;
      const up = easeInOut(seg(t, 0.6, 1.2));
      const a = lerp(28, 100, up) * (1 - back) + 50 * back;
      b.pose({ x, walk: walking ? t * 9 : 0, armR: walking ? a + Math.sin(t * 9) * 4 : a, armL: walking ? 8 - Math.sin(t * 9) * 12 : 8, lean: walking ? 3 : 0, look: 0.7, mood: t > 3.0 ? 'grin' : 'smile', blink: t > 2.2 && t < 2.3 ? 1 : 0 });
      const h = b.handPos('R');
      const bx = h.x + 14, by = h.y - 4;
      tf(bottle, bx, by, 0);
      // 水位（ボトル座標：底 32 → 口元 -30）
      const f = easeInOut(seg(t, 1.35, 3.0));
      const lv = lerp(32, -28, f);
      k.set(water, { y: lv }); k.set(surf, { y: lv });
      const flowing = t > 1.25 && t < 3.05;
      const open = easeOut(seg(t, 1.25, 1.4)), cut = easeInOut(seg(t, 3.0, 3.15));
      const top = lerp(156, by + lv, cut), bot = lerp(156, by + lv, open);
      k.set(stream, { y1: top, y2: bot, x1: 284, x2: 284 });
      stream.setAttribute('opacity', t > 1.25 && t < 3.15 ? 1 : 0);
      stream.setAttribute('stroke-width', 4.5 * (1 - 0.4 * cut));
      // 給水機の表示：水位バーとランプ
      k.set(lvBar, { y: 104 - 24 * f, height: 24 * f });
      led.setAttribute('fill', t > 3.05 ? pal.green : flowing ? pal.water : pal.blue);
      // 満タンの合図（きらり）とボトル口の小さなこぼれ
      const sp = seg(t, 3.1, 3.7);
      tf(spark, bx, by - 44 - 6 * sp, 0, sp > 0 ? backOut(Math.min(1, sp * 1.4)) : 0.001);
      spark.setAttribute('opacity', sp > 0 && sp < 1 ? 1 - seg(sp, 0.7, 1) : 0);
      drip.setAttribute('opacity', 0);
    }
  };
}
