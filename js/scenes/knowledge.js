// knowledge：車を前に、まめが車の部品の知識をたくさん頭に持っていて説明する（例文 He has a lot of knowledge about cars.）
import { seg, lerp, easeInOut, easeOut, backOut, hump, clamp } from '../ease.js';
import { P, blinkAt } from './run-after.js';
import { roomBg, cloud, say, desk, hp } from './look-over.js';

const EF = '"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif';
export const meta = { duration: 4.2, beats: [[0, '車を見る'], [1.4, '頭に浮かぶ'], [3.0, 'くわしい']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 0.95;
  const FY = roomBg(k, 'office', 240);
  const em = (ch, sz, parent) => { const q = g({}, parent); k.text(0, 0, ch, { 'font-size': sz, 'font-family': EF, 'text-anchor': 'middle', 'dominant-baseline': 'central' }, q); return q; };
  const tx = (s, sz = 14, fill) => k.text(0, 0, s, { 'font-size': sz, 'font-weight': 700, fill: fill || pal.ink, 'text-anchor': 'middle', 'dominant-baseline': 'central' });
  const car = em('🚗', 80); tf(car, 300, FY - 36);
  k.shadow(300, FY - 2, 50, 6);
  const b = k.buddy({ x: 130, y: FY, scale: S });
  const cl = cloud(k, 140, 84, -1);
  const ic = ['⚙️', '🔧', '🛞', '🔋'].map((c) => em(c, 26, cl.g));
  const pos = [[-40, -10], [-12, 10], [16, -14], [44, 8]];
  return { update(t) {
    cl.show(seg(t, 0.8, 1.3), 140, 74);
    ic.forEach((q, i) => tf(q, pos[i][0], pos[i][1], Math.sin(t * 3 + i) * 6 * seg(t, 2, 3), backOut(seg(t, 1.3 + i * 0.4, 1.7 + i * 0.4))));
    P(b, { look: 0.6, armR: 8 + 70 * easeOut(seg(t, 2.6, 3.2)) + 8 * Math.sin(t * 6) * seg(t, 3.2, 3.6), lean: 3, mood: t > 2.8 ? 'grin' : 'smile', blink: blinkAt(t) });
  } };
}
