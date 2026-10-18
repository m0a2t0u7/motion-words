// on one's own：まめが誰の手も借りずに、板を1枚ずつ自分で棚にはめていき、棚が完成する（例文 She built the shelf on her own.）
import { seg, lerp, easeInOut, easeOut, hump, wobble } from '../ease.js';
import { P, reach, held, drop } from './in-common.js';

export const meta = { duration: 4.4, beats: [[0, '板を取る'], [1.4, '自分ではめる'], [3.6, 'ひとりで完成']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 240, mood: 'indoor' });
  el('rect', { x: 0, y: FY - 6, width: 400, height: 6, fill: pal.line });
  el('rect', { x: 40, y: 44, width: 84, height: 64, rx: 6, fill: '#DDEFFA', stroke: '#fff', 'stroke-width': 5 });
  // 板の山（床）
  const pile = [0, 1, 2].map((i) => { const b = el('rect', { x: 76, y: FY - 6 - i * 6, width: 64, height: 6, rx: 2, fill: pal.wood, stroke: pal.woodDark, 'stroke-width': 1 }); return b; });
  // 棚の側板（立っている）
  k.shadow(298, FY, 50, 4);
  el('rect', { x: 256, y: 116, width: 8, height: FY - 116, fill: pal.woodDark });
  el('rect', { x: 332, y: 116, width: 8, height: FY - 116, fill: pal.woodDark });
  el('rect', { x: 264, y: 116, width: 68, height: FY - 116, fill: '#F1E4CF' });
  const levels = [212, 172, 132];
  const placed = levels.map((y) => el('rect', { x: 264, y, width: 68, height: 6, rx: 1, fill: pal.wood, stroke: pal.woodDark, 'stroke-width': 1 }));
  const A = k.buddy({ x: 196, y: FY, scale: 0.9 });
  const board = g({}); el('rect', { x: -32, y: -3, width: 64, height: 6, rx: 2, fill: pal.wood, stroke: pal.woodDark, 'stroke-width': 1 }, board);
  const sw = drop(k);
  const C = 1.1, T0 = 0.2;
  return {
    update(t) {
      const n = Math.min(3, Math.max(0, Math.floor((t - T0) / C)));
      const u = ((t - T0) % C) / C, active = t > T0 && n < 3;
      // 0〜0.3: 山から取る（後ろ向き）、0.3〜0.5: 振り向く、0.5〜0.8: はめる
      const pickP = hump(seg(u, 0, 0.35)), placeP = easeInOut(seg(u, 0.45, 0.8));
      const back = active && u < 0.4;
      P(A, { facing: back ? -1 : 1, lean: back ? 18 * pickP : 4, squash: 1 - 0.05 * pickP, look: 0.5, mood: t > 3.6 ? 'grin' : 'flat' });
      const lv = levels[Math.min(2, n)];
      if (active) {
        const tx = back ? 112 : lerp(250, 298, placeP), ty = back ? FY - 14 - 6 * (2 - n) : lerp(lv - 4, lv + 2, placeP);
        A.pose({ armR: reach(A, 0.9, 'R', tx, ty), armL: back ? 30 : 60 });
      } else if (t > 3.5) {
        const e = easeOut(seg(t, 3.5, 3.9));
        A.pose({ armR: lerp(8, 30, e), armL: lerp(8, 30, e), lean: -3 * e, lift: 4 * hump(seg(t, 3.7, 4.1)) });
      }
      const carrying = active && u > 0.2 && u < 0.8;
      const h = held(k, A, 0.9, board, 'R', 0, 28);
      if (carrying) tf(board, back ? h.x : lerp(h.x, 298, placeP * 0.6), h.y, 0); board.setAttribute('opacity', carrying ? 1 : 0);
      pile.forEach((p, i) => p.setAttribute('opacity', i < 3 - n - (active && u > 0.2 ? 1 : 0) ? 1 : 0));
      placed.forEach((p, i) => { p.setAttribute('opacity', i < n || (i === n && active && u >= 0.8) ? 1 : 0); });
      sw.setAttribute('opacity', t > 0.6 && t < 3.4 ? 1 : 0); tf(sw, A.state.x + (back ? 28 : -28), FY - 96 + 8 * ((t * 0.8) % 1));
    }
  };
}
