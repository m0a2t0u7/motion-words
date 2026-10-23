import { seg, lerp, easeInOut, easeOut, easeIn, backOut, wobble, hump, clamp } from '../ease.js';
import { P, blinkAt } from './run-after.js';
// 手先が(tx,ty)を向く腕の角度（シーン内だけで使う）
const aim = (x, y, f, s, tx, ty) => (Math.atan2((tx - (x + 27 * f * s)) * f, ty - (y - 56 * s)) * 180) / Math.PI;
// straight：定規を当ててまっすぐな線を引く（例文 Draw a straight line with a ruler.）
export const meta = { duration: 4.0, beats: [[0, '定規を置く'], [1.1, '線を引く'], [3.0, 'まっすぐ']] };
export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  const TY = 184;
  el('rect', { x: 120, y: TY, width: 270, height: 10, rx: 3, fill: pal.wood });
  el('rect', { x: 135, y: TY + 10, width: 8, height: FY - TY - 10, fill: pal.woodDark });
  el('rect', { x: 366, y: TY + 10, width: 8, height: FY - TY - 10, fill: pal.woodDark });
  k.shadow(250, FY, 110, 6);
  el('rect', { x: 150, y: TY - 4, width: 220, height: 4, fill: '#fff', stroke: pal.line });
  const ruler = g({});
  el('rect', { x: -80, y: -12, width: 160, height: 12, rx: 2, fill: pal.yellow, stroke: pal.yellowDark, 'stroke-width': 1.5 }, ruler);
  for (let i = -7; i <= 7; i++) el('line', { x1: i * 10, y1: -12, x2: i * 10, y2: i % 2 ? -8 : -5, stroke: pal.yellowDark }, ruler);
  tf(ruler, 260, TY - 4 - 3);
  const ln = el('line', { x1: 190, y1: TY - 4, x2: 190, y2: TY - 4, stroke: pal.blueDark, 'stroke-width': 3, 'stroke-linecap': 'round' });
  const pen = g({}); el('rect', { x: -2.5, y: -22, width: 5, height: 20, fill: pal.red }, pen); el('path', { d: 'M -2.5 -2 L 2.5 -2 L 0 5 Z', fill: '#E8C9A0' }, pen);
  const b = k.buddy({ x: 100, y: FY, scale: 1 });
  return {
    update(t) {
      const dr = easeInOut(seg(t, 1.1, 2.9)), x = lerp(100, 142, dr) - 0 + 10 * 0;
      const px = lerp(190, 330, dr), pre = easeOut(seg(t, 0, 0.9));
      const bx = px - 53;
      P(b, { x: bx, armR: aim(bx, FY, 1, 1, px, TY - 6), armL: 14, lean: 6, look: 0.6, mood: t > 3.0 ? 'grin' : 'smile', blink: blinkAt(t) });
      const h = b.handPos('R');
      tf(pen, h.x - 1, h.y + 1, 10);
      k.set(ln, { x2: h.x + 2, y2: TY - 4, opacity: dr > 0 ? 1 : 0 });
      tf(ruler, 260, lerp(TY - 50, TY - 7, easeIn(pre)));
    }
  };
}
