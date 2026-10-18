// count out：自動販売機の横の棚で、財布から硬貨を1枚ずつ取り出し、1・2・3・4・5と並べる（例文 He counted out five coins for the machine.）
import { seg, lerp, easeInOut, easeOut, backOut, hump } from '../ease.js';
import { hp, reach, room } from './dig.js';

export const meta = { duration: 4.6, beats: [[0, '財布を出す'], [1.4, '1枚ずつ数える'], [3.8, '5枚そろった']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const R = room(k);
  // 自動販売機（右）
  el('rect', { x: 312, y: 70, width: 80, height: 126, rx: 6, fill: pal.blue });
  el('rect', { x: 320, y: 80, width: 64, height: 60, rx: 3, fill: '#CFE9F7' });
  [[326, pal.red], [346, pal.yellow], [366, pal.green]].forEach(([x, c]) => { el('rect', { x, y: 88, width: 12, height: 20, rx: 3, fill: c }); el('rect', { x, y: 114, width: 12, height: 20, rx: 3, fill: c, opacity: 0.8 }); });
  el('rect', { x: 366, y: 148, width: 8, height: 18, rx: 2, fill: pal.ink });
  k.text(352, 157, '5', { 'font-size': 12, fill: '#fff' });
  const S = 1.2;
  const b = k.buddy({ x: 140, y: 228, scale: S });
  R.front();
  const TY = 196;
  // 財布（棚の上）
  const purse = g({}); tf(purse, 184, TY);
  el('path', { d: 'M -16 0 L -16 -18 Q -16 -22 -12 -22 L 12 -22 Q 16 -22 16 -18 L 16 0 Z', fill: pal.violet }, purse);
  el('path', { d: 'M -16 -14 L 16 -14', stroke: '#fff', 'stroke-width': 2, opacity: 0.5 }, purse);
  const CX = [214, 234, 254, 274, 294];
  const coins = CX.map(() => { const c = g({}); el('ellipse', { rx: 7, ry: 7, fill: pal.yellow, stroke: pal.yellowDark, 'stroke-width': 2 }, c); el('circle', { r: 3, fill: 'none', stroke: pal.yellowDark, 'stroke-width': 1.2 }, c); return c; });
  const csh = CX.map((x) => k.shadow(x, TY + 1, 7, 1.5));
  const nums = CX.map((x, i) => k.text(x, TY - 30, String(i + 1), { 'font-size': 14, fill: pal.ink }));
  const T = (i) => 0.7 + i * 0.6;
  return {
    update(t) {
      let tx = 184, ty = TY - 18, carry = -1;
      for (let i = 0; i < 5; i++) {
        const s = T(i);
        if (t >= s) {
          const pick = easeInOut(seg(t, s, s + 0.15)), put = easeInOut(seg(t, s + 0.18, s + 0.45));
          tx = lerp(184, CX[i], put); ty = TY - 22 - 16 * hump(put) + (1 - pick) * 0 + 6 * put;
          if (put < 1) carry = i;
          if (t > s + 0.45 && i < 4) { const back = easeInOut(seg(t, s + 0.45, T(i + 1))); tx = lerp(CX[i], 184, back); ty = TY - 16 - 10 * hump(back); }
        }
      }
      if (t > T(4) + 0.5) { const r = easeInOut(seg(t, T(4) + 0.5, T(4) + 0.9)); tx = lerp(tx, 230, r); ty = lerp(ty, TY - 6, r); }
      const bx = lerp(140, 196, seg(tx, 184, 294)) ;
      b.pose({ x: bx, lean: 8, look: 0.6, mood: t > 4.0 ? 'grin' : 'flat', armL: 10 });
      b.pose({ armR: reach(b, S, 'R', tx, ty) });
      const h = hp(b, S, 'R');
      coins.forEach((c, i) => {
        const placed = t >= T(i) + 0.45, inHand = carry === i;
        const p = placed ? { x: CX[i], y: TY - 7 } : inHand ? { x: h.x + 4, y: h.y + 4 } : null;
        c.setAttribute('opacity', p ? 1 : 0); csh[i].setAttribute('opacity', placed ? 1 : 0);
        if (p) tf(c, p.x, p.y + (placed ? -2 * Math.abs(Math.sin((t - T(i) - 0.45) * 12)) * Math.exp(-(t - T(i) - 0.45) * 8) : 0));
        const q = seg(t, T(i) + 0.45, T(i) + 0.6);
        nums[i].setAttribute('opacity', q); tf(nums[i], 0, -4 * (1 - easeOut(q)));
      });
    }
  };
}
