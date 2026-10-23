import { seg, lerp, easeInOut, easeOut, easeIn, backOut, wobble, hump, clamp } from '../ease.js';
import { P, blinkAt } from './run-after.js';
// 手先が(tx,ty)を向く腕の角度（シーン内だけで使う）
const aim = (x, y, f, s, tx, ty) => (Math.atan2((tx - (x + 27 * f * s)) * f, ty - (y - 56 * s)) * 180) / Math.PI;
// flat：テーブルの表面は平ら。手でなでて、水平器の泡が中央に来る（例文 The table has a flat surface.）
export const meta = { duration: 4.0, beats: [[0, 'テーブル'], [1.0, '手でなでる'], [2.8, '水平と分かる']] };
export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  const TY = 180;
  el('rect', { x: 150, y: TY, width: 230, height: 10, rx: 3, fill: pal.wood });
  el('rect', { x: 165, y: TY + 10, width: 8, height: FY - TY - 10, fill: pal.woodDark });
  el('rect', { x: 356, y: TY + 10, width: 8, height: FY - TY - 10, fill: pal.woodDark });
  k.shadow(270, FY, 100, 6);
  const lv = g({});
  el('rect', { x: -50, y: -14, width: 100, height: 14, rx: 4, fill: pal.yellow, stroke: pal.yellowDark, 'stroke-width': 2 }, lv);
  el('rect', { x: -16, y: -11, width: 32, height: 8, rx: 4, fill: '#fff' }, lv);
  const bub = el('circle', { r: 3, fill: pal.green }, lv);
  const line = el('line', { x1: 0, y1: -40, x2: 0, y2: -22, stroke: pal.green, 'stroke-width': 3, 'stroke-linecap': 'round' }, lv);
  const b = k.buddy({ x: 100, y: FY, scale: 1 });
  return {
    update(t) {
      const sw = easeInOut(seg(t, 0.8, 2.6)), x = lerp(104, 160, sw);
      const a = aim(x, FY, 1, 1, x + 53, TY - 2);
      P(b, { x, armR: a, armL: 14, lean: 5, look: 0.5, mood: t > 2.8 ? 'grin' : 'smile', blink: blinkAt(t), walk: sw * 0 });
      const d = easeIn(seg(t, 2.4, 2.9)), land = seg(t, 2.9, 3.6);
      tf(lv, 270, lerp(TY - 60, TY, d), 0, 1, 1);
      bub.setAttribute('cx', 22 * Math.sin(land * 14) * Math.exp(-land * 5)); bub.setAttribute('cy', -7);
      lv.setAttribute('opacity', seg(t, 2.4, 2.5)); line.setAttribute('opacity', land > 0.7 ? 1 : 0);
    }
  };
}
