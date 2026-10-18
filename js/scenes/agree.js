// agree：相手の考え（星）を聞き、うなずいて自分も同じ考えだと示す（例文 I agree with you.）
import { seg, lerp, easeInOut, easeOut, backOut, hump } from '../ease.js';
import { bubble } from './weigh.js';

export const meta = { duration: 4.2, beats: [[0, '相手の意見'], [1.6, 'うなずく'], [3.0, '同じ考え']] };
export const STAR = 'M 0 -11 L 3.2 -3.5 L 11 -3 L 5 2.5 L 7 10.5 L 0 6 L -7 10.5 L -5 2.5 L -11 -3 L -3.2 -3.5 Z';

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  el('rect', { x: 150, y: 46, width: 100, height: 64, rx: 6, fill: '#DDEFFA', stroke: '#fff', 'stroke-width': 5 });
  el('line', { x1: 200, y1: 46, x2: 200, y2: 110, stroke: '#fff', 'stroke-width': 4 });
  el('ellipse', { cx: 200, cy: 262, rx: 150, ry: 14, fill: '#F1D9CF' });
  const C = k.buddy({ x: 290, y: FY, facing: -1, color: pal.coral, dark: pal.coralDark });
  const G = k.buddy({ x: 110, y: FY, facing: 1 });
  const P = (b, o) => b.pose({ armL: 8, armR: 8, lean: 0, squash: 1, walk: 0, look: 0, mood: 'smile', blink: 0, lift: 0, ...o });
  const mk = () => { const b = bubble(k, 50, 38); el('path', { d: STAR, fill: pal.yellow, stroke: pal.yellowDark, 'stroke-width': 2, 'stroke-linejoin': 'round' }, b); return b; };
  const bc = mk(), bg = mk();
  const eq = k.text(0, 0, '=', { 'font-size': 30, fill: pal.green });
  const ring = el('circle', { r: 14, fill: 'none', stroke: pal.green, 'stroke-width': 4 });
  const ck = el('path', { d: 'M -6 0 L -1 5 L 7 -5', stroke: pal.green, 'stroke-width': 4, fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' });
  return {
    update(t) {
      const talk = t > 0.4 && t < 1.5 && Math.sin(t * 20) > 0;
      const nod = seg(t, 1.7, 3.3), nd = nod > 0 && nod < 1 ? Math.max(0, Math.sin(nod * Math.PI * 5)) : 0;
      const me = easeOut(seg(t, 2.4, 3.0));
      P(C, { armR: 70 * hump(seg(t, 0.3, 1.6)) + 8, look: 0.5, mood: talk ? 'open' : t > 3.0 ? 'grin' : 'smile', lean: 4 * hump(seg(t, 0.4, 1.4)) });
      P(G, { look: 0.5, lean: 9 * nd, squash: 1 - 0.04 * nd, armR: lerp(8, 70, me), mood: t > 2.4 ? 'grin' : nod > 0 ? 'smile' : 'flat' });
      tf(bc, 268, 108, 0, Math.max(0.001, backOut(seg(t, 0.8, 1.2))));
      tf(bg, 132, 108, 0, Math.max(0.001, backOut(seg(t, 2.5, 2.9))));
      tf(eq, 200, 120, 0, Math.max(0.001, backOut(seg(t, 2.9, 3.3))));
      tf(ring, 200, 120, 0, 0.001); tf(ck, 200, 160, 0, Math.max(0.001, backOut(seg(t, 3.3, 3.7))));
    }
  };
}
