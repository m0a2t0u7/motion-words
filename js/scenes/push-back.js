// push back：机に向かって座っていたまめが、机の端を両手で押し、いすごと後ろへ下がる（例文 He pushed back his chair from the desk.）
import { seg, lerp, easeInOut, easeOut, wobble, clamp } from '../ease.js';
import { reach } from './dig.js';

export const meta = { duration: 3.6, beats: [[0, '机に向かう'], [1.2, '机を押す'], [2.6, 'いすが下がった']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 240, mood: 'indoor' });
  el('rect', { x: 40, y: 50, width: 90, height: 66, rx: 6, fill: '#DDEFFA', stroke: '#fff', 'stroke-width': 5 });
  // 机（静止）
  el('rect', { x: 240, y: 168, width: 150, height: 10, rx: 3, fill: pal.wood });
  el('rect', { x: 372, y: 178, width: 8, height: 62, fill: pal.woodDark });
  el('rect', { x: 250, y: 178, width: 8, height: 62, fill: pal.woodDark });
  el('rect', { x: 300, y: 132, width: 56, height: 36, rx: 4, fill: '#C9D0DB' });
  el('rect', { x: 324, y: 160, width: 8, height: 8, fill: '#9AA3B2' });
  k.shadow(315, 241, 70, 4);
  // いす（キャスター付き）
  const chair = g({});
  const csh = k.shadow(0, 1, 34, 4, chair);
  el('rect', { x: -26, y: -54, width: 52, height: 8, rx: 4, fill: pal.blueDark }, chair);
  el('rect', { x: -32, y: -104, width: 10, height: 56, rx: 5, fill: pal.blue }, chair);
  el('rect', { x: -2, y: -46, width: 5, height: 30, fill: '#8C96A8' }, chair);
  el('path', { d: 'M -22 -12 L 24 -12', stroke: '#8C96A8', 'stroke-width': 5, 'stroke-linecap': 'round' }, chair);
  const wh = [-20, 22].map((x) => el('circle', { cx: x, cy: -6, r: 6, fill: pal.ink }, chair));
  const B = k.buddy({ x: 0, y: 0, scale: 0.75, parent: chair });
  // 座っている：脚を前へ
  const legs = B.g.children[1].children;
  return {
    update(t) {
      const push = easeOut(seg(t, 1.0, 1.6));
      const roll = seg(t, 1.05, 2.4);
      const X0 = 210, X1 = 130;
      const x = lerp(X0, X1, 1 - Math.pow(1 - roll, 2.6)) + 2 * wobble(seg(t, 2.3, 2.9), 1.5, 5);
      tf(chair, x, FY);
      wh.forEach((w, i) => k.set(w, { 'stroke-dasharray': '3 3', stroke: '#fff', 'stroke-width': 1.5, transform: `rotate(${-(X0 - x) * 9} ${i ? 22 : -20} -6)` }));
      const tilt = -8 * Math.sin(seg(t, 1.0, 1.8) * Math.PI);
      B.pose({ x: 0, y: -46, lean: lerp(10, 0, roll) + tilt, mood: t > 2.4 ? 'grin' : 'flat', look: 0.6 });
      legs[0].setAttribute('transform', 'translate(-12 -14) rotate(-80)');
      legs[1].setAttribute('transform', 'translate(12 -14) rotate(-80)');
      // 手は机の端へ（押し終わると離す）
      const ex = 246, ey = 170;
      const aR = reach(B, 0.75, 'R', ex - x, ey - FY), aL = reach(B, 0.75, 'L', ex - 2 - x, ey + 4 - FY);
      const on = 1 - seg(t, 1.5, 2.0);
      B.pose({ armR: lerp(30, aR, on * seg(t, 0.3, 0.8)), armL: lerp(20, aL, on * seg(t, 0.3, 0.8)) });
    }
  };
}
