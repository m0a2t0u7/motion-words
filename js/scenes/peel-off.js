// peel off：ノートパソコンに貼ったシールを、まめが端からゆっくりはがしていく（例文 Peel off the sticker slowly.）
import { seg, lerp, easeInOut, easeOut, clamp } from '../ease.js';
import { reach } from './dig.js';

export const meta = { duration: 4.2, beats: [[0, '貼ったシール'], [1.4, '端からゆっくり'], [3.4, 'はがれた']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 240, mood: 'indoor' });
  el('rect', { x: 150, y: 206, width: 250, height: 10, rx: 3, fill: pal.wood });
  el('rect', { x: 370, y: 216, width: 8, height: 24, fill: pal.woodDark });
  // ノートパソコン（ふたの外側が見えている）
  el('path', { d: 'M 200 206 L 360 206 L 352 200 L 208 200 Z', fill: '#9AA3B2' });
  el('rect', { x: 210, y: 100, width: 140, height: 100, rx: 8, fill: '#C9D0DB' });
  // シール：はがれていない部分（右側）とめくれた部分（左端を軸に上へ）
  const SX = 250, SY = 130, SW = 60, SH = 40;
  const mark = el('rect', { x: SX, y: SY, width: SW, height: SH, rx: 6, fill: '#B9C1CD' }); // のり跡
  const stuck = el('rect', { x: SX, y: SY, width: SW, height: SH, rx: 6, fill: pal.yellow });
  const star = el('path', { d: 'M 0 -10 L 3 -3 L 10 -3 L 4 2 L 6 10 L 0 5 L -6 10 L -4 2 L -10 -3 L -3 -3 Z', fill: pal.coral, transform: `translate(${SX + 30} ${SY + 20})` });
  const flap = el('rect', { x: 0, y: 0, width: 0, height: SH, rx: 4, fill: '#F5E2A6' });
  const B = k.buddy({ x: 140, y: FY, scale: 0.95 });
  return {
    update(t) {
      // 左端をつまむ→少しずつ右へめくる（はがれた分は手前に折り返して手と一緒に動く）
      const p = easeInOut(seg(t, 1.0, 3.4));
      const peeled = SW * p;
      const off = seg(t, 3.4, 3.8);
      k.set(stuck, { x: SX + peeled, width: Math.max(0, SW - peeled), opacity: 1 });
      k.set(star, { opacity: p < 0.5 ? 1 : 0 });
      // めくれた部分：はがし線（x = SX + peeled）から左上へ伸びる
      const lx = SX + peeled, ang = lerp(160, 200, p);
      const fw = Math.max(2, peeled);
      k.set(flap, { width: fw, transform: `translate(${lx + off * -24} ${SY - off * 14}) rotate(${-(180 - ang)}) translate(${-fw} 0)`, opacity: t > 1.0 ? 1 : 0 });
      const a = (-(180 - ang) * Math.PI) / 180;
      const tip = t < 1.0 ? { x: SX + 2, y: SY + SH / 2 } : { x: lx - fw * Math.cos(a) - off * 24, y: SY + SH / 2 - fw * Math.sin(a) - off * 14 };
      B.pose({ armR: reach(B, 0.95, 'R', lerp(200, tip.x, easeOut(seg(t, 0.2, 1.0))), lerp(220, tip.y, easeOut(seg(t, 0.2, 1.0)))), armL: 12, lean: 6, look: 0.8, mood: t > 3.5 ? 'grin' : 'flat', squash: 1 });
    }
  };
}
