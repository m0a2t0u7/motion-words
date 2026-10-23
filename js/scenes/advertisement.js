// advertisement：通りを歩くまめが、新しい車の大きな広告看板を見上げる（例文 I saw an advertisement for a new car.）
import { seg, lerp, easeOut, easeInOut, hump } from '../ease.js';
import { P, blinkAt, walkTo } from './run-after.js';
import { roomBg } from './look-over.js';
import { streetBg } from './weigh.js';
import { faceAt } from './weigh.js';

export const meta = { duration: 4.0, beats: [[0, '通りを歩く'], [1.4, '看板に気づく'], [2.6, '広告を見上げる']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 0.95;
  const FY = streetBg(k, 240);
  [[250, 330]].forEach(([a, c]) => el('rect', { x: a + 20, y: 110, width: 8, height: FY - 110, fill: pal.sub }) && el('rect', { x: c - 20, y: 110, width: 8, height: FY - 110, fill: pal.sub }));
  el('rect', { x: 226, y: 30, width: 150, height: 90, rx: 6, fill: '#fff', stroke: pal.sub, 'stroke-width': 5 });
  el('rect', { x: 232, y: 36, width: 138, height: 78, rx: 3, fill: '#CFE8F7' });
  const car = g({}); tf(car, 300, 100);
  el('path', { d: 'M -44 0 L -44 -14 Q -40 -18 -26 -20 L -16 -34 Q -12 -38 -4 -38 L 18 -38 Q 26 -38 30 -32 L 38 -20 Q 46 -18 46 -10 L 46 0 Z', fill: pal.coral }, car);
  el('path', { d: 'M -12 -22 L -6 -32 L 8 -32 L 8 -22 Z M 14 -22 L 14 -32 L 20 -32 L 28 -22 Z', fill: '#EAF6FD' }, car);
  [-26, 26].forEach((x) => { el('circle', { cx: x, cy: 0, r: 9, fill: pal.ink }, car); el('circle', { cx: x, cy: 0, r: 3.5, fill: '#ddd' }, car); });
  k.text(334, 58, 'NEW', { 'font-size': 15, fill: pal.red, 'text-anchor': 'middle' });
  const sp = [[238, 44], [362, 48], [352, 104]].map(([x, y]) => { const s = k.text(0, 0, '★', { 'font-size': 14, fill: pal.yellow }); k.tf(s, x, y); return s; });
  const b = k.buddy({ x: 0, y: FY, scale: S });
  const mark = k.text(0, 0, '!', { 'font-size': 22, fill: pal.red });
  return {
    update(t) {
      const xf = (u) => lerp(-20, 130, easeOut(seg(u, 0, 1.8)));
      const w = walkTo(xf, t, -20), look = easeInOut(seg(t, 1.3, 2.0));
      P(b, { x: w.x, walk: w.walk, armL: w.armL, armR: w.armR, lean: w.lean - 6 * look, facing: 1, look: 0.9, mood: t > 2.2 ? 'open' : 'smile', blink: blinkAt(t) });
      faceAt(b, 3 * look, -7 * look);
      sp.forEach((s, i) => s.setAttribute('opacity', 0.35 + 0.65 * Math.abs(Math.sin(t * 4 + i * 2))));
      k.tf(mark, w.x + 4, FY - 112 + 6 * hump(seg(t, 1.4, 1.9)), 0, 1, 1);
      mark.setAttribute('opacity', t > 1.4 && t < 3.2 ? 1 : 0);
    }
  };
}
