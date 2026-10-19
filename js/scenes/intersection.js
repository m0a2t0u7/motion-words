// intersection：上から見た交差点。まめの車が左のウインカーを出し、次の交差点で左に曲がる（例文 Turn left at the next intersection.）
import { seg, lerp, easeInOut } from '../ease.js';
import { topCar } from './road.js';
import { tree } from './run-after.js';

export const meta = { duration: 4.4, beats: [[0, '交差点へ'], [1.4, 'ウインカー'], [2.4, '左に曲がる']] };

export function create(k) {
  const { el, tf, pal } = k;
  el('rect', { x: 0, y: 0, width: 400, height: 300, fill: '#DCEFD9' });
  el('rect', { x: 160, y: 0, width: 80, height: 300, fill: '#AEB7C4' });
  el('rect', { x: 0, y: 90, width: 400, height: 80, fill: '#AEB7C4' });
  for (let y = 0; y < 300; y += 26) if (y < 82 || y > 170) el('rect', { x: 198, y, width: 4, height: 14, fill: '#fff' });
  for (let x = 0; x < 400; x += 26) if (x < 152 || x > 240) el('rect', { x, y: 128, width: 14, height: 4, fill: '#fff' });
  for (let i = 0; i < 6; i++) { el('rect', { x: 164 + i * 12, y: 176, width: 7, height: 18, fill: '#fff', opacity: 0.85 }); el('rect', { x: 164 + i * 12, y: 66, width: 7, height: 18, fill: '#fff', opacity: 0.85 }); }
  [[60, 40], [320, 40], [60, 230], [330, 240]].forEach(([x, y]) => { el('circle', { cx: x, cy: y, r: 22, fill: '#8FD3A8' }); el('circle', { cx: x + 8, cy: y - 6, r: 12, fill: '#A6DDB8' }); });
  // 左折の矢印
  const arrow = el('path', { d: 'M 224 250 V 214 Q 224 200 210 200 H 196 v -8 l -14 14 l 14 14 v -8 h 14 Q 216 220 216 226 V 250 Z', fill: '#fff', opacity: 0.8 });
  const car = topCar(k, pal.coral, pal.coralDark);
  // 経路：右側車線を上へ → 交差点で左へ曲がる
  return {
    update(t) {
      let x, y, r;
      const a = seg(t, 0, 1.9), turn = seg(t, 1.9, 3.1), out = seg(t, 3.1, 4.4);
      if (t < 1.9) { x = 220; y = lerp(330, 170, easeInOut(a) * 0.6 + a * 0.4); r = 0; }
      else if (t < 3.1) { const q = easeInOut(turn); const ang = q * Math.PI / 2; x = 220 - 70 * (1 - Math.cos(ang)) + 0; y = 170 - 60 * Math.sin(ang); r = -90 * q; }
      else { x = lerp(150, -60, out); y = 110; r = -90; }
      tf(car.g, x, y, r, 1);
      car.blink(t > 0.9 && t < 3.0 && Math.sin(t * 14) > 0);
      arrow.setAttribute('opacity', 0.5 + 0.4 * Math.sin(t * 5));
    }
  };
}
