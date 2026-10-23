// young：若くて元気いっぱいの子が、ぴょんぴょん跳ねる（例文 She is young and full of energy.）
import { seg, lerp, easeOut, easeIn, hump, clamp } from '../ease.js';
import { P, blinkAt, parkBg, tree, star } from './run-after.js';

export const meta = { duration: 3.6, beats: [[0, 'わくわく'], [1.0, '跳ねる'], [2.6, '元気いっぱい']] };

export function create(k) {
  const { el, tf, pal } = k;
  const FY = parkBg(k, 238);
  tree(k, 340, FY - 4, 0.7);
  // 若い芽
  const sp = k.g({}); tf(sp, 70, FY - 2);
  el('line', { x1: 0, y1: 0, x2: 0, y2: -22, stroke: pal.green, 'stroke-width': 4, 'stroke-linecap': 'round' }, sp);
  el('ellipse', { cx: -9, cy: -24, rx: 9, ry: 5, fill: '#7FD3A0', transform: 'rotate(-25 -9 -24)' }, sp);
  el('ellipse', { cx: 9, cy: -26, rx: 9, ry: 5, fill: '#7FD3A0', transform: 'rotate(25 9 -26)' }, sp);
  // 元気メーター
  el('rect', { x: 120, y: 26, width: 160, height: 14, rx: 7, fill: pal.line });
  const meter = el('rect', { x: 120, y: 26, width: 0, height: 14, rx: 7, fill: pal.yellow });
  const b = k.buddy({ x: 200, y: FY + 4, scale: 0.85 });
  const st = [0, 1, 2, 3].map(() => star(k));
  return {
    update(t) {
      const T = 0.7, ph = Math.max(0, t - 0.9) / T, n = Math.floor(ph), f = ph - n;
      const air = t < 0.9 ? 0 : hump(clamp(f / 0.8)) * 62;
      const crouch = t < 0.9 ? hump(seg(t, 0.2, 0.9)) * 0.7 : f > 0.8 ? hump((f - 0.8) / 0.2) * 0.9 : 0;
      const up = air > 4 ? 1 : 0;
      P(b, { y: FY + 4, lift: air, squash: 1 - 0.2 * crouch + 0.06 * up, armL: lerp(20, 170, up), armR: lerp(20, 170, up), mood: air > 4 ? 'grin' : 'smile', look: 0.2, blink: blinkAt(t) });
      meter.setAttribute('width', 160 * easeOut(seg(t, 0.4, 2.6)));
      st.forEach((s, i) => s.set(200 + (i - 1.5) * 52, FY - 110 - (i % 2) * 18, clamp(((t * 0.8 + i * 0.25) % 1) * seg(t, 2.4, 2.7))));
    }
  };
}
