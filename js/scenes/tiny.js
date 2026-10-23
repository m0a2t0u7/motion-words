// tiny：枝に小さな鳥が飛んできてとまる。まめは指の幅と比べて「小さい」と見る（例文 A tiny bird sat on the branch.）
import { seg, lerp, easeInOut, easeOut, backOut, hump, wobble } from '../ease.js';
import { P, blinkAt, parkBg, tree } from './run-after.js';

export const meta = { duration: 3.6, beats: [[0, '枝だけ'], [1.2, '鳥が来る'], [2.6, 'とまった']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = parkBg(k, 240);
  tree(k, 290, FY - 4, 1.5);
  el('path', { d: 'M 285 120 Q 240 112 196 118', fill: 'none', stroke: pal.woodDark, 'stroke-width': 8, 'stroke-linecap': 'round' });
  const bird = g({});
  const body = g({}, bird);
  el('ellipse', { cx: 0, cy: -6, rx: 7, ry: 6, fill: pal.yellow }, body);
  el('circle', { cx: 5, cy: -12, r: 4.2, fill: pal.yellow }, body);
  el('path', { d: 'M 9 -12 l 4 1.5 l -4 1.5 Z', fill: pal.coral }, body);
  el('circle', { cx: 6.4, cy: -13, r: 1, fill: pal.ink }, body);
  el('path', { d: 'M -6 -6 l -9 3 l 8 3 Z', fill: pal.yellowDark }, body);
  el('line', { x1: -1, y1: 0, x2: -1, y2: 4, stroke: pal.coralDark, 'stroke-width': 1.5 }, body);
  el('line', { x1: 2, y1: 0, x2: 2, y2: 4, stroke: pal.coralDark, 'stroke-width': 1.5 }, body);
  const wing = el('ellipse', { cx: -1, cy: -7, rx: 6, ry: 3, fill: pal.yellowDark }, body);
  const b = k.buddy({ x: 90, y: FY, scale: 0.95 });
  const ring = el('path', { d: 'M -20 0 H 20 M -20 -5 V 5 M 20 -5 V 5', stroke: pal.sub, 'stroke-width': 1.6, fill: 'none' });
  return {
    update(t) {
      const u = easeOut(seg(t, 1.0, 2.3)), land = seg(t, 2.2, 3.0);
      const bx = lerp(60, 222, u), by = lerp(30, 118, u) - Math.sin(u * Math.PI) * 24 * 0 + Math.sin(t * 10) * 3 * (1 - u);
      tf(bird, bx, by, 0, 1.5 - 0.1 * 0, 1.5);
      tf(body, 0, 0, 0, 1, 1 - 0.1 * wobble(land));
      tf(wing, 0, 0, Math.sin(t * 40) * 25 * (1 - u), 1, 1);
      const look = easeInOut(seg(t, 1.0, 1.8)), point = easeInOut(seg(t, 2.3, 2.9));
      P(b, { armR: lerp(8, 110, point), lean: -4 * look, look: 0.9, mood: point > 0.5 ? 'open' : 'smile', blink: blinkAt(t) });
      tf(ring, 140, 112, 0, 1, 1); ring.setAttribute('opacity', point);
    }
  };
}
