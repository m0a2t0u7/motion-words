import { seg, lerp, easeInOut, easeOut, easeIn, backOut, wobble, hump, clamp } from '../ease.js';
import { P, blinkAt } from './run-after.js';
// 手先が(tx,ty)を向く腕の角度（シーン内だけで使う）
const aim = (x, y, f, s, tx, ty) => (Math.atan2((tx - (x + 27 * f * s)) * f, ty - (y - 56 * s)) * 180) / Math.PI;
// sharp：テーブルのナイフは鋭い。手を出して「気をつけて」と注意する（例文 Be careful. That knife is very sharp.）
export const meta = { duration: 3.8, beats: [[0, 'ナイフがある'], [1.2, 'キラリと光る'], [2.6, '気をつけて']] };
export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  el('rect', { x: 150, y: 170, width: 230, height: 10, rx: 3, fill: pal.wood });
  el('rect', { x: 165, y: 180, width: 8, height: FY - 180, fill: pal.woodDark });
  el('rect', { x: 356, y: 180, width: 8, height: FY - 180, fill: pal.woodDark });
  k.shadow(270, FY, 100, 6);
  const kn = g({});
  el('rect', { x: -52, y: -12, width: 34, height: 11, rx: 5, fill: pal.woodDark }, kn);
  el('path', { d: 'M -18 -12 L 40 -12 Q 56 -4 62 0 L -18 0 Z', fill: '#E3E8EF', stroke: '#8E98A8', 'stroke-width': 1.6 }, kn);
  el('line', { x1: -14, y1: -9, x2: 40, y2: -9, stroke: '#fff', 'stroke-width': 2 }, kn);
  tf(kn, 270, 170);
  const gl = el('path', { d: 'M 0 -12 L 3 -3 L 12 0 L 3 3 L 0 12 L -3 3 L -12 0 L -3 -3 Z', fill: '#fff', stroke: pal.yellowDark, 'stroke-width': 1.2 });
  const bang = k.text(0, 0, '!', { 'font-size': 44, 'font-weight': 900, fill: pal.red, 'text-anchor': 'middle' });
  const b = k.buddy({ x: 90, y: FY, scale: 1.1 });
  return {
    update(t) {
      const sh = hump(seg(t, 1.0, 1.9)), w = easeOut(seg(t, 2.2, 2.9));
      const x = lerp(90, 120, easeInOut(seg(t, 0, 1.2)));
      const a = aim(x, FY, 1, 1.1, 215, 150);
      P(b, { x, armR: lerp(8, 70, w) , armL: lerp(8, 170, w) * 0 + 14, lean: 4 * w, look: 0.5, mood: w > 0.3 ? 'open' : 'smile', blink: blinkAt(t) });
      tf(gl, 295, 156, t * 40, sh * 1.3, sh * 1.3);
      const p = w * (1 + 0.15 * wobble(seg(t, 2.6, 3.6)));
      bang.setAttribute('opacity', w); bang.setAttribute('transform', `translate(300 ${120 - 6 * w}) scale(${p})`);
    }
  };
}
