// side by side：並木道の奥から、2人の友だちが肩を並べ、同じ歩幅で横に並んでこちらへ歩いてくる（例文 The two friends walked side by side.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';
import { P, blinkAt, tree } from './run-after.js';

export const meta = { duration: 4.4, beats: [[0, '2人の友だち'], [1.2, '並んで歩く'], [3.6, 'ずっと横に']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  k.backdrop({ floorY: 150 });
  el('rect', { x: 0, y: 150, width: 400, height: 150, fill: '#DCEFD9' });
  // 奥へのびる道
  el('path', { d: 'M 170 150 L 230 150 L 380 300 L 20 300 Z', fill: '#EEF1F5' });
  el('path', { d: 'M 170 150 L 20 300 M 230 150 L 380 300', stroke: pal.floorEdge, 'stroke-width': 3 });
  [[150, 150, 0.45], [250, 150, 0.45], [100, 190, 0.7], [300, 190, 0.7], [40, 250, 1.0], [360, 250, 1.0]].forEach(([x, y, s]) => tree(k, x, y, s));
  const c = k.buddy({ x: 180, y: 170, facing: 1, color: pal.coral, dark: pal.coralDark, scale: 0.5 });
  const b = k.buddy({ x: 220, y: 170, facing: -1, scale: 0.5 });
  return {
    update(t) {
      const p = easeInOut(seg(t, 0.1, 4.3));
      const y = lerp(172, 272, p), s = lerp(0.5, 1.05, p);
      const gap = 34 * s;
      const w = p * 34;
      const chat = Math.sin(t * 2.2);
      const sw = Math.sin(w) * 22 * (p > 0 && p < 1 ? 1 : 0);
      [[c, -1, 1], [b, 1, -1]].forEach(([u, side, f]) => {
        P(u, { x: 200 + side * gap, y, walk: w, armL: 8 + sw * side, armR: 8 - sw * side, facing: f, look: side < 0 ? (chat > 0 ? 0.8 : 0.1) : (chat < 0 ? 0.8 : 0.1), mood: (side < 0 ? chat > 0.3 : chat < -0.3) && Math.sin(t * 18) > 0 ? 'open' : 'grin', blink: blinkAt(t, side < 0 ? 1 : 0) });
        u.g.setAttribute('transform', `translate(${(200 + side * gap).toFixed(2)} ${y.toFixed(2)}) scale(${s.toFixed(3)})`);
      });
    }
  };
}
