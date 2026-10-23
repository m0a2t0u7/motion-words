// manufacturer：こわれた製品を前に、まめがメーカーへ電話する（例文 Contact the manufacturer if the product breaks.）
import { seg, lerp, easeInOut, hump } from '../ease.js';
import { P, blinkAt } from './run-after.js';
import { roomBg, desk, held, phone, waves, cloud } from './look-over.js';

export const meta = { duration: 4.4, beats: [[0, '製品がこわれる'], [1.4, '電話をかける'], [3.0, 'メーカーへ']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 0.95;
  const FY = roomBg(k, 'home', 240);
  const b = k.buddy({ x: 120, y: FY, scale: S });
  desk(k, 190, 160, 196);
  const lamp = g({}); tf(lamp, 280, 196);
  el('rect', { x: -16, y: -6, width: 32, height: 6, rx: 3, fill: pal.sub }, lamp);
  const arm = el('path', { d: 'M 0 -6 L 0 -34 L 22 -50', fill: 'none', stroke: pal.sub, 'stroke-width': 5, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, lamp);
  el('path', { d: 'M 14 -52 L 36 -46 L 32 -34 Z', fill: pal.yellow }, lamp);
  const sp = [0, 1, 2].map(() => el('path', { d: 'M 0 -6 L 3 0 L -1 2 L 2 8', fill: 'none', stroke: pal.yellowDark, 'stroke-width': 2.4, 'stroke-linecap': 'round' }));
  const x = g({}); tf(x, 284, 130);
  el('circle', { r: 11, fill: pal.red }, x);
  el('path', { d: 'M -5 -5 L 5 5 M 5 -5 L -5 5', stroke: '#fff', 'stroke-width': 3, 'stroke-linecap': 'round' }, x);
  const ph = phone(k);
  const wv = waves(k, pal.blue);
  const c = cloud(k, 96, 66, -1);
  el('rect', { x: -26, y: -12, width: 46, height: 30, fill: '#B8C7D9', stroke: pal.line, 'stroke-width': 2 }, c.g);
  el('rect', { x: 10, y: -30, width: 8, height: 20, fill: pal.sub }, c.g);
  [-18, -6].forEach((xx) => el('rect', { x: xx, y: -6, width: 9, height: 8, fill: '#fff' }, c.g));
  return {
    update(t) {
      const brk = seg(t, 0.4, 0.8), call = easeInOut(seg(t, 1.3, 2.0)), talk = seg(t, 2.2, 3.8);
      P(b, { x: 120, armR: lerp(20, 150, call), armL: 12, look: 0.6, mood: talk > 0 ? 'open' : (brk > 0.5 ? 'sad' : 'smile'), blink: blinkAt(t) });
      held(k, b, S, ph.g, 'R', 150 * call);
      tf(x, 284, 130, 0, brk || 0.001);
      sp.forEach((s, i) => { const o = hump(seg(t, 0.4 + i * 0.1, 1.2 + i * 0.1)); tf(s, 282 + (i - 1) * 14, 152 - o * 8, i * 20 - 20); s.setAttribute('opacity', o); });
      wv(talk > 0 ? 1 : 0, (t * 1.2) % 1, 150, 110, 1, 1);
      c.show(seg(t, 2.9, 3.4), 255, 82);
    }
  };
}
