// recruit：会社の前で、まめが「仲間募集」のチラシを配り、通りがかった人を誘う（例文 The company is recruiting new staff.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';
import { P, walkTo } from './run-after.js';
import { hp } from './dig.js';
import { top } from './shirt.js';
import { sign, COL } from './queue-up.js';

export const meta = { duration: 4.4, beats: [[0, '人を募る'], [1.6, 'チラシを渡す'], [3.0, '興味を持つ']] };

function flyer(k, parent) {
  const g = k.g({}, parent), pal = k.pal;
  k.el('rect', { x: -9, y: -12, width: 18, height: 24, rx: 2, fill: '#fff', stroke: pal.line, 'stroke-width': 1.5 }, g);
  k.el('circle', { cx: 0, cy: -5, r: 3, fill: pal.mint }, g);
  k.el('path', { d: 'M -5 3 Q -5 -1 0 -1 Q 5 -1 5 3 Z', fill: pal.mint }, g);
  k.el('line', { x1: -5, y1: 7, x2: 5, y2: 7, stroke: pal.sub, 'stroke-width': 1.5 }, g);
  return g;
}

export function create(k) {
  const { el, g, tf, pal } = k, S = 0.82;
  const FY = k.backdrop({ floorY: 236, mood: 'outdoor' });
  // 会社のビル
  k.shadow(90, FY + 1, 80, 5);
  el('rect', { x: 10, y: 40, width: 160, height: 196, fill: '#DCE6F2' });
  for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) el('rect', { x: 22 + c * 37, y: 54 + r * 34, width: 26, height: 20, rx: 2, fill: '#B8D6EE' });
  el('rect', { x: 66, y: 186, width: 48, height: 50, fill: '#8FB0CC' });
  el('rect', { x: 10, y: 34, width: 160, height: 8, fill: '#B5C3D3' });
  sign(k, 128, FY, 'JOIN US!', { w: 92, h: 34, color: pal.yellow, post: 50 });
  const rec = k.buddy({ x: 200, y: FY, scale: S });
  top(k, rec, 'suit', '#46536E', '#2F3A52');
  const pile = flyer(k), give = flyer(k);
  const cand = k.buddy({ x: 420, y: FY, scale: S, facing: -1, color: pal.coral, dark: pal.coralDark });
  const cx = (t) => lerp(420, 306, easeInOut(seg(t, 0.4, 1.8)));
  return {
    update(t) {
      const wave = t < 1.5 ? Math.sin(t * 9) : 0;
      const off = easeInOut(seg(t, 1.8, 2.4)) * (1 - easeInOut(seg(t, 2.9, 3.4)));
      P(rec, { x: 200, armL: 40, armR: t < 1.5 ? 150 + 16 * wave : lerp(60, 92, off), lean: 6 * off, look: 1, mood: 'grin' });
      const lh = hp(rec, S, 'L', 30);
      tf(pile, lh.x + 6, lh.y - 4, -10);
      const w = walkTo(cx, t, 420, -1);
      const take = easeInOut(seg(t, 2.1, 2.6)), read = easeInOut(seg(t, 2.9, 3.4));
      P(cand, { x: w.x, walk: w.walk, armL: w.armL, armR: lerp(w.armR, 90, take) * (1 - read) + 70 * read, lean: w.lean + 6 * take * (1 - read), facing: -1, look: -0.5, mood: read > 0.5 ? 'grin' : 'smile' });
      const rh = hp(rec, S, 'R', 30), ch = hp(cand, S, 'R', 30);
      const hold = t > 2.45 ? ch : rh;
      tf(give, hold.x + (t > 2.45 ? -4 : 6), hold.y - 6, read * -8, t > 1.6 ? 1 : 0.001);
    }
  };
}
