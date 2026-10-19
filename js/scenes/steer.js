// steer：まめが舵輪を回して小舟の向きを変え、岸に着ける（例文 He steered the boat to the shore.）
import { seg, lerp, easeInOut, easeOut, hump, wobble } from '../ease.js';
import { P } from './run-after.js';

export const meta = { duration: 4.4, beats: [[0, '海を進む'], [1.2, '舵を切る'], [3.2, '岸に着いた']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 0.62;
  k.backdrop({ floorY: 300, mood: 'outdoor' });
  const SEA = 190;
  el('rect', { x: 0, y: SEA, width: 400, height: 110, fill: '#7FC7EA' });
  // 岸（右）：砂浜と木
  el('path', { d: `M 300 ${SEA + 4} Q 330 ${SEA - 18} 400 ${SEA - 22} L 400 300 L 280 300 Q 300 ${SEA + 40} 300 ${SEA + 4} Z`, fill: '#F2DDB0' });
  el('rect', { x: 366, y: SEA - 92, width: 8, height: 74, rx: 3, fill: pal.woodDark, transform: `rotate(8 370 ${SEA - 20})` });
  [[-30, -10], [0, -22], [26, -6]].forEach(([dx, r]) => el('ellipse', { cx: 376 + dx * 0.8, cy: SEA - 92, rx: 26, ry: 8, fill: pal.green, transform: `rotate(${r + dx} ${376} ${SEA - 92})` }));
  const waves = [0, 1, 2, 3].map((i) => el('path', { d: 'M 0 0 q 10 -5 20 0 t 20 0', fill: 'none', stroke: '#fff', 'stroke-width': 2.5, opacity: 0.7, 'stroke-linecap': 'round' }));
  // 舟（原点＝水線の中央、右向き）
  const boat = g({});
  const b = k.buddy({ parent: boat, x: -14, y: -6, scale: S });
  b.g.children[0].setAttribute('opacity', 0);
  // 舵輪（スポーク付き）
  const wheel = g({}, boat);
  el('rect', { x: 15, y: -38, width: 4, height: 30, fill: pal.woodDark }, boat);
  el('circle', { r: 11, fill: 'none', stroke: pal.woodDark, 'stroke-width': 3.5 }, wheel);
  for (let i = 0; i < 4; i++) el('line', { x1: 0, y1: -15, x2: 0, y2: 15, stroke: pal.woodDark, 'stroke-width': 2.5, transform: `rotate(${i * 45})`, 'stroke-linecap': 'round' }, wheel);
  boat.appendChild(wheel);
  el('path', { d: 'M -46 -14 L 48 -14 Q 44 8 26 10 L -36 10 Q -46 4 -46 -14 Z', fill: pal.coral }, boat);
  el('rect', { x: -46, y: -16, width: 94, height: 5, rx: 2, fill: '#fff' }, boat);
  const wake = [0, 1].map(() => el('path', { d: 'M 0 0 Q -20 -4 -40 0', fill: 'none', stroke: '#fff', 'stroke-width': 3, 'stroke-linecap': 'round' }));
  const bx = (t) => lerp(60, 284, easeInOut(seg(t, 0.0, 3.3)));
  const by = (t) => lerp(SEA + 30, SEA + 6, easeInOut(seg(t, 1.2, 3.3)));
  return {
    update(t) {
      const x = bx(t), y = by(t), v = (bx(t + 0.02) - bx(t - 0.02)) / 0.04;
      const turn = easeInOut(seg(t, 1.0, 1.6)) * (1 - easeInOut(seg(t, 2.6, 3.2)));
      const stop = seg(t, 3.3, 4.4);
      const rock = Math.sin(t * 3) * 2 * (1 - stop) + 3 * wobble(stop, 1.5, 4);
      tf(boat, x, y, -6 * turn + rock);
      tf(wheel, 17, -40, -200 * turn);
      P(b, { x: -14, y: -6, armR: 75 + 20 * turn, armL: 8, lean: 6 + 4 * turn, look: 0.8, mood: t > 3.4 ? 'grin' : 'flat' });
      wake.forEach((w, i) => { tf(w, x - 50 - i * 14, y + 8 + i * 4); w.setAttribute('opacity', Math.min(1, v / 80) * (0.8 - i * 0.3)); });
      waves.forEach((w, i) => { tf(w, 20 + i * 70 + Math.sin(t * 1.6 + i) * 6, SEA + 40 + (i % 2) * 34); });
    }
  };
}
