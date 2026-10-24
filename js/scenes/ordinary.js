// ordinary：登校・授業・帰宅を淡々と。カレンダーに「普通の日」の印（例文 It was just an ordinary day at school.）
import { seg, lerp, easeInOut, hump } from '../ease.js';
import { P, blinkAt, walkTo, clock } from './run-after.js';
import { roomBg, desk } from './look-over.js';

export const meta = { duration: 4.4, beats: [[0, '登校'], [1.4, '授業'], [3.2, '帰る']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 0.95;
  const FY = roomBg(k, 'office', 240);
  el('rect', { x: 130, y: 44, width: 150, height: 70, rx: 5, fill: '#4F7F68', stroke: pal.woodDark, 'stroke-width': 4 });
  [[146, 70, 60], [146, 88, 92]].forEach(([x, y, w]) => el('line', { x1: x, y1: y, x2: x + w, y2: y, stroke: '#fff', 'stroke-width': 3, 'stroke-linecap': 'round', opacity: 0.8 }));
  clock(k, 320, 70, 14);
  const door = el('rect', { x: 346, y: 150, width: 44, height: 90, rx: 4, fill: pal.wood, stroke: pal.woodDark, 'stroke-width': 3 });
  const cal = g({}); tf(cal, 66, 78);
  el('rect', { x: -34, y: -30, width: 68, height: 62, rx: 6, fill: '#fff', stroke: pal.line, 'stroke-width': 2.5 }, cal);
  el('rect', { x: -34, y: -30, width: 68, height: 14, rx: 6, fill: pal.blue }, cal);
  for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++) el('circle', { cx: -22 + c * 15, cy: -6 + r * 14, r: 3, fill: pal.line }, cal);
  const mark = el('circle', { cx: -7, cy: 8, r: 8, fill: 'none', stroke: pal.green, 'stroke-width': 3, 'stroke-dasharray': '51' }, cal);
  const m = k.buddy({ x: 20, y: FY, scale: S });
  const bag = el('rect', { width: 14, height: 22, rx: 5, fill: pal.yellowDark });
  desk(k, 190, 80, 200);
  const sitDesk = g({});
  return {
    update(t) {
      const xf = (tt) => lerp(40, 205, easeInOut(seg(tt, 0.1, 1.4))) + lerp(0, 150, easeInOut(seg(tt, 3.2, 4.3)));
      const w = walkTo(xf, t, 40, 1), at = t > 1.5 && t < 3.2;
      const note = at ? hump(seg(t, 1.8, 3.0) * 3 % 1) : 0;
      P(m, { x: w.x, walk: w.walk, armL: at ? 8 : w.armL, armR: at ? 20 + note * 30 : w.armR, lean: w.lean, mood: 'flat', blink: blinkAt(t) });
      tf(bag, w.x - 18, FY - 54);
      mark.setAttribute('stroke-dashoffset', 51 * (1 - seg(t, 3.3, 4.2)));
    }
  };
}
