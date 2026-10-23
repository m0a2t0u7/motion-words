// dog：朝日がのぼる住宅街を、まめがリードをつけた犬と散歩する（例文 I walk my dog every morning.）
import { seg, lerp, easeInOut, easeOut, hump, clamp } from '../ease.js';
import { P, blinkAt, walkTo, dog } from './run-after.js';
import { house } from './street.js';
import { hp } from './dig.js';

export const meta = { duration: 4.4, beats: [[0, '朝が来た'], [1.0, '犬と散歩'], [3.4, '毎朝の散歩']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 0.95;
  const sky = el('rect', { x: 0, y: 0, width: 400, height: 300, fill: k.gradient([[0, '#FFD9B8'], [1, '#FFF4E6']]) });
  const blue = el('rect', { x: 0, y: 0, width: 400, height: 300, fill: k.gradient([[0, '#BFE4FA'], [1, '#F4FAFE']]) });
  const sun = g({}); el('circle', { r: 30, fill: '#FFE7A0', opacity: 0.6 }, sun); el('circle', { r: 20, fill: '#FFC93C' }, sun);
  el('path', { d: 'M 0 180 Q 100 150 200 176 T 400 170 V 240 H 0 Z', fill: '#D7EBD2' });
  house(k, 70, 236, '#F7EBDD', pal.coral, 76, 66); house(k, 210, 236, '#E6F1F8', pal.blue, 66, 58); house(k, 340, 236, '#FFF4D6', '#9C86E8', 80, 70);
  const FY = 250;
  el('rect', { x: 0, y: 236, width: 400, height: 64, fill: '#E9EDF2' });
  el('rect', { x: 0, y: 236, width: 400, height: 3, fill: '#D9DFE7' });
  const d = dog(k);
  const leash = el('path', { stroke: pal.red, 'stroke-width': 2.4, fill: 'none', 'stroke-linecap': 'round' });
  const me = k.buddy({ x: 30, y: FY, scale: S });
  const xf = (t) => lerp(20, 250, easeInOut(seg(t, 0.8, 4.2)));
  return {
    update(t) {
      const r = easeOut(seg(t, 0, 1.4));
      tf(sun, 330, lerp(200, 70, r)); blue.setAttribute('opacity', 0.15 + 0.85 * r);
      const w = walkTo(xf, t, 20);
      P(me, { x: w.x, y: FY, walk: w.walk, armL: w.armL, armR: 40, lean: w.lean, look: 0.6, mood: t > 3.4 ? 'grin' : 'smile', blink: blinkAt(t) });
      const dx = w.x + 86 + Math.sin(t * 3) * 4, ph = Math.abs(dx - 106) * 0.16;
      d.set(dx, FY + 4, ph, 1, w.m);
      const h = hp(me, S, 'R', 28), cx = dx + 18, cy = FY - 26;
      k.set(leash, { d: `M ${h.x} ${h.y} Q ${(h.x + cx) / 2} ${Math.max(h.y, cy) + 18 - 12 * w.m} ${cx} ${cy}` });
    }
  };
}
