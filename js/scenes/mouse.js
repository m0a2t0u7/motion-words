// mouse：台所の床を小さなネズミがちょろちょろっと走り抜け、壁の穴へ。まめはびっくりしてとび上がる（例文 A mouse ran across the kitchen floor.）
import { seg, lerp, easeInOut, easeOut, hump, clamp, wobble } from '../ease.js';
import { P, blinkAt } from './run-after.js';
import { kitchenWall } from './cabinet.js';
import { beast } from './animal.js';
import { mark } from './nature.js';

export const meta = { duration: 4.0, beats: [[0, '台所'], [0.8, 'ネズミが走る'], [2.8, '穴に入った']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const kw = kitchenWall(k, { FY: 236, CT: 176, x0: 0, x1: 170 });
  kw.counter();
  el('rect', { x: 20, y: 150, width: 30, height: 26, rx: 4, fill: pal.coral }); el('rect', { x: 90, y: 158, width: 50, height: 18, rx: 9, fill: '#fff', stroke: pal.line });
  // 壁の穴（右端）
  el('path', { d: 'M 356 236 L 356 222 Q 368 208 380 222 L 380 236 Z', fill: '#3A3242' });
  const m = beast(k, 'mouse');
  const me = k.buddy({ x: 250, y: 236, scale: 0.95 });
  const ex = mark(k, '!', pal.coralDark);
  const xf = (t) => lerp(-30, 368, seg(t, 0.8, 2.8));
  return {
    update(t) {
      const x = xf(t), p = seg(t, 0.8, 2.8), on = p > 0 && p < 1;
      m.set({ x, y: 262 - 24 * Math.max(0, (x - 250) / 118), s: 1.2 - 0.4 * clamp((x - 250) / 118), ph: t * 40, m: on ? 1 : 0, tail: Math.sin(t * 30) * 8 });
      m.g.setAttribute('opacity', x > 364 ? 0 : 1);
      const jp = hump(seg(t, 1.3, 1.9)), sc = seg(t, 1.2, 1.4);
      P(me, { x: 250, lift: 26 * jp, armL: 8 + 140 * jp, armR: 8 + 140 * jp, squash: 1 - 0.08 * hump(seg(t, 1.9, 2.1)), look: clamp((x - 250) / 80, -1, 1), mood: t > 1.2 && t < 2.9 ? 'open' : t >= 2.9 ? 'grin' : 'smile', blink: blinkAt(t), facing: 1 });
      ex.show(sc * (1 - seg(t, 2.4, 2.7)), 250, 120);
    }
  };
}
