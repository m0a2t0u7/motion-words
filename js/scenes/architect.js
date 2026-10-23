// architect：建築家のまめが図書館の設計図を描き上げ、横の模型の図書館がせり上がって完成する（例文 The architect designed the new library.）
import { seg, lerp, easeInOut, easeOut, hump, clamp } from '../ease.js';
import { reach, held, P, blinkAt, wear, deskFront, sc } from './member.js';
import { pencil } from './check.js';

export const meta = { duration: 4.4, beats: [[0, '設計図を広げる'], [0.8, '図書館を設計'], [3.2, '新しい図書館']] };

const PLAN = 'M 0 48 L 0 18 L 50 0 L 100 18 L 100 48 Z M 14 22 L 14 48 M 32 22 L 32 48 M 68 22 L 68 48 M 86 22 L 86 48 M 42 48 L 42 32 L 58 32 L 58 48';

export function create(k) {
  const { el, g, tf, pal } = k, S = 1, FY = 236;
  k.backdrop({ floorY: FY, mood: 'indoor' });
  el('rect', { x: 0, y: FY - 14, width: 400, height: 14, fill: '#ECE6DC' });
  el('rect', { x: 20, y: 40, width: 90, height: 70, rx: 6, fill: '#DDEFFA', stroke: '#fff', 'stroke-width': 5 });
  const b = k.buddy({ x: 80, y: FY, scale: S, facing: 1 }); wear(k, b, 'glasses');
  // 立てかけた設計図
  const BX = 118, BY = 100;
  el('rect', { x: BX - 6, y: BY - 6, width: 124, height: 76, rx: 4, fill: pal.woodDark });
  el('rect', { x: BX, y: BY, width: 112, height: 64, fill: '#2F5E9E' });
  const plan = el('path', { d: PLAN, transform: `translate(${BX + 6} ${BY + 8})`, fill: 'none', stroke: '#fff', 'stroke-width': 2, 'stroke-linejoin': 'round' });
  const L = plan.getTotalLength(); k.set(plan, { 'stroke-dasharray': `${L} ${L}` });
  el('line', { x1: BX + 56, y1: BY + 70, x2: BX + 56, y2: FY, stroke: pal.woodDark, 'stroke-width': 5 });
  // 台と模型
  const TOP = FY - 40;
  deskFront(k, 260, 120, TOP, FY);
  const model = g({ 'clip-path': k.clip((c) => el('rect', { x: 250, y: 60, width: 140, height: TOP - 60 }, c)) });
  const mg = g({}, model);
  el('rect', { x: -50, y: -46, width: 100, height: 46, fill: '#F3E6DC' }, mg);
  el('path', { d: 'M -58 -46 L 0 -72 L 58 -46 Z', fill: '#C98A5A' }, mg);
  [-36, -18, 18, 36].forEach((x) => el('rect', { x: x - 4, y: -42, width: 8, height: 42, fill: '#fff' }, mg));
  el('rect', { x: -9, y: -24, width: 18, height: 24, fill: '#8FA3B8' }, mg);
  el('rect', { x: -24, y: -60, width: 48, height: 10, rx: 2, fill: '#fff' }, mg); k.text(0, -55, 'LIBRARY', { 'font-size': 7, fill: pal.ink }, mg);
  const pen = pencil(k);
  return {
    update(t) {
      const p = easeInOut(seg(t, 0.8, 3.0));
      k.set(plan, { 'stroke-dashoffset': L * (1 - p) });
      const pt = plan.getPointAtLength(L * p);
      let tx = BX + 6 + pt.x, ty = BY + 8 + pt.y;
      if (t < 0.8) { tx = BX + 6; ty = lerp(BY + 70, BY + 56, easeInOut(seg(t, 0.2, 0.8))); }
      const rest = easeInOut(seg(t, 3.0, 3.4));
      P(b, { lean: 5 - 5 * rest, look: lerp(0.9, 1, rest), blink: blinkAt(t), mood: t > 3.3 ? 'grin' : 'flat' });
      b.pose({ armR: lerp(reach(b, S, 'R', tx, ty), reach(b, S, 'R', 330, TOP - 50), rest) });
      held(k, b, S, pen, 'R', 0, 20);
      const up = easeOut(seg(t, 3.0, 3.8));
      tf(mg, 320, TOP + 76 * (1 - up));
    }
  };
}
