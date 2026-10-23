// wide：川の岸に立つまめが両腕を広げて、川幅の広さを示す（例文 The river is wide at this point.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';
import { P, blinkAt, parkBg } from './run-after.js';

export const meta = { duration: 3.4, beats: [[0, '岸に立つ'], [1.0, '腕を広げる'], [2.4, '川幅が広い']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = parkBg(k, 238);
  el('rect', { x: 0, y: FY, width: 400, height: 64, fill: '#DCEFD9' });
  el('rect', { x: 118, y: FY - 2, width: 282, height: 66, fill: pal.water });
  [150, 220, 290, 350].forEach((x, i) => el('path', { d: `M ${x} ${FY + 14 + (i % 2) * 22} q 8 -5 16 0 t 16 0`, stroke: '#fff', 'stroke-width': 2, fill: 'none', opacity: 0.7 }));
  el('rect', { x: 112, y: FY - 4, width: 8, height: 6, rx: 3, fill: '#B9D8B0' });
  const arrow = g({});
  const line = el('line', { x1: 0, y1: 0, x2: 0, y2: 0, stroke: pal.coral, 'stroke-width': 4, 'stroke-linecap': 'round' }, arrow);
  const hl = el('path', { d: 'M 10 -8 L 0 0 L 10 8', fill: 'none', stroke: pal.coral, 'stroke-width': 4, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, arrow);
  const hr = el('path', { d: 'M -10 -8 L 0 0 L -10 8', fill: 'none', stroke: pal.coral, 'stroke-width': 4, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, arrow);
  const b = k.buddy({ x: 72, y: FY + 4, scale: 0.95 });
  return {
    update(t) {
      const a = easeOut(seg(t, 1.0, 2.0)), s = easeInOut(seg(t, 1.8, 2.6));
      P(b, { armL: lerp(8, 110, a), armR: lerp(8, 110, a), lean: -3 * a, look: 0.8, mood: a > 0.3 ? 'open' : 'smile', blink: blinkAt(t) });
      const len = 250 * s;
      line.setAttribute('x1', 0); line.setAttribute('x2', len);
      tf(hl, 0, 0); tf(hr, len, 0);
      tf(arrow, 122, FY + 40); arrow.setAttribute('opacity', s > 0 ? 1 : 0);
      tf(hl, 0, 0, 0, 1, 1);
    }
  };
}
