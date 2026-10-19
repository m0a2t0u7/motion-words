// step：階段を下りるまめに、下の友だちが「最後の一段に気をつけて」と知らせ、まめは慎重に下りる（例文 Be careful of the last step.）
import { seg, lerp, easeInOut, easeOut, wobble, hump } from '../ease.js';
import { reach } from './dig.js';
import { P, blinkAt } from './run-after.js';
import { say } from './look-over.js';

export const meta = { duration: 4.4, beats: [[0, '階段を下りる'], [1.4, '最後の段に注意'], [2.9, 'そっと下りる']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  el('rect', { x: 250, y: 50, width: 80, height: 62, rx: 6, fill: '#DDEFFA', stroke: '#fff', 'stroke-width': 5 });
  // 階段（左上から右下へ）
  const R = 20, T = 40;
  el('path', { d: `M 0 ${FY - 80} L 90 ${FY - 80} L 90 ${FY - 60} L 130 ${FY - 60} L 130 ${FY - 40} L 170 ${FY - 40} L 170 ${FY - 20} L 210 ${FY - 20} L 210 ${FY} L 0 ${FY} Z`, fill: pal.wood });
  for (let i = 0; i < 4; i++) {
    const x0 = i === 0 ? 0 : 90 + (i - 1) * T, x1 = 90 + i * T, y = FY - 80 + i * R;
    el('rect', { x: x0, y: y, width: x1 - x0 + 2, height: 5, fill: pal.woodDark });
  }
  el('rect', { x: 0, y: FY - 160, width: 6, height: 80, fill: pal.woodDark });
  el('line', { x1: 3, y1: FY - 116, x2: 196, y2: FY - 50, stroke: pal.woodDark, 'stroke-width': 4, 'stroke-linecap': 'round' });
  // 最後の一段（光る）
  const last = el('rect', { x: 170, y: FY - 20, width: 40, height: 20, fill: pal.yellow, opacity: 0 });
  const edge = el('rect', { x: 170, y: FY - 21, width: 42, height: 5, fill: pal.yellowDark, opacity: 0 });
  const S = 0.78;
  const fr = k.buddy({ x: 320, y: FY, scale: 0.95, facing: -1, color: pal.coral, dark: pal.coralDark });
  const me = k.buddy({ x: 46, y: FY - 80, scale: S });
  const bub = say(k, 40, 38, 1);
  k.text(0, 1, '!', { 'font-size': 26, fill: pal.red }, bub.g);
  // 立つ位置と、跳ぶ時刻
  const P0 = [[46, FY - 80], [110, FY - 60], [150, FY - 40], [190, FY - 20], [246, FY]];
  const H = [[0.4, 0.8], [0.9, 1.3], [1.9, 2.6], [3.0, 3.5]];
  return {
    update(t) {
      let x = P0[0][0], y = P0[0][1], lift = 0, land = 0;
      H.forEach(([a, b], i) => {
        const p = seg(t, a, b);
        if (t >= a) { const e = easeInOut(p); x = lerp(P0[i][0], P0[i + 1][0], e); y = lerp(P0[i][1], P0[i + 1][1], e); lift = (i >= 2 ? 6 : 9) * hump(p); }
        if (t > b) land = Math.max(land, wobble(seg(t, b, b + 0.4), 2, 6));
      });
      const careful = seg(t, 1.6, 2.0) * (1 - seg(t, 3.5, 3.8));
      P(me, { x, y, lift, squash: 1 - 0.06 * land, armL: 8 + 62 * careful, armR: 8 + 62 * careful, lean: 8 * careful,
        look: careful > 0.3 ? 0.9 : 0.4, mood: careful > 0.3 ? 'flat' : t > 3.6 ? 'grin' : 'smile', blink: blinkAt(t) });
      // 友だち：段を指さして知らせる
      const warn = easeOut(seg(t, 1.2, 1.5)) * (1 - easeInOut(seg(t, 3.5, 3.9)));
      P(fr, { x: 320, facing: -1, lean: 4 * warn, look: 0.5, mood: warn > 0.5 ? 'open' : 'smile', blink: blinkAt(t, 1) });
      fr.pose({ armR: lerp(8, reach(fr, 0.95, 'R', 200, FY - 22), warn) });
      bub.show(seg(t, 1.2, 1.5) * (1 - seg(t, 3.4, 3.6)), 290, 116);
      const gl = warn * (0.6 + 0.4 * Math.sin(t * 9));
      last.setAttribute('opacity', 0.45 * gl); edge.setAttribute('opacity', gl);
    }
  };
}
