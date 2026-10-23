// project：まめが、進み具合のバーが満タンになりゴールの旗を立てる（例文 We finished the project on time.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';
import { P, blinkAt, clock } from './run-after.js';
import { roomBg } from './look-over.js';

export const meta = { duration: 4.2, beats: [[0, '作業開始'], [1.4, '進んでいく'], [3.0, '期限に間に合う']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = roomBg(k, 'office', 240);
  const bd = g({});
  el('rect', { x: 60, y: 54, width: 280, height: 44, rx: 22, fill: '#fff', stroke: pal.line, 'stroke-width': 3 }, bd);
  const bar = el('rect', { x: 66, y: 60, width: 4, height: 32, rx: 16, fill: pal.green }, bd);
  const items = [0, 1, 2, 3].map((i) => { const x = 110 + i * 62; el('circle', { cx: x, cy: 76, r: 5, fill: '#fff', opacity: 0.0 }, bd); return x; });
  const flag = g({}); tf(flag, 344, 76);
  el('rect', { x: -2, y: -34, width: 4, height: 70, fill: pal.sub }, flag);
  const cloth = el('path', { d: 'M 2 -34 L 34 -24 L 2 -14 Z', fill: pal.coral }, flag);
  clock(k, 200, 140, 20);
  const ok = g({}); tf(ok, 228, 124);
  el('circle', { r: 14, fill: pal.green }, ok);
  el('path', { d: 'M -6 0 l 4 5 l 8 -10', fill: 'none', stroke: '#fff', 'stroke-width': 3.5, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, ok);
  const b = k.buddy({ x: 120, y: FY, scale: 0.95 });
  return {
    update(t) {
      const pr = easeInOut(seg(t, 0.5, 2.9)), fin = seg(t, 3.0, 3.5);
      k.set(bar, { width: 4 + pr * 264 });
      const j = hump(seg(t, 3.0, 3.6));
      P(b, { x: 120 + 130 * easeInOut(seg(t, 2.6, 3.0)) * 0, armL: lerp(30, 160, fin), armR: lerp(30, 160, fin), lift: 14 * j, squash: 1 - 0.1 * (1 - fin) * 0, mood: fin > 0 ? 'grin' : 'flat', look: 0.2, blink: blinkAt(t) });
      tf(flag, 344, 76, 0, 1, seg(t, 2.8, 3.3) || 0.001);
      tf(ok, 228, 124, 0, fin ? 1 : 0.001);
      ok.setAttribute('opacity', fin);
    }
  };
}
