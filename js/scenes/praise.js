// praise：頑張ったノートを見せる生徒を、先生が頭をなでて星で褒める（例文 The teacher praised her for her effort.）
import { seg, lerp, easeInOut, easeOut, backOut, hump, wobble } from '../ease.js';
import { hp, gait } from './dig.js';
import { bubble, heart } from './weigh.js';
import { STAR } from './agree.js';

export const meta = { duration: 4.4, beats: [[0, 'ノートを見せる'], [1.8, '先生が近づく'], [3.2, '褒められた']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  el('rect', { x: 40, y: 40, width: 120, height: 70, rx: 5, fill: '#CFE6D8', stroke: pal.woodDark, 'stroke-width': 5 });
  [[56, 60, 70], [56, 76, 46], [56, 92, 88]].forEach(([x, y, w]) => el('line', { x1: x, y1: y, x2: x + w, y2: y, stroke: '#fff', 'stroke-width': 3, 'stroke-linecap': 'round', opacity: 0.8 }));
  el('ellipse', { cx: 200, cy: 262, rx: 150, ry: 14, fill: '#F1D9CF' });
  const T = k.buddy({ x: 100, y: FY, facing: 1 });
  const S = k.buddy({ x: 268, y: FY, facing: -1, color: pal.coral, dark: pal.coralDark, scale: 0.78 });
  const P = (b, o) => b.pose({ armL: 8, armR: 8, lean: 0, squash: 1, walk: 0, look: 0, mood: 'smile', blink: 0, lift: 0, ...o });
  const nb = g({});
  el('rect', { x: -14, y: -18, width: 28, height: 36, rx: 3, fill: '#fff', stroke: pal.blue, 'stroke-width': 2.5 }, nb);
  [-11, -5, 1, 7, 13].forEach((y, i) => el('line', { x1: -9, y1: y, x2: 9 - (i % 2) * 5, y2: y, stroke: pal.blue, 'stroke-width': 2, 'stroke-linecap': 'round' }, nb));
  const bb = bubble(k, 50, 40); el('path', { d: STAR, fill: pal.yellow, stroke: pal.yellowDark, 'stroke-width': 2, 'stroke-linejoin': 'round', transform: 'scale(1.3)' }, bb);
  const hs = [0, 1, 2].map(() => heart(k, k.root));
  const xf = (t) => lerp(100, 186, easeInOut(seg(t, 1.5, 2.6)));
  return {
    update(t) {
      const show = easeOut(seg(t, 0.3, 0.9)), pat = seg(t, 2.7, 4.0);
      const p = gait(xf, t, 100, 16, 0.11);
      const pt = easeOut(seg(t, 2.6, 3.0)), wag = pt > 0 ? Math.sin(pat * Math.PI * 6) * 8 : 0;
      P(T, { x: p.x, walk: p.walk, armR: lerp(p.armR, 118, pt) + wag, armL: p.armL, lean: p.lean + 3 * pt, look: 0.5, mood: t > 2.6 ? 'grin' : 'smile' });
      P(S, { armR: lerp(8, 125, show) * (1 - seg(t, 1.6, 2.2)) + 25 * seg(t, 1.6, 2.2), look: 0.6, mood: t > 2.9 ? 'grin' : 'smile', blink: t > 3.0 ? 0.8 : 0, squash: 1 - 0.07 * pt + 0.03 * Math.sin(t * 4) * (1 - pt) - 0.03 * wobble(seg(t, 2.8, 3.8), 3, 4) });
      const h = hp(S, 0.78, 'R');
      tf(nb, h.x - 4, h.y - 14, 8, 0.78 + 0.0001 * 0 + 0.2);
      tf(bb, p.x, 108, 0, Math.max(0.001, backOut(seg(t, 3.0, 3.4))));
      hs.forEach((q, i) => { const u = seg(t, 3.3 + i * 0.2, 4.3); tf(q, 252 + i * 18, 146 - 24 * u - i * 5, 0, hump(u) * 1.1 + 0.001); });
    }
  };
}
