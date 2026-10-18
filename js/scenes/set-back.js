// set back：窓の外は雨。まめは完成予定の旗をカレンダーの1週間後へ移す（例文 The rain set back the project by a week.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';
import { P, blinkAt, win } from './run-after.js';
import { reach, hp } from './weigh.js';

export const meta = { duration: 4.4, beats: [[0, '雨が続く'], [1.6, '予定をずらす'], [3.4, '1週間遅れ']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  const w = win(k, 24, 44, 110, 90, '#B9C6D6');
  // 窓の外：工事中の建物の骨組み
  [[44, 80], [74, 80], [104, 80]].forEach(([x, y]) => el('rect', { x, y, width: 4, height: 60, fill: pal.yellowDark }, w.inner));
  [96, 116].forEach((y) => el('rect', { x: 40, y, width: 72, height: 4, fill: pal.yellowDark }, w.inner));
  const drops = Array.from({ length: 12 }, () => el('line', { x1: 0, y1: 0, x2: -3, y2: 10, stroke: '#fff', 'stroke-width': 2, 'stroke-linecap': 'round' }, w.inner));
  w.frame();
  // カレンダー（7列×3行）
  const CX = 210, CY = 56, CW = 24, CH = 30;
  el('rect', { x: CX - 8, y: CY - 22, width: 7 * CW + 16, height: 3 * CH + 30, rx: 6, fill: '#fff', stroke: pal.line, 'stroke-width': 3 });
  el('rect', { x: CX - 8, y: CY - 22, width: 7 * CW + 16, height: 16, rx: 6, fill: pal.blue });
  for (let r = 0; r < 3; r++) for (let c = 0; c < 7; c++) { el('rect', { x: CX + c * CW + 1, y: CY + r * CH + 1, width: CW - 2, height: CH - 2, rx: 3, fill: '#F3F5F8' }); k.text(CX + c * CW + 7, CY + r * CH + 8, String(r * 7 + c + 3), { 'font-size': 7, fill: pal.sub }); }
  const tgt0 = { x: CX + 4 * CW + CW / 2, y: CY + 0 * CH + CH / 2 + 4 }, tgt1 = { x: tgt0.x, y: tgt0.y + CH };
  const oldMark = el('rect', { x: tgt0.x - CW / 2 + 1, y: tgt0.y - CH / 2 - 3, width: CW - 2, height: CH - 2, rx: 3, fill: 'none', stroke: pal.coral, 'stroke-width': 2, 'stroke-dasharray': '3 2', opacity: 0 });
  const plus = k.text(tgt0.x + 30, tgt0.y + CH / 2 + 2, '+7', { 'font-size': 14, fill: pal.coralDark, opacity: 0 });
  const arrow = el('path', { d: `M ${tgt0.x + 16} ${tgt0.y - 2} q 10 15 0 30`, stroke: pal.coralDark, 'stroke-width': 2.5, fill: 'none', opacity: 0 });
  const flag = g({});
  el('line', { x1: 0, y1: 0, x2: 0, y2: -18, stroke: pal.ink, 'stroke-width': 2 }, flag);
  el('path', { d: 'M 0 -18 L 12 -14 L 0 -10 Z', fill: pal.red }, flag);
  const S = 0.9;
  const b = k.buddy({ x: 160, y: FY, scale: S });
  return {
    update(t) {
      drops.forEach((d, i) => { const p = (t * 1.8 + i / 12) % 1; tf(d, 30 + (i * 37) % 110, 40 + p * 100); });
      const sigh = hump(seg(t, 0.2, 1.2));
      const grab = easeInOut(seg(t, 1.2, 1.6)), mv = easeInOut(seg(t, 1.8, 2.6)), rel = easeInOut(seg(t, 2.8, 3.2));
      const fp = { x: tgt0.x, y: lerp(tgt0.y, tgt1.y, mv) - 6 * hump(mv) };
      P(b, { x: 160, facing: 1, armR: 40, lean: 2, look: t < 1.0 ? -0.8 : 0.8, mood: 'sad', squash: 1 - 0.05 * sigh, blink: blinkAt(t) });
      const r = reach(b, S, 'R', fp.x - 4, fp.y - 12);
      P(b, { x: 160, facing: 1, armR: t < 2.8 ? lerp(8, r, grab) : lerp(r, 8, rel), lean: 2 + 4 * grab * (1 - rel), look: t < 1.0 ? -0.8 : 0.8, mood: 'sad', squash: 1 - 0.05 * sigh, blink: blinkAt(t) });
      tf(flag, fp.x, fp.y + 6);
      oldMark.setAttribute('opacity', seg(t, 2.0, 2.3));
      const q = seg(t, 2.7, 3.1); plus.setAttribute('opacity', q); arrow.setAttribute('opacity', q);
    }
  };
}
