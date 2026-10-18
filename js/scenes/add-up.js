// add up：カウンターの食べ物3つの値札を順にペンで指し、メモに 3+5+2 を書いて合計 10 を出す（例文 He added up the cost of the food.）
import { seg, lerp, easeInOut, easeOut, backOut, hump } from '../ease.js';
import { hp, reach, room } from './dig.js';

export const meta = { duration: 4.4, beats: [[0, '値段を見る'], [1.4, '足していく'], [3.4, '合計が出た']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const R = room(k);
  // 壁のメモ板
  el('rect', { x: 296, y: 40, width: 96, height: 128, rx: 4, fill: '#FFF8DC', stroke: pal.yellowDark, 'stroke-width': 2 });
  el('circle', { cx: 344, cy: 44, r: 4, fill: pal.red });
  const nums = ['3', '+5', '+2'].map((s, i) => k.text(372, 70 + i * 24, s, { 'font-size': 18, 'text-anchor': 'end', fill: pal.ink }));
  const line = el('rect', { x: 312, y: 136, width: 0, height: 3, fill: pal.ink });
  const tot = k.text(372, 154, '10', { 'font-size': 22, 'text-anchor': 'end', fill: pal.red });
  const S = 1.2;
  const b = k.buddy({ x: 140, y: 228, scale: S });
  R.front();
  // 食べ物と値札（カウンターの上、固定）
  const TY = 196, X = [196, 238, 278];
  k.shadow(X[0], TY + 1, 13, 2.5); el('circle', { cx: X[0], cy: TY - 12, r: 12, fill: pal.red }); el('path', { d: `M ${X[0]} ${TY - 24} q 4 -6 8 -4`, stroke: pal.green, 'stroke-width': 3, fill: 'none' });
  k.shadow(X[1], TY + 1, 18, 2.5); el('path', { d: `M ${X[1] - 18} ${TY} L ${X[1] - 18} ${TY - 14} Q ${X[1]} ${TY - 30} ${X[1] + 18} ${TY - 14} L ${X[1] + 18} ${TY} Z`, fill: '#E0A96D' });
  k.shadow(X[2], TY + 1, 11, 2.5); el('rect', { x: X[2] - 10, y: TY - 30, width: 20, height: 30, rx: 3, fill: '#fff', stroke: pal.blue, 'stroke-width': 2 }); el('rect', { x: X[2] - 10, y: TY - 20, width: 20, height: 8, fill: pal.blue });
  const price = ['3', '5', '2'];
  X.forEach((x, i) => { el('rect', { x: x - 9, y: TY - 52, width: 18, height: 14, rx: 3, fill: '#fff', stroke: pal.yellowDark, 'stroke-width': 1.6 }); el('line', { x1: x, y1: TY - 38, x2: x, y2: TY - 30 + (i === 1 ? 6 : 0), stroke: pal.yellowDark, 'stroke-width': 1.4 }); k.text(x, TY - 44.5, price[i], { 'font-size': 11 }); });
  const pn = g({});
  el('rect', { x: -2, y: -18, width: 4, height: 18, rx: 2, fill: pal.ink }, pn);
  const T = [0.6, 1.4, 2.2];
  return {
    update(t) {
      let tx = 190, ty = 190;
      T.forEach((s, i) => { const m = easeInOut(seg(t, s - 0.35, s)); tx = lerp(tx, X[i], m); ty = lerp(ty, TY - 58, m); });
      const tap = T.reduce((a, s) => a + hump(seg(t, s, s + 0.2)), 0);
      if (t > 2.8) { const r = easeInOut(seg(t, 2.8, 3.2)); tx = lerp(tx, 230, r); ty = lerp(ty, 160, r); }
      const bx = lerp(140, 196, easeInOut(seg(t, 0.4, 2.2)));
      b.pose({ x: bx, lean: 6, look: t > 2.9 ? 0.9 : 0.6, mood: t > 3.4 ? 'grin' : 'flat', armL: 10 });
      b.pose({ armR: reach(b, S, 'R', tx, ty + 4 * tap) });
      const h = hp(b, S, 'R', 30);
      const A = b.state.armR - b.state.lean;
      tf(pn, h.x, h.y, 180 - A);
      nums.forEach((n, i) => n.setAttribute('opacity', seg(t, T[i] + 0.1, T[i] + 0.3)));
      line.setAttribute('width', 64 * easeOut(seg(t, 2.8, 3.1)));
      const p = seg(t, 3.2, 3.5);
      tot.setAttribute('opacity', p); tf(tot, 0, -6 * (1 - easeOut(p)));
    }
  };
}
