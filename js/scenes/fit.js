// fit：床にそろえた靴に、まめが足を入れる。ちょうどよく収まり、満足する（例文 These shoes fit me well.）
import { seg, lerp, easeInOut, easeOut, backOut, wobble, hump } from '../ease.js';
import { gait } from './dig.js';

export const meta = { duration: 4.2, beats: [[0, '靴を見る'], [1.3, '足を入れる'], [2.8, 'ぴったり']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  el('rect', { x: 60, y: 48, width: 76, height: 64, rx: 6, fill: '#DDEFFA', stroke: '#fff', 'stroke-width': 5 });
  el('rect', { x: 0, y: FY, width: 400, height: 64, fill: '#F0E4D2' });
  for (let x = 0; x < 400; x += 50) el('line', { x1: x, y1: FY, x2: x - 14, y2: 300, stroke: pal.wood, 'stroke-width': 2, opacity: 0.6 });
  el('rect', { x: 0, y: FY, width: 400, height: 3, fill: pal.woodDark, opacity: 0.4 });
  // 靴箱
  const bx = g({}); tf(bx, 320, FY + 14);
  el('rect', { x: -30, y: -8, width: 60, height: 22, rx: 3, fill: pal.coral }, bx); el('rect', { x: -32, y: -14, width: 64, height: 8, rx: 3, fill: pal.coralDark }, bx);
  const b = k.buddy({ x: 120, y: FY + 5 });
  const shoe = (c) => { const n = g({}); el('ellipse', { cx: 2, cy: 1, rx: 20, ry: 3.5, fill: pal.shadow }, n); el('path', { d: 'M -16 1 L -16 -10 Q -14 -13 -7 -12 L 3 -9 Q 14 -8 19 -2 L 19 1 Z', fill: c }, n); el('rect', { x: -17, y: -2, width: 37, height: 4, rx: 2, fill: '#fff', stroke: pal.line, 'stroke-width': 1 }, n); [-2, 4].forEach((x) => el('line', { x1: x, y1: -9, x2: x + 3, y2: -6, stroke: '#fff', 'stroke-width': 2, 'stroke-linecap': 'round' }, n)); return n; };
  const sL = shoe(pal.blueDark), sR = shoe(pal.blue);
  const ring = el('ellipse', { cx: 215, cy: FY + 8, rx: 40, ry: 8, fill: 'none', stroke: pal.green, 'stroke-width': 3 });
  const ck = g({}); tf(ck, 215, 120);
  el('circle', { r: 17, fill: pal.green }, ck); el('path', { d: 'M -8 0 L -2 6 L 9 -7', stroke: '#fff', 'stroke-width': 4.5, fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, ck);
  const DX = 215, Y0 = FY + 5;
  return {
    update(t) {
      const cr = hump(seg(t, 0.9, 1.3)) * 0.5, jp = seg(t, 1.3, 2.1), land = seg(t, 2.1, 2.9);
      const x = lerp(120, DX, easeInOut(jp)), lift = 54 * Math.sin(jp * Math.PI), sq = 1 - 0.14 * cr - 0.12 * Math.max(0, 1 - Math.abs(land - 0.05) * 10) * (t > 2.0 ? 1 : 0) + 0.02 * wobble(land, 2.5, 4) * (t > 2.1 ? 1 : 0);
      const pr = seg(t, 2.9, 3.4);
      b.pose({ x, y: Y0, lift, squash: sq, armL: lerp(8, 60, jp) * (1 - pr) + 135 * pr, armR: lerp(8, 60, jp) * (1 - pr) + 135 * pr, mood: t > 2.5 ? 'grin' : 'smile', look: 0.6 });
      // 靴：体が降りてくるまで床に置いてあり、収まったら足を包む
            const squeeze = Math.max(0, wobble(seg(t, 2.1, 3.0), 3, 5)) * 0.12;
      tf(sL, DX - 17, Y0 + 6, 0, 1.45 * (1 + squeeze * 0.6), 1.45 * (1 - squeeze)); tf(sR, DX + 13, Y0 + 6, 0, 1.45 * (1 + squeeze * 0.6), 1.45 * (1 - squeeze));
      k.set(ring, { opacity: pr * (1 - seg(t, 3.8, 4.2)), rx: 30 + 18 * pr });
      const c = backOut(seg(t, 3.0, 3.5), 1.6); tf(ck, DX, 112 - 4 * Math.sin(t * 4), 0, c + 0.001);
    }
  };
}
