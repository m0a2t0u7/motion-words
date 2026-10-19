// checkup：歯医者のいすで口を開け、歯科医が鏡で歯を一本ずつ点検し、チェック表に印がつく（例文 I go to the dentist for a checkup every year.）
import { seg, lerp, easeInOut, easeOut, hump, backOut } from '../ease.js';
import { doctor, lie, medRoom } from './surgery.js';
import { hp, reach } from './dig.js';
import { mark } from './so-far-so-good.js';

export const TOOTH = 'M -8 -8 Q -8 -12 -4 -12 Q 0 -10 4 -12 Q 8 -12 8 -8 Q 8 0 5 9 Q 3 11 2 4 Q 0 1 -2 4 Q -3 11 -5 9 Q -8 0 -8 -8 Z';
export const meta = { duration: 4.4, beats: [[0, '歯医者のいす'], [1.0, '歯を点検'], [3.2, '異常なし']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = medRoom(k, 238);
  // 歯のポスター
  el('rect', { x: 26, y: 40, width: 60, height: 74, rx: 4, fill: '#fff', stroke: pal.line, 'stroke-width': 2 });
  const tt = el('path', { d: TOOTH, fill: '#fff', stroke: pal.blue, 'stroke-width': 2 }); tf(tt, 56, 72, 0, 1.8);
  // ライト
  el('line', { x1: 230, y1: 0, x2: 214, y2: 52, stroke: '#9AA4B4', 'stroke-width': 4 });
  el('ellipse', { cx: 210, cy: 58, rx: 22, ry: 10, fill: '#C9D2DE' });
  el('path', { d: 'M 192 62 L 150 130 L 210 130 L 228 62 Z', fill: '#FFF7D6', opacity: 0.55 });
  // 歯科用のいす（背もたれを倒した形）
  el('path', { d: 'M 104 132 L 128 116 L 200 178 L 186 192 Z', fill: '#6FB6D9' });
  el('rect', { x: 180, y: 176, width: 86, height: 18, rx: 8, fill: '#6FB6D9' });
  el('rect', { x: 206, y: 194, width: 14, height: FY - 194, fill: '#9AA4B4' });
  el('rect', { x: 186, y: FY - 6, width: 54, height: 6, rx: 3, fill: '#9AA4B4' });
  k.shadow(213, FY + 1, 50, 4);
  const P = lie(k, { scale: 0.9 });
  const dr = k.buddy({ x: 268, y: FY, scale: 1, facing: -1, color: pal.coral, dark: pal.coralDark });
  doctor(k, dr, { mask: true });
  const mir = g({});
  el('line', { x1: 0, y1: 0, x2: -18, y2: 0, stroke: '#AEB7C4', 'stroke-width': 3, 'stroke-linecap': 'round' }, mir);
  el('circle', { cx: -21, cy: 0, r: 4, fill: '#DCE6EF', stroke: '#AEB7C4', 'stroke-width': 1.5 }, mir);
  // チェック表
  const card = g({});
  el('rect', { x: -34, y: -42, width: 68, height: 84, rx: 6, fill: '#fff', stroke: pal.line, 'stroke-width': 2 }, card);
  el('rect', { x: -12, y: -47, width: 24, height: 9, rx: 3, fill: pal.sub }, card);
  const ticks = [-20, 2, 24].map((y) => {
    const tooth = el('path', { d: TOOTH, fill: '#fff', stroke: pal.sub, 'stroke-width': 1.5 }, card); tf(tooth, -18, y, 0, 0.8);
    el('line', { x1: -4, y1: y, x2: 22, y2: y, stroke: pal.line, 'stroke-width': 3, 'stroke-linecap': 'round' }, card);
    return mark(k, 'check', card, 1);
  });
  return {
    update(t) {
      const sit = easeInOut(seg(t, 3.3, 3.8));
      P.set(200, 176, lerp(-62, -20, sit));
      const open = t > 0.8 && t < 3.0;
      P.b.pose({ mood: open ? 'open' : sit > 0.5 ? 'grin' : 'smile', look: 0.3, armL: 10, armR: 10, blink: t > 3.9 && t < 4.05 ? 1 : 0 });
      const rot = (lerp(-62, -20, sit) * Math.PI) / 180, s = 0.9, mx = 0, my = (12 - 53) * s;
      const mouth = { x: 200 + mx * Math.cos(rot) - my * Math.sin(rot) + 6, y: 176 + mx * Math.sin(rot) + my * Math.cos(rot) + 4 };
      const work = easeInOut(seg(t, 0.6, 1.0)) * (1 - easeInOut(seg(t, 2.9, 3.2)));
      const jig = 3 * Math.sin(seg(t, 1.0, 2.9) * Math.PI * 6);
      dr.pose({ lean: 16 * work, look: 0.7, armR: lerp(8, reach(dr, 1, 'R', mouth.x + 20 + jig, mouth.y - 14), work), armL: 8 + 40 * hump(seg(t, 3.2, 3.9)), mood: 'smile' });
      const h = hp(dr, 1, 'R', 28);
      tf(mir, h.x, h.y, 0, work > 0.02 ? 1 : 0.001);
      const cp = seg(t, 1.1, 1.4);
      tf(card, 336, 106, 0, cp <= 0 ? 0.001 : backOut(cp) * 0.95);
      ticks.forEach((m, i) => { const q = seg(t, 1.7 + i * 0.5, 1.95 + i * 0.5); tf(m, 0, [-20, 2, 24][i], 0, q <= 0 ? 0.001 : backOut(q) * 1.1); });
      tf(card, 336, 106, 0, cp <= 0 ? 0.001 : backOut(cp) * 0.95);
    }
  };
}
