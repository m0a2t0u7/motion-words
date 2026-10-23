import { seg, lerp, easeInOut, easeOut, easeIn, backOut, wobble, hump, clamp } from '../ease.js';
import { P, blinkAt } from './run-after.js';
// 手先が(tx,ty)を向く腕の角度（シーン内だけで使う）
const aim = (x, y, f, s, tx, ty) => (Math.atan2((tx - (x + 27 * f * s)) * f, ty - (y - 56 * s)) * 180) / Math.PI;
// thick：パンを包丁で厚く切る（例文 He cut a thick slice of bread.）
export const meta = { duration: 3.8, beats: [[0, 'パンを前に'], [1.3, '切る'], [3.0, '厚い一切れ']] };
export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  el('rect', { x: 130, y: 200, width: 230, height: 10, rx: 3, fill: pal.wood });
  el('rect', { x: 145, y: 210, width: 8, height: FY - 210, fill: pal.woodDark });
  el('rect', { x: 336, y: 210, width: 8, height: FY - 210, fill: pal.woodDark });
  k.shadow(250, FY, 100, 6);
  el('rect', { x: 150, y: 192, width: 200, height: 9, rx: 3, fill: pal.woodDark });
  const bread = g({}), slice = g({});
  el('rect', { x: 0, y: -34, width: 100, height: 34, rx: 8, fill: '#E0A55E', stroke: '#C98440', 'stroke-width': 2 }, bread);
  el('rect', { x: 0, y: -32, width: 30, height: 30, rx: 6, fill: '#F6DDA8' }, slice);
  el('rect', { x: 0, y: -32, width: 30, height: 30, rx: 6, fill: 'none', stroke: '#C98440', 'stroke-width': 2 }, slice);
  const S = 1, bx = 70;
  const knife = g({}); el('rect', { x: -4, y: 0, width: 8, height: 14, rx: 3, fill: pal.woodDark }, knife);
  el('path', { d: 'M -4 14 L 4 14 L 4 44 L -4 36 Z', fill: '#D9DEE6', stroke: '#9AA3B2', 'stroke-width': 1.5 }, knife);
  const b = k.buddy({ x: bx, y: FY, scale: S });
  const dim = el('path', { d: 'M 144 146 H 174 M 144 142 v8 M 174 142 v8', stroke: pal.coralDark, 'stroke-width': 2, fill: 'none' });
  return {
    update(t) {
      const cut = seg(t, 1.2, 2.6), saw = Math.sin(cut * 18) * (cut > 0 && cut < 1 ? 1 : 0);
      const sx = 190; // 切る位置
      const x = 118 + 34 * easeOut(seg(t, 0, 1)) - 44 * easeInOut(seg(t, 2.6, 3.2));
      const tx = sx - 3 + saw * 3, ty = 164 + saw * 2 - (1 - easeOut(seg(t, 0.4, 1.2))) * 8;
      const a = aim(x, FY, 1, S, tx, ty);
      P(b, { x, armR: a, armL: 20, lean: 4, look: 0.3, mood: t > 2.7 ? 'grin' : 'smile', blink: blinkAt(t) });
      const h = b.handPos('R');
      tf(knife, h.x, h.y - 2, -4);
      const open = easeOut(seg(t, 2.6, 3.2));
      tf(slice, 160 - 16 * open, 192, -3 * open * wobble(seg(t, 2.6, 3.4)));
      tf(bread, 190, 192);
      k.set(dim, { opacity: open }); dim.setAttribute('transform', `translate(${-16 * open} 0)`);
    }
  };
}
