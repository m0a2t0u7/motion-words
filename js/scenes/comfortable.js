// comfortable：まめがふかふかのソファに腰を下ろすと、クッションが沈んで体を包み、うっとりする（例文 This sofa is very comfortable.）
import { seg, lerp, easeInOut, easeOut, hump, wobble } from '../ease.js';
import { P, blinkAt, walkTo, path, homeBg, sym, heart } from './confused.js';

export const meta = { duration: 4.2, beats: [[0, 'ソファの前'], [1.3, '座ると沈む'], [2.6, 'ふかふか快適']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 1;
  const FY = homeBg(k, { winX: 290 });
  el('rect', { x: 40, y: 50, width: 60, height: 44, rx: 3, fill: '#fff', stroke: pal.woodDark, 'stroke-width': 4 });
  el('path', { d: 'M 46 88 L 62 68 L 74 80 L 84 70 L 94 88 Z', fill: pal.green });
  // 正面向きのソファ（座面クッションは沈む）
  const SX = 200, SEAT = FY - 44;
  k.shadow(SX, FY + 2, 110, 6);
  el('rect', { x: SX - 100, y: FY - 112, width: 200, height: 76, rx: 22, fill: '#7FB3E8' });
  const cush = g({});
  el('rect', { x: -86, y: 0, width: 172, height: 26, rx: 12, fill: '#A9CDF2' }, cush);
  el('line', { x1: 0, y1: 2, x2: 0, y2: 24, stroke: '#7FB3E8', 'stroke-width': 2 }, cush);
  el('rect', { x: SX - 112, y: FY - 76, width: 30, height: 66, rx: 14, fill: '#5C93CF' });
  el('rect', { x: SX + 82, y: FY - 76, width: 30, height: 66, rx: 14, fill: '#5C93CF' });
  el('rect', { x: SX - 90, y: FY - 22, width: 180, height: 14, rx: 6, fill: '#5C93CF' });
  [SX - 90, SX + 82].forEach((x) => el('rect', { x, y: FY - 10, width: 8, height: 10, fill: pal.woodDark }));
  const b = k.buddy({ x: 380, y: FY, scale: S, facing: -1 });
  const dent = el('ellipse', { cx: SX, cy: SEAT + 2, rx: 40, ry: 0.1, fill: '#7FB3E8', opacity: 0.6 });
  const ahh = sym(k, '~', pal.violet, 40), hs = [0, 1].map(() => heart(k));
  const xf = path([[0.1, 380], [1.1, SX]]);
  return {
    update(t) {
      const w = walkTo(xf, t, 380, -1), sit = easeInOut(seg(t, 1.2, 1.7)), sink = easeOut(seg(t, 1.6, 2.2)) + 0.12 * wobble(seg(t, 1.6, 2.6), 2, 4);
      const melt = easeInOut(seg(t, 2.3, 3.0));
      const y = lerp(FY, SEAT + 12 + 8 * sink, sit);
      P(b, { x: w.x, y, walk: w.walk, facing: t > 1.15 ? 1 : -1, lean: w.lean - 8 * melt, squash: 1 - 0.08 * sink * sit + 0.04 * melt,
        armL: lerp(w.armL, 120, melt), armR: lerp(w.armR, 120, melt), mood: t > 2.2 ? 'grin' : 'smile', blink: t > 2.3 ? 1 : blinkAt(t), look: 0 });
      // 座っている間は脚が前（下）へ投げ出される
      tf(cush, SX, SEAT + 6 * sink * sit, 0, 1, 1 - 0.18 * sink * sit);
      k.set(dent, { ry: Math.max(0.1, 5 * sink * sit) });
      ahh(seg(t, 2.6, 3.0), SX + 30, FY - 150, 0);
      hs.forEach((n, i) => { const q = seg(t, 2.9 + i * 0.3, 4.1); tf(n, SX - 50 + i * 100, FY - 120 - 24 * q, 0, q > 0 ? 1.4 * easeOut(seg(q, 0, 0.3)) : 0.001); });
    }
  };
}
