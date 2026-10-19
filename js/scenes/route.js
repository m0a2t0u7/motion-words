// route：壁の地図の前で、まめが遠回りの道ではなく、まっすぐ家へ向かう一番速いルートを指でなぞる（例文 This is the fastest route home.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';
import { P, blinkAt, reach, popIn, hp } from './vehicle.js';

export const meta = { duration: 4.4, beats: [[0, '地図を見る'], [1.2, 'この道が速い'], [3.2, '家まで最短']] };

export function create(k) {
  const { el, g, pal } = k;
  const FY = 240;
  k.backdrop({ floorY: FY, mood: 'indoor' });
  // 地図
  el('rect', { x: 120, y: 30, width: 260, height: 180, rx: 10, fill: '#F4F1E6', stroke: pal.woodDark, 'stroke-width': 5 });
  [[150, 60, 60, 40], [240, 120, 50, 60], [300, 50, 50, 50], [150, 140, 60, 50]].forEach(([x, y, w, h]) => el('rect', { x, y, width: w, height: h, rx: 4, fill: '#E3E9D5' }));
  const S0 = [146, 190], H0 = [350, 60];
  // 遠回り（灰色）
  el('path', { d: `M ${S0[0]} ${S0[1]} L 230 196 L 230 110 L 290 110 L 290 40 L 236 40 L 236 20`, stroke: '#C9D1DC', 'stroke-width': 7, fill: 'none', 'stroke-linejoin': 'round', 'stroke-dasharray': '1 0' });
  el('path', { d: `M 290 40 L ${H0[0]} 40 L ${H0[0]} ${H0[1]}`, stroke: '#C9D1DC', 'stroke-width': 7, fill: 'none' });
  // 最短（線が伸びる）
  const fast = el('path', { d: `M ${S0[0]} ${S0[1]} L 230 110 L ${H0[0]} ${H0[1]}`, stroke: pal.green, 'stroke-width': 8, fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', pathLength: 1, 'stroke-dasharray': 1 });
  el('circle', { cx: S0[0], cy: S0[1], r: 8, fill: pal.mint, stroke: '#fff', 'stroke-width': 3 });
  const home = g({}); el('path', { d: 'M -14 2 L 0 -12 L 14 2 L 14 14 L -14 14 Z', fill: pal.coral }, home); el('rect', { x: -4, y: 4, width: 8, height: 10, fill: '#fff' }, home); k.tf(home, H0[0], H0[1] - 8);
  const clk = g({}); el('rect', { x: -26, y: -12, width: 52, height: 24, rx: 12, fill: pal.green }, clk); k.text(0, 1, '10 min', { 'font-size': 12, fill: '#fff' }, clk);
  const me = k.buddy({ x: 70, y: FY + 4, scale: 0.95 });
  const stick = el('line', { stroke: pal.woodDark, 'stroke-width': 4, 'stroke-linecap': 'round' });
  const pts = [S0, [230, 110], H0];
  return {
    update(t) {
      const p = easeInOut(seg(t, 1.0, 3.0));
      k.set(fast, { 'stroke-dashoffset': 1 - p });
      const L1 = Math.hypot(84, 80), L2 = Math.hypot(120, 50), d = p * (L1 + L2);
      const [a, b] = d < L1 ? [pts[0], pts[1]] : [pts[1], pts[2]], q = d < L1 ? d / L1 : (d - L1) / L2;
      const fx = lerp(a[0], b[0], q), fy = lerp(a[1], b[1], q);
      const on = easeOut(seg(t, 0.5, 1.0)) * (1 - easeInOut(seg(t, 3.3, 3.7)));
      P(me, { x: 70 + 40 * p, look: 0.8, lean: -4, mood: t > 3.2 ? 'grin' : 'smile', blink: blinkAt(t) });
      me.pose({ armR: lerp(10, reach(me, 0.95, 'R', fx, fy), on) });
      const h = hp(me, 0.95, 'R');
      k.set(stick, { x1: h.x, y1: h.y, x2: lerp(h.x + 10, fx, on), y2: lerp(h.y + 20, fy, on) });
      k.tf(clk, 300, 90, 0, popIn(seg(t, 3.0, 3.4)) + 0.001);
      void hump;
    }
  };
}
