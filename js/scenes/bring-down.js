// bring down：店員のまめが商品の値札を手で下へずらし、500から300へ値下げする（例文 The store brought down its prices.）
import { seg, lerp, easeInOut, easeOut, hump, backOut } from '../ease.js';
import { hp } from './dig.js';

export const meta = { duration: 4.0, beats: [[0, '値札は500'], [1.4, '値段を下げる'], [3.0, '300になった']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  el('rect', { x: 0, y: 20, width: 400, height: 14, fill: pal.coralDark });
  // 棚と商品
  el('rect', { x: 200, y: 100, width: 170, height: 136, rx: 4, fill: '#F2E4D0' });
  [150, 200].forEach((y) => el('rect', { x: 200, y, width: 170, height: 6, fill: pal.woodDark }));
  [[220, pal.blue], [260, pal.yellow], [300, pal.green], [340, pal.violet]].forEach(([x, c]) => { el('rect', { x: x - 12, y: 120, width: 24, height: 30, rx: 4, fill: c }); el('rect', { x: x - 12, y: 170, width: 24, height: 30, rx: 4, fill: c }); });
  // 値札（ポール付き）：高い位置→低い位置
  const tag = g({});
  el('rect', { x: -34, y: -18, width: 68, height: 36, rx: 6, fill: '#fff', stroke: pal.red, 'stroke-width': 3 }, tag);
  const num = k.text(0, 1, '500', { 'font-size': 20, fill: pal.red }, tag);
  el('rect', { x: 150, y: 50, width: 5, height: 186, fill: pal.sub });
  const arrow = el('path', { d: 'M 0 -14 L 0 10 M -8 2 L 0 12 L 8 2', stroke: pal.red, 'stroke-width': 4, fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' });
  const b = k.buddy({ x: 90, y: FY, scale: 0.95 });
  el('rect', { x: -22, y: -30, width: 44, height: 22, rx: 4, fill: pal.white, opacity: 0.85 }, b.body);
  return {
    update(t) {
      const down = easeInOut(seg(t, 1.2, 2.4));
      const ty = lerp(80, 150, down);
      // まめ：手を伸ばして札をつかみ、下へ押し下げる
      const reach = easeOut(seg(t, 0.6, 1.1));
      const arm = lerp(10, lerp(150, 105, down), reach) * (1 - easeInOut(seg(t, 3.0, 3.4))) + 10 * easeInOut(seg(t, 3.0, 3.4));
      b.pose({ armR: arm, lean: 4 * reach + 6 * down, look: 0.7, mood: t > 2.6 ? 'grin' : 'smile', squash: 1 - 0.05 * down * (1 - seg(t, 3.0, 3.4)) });
      tf(tag, 153, ty + wobble2(t));
      num.textContent = t > 2.5 ? '300' : '500';
      tf(arrow, 200, lerp(70, 150, down)); arrow.setAttribute('opacity', hump(seg(t, 1.2, 2.6)));
      tag.setAttribute('transform', tag.getAttribute('transform') + ` scale(${1 + 0.15 * hump(seg(t, 2.5, 2.8))})`);
    }
  };
}
const wobble2 = (t) => (t > 2.4 ? Math.sin((t - 2.4) * 25) * 3 * Math.exp(-(t - 2.4) * 6) : 0);
