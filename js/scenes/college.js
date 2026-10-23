// college：本を持って大学の建物へ歩いていき、その前に「2」の札が出る（例文 My sister is in her second year of college.）
import { seg, lerp, easeInOut, easeOut, backOut, hump } from '../ease.js';
import { P, blinkAt, walkTo, parkBg } from './run-after.js';
import { hp } from './look-over.js';

export const meta = { duration: 4.2, beats: [[0, '歩いてくる'], [2.2, '大学の前'], [3.2, '2年生']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 1.0;
  const FY = parkBg(k, 236);
  // 大学の建物
  el('rect', { x: 245, y: 118, width: 140, height: 118, fill: '#F2E3CB' });
  el('path', { d: 'M 235 118 L 315 78 L 395 118 Z', fill: pal.coral });
  el('circle', { cx: 315, cy: 104, r: 8, fill: '#fff', stroke: pal.coralDark, 'stroke-width': 2 });
  [262, 290, 340, 368].forEach((x) => el('rect', { x: x - 5, y: 124, width: 10, height: 104, fill: '#fff' }));
  el('rect', { x: 240, y: 228, width: 150, height: 8, rx: 2, fill: '#D9CDB8' });
  el('rect', { x: 303, y: 170, width: 24, height: 58, rx: 4, fill: pal.woodDark });
  el('rect', { x: 236, y: 118, width: 158, height: 6, fill: pal.coralDark });
  el('line', { x1: 315, y1: 78, x2: 315, y2: 56, stroke: pal.sub, 'stroke-width': 3 });
  el('path', { d: 'M 315 56 L 335 62 L 315 68 Z', fill: pal.blue });
  const b = k.buddy({ x: 30, y: FY, scale: S });
  const bk = g({});
  el('rect', { x: -9, y: -12, width: 18, height: 24, rx: 2, fill: pal.blue }, bk);
  el('rect', { x: -9, y: -12, width: 4, height: 24, fill: pal.blueDark }, bk);
  el('line', { x1: -1, x2: 6, y1: -4, y2: -4, stroke: '#fff', 'stroke-width': 2 }, bk);
  const bd = g({}); el('circle', { r: 19, fill: pal.yellow, stroke: pal.yellowDark, 'stroke-width': 3 }, bd);
  k.text(0, 8, '2', { 'font-size': 22, fill: pal.ink, 'font-weight': 700 }, bd);
  const xm = (t) => lerp(30, 192, easeOut(seg(t, 0, 2.4)));
  return {
    update(t) {
      const w = walkTo(xm, t, 30), done = seg(t, 2.4, 3.0);
      P(b, { x: w.x, walk: w.walk, lean: w.lean, armL: lerp(w.armL, 8, done), armR: 75, look: 0.2, mood: t > 3 ? 'grin' : 'smile', blink: blinkAt(t), lift: 0, squash: 1 - 0.04 * hump(done) });
      const h = hp(b, S, 'R');
      tf(bk, h.x + 4, h.y - 2);
      tf(bd, w.x + 8, 112 - 4 * hump(seg(t, 3.1, 3.7)), 0, t < 3.1 ? 0.001 : backOut(seg(t, 3.1, 3.6)));
    }
  };
}
