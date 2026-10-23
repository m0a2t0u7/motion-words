// policy：セール品は返品不可の店の方針。まめが返品しようと袋を出すと、店員が「返品なし」の掲示を指す（例文 Our store has a no-return policy on sale items.）
import { seg, lerp, easeInOut, backOut, hump } from '../ease.js';
import { P, blinkAt, walkTo } from './run-after.js';
import { roomBg } from './look-over.js';
import { held, reach } from './dig.js';

export const meta = { duration: 4.2, beats: [[0, '返品しに来た'], [1.4, '掲示を指される'], [3.0, '返品できない']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 0.95;
  const FY = roomBg(k, 'office', 240);
  const sg = g({}); tf(sg, 250, 82);
  el('rect', { x: -62, y: -34, width: 124, height: 68, rx: 8, fill: '#fff', stroke: pal.red, 'stroke-width': 4 }, sg);
  el('path', { d: 'M -30 4 a 18 18 0 1 1 8 14 M -30 4 l -8 -8 m 8 8 l -10 4', fill: 'none', stroke: pal.sub, 'stroke-width': 4, 'stroke-linecap': 'round', transform: 'translate(-6 -2)' }, sg);
  el('line', { x1: -50, y1: 24, x2: 50, y2: -24, stroke: pal.red, 'stroke-width': 6, 'stroke-linecap': 'round' }, sg);
  k.text(34, 8, 'SALE', { 'font-size': 14, 'font-weight': 800, fill: pal.red, 'text-anchor': 'middle' }, sg);
  const cl = k.buddy({ x: 300, y: FY - 8, scale: 0.95, facing: -1, color: pal.coral, dark: pal.coralDark });
  el('rect', { x: 215, y: 196, width: 185, height: 8, rx: 3, fill: pal.wood });
  el('rect', { x: 219, y: 204, width: 177, height: 40, fill: '#F2DDBB' });
  const b = k.buddy({ x: 30, y: FY, scale: S });
  const bag = g({});
  el('rect', { x: -14, y: -4, width: 28, height: 28, rx: 4, fill: pal.yellow }, bag);
  el('path', { d: 'M -7 -4 q 0 -12 7 -12 q 7 0 7 12', fill: 'none', stroke: pal.yellowDark, 'stroke-width': 3 }, bag);
  k.text(0, 14, '%', { 'font-size': 14, 'font-weight': 800, fill: pal.red, 'text-anchor': 'middle' }, bag);
  const xf = (t) => lerp(30, 150, easeInOut(seg(t, 0.2, 1.5)));
  return {
    update(t) {
      const w = walkTo(xf, t, 30), off = seg(t, 1.3, 1.7);
      const o = { ...w, armR: lerp(w.armR, 85, off), armL: lerp(w.armL, 8, off), mood: t > 2.8 ? 'sad' : 'open', look: 0.6, blink: blinkAt(t) };
      P(b, o); held(k, b, S, bag, 'R', 0);
      const pt = easeInOut(seg(t, 1.5, 2.2));
      const co = { facing: -1, armL: 8, armR: 8, lean: 0, squash: 1, walk: 0, lift: 0, mood: t > 1.6 ? 'flat' : 'smile', look: 0.4, blink: blinkAt(t, 1), y: FY - 8, x: 300 };
      cl.pose(co); cl.pose({ ...co, armL: lerp(8, reach(cl, S, 'L', 250, 70), pt) });
      tf(sg, 250, 82, 4 * Math.sin(t * 16) * hump(seg(t, 1.9, 2.6)), 1);
    }
  };
}
