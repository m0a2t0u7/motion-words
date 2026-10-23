// forward：車がゆっくり前へ進む（例文 The car moved slowly forward.）。まめは歩道から見送る
import { seg, lerp, easeInOut, easeOut, clamp } from '../ease.js';
import { P, blinkAt, car } from './run-after.js';

export const meta = { duration: 3.8, beats: [[0, '止まっている'], [1.0, 'ゆっくり前へ'], [3.0, '前に進んだ']] };

export function create(k) {
  const { el, pal } = k;
  const FY = k.backdrop({ floorY: 214, mood: 'outdoor' });
  el('rect', { x: 0, y: FY, width: 400, height: 86, fill: '#8F9AAE' });
  el('rect', { x: 0, y: FY, width: 400, height: 10, fill: '#E3E7EE' });
  const dashes = [];
  for (let i = 0; i < 9; i++) dashes.push(el('rect', { x: 0, y: FY + 64, width: 36, height: 5, rx: 2, fill: '#fff' }));
  const b = k.buddy({ x: 346, y: FY + 6, scale: 0.7 });
  const c = car(k, pal.coral, pal.coralDark);
  const lines = [0, 1, 2].map((i) => el('line', { x1: 0, y1: 0, x2: -22, y2: 0, stroke: pal.sub, 'stroke-width': 3, 'stroke-linecap': 'round' }));
  const xf = (t) => lerp(70, 250, easeInOut(seg(t, 0.7, 3.3)));
  return {
    update(t) {
      const x = xf(t), v = clamp((xf(t + 0.03) - xf(t - 0.03)) / 4);
      c.set(x, x * 1.4, FY + 56, 0.8 * Math.sin(t * 20) * v);
      lines.forEach((l, i) => { k.tf(l, x - 76 - i * 6, FY + 30 + i * 11); l.setAttribute('opacity', v * 0.7); });
      dashes.forEach((d, i) => k.tf(d, ((i * 50 - x * 0.6) % 450 + 450) % 450 - 40, 0));
      P(b, { look: 0.8, mood: t > 3.2 ? 'grin' : 'smile', armR: 8 + 80 * easeOut(seg(t, 2.2, 2.8)) , blink: blinkAt(t) });
    }
  };
}
