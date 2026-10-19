// suit：父（まめ）がダークスーツにネクタイ姿で、ネクタイを直し、かばんを持って会社へ向かう（例文 My father always wears a dark suit and a tie to work.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';
import { top } from './shirt.js';
import { hp, gait } from './dig.js';
import { streetBg } from './weigh.js';

export const meta = { duration: 4.2, beats: [[0, 'ネクタイを直す'], [1.3, 'かばんを持つ'], [2.2, '会社へ向かう']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = streetBg(k, 236);
  // 会社のビル（右）
  el('rect', { x: 286, y: 40, width: 120, height: FY - 40, fill: '#C8D4E2' });
  for (let r = 0; r < 5; r++) for (let c = 0; c < 3; c++) el('rect', { x: 296 + c * 34, y: 52 + r * 26, width: 26, height: 18, rx: 2, fill: '#E8F1F9' });
  el('rect', { x: 314, y: FY - 54, width: 50, height: 54, fill: '#9FB8D2', stroke: '#fff', 'stroke-width': 3 });
  el('line', { x1: 339, y1: FY - 54, x2: 339, y2: FY, stroke: '#fff', 'stroke-width': 2 });
  const S = 1.06, b = k.buddy({ x: 96, y: FY, scale: S });
  const SU = '#2F3A55', SD = '#1D2539';
  top(k, b, 'suit', SU, SD, { sleeve: SU, legs: SU, tie: '#C2414B' });
  const bag = g({});
  el('rect', { x: -14, y: 6, width: 28, height: 20, rx: 3, fill: pal.coffee }, bag);
  el('path', { d: 'M -6 6 V 2 H 6 V 6', fill: 'none', stroke: '#5E3B25', 'stroke-width': 3 }, bag);
  el('rect', { x: -14, y: 13, width: 28, height: 2.5, fill: '#5E3B25' }, bag);
  const bsh = k.shadow(130, FY + 1, 14, 3);
  const xf = (t) => lerp(96, 300, easeInOut(seg(t, 2.0, 4.0)));
  return {
    update(t) {
      const tie = hump(seg(t, 0.1, 1.15)), wig = Math.sin(seg(t, 0.35, 0.95) * Math.PI * 4) * 4;
      const pick = easeInOut(seg(t, 1.2, 1.6)), rise = easeInOut(seg(t, 1.6, 1.95));
      const p = gait(xf, t, 96);
      const lean = 22 * pick * (1 - rise) + p.lean;
      const armR = t < 1.2 ? lerp(8, -58 + wig, tie) : t < 2.0 ? lerp(8, 34, pick) * (1 - rise) + 10 * rise : 10 + (p.armR - 8) * 0.4;
      b.pose({ x: p.x, walk: p.walk, lean, armR, armL: p.armL, look: tie > 0.3 ? -0.3 : 0.5, mood: t > 1.9 ? 'smile' : 'flat', squash: 1 - 0.04 * hump(seg(t, 1.2, 1.9)) });
      const h = hp(b, S, 'R', 28);
      const att = t > 1.55;
      if (att) tf(bag, h.x, h.y - 6, 0, S);
      else tf(bag, 130, FY - 26, 0, S);
      bsh.setAttribute('opacity', att ? 0 : 1);
    }
  };
}
