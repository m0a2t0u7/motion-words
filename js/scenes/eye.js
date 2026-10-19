// eye：ソファで、ゆっくり目を閉じて深呼吸。肩の力が抜けてリラックスする（例文 Close your eyes and relax.）
import { seg, lerp, easeInOut, easeOut, hump, clamp } from '../ease.js';
import { P, blinkAt, bp, spot } from './body.js';
import { homeBg } from './furniture.js';
import { sofa } from './run-after.js';

export const meta = { duration: 4.4, beats: [[0, '目を閉じて'], [1.6, '深呼吸'], [3.0, 'リラックス']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 1.2, FY = 240;
  homeBg(k, { FY, winX: 40, sky: '#E7DDF7' });
  el('path', { d: `M 318 ${FY} L 324 ${FY - 30} L 346 ${FY - 30} L 352 ${FY} Z`, fill: pal.coral });
  [[-10, -50, -18], [0, -58, 0], [10, -48, 20]].forEach(([dx, dy, r]) => el('ellipse', { cx: 335 + dx, cy: FY + dy, rx: 6, ry: 16, fill: pal.green, transform: `rotate(${r} ${335 + dx} ${FY + dy + 12})` }));
  sofa(k, 200, FY, 190);
  const b = k.buddy({ x: 200, y: FY - 26, scale: S });
  const ring = spot(k);
  const notes = [0, 1, 2].map((i) => { const n = g({}); el('ellipse', { cx: 0, cy: 0, rx: 5, ry: 4, fill: pal.violet }, n); el('line', { x1: 4.5, y1: 0, x2: 4.5, y2: -16, stroke: pal.violet, 'stroke-width': 2.4 }, n); return n; });
  return {
    update(t) {
      const close = easeInOut(seg(t, 0.6, 1.6));
      const br = t > 1.6 ? Math.sin((t - 1.6) * 2.6) : 0, relax = easeInOut(seg(t, 2.6, 3.4));
      P(b, { y: FY - 26, blink: close, squash: 1 + 0.03 * br * (1 - relax * 0.5) - 0.04 * relax, armL: lerp(10, 26, relax), armR: lerp(10, 26, relax), lean: -6 * relax, mood: t > 2.6 ? 'smile' : 'flat' });
      const e = bp(b, S, 0, -54);
      ring.set(seg(t, 0.2, 0.6) * (1 - seg(t, 1.6, 2.0)), e.x, e.y, 30, t);
      notes.forEach((n, i) => { const q = seg(t, 2.8 + i * 0.35, 4.4); tf(n, e.x + 44 + i * 18, e.y - 10 - 40 * q, 10 * Math.sin(t * 3 + i), q > 0 ? 1 : 0.001); n.setAttribute('opacity', (1 - q * 0.6).toFixed(2)); });
    }
  };
}
