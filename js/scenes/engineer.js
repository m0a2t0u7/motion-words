// engineer：自動車会社の技術者のおじ（まめ）が製図板に車の設計図を描き、その横で試作車のライトがともる（例文 My uncle is an engineer at a car company.）
import { seg, lerp, easeInOut, easeOut, hump, clamp } from '../ease.js';
import { reach, held, P, blinkAt, wear } from './member.js';
import { pencil } from './check.js';
import { auto } from './vehicle.js';

export const meta = { duration: 4.4, beats: [[0, '自動車会社'], [0.8, '車を設計する'], [3.4, '技術者のおじ']] };

const CAR = 'M 10 54 L 10 40 Q 12 32 26 32 L 40 32 L 52 18 L 86 18 L 100 32 L 118 34 Q 128 36 128 46 L 128 54 Z M 30 54 a 10 10 0 1 0 0.1 0 M 104 54 a 10 10 0 1 0 0.1 0';

export function create(k) {
  const { el, g, tf, pal } = k, S = 1.05, FY = 236;
  k.backdrop({ floorY: FY, mood: 'indoor' });
  el('rect', { x: 0, y: 0, width: 400, height: 24, fill: '#D6DEE8' });
  el('rect', { x: 20, y: 30, width: 130, height: 24, rx: 5, fill: pal.blueDark }); k.text(85, 42, 'CAR COMPANY', { 'font-size': 11, fill: '#fff' });
  // 奥の試作車
  const car = auto(k, { kind: 'car', color: '#E8EDF3', dark: '#C9D1DC' }); car.set(312, FY - 2, 0, 0, 0, 0.9);
  const lamp = el('ellipse', { cx: 312 + 70 * 0.9, cy: FY - 36 * 0.9, rx: 12, ry: 6, fill: '#FFF2A8' });
  // 製図板
  const BX = 120, BY = 110;
  el('line', { x1: BX + 20, y1: BY + 80, x2: BX + 10, y2: FY, stroke: pal.woodDark, 'stroke-width': 5 });
  el('line', { x1: BX + 120, y1: BY + 80, x2: BX + 130, y2: FY, stroke: pal.woodDark, 'stroke-width': 5 });
  el('rect', { x: BX, y: BY, width: 140, height: 84, rx: 4, fill: '#2F5E9E' });
  for (let i = 1; i < 7; i++) el('line', { x1: BX + i * 20, y1: BY, x2: BX + i * 20, y2: BY + 84, stroke: '#fff', opacity: 0.12 });
  const draw = el('path', { d: CAR, transform: `translate(${BX} ${BY + 4})`, fill: 'none', stroke: '#fff', 'stroke-width': 2.4, 'stroke-linejoin': 'round' });
  const L = draw.getTotalLength();
  k.set(draw, { 'stroke-dasharray': `${L} ${L}` });
  const b = k.buddy({ x: 86, y: FY, scale: S, facing: 1 }); wear(k, b, 'glasses'); wear(k, b, 'badge', '#DCEBFF');
  // おじさんらしい口ひげ
  const face = b.body.children[3]; el('path', { d: 'M -9 -45 Q -4 -49 0 -45 Q 4 -49 9 -45 Q 4 -42 0 -44 Q -4 -42 -9 -45 Z', fill: '#5B4A3A' }, face);
  const pen = pencil(k);
  return {
    update(t) {
      const p = easeInOut(seg(t, 0.8, 3.2));
      k.set(draw, { 'stroke-dashoffset': L * (1 - p) });
      const pt = draw.getPointAtLength(L * p);
      let tx = BX + pt.x, ty = BY + 4 + pt.y;
      if (t < 0.8) { tx = lerp(BX + 20, BX + 10, seg(t, 0.2, 0.8)); ty = lerp(BY + 90, BY + 58, easeInOut(seg(t, 0.2, 0.8))); }
      if (t > 3.2) { const q = easeOut(seg(t, 3.2, 3.7)); tx = lerp(tx, BX + 30, q); ty = lerp(ty, BY + 100, q); }
      P(b, { lean: 6, look: 0.9, blink: blinkAt(t), mood: t > 3.4 ? 'grin' : 'flat' });
      b.pose({ armR: reach(b, S, 'R', tx, ty) });
      held(k, b, S, pen, 'R', 0, 20);
      const on = seg(t, 3.4, 3.6) * (0.85 + 0.15 * Math.sin(t * 12));
      lamp.setAttribute('opacity', on);
    }
  };
}
