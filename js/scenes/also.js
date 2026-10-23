// also：まめが英語で話し、さらにフランス語も話す（例文 She also speaks French.）
import { seg, lerp, easeInOut, hump } from '../ease.js';
import { P, blinkAt } from './run-after.js';
import { roomBg, say } from './look-over.js';

export const meta = { duration: 4.0, beats: [[0, '英語を話す'], [1.4, 'さらに'], [2.8, 'フランス語も']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = roomBg(k, 'home', 240);
  k.shadow(200, FY + 2, 26, 5);
  const b = k.buddy({ x: 200, y: FY, scale: 1 });
  const s1 = say(k, 80, 40, -1), s2 = say(k, 96, 40, 1);
  k.text(0, 0, 'Hello', { 'font-size': 18, 'font-weight': 700, fill: pal.ink, 'text-anchor': 'middle', 'dominant-baseline': 'central' }, s1.g);
  k.text(0, 0, 'Bonjour', { 'font-size': 18, 'font-weight': 700, fill: pal.ink, 'text-anchor': 'middle', 'dominant-baseline': 'central' }, s2.g);
  const plus = g({});
  el('circle', { r: 15, fill: pal.coral }, plus);
  el('path', { d: 'M -7 0 H 7 M 0 -7 V 7', stroke: '#fff', 'stroke-width': 4, 'stroke-linecap': 'round' }, plus);
  return {
    update(t) {
      const a = seg(t, 0.3, 0.8), c = seg(t, 2.5, 3.0), p = seg(t, 1.5, 1.9);
      const talk1 = hump(seg(t, 0.3, 1.3)) , talk2 = hump(seg(t, 2.5, 3.5));
      P(b, { x: 200, mood: talk1 > 0.3 || talk2 > 0.3 ? 'open' : 'smile', armR: 8 + 40 * easeInOut(talk2), armL: 8 + 20 * talk1, blink: blinkAt(t), look: 0 });
      s1.show(a, 130, 90);
      s2.show(c, 280, 90);
      tf(plus, 205, 62, 0, p * (1 + 0.15 * hump(p)));
      plus.setAttribute('opacity', p);
    }
  };
}
