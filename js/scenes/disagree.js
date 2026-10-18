// disagree：相手の考え（星）に対し、首を振り手のひらを向け、自分の考え（三角）は違うと示す（例文 I disagree with his idea.）
import { seg, lerp, easeInOut, easeOut, backOut, hump } from '../ease.js';
import { bubble } from './weigh.js';
import { STAR } from './agree.js';

export const meta = { duration: 4.2, beats: [[0, '相手の意見'], [1.6, '首を振る'], [3.0, '違う考え']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  el('rect', { x: 150, y: 46, width: 100, height: 64, rx: 6, fill: '#DDEFFA', stroke: '#fff', 'stroke-width': 5 });
  el('line', { x1: 200, y1: 46, x2: 200, y2: 110, stroke: '#fff', 'stroke-width': 4 });
  el('ellipse', { cx: 200, cy: 262, rx: 150, ry: 14, fill: '#F1D9CF' });
  const C = k.buddy({ x: 290, y: FY, facing: -1, color: pal.coral, dark: pal.coralDark });
  const G = k.buddy({ x: 110, y: FY, facing: 1 });
  const P = (b, o) => b.pose({ armL: 8, armR: 8, lean: 0, squash: 1, walk: 0, look: 0, mood: 'smile', blink: 0, lift: 0, ...o });
  const bc = bubble(k, 50, 38); el('path', { d: STAR, fill: pal.yellow, stroke: pal.yellowDark, 'stroke-width': 2, 'stroke-linejoin': 'round' }, bc);
  const cross = el('path', { d: 'M -14 -14 L 14 14 M 14 -14 L -14 14', stroke: pal.red, 'stroke-width': 5, 'stroke-linecap': 'round', fill: 'none' }, bc);
  const bg = bubble(k, 50, 38); el('path', { d: 'M 0 -11 L 11 9 L -11 9 Z', fill: pal.violet, stroke: '#7E63DB', 'stroke-width': 2, 'stroke-linejoin': 'round' }, bg);
  const ne = k.text(0, 0, '≠', { 'font-size': 30, fill: pal.red });
  return {
    update(t) {
      const talk = t > 0.4 && t < 1.5 && Math.sin(t * 20) > 0;
      const sh = seg(t, 1.6, 3.2), shake = sh > 0 && sh < 1 ? Math.sin(sh * Math.PI * 6) * (1 - sh * 0.4) : 0;
      const stop = easeOut(seg(t, 1.6, 2.2));
      const crs = easeOut(seg(t, 2.0, 2.4));
      P(C, { armR: 70 * hump(seg(t, 0.3, 1.6)) + 8, look: 0.5, mood: talk ? 'open' : t > 2.3 ? 'sad' : 'smile', lean: 4 * hump(seg(t, 0.4, 1.4)) - 3 * crs });
      P(G, { look: sh > 0 ? 0.9 * shake : 0.5, lean: -3 * stop, armR: lerp(8, 100, stop), mood: sh > 0 ? 'flat' : 'smile', blink: 0 });
      tf(bc, 268, 108, 0, Math.max(0.001, backOut(seg(t, 0.8, 1.2))));
      k.set(cross, { opacity: crs, 'stroke-dasharray': '40', 'stroke-dashoffset': 40 * (1 - crs) });
      tf(bg, 132, 108, 0, Math.max(0.001, backOut(seg(t, 2.6, 3.0))));
      tf(ne, 200, 120, 0, Math.max(0.001, backOut(seg(t, 3.0, 3.4))));
    }
  };
}
