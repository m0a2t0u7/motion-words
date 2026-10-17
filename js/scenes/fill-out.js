// fill out：ボードの用紙の空欄に、まめがペンで1つずつ書き込んでいく（例文 Please fill out this form.）
import { seg, lerp, easeInOut, easeOut, backOut, clamp } from '../ease.js';

export const meta = { duration: 4.2, beats: [[0, '空欄の用紙'], [1.1, '書き込む'], [3.4, 'すべて記入']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  el('rect', { x: 36, y: 44, width: 70, height: 60, rx: 6, fill: '#DDEFFA' });
  el('line', { x1: 71, y1: 44, x2: 71, y2: 104, stroke: '#fff', 'stroke-width': 4 });
  // 立て看板（イーゼル）
  k.shadow(332, FY, 64, 7);
  [[286, 220, 270, FY - 2], [378, 220, 394, FY - 2]].forEach(([x1, y1, x2, y2]) => el('line', { x1, y1, x2, y2, stroke: pal.woodDark, 'stroke-width': 7, 'stroke-linecap': 'round' }));
  el('rect', { x: 270, y: 96, width: 122, height: 128, rx: 8, fill: pal.wood });
  el('rect', { x: 278, y: 104, width: 106, height: 112, rx: 4, fill: '#fff' });
  el('rect', { x: 286, y: 128, width: 50, height: 5, rx: 2.5, fill: pal.line });
  el('rect', { x: 286, y: 138, width: 70, height: 5, rx: 2.5, fill: pal.line });
  el('rect', { x: 316, y: 98, width: 30, height: 10, rx: 4, fill: pal.woodDark });
  el('rect', { x: 286, y: 112, width: 62, height: 9, rx: 4, fill: pal.blue });
  const rows = [160, 180, 200];
  const inks = [];
  const shapes = ['q 3 -9 6 0 t 6 0 t 6 0 q 3 -6 6 0', 'q 2 -8 4 0 t 4 0 q 3 -9 6 0 t 6 0', 'q 3 -7 6 0 t 6 0 t 6 0 t 6 0'];
  rows.forEach((y, i) => {
    el('rect', { x: 286, y: y - 14, width: 90, height: 20, rx: 4, fill: '#F3F6FA' });
    el('line', { x1: 288, y1: y + 6, x2: 374, y2: y + 6, stroke: pal.line, 'stroke-width': 1.5 });
    el('rect', { x: 340, y: y - 4, width: 28, height: 6, rx: 3, fill: pal.line });
    inks.push(el('path', { d: `M 290 ${y} ${shapes[i]}`, fill: 'none', stroke: pal.blueDark, 'stroke-width': 2.2, 'stroke-linecap': 'round', pathLength: 1, 'stroke-dasharray': 1, 'stroke-dashoffset': 1 }));
  });
  const ok = g({});
  el('circle', { cx: 0, cy: 0, r: 13, fill: pal.green }, ok);
  el('path', { d: 'M -6 0 L -2 5 L 7 -5', stroke: '#fff', 'stroke-width': 3.2, fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, ok);

  const S = 1.05;
  const b = k.buddy({ x: 220, y: FY, scale: S });
  const pen = g({});
  el('line', { x1: 0, y1: 0, x2: 11, y2: -17, stroke: pal.coralDark, 'stroke-width': 4, 'stroke-linecap': 'round' }, pen);
  el('circle', { cx: 0, cy: 0, r: 1.8, fill: pal.ink }, pen);

  const W0 = [290, 288, 290], WL = [30, 26, 24];
  const T = [[0.8, 1.6], [1.8, 2.5], [2.7, 3.4]];
  return {
    update(t) {
      // ペン先の目標位置（今どの行をどこまで書いているか）
      let tx = 288, ty = 180, writing = false, row = 0;
      T.forEach(([a, c], i) => {
        const p = seg(t, a, c);
        inks[i].setAttribute('stroke-dashoffset', 1 - easeInOut(p));
        if (t >= a - 0.25) row = i;
      });
      const [a0, c0] = T[row];
      const p = seg(t, a0, c0);
      writing = t >= a0 && t < c0;
      const y = rows[row];
      const prevY = row > 0 ? rows[row - 1] : 168;
      const prevX = row > 0 ? W0[row - 1] + WL[row - 1] : 282;
      const mv = easeInOut(seg(t, a0 - 0.25, a0));
      tx = lerp(prevX, W0[row] + WL[row] * easeInOut(p), mv);
      ty = lerp(prevY, y, mv) + (writing ? Math.sin(t * 38) * 1.6 : 0);
      if (t > 3.4) { tx = lerp(tx, 262, easeInOut(seg(t, 3.4, 3.9))); ty = lerp(ty, 204, easeInOut(seg(t, 3.4, 3.9))); }
      const sh = FY - 56 * S, arm = 26 * S;
      const c = clamp((ty - sh) / arm, -1, 1);
      const a = (Math.acos(c) * 180) / Math.PI;
      const bx = tx - (27 + 26 * Math.sin((a * Math.PI) / 180)) * S;
            b.pose({ x: t < 0.5 ? lerp(bx, 190, 1 - easeInOut(seg(t, 0, 0.5))) : bx, armR: lerp(a, 20, t < 0.5 ? 1 - easeInOut(seg(t, 0, 0.5)) : 0), armL: 8, lean: writing ? 5 : 2, look: 0.7, mood: t > 3.4 ? 'grin' : 'smile', blink: t > 2.5 && t < 2.6 ? 1 : 0 });
      const h = b.handPos('R');
      tf(pen, h.x - 1, h.y + 2, 0, 1);
      pen.setAttribute('opacity', 1);
      const okp = seg(t, 3.5, 3.95);
      tf(ok, 358, 128, 0, okp > 0 ? backOut(okp) : 0.001);
    }
  };
}
