// university：大きな大学の教室で、彼女（まめ）が学生に教えている（She teaches at a large university.）
import { seg, lerp, easeInOut, hump } from '../ease.js';
import { P, blinkAt } from './run-after.js';
import { roomBg, desk } from './look-over.js';
import { hp } from './dig.js';

export const meta = { duration: 4.2, beats: [[0, '黒板の前'], [1.4, '説明する'], [3.2, '学生が手を挙げる']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 1.0;
  const FY = roomBg(k, 'office', 240);
  // 窓の外に大きな大学の建物
  el('rect', { x: 32, y: 42, width: 116, height: 70, fill: '#C7D8EC' });
  el('rect', { x: 40, y: 72, width: 100, height: 40, fill: '#E8D7BC' });
  el('path', { d: 'M 36 74 L 90 52 L 144 74 Z', fill: pal.coral });
  [48, 66, 84, 102, 120].forEach((x) => el('rect', { x, y: 80, width: 6, height: 32, fill: '#fff' }));
  // 黒板
  el('rect', { x: 188, y: 54, width: 190, height: 112, rx: 6, fill: '#3E6B58', stroke: pal.woodDark, 'stroke-width': 5 });
  const ch = g({});
  el('path', { d: 'M 204 140 L 204 78 M 204 140 L 358 140', stroke: '#fff', 'stroke-width': 3, fill: 'none', 'stroke-linecap': 'round' }, ch);
  const pts = [[214, 130], [250, 114], [286, 100], [322, 84], [350, 76]];
  const line = el('path', { d: '', stroke: pal.yellow, 'stroke-width': 4, fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, ch);
  const b = k.buddy({ x: 140, y: FY, scale: S });
  const st = el('line', { stroke: pal.woodDark, 'stroke-width': 3, 'stroke-linecap': 'round' });
  const stu = k.buddy({ x: 300, y: FY, scale: 0.85, facing: -1, color: pal.coral, dark: pal.coralDark });
  desk(k, 252, 100, 204);
  return {
    update(t) {
      const n = lerp(0, pts.length - 1, easeInOut(seg(t, 0.6, 2.6)));
      const i = Math.min(pts.length - 2, Math.floor(n)), f = n - i;
      const tip = [lerp(pts[i][0], pts[i + 1][0], f), lerp(pts[i][1], pts[i + 1][1], f)];
      k.set(line, { d: 'M ' + pts.slice(0, i + 1).map((p) => p.join(' ')).join(' L ') + ` L ${tip[0]} ${tip[1]}` });
      const pt = seg(t, 0.6, 2.6) > 0 && seg(t, 0.6, 2.6) < 1 ? 1 : 0;
      P(b, { armR: lerp(30, 100, easeInOut(seg(t, 0.2, 1.0))) - hump(seg(t, 2.6, 3.4)) * 40, armL: 10, lean: 4, look: 0.5, mood: t > 3 ? 'grin' : 'open', blink: blinkAt(t) });
      const h = hp(b, S, 'R');
      k.set(st, { x1: h.x - 6, y1: h.y + 3, x2: lerp(h.x + 6, tip[0], pt) , y2: lerp(h.y - 8, tip[1], pt) });
      const up = easeInOut(seg(t, 3.0, 3.6));
      P(stu, { armR: 8, armL: lerp(8, 170, up), look: -0.5, mood: 'smile', blink: blinkAt(t, 1) });
    }
  };
}
