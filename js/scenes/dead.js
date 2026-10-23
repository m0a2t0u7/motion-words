// dead：花瓶の花が枯れている。まめが近づいてのぞくと、しおれた花から花びらが1枚落ちて、まめがしょんぼりする（例文 The flowers in the vase are dead.）
import { seg, lerp, easeInOut, easeOut, easeIn, hump } from '../ease.js';
import { P, blinkAt, walkTo } from './run-after.js';
import { roomBg, desk } from './look-over.js';

export const meta = { duration: 4.2, beats: [[0, '花瓶の花'], [1.4, 'のぞく'], [2.8, '枯れている']] };

export function create(k) {
  const { el, g, tf } = k;
  const FY = roomBg(k, 'home', 240);
  desk(k, 220, 130, 196);
  // 花瓶（机の上に置く）
  const VX = 285, VY = 196;
  el('path', { d: `M ${VX - 14} ${VY} L ${VX - 18} ${VY - 34} Q ${VX - 18} ${VY - 46} ${VX - 8} ${VY - 48} L ${VX + 8} ${VY - 48} Q ${VX + 18} ${VY - 46} ${VX + 18} ${VY - 34} L ${VX + 14} ${VY} Z`, fill: '#8FB8E8' });
  el('rect', { x: VX - 9, y: VY - 52, width: 18, height: 6, rx: 3, fill: '#7AA6DA' });
  // しおれた花（茶色の茎が垂れ下がる）
  const stems = [[-6, -14, '#A08060'], [0, 0, '#9A7A58'], [6, 14, '#A08060']].map(([dx, lean, col]) => {
    const s = g({});
    el('path', { d: 'M 0 0 Q 2 -30 0 -44 Q -2 -54 10 -58', stroke: col, 'stroke-width': 3, fill: 'none', 'stroke-linecap': 'round' }, s);
    el('circle', { cx: 12, cy: -56, r: 7, fill: '#B89A7A' }, s);
    el('ellipse', { cx: 18, cy: -52, rx: 5, ry: 3, fill: '#A88A6A', transform: 'rotate(40 18 -52)' }, s);
    el('path', { d: 'M -2 -24 q -10 4 -12 12', stroke: '#9C8A5E', 'stroke-width': 2.5, fill: 'none', 'stroke-linecap': 'round' }, s);
    return { s, dx, lean };
  });
  const petal = el('ellipse', { rx: 4.5, ry: 2.8, fill: '#B89A7A' });
  const me = k.buddy({ x: 60, y: FY, scale: 0.9 });
  const xf = (t) => lerp(60, 190, easeInOut(seg(t, 0.4, 1.8)));
  return {
    update(t) {
      const sway = Math.sin(t * 1.3) * 1.5;
      stems.forEach(({ s, dx, lean }) => tf(s, VX + dx, VY - 48, lean + sway, 1, 1));
      // 花びらが1枚、ひらひら落ちる（2.0〜3.2秒）
      const q = seg(t, 2.0, 3.2);
      const px = lerp(VX + 16, VX + 34, q) + Math.sin(q * 9) * 5, py = lerp(VY - 102, VY - 2, easeIn(q));
      tf(petal, px, py, q * 200);
      petal.setAttribute('opacity', q > 0 ? 1 : 0);
      const w = walkTo(xf, t, 60);
      const peek = easeOut(seg(t, 1.8, 2.3)), sad = t > 3.0;
      P(me, { x: w.x, walk: w.walk, armL: w.armL, armR: lerp(w.armR, 60, peek), lean: w.lean + 10 * peek - (sad ? 4 : 0), look: 0.8, mood: sad ? 'sad' : peek > 0.5 ? 'open' : 'smile', blink: blinkAt(t), squash: sad ? 1 - 0.04 * hump(seg(t, 3.0, 3.6)) : 1 });
    }
  };
}
