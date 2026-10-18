// look ahead：二人が丘の上から遠くのゴールの旗を見渡し、道の途中に目印を置いて計画する（例文 We need to look ahead and plan for the future.）
import { seg, lerp, easeInOut, easeOut, backOut, hump } from '../ease.js';
import { faceAt } from './look-over.js';

export const meta = { duration: 4.4, beats: [[0, '丘の上'], [1.2, '先を見渡す'], [3.0, '道すじを決める']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  k.backdrop({ floorY: 236 });
  el('path', { d: 'M 0 300 L 0 222 Q 60 206 140 222 L 140 300 Z', fill: '#BFE5B5' });
  el('path', { d: 'M 120 300 Q 200 190 300 170 Q 350 160 400 168 L 400 300 Z', fill: '#D7EFCF' });
  el('path', { d: 'M 248 160 Q 300 110 352 150 Z', fill: '#C9E6C0' });
  // 遠くへ続く道
  el('path', { d: 'M 150 300 C 190 250 250 240 240 214 C 232 196 290 186 320 170', fill: 'none', stroke: '#F2E3C2', 'stroke-width': 10, 'stroke-linecap': 'round' });
  const flag = g({}); tf(flag, 322, 166);
  el('line', { x1: 0, y1: 0, x2: 0, y2: -30, stroke: pal.ink, 'stroke-width': 2.5 }, flag);
  const cloth = el('path', { d: 'M 0 -30 L 18 -25 L 0 -19 Z', fill: pal.red }, flag);
  const pts = [[186, 262], [236, 226], [272, 188]].map(([x, y]) => { const n = g({}); tf(n, x, y, 0, 0.001); el('circle', { r: 7, fill: pal.yellow, stroke: '#fff', 'stroke-width': 2.5 }, n); return n; });
  const B = [k.buddy({ x: 50, y: 216, scale: 0.75 }), k.buddy({ x: 102, y: 220, scale: 0.75, color: pal.coral, dark: pal.coralDark })];
  return {
    update(t) {
      const shade = easeOut(seg(t, 0.4, 0.9)) * (1 - easeInOut(seg(t, 2.4, 2.8)));
      B.forEach((b, i) => {
        const point = easeOut(seg(t, 2.6 + i * 0.1, 3.0)), sweep = seg(t, 2.8, 4.0);
        b.pose({ armR: i ? 8 + 150 * shade + (90 - 0) * point - sweep * 15 : 8 + 150 * shade, armL: 8 + (i ? 0 : 100 * point), lift: 2 * hump(seg(t, 1.2, 1.6)), lean: 4 * shade, mood: t > 3.2 ? 'grin' : 'flat', look: 0.8 });
        faceAt(b, 6, -4 * shade);
      });
      pts.forEach((p, i) => tf(p, ...[[186, 262], [236, 226], [272, 188]][i], 0, Math.max(0.001, backOut(seg(t, 3.0 + i * 0.35, 3.35 + i * 0.35)))));
      cloth.setAttribute('d', `M 0 -30 L 18 ${-25 + Math.sin(t * 6) * 2} L 0 -19 Z`);
    }
  };
}
