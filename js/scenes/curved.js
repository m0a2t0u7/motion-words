import { seg, lerp, easeInOut, easeOut, easeIn, backOut, wobble, hump, clamp } from '../ease.js';
import { P, blinkAt } from './run-after.js';
// 手先が(tx,ty)を向く腕の角度（シーン内だけで使う）
const aim = (x, y, f, s, tx, ty) => (Math.atan2((tx - (x + 27 * f * s)) * f, ty - (y - 56 * s)) * 180) / Math.PI;
// curved：海岸に沿ってカーブした道。まめが指さし、車がなぞって走る（例文 The road follows a curved line along the coast.）
export const meta = { duration: 4.2, beats: [[0, '海ぞいの道'], [1.0, '車が走る'], [3.2, 'カーブの線']] };
export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'outdoor' });
  el('rect', { x: 0, y: 70, width: 400, height: 56, fill: pal.water });
  el('path', { d: 'M 0 124 Q 120 112 220 150 T 400 168 V 126 H 0 Z', fill: '#F2E4BF' });
  const pts = (u) => { const x = 20 + u * 360; return { x, y: 176 + 28 * Math.sin(u * 5.2 + 0.6) - 8 * u }; };
  const road = Array.from({ length: 41 }, (_, i) => pts(i / 40)).map((p, i) => `${i ? 'L' : 'M'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
  el('path', { d: road, stroke: '#9AA3B2', 'stroke-width': 18, fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' });
  el('path', { d: road, stroke: '#fff', 'stroke-width': 2, 'stroke-dasharray': '8 8', fill: 'none' });
  const trail = el('path', { d: road, stroke: pal.coral, 'stroke-width': 4, fill: 'none', 'stroke-linecap': 'round', pathLength: 1, 'stroke-dasharray': '0 1' });
  const car = g({}); el('rect', { x: -12, y: -12, width: 24, height: 12, rx: 5, fill: pal.blue }, car); el('rect', { x: -6, y: -17, width: 12, height: 7, rx: 3, fill: pal.blueDark }, car);
  [-7, 7].forEach((x) => el('circle', { cx: x, cy: 0, r: 3.4, fill: pal.ink }, car));
  const b = k.buddy({ x: 70, y: FY + 14, scale: 0.9 });
  return {
    update(t) {
      const u = easeInOut(seg(t, 1.0, 3.2)), p = pts(u), p2 = pts(Math.min(1, u + 0.01)), p1 = pts(Math.max(0, u - 0.01));
      tf(car, p.x, p.y + 5, (Math.atan2(p2.y - p1.y, p2.x - p1.x) * 180) / Math.PI);
      trail.setAttribute('stroke-dasharray', `${u} 1`);
      const a = aim(70, FY + 14, 1, 0.9, p.x, p.y);
      P(b, { armR: lerp(8, 100, easeOut(seg(t, 0.2, 0.8))), look: 0.6, mood: t > 3.2 ? 'grin' : 'smile', blink: blinkAt(t), lean: 3 });
    }
  };
}
