// break out：台所のコンロで、急に炎が燃え上がる。まめは驚いて飛びのく（例文 A fire broke out in the kitchen.）
import { seg, lerp, easeInOut, easeOut, backOut, wobble, clamp } from '../ease.js';
import { kitchenBg } from './weigh.js';

export const meta = { duration: 3.8, beats: [[0, 'ふつうの台所'], [1.2, '急に火が出る'], [2.6, '燃え広がる']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = kitchenBg(k, 236);
  // コンロ台
  el('rect', { x: 210, y: 176, width: 170, height: 60, fill: '#E7E9EE' });
  el('rect', { x: 206, y: 170, width: 178, height: 8, rx: 3, fill: '#C9CED8' });
  el('rect', { x: 230, y: 190, width: 130, height: 34, rx: 4, fill: '#D5D9E1' });
  el('ellipse', { cx: 290, cy: 170, rx: 30, ry: 4, fill: '#3A4152' });
  // フライパン
  el('path', { d: 'M 262 158 L 318 158 L 312 170 L 268 170 Z', fill: '#4A5160' });
  el('rect', { x: 318, y: 158, width: 40, height: 6, rx: 3, fill: '#2A3242' });
  const glow = el('circle', { cx: 290, cy: 140, r: 60, fill: '#FFB347', opacity: 0 });
  const F = g({}); tf(F, 290, 160);
  const fl = [[0, 1, pal.red], [-14, 0.75, '#FF8A3D'], [14, 0.8, '#FF8A3D'], [0, 0.55, pal.yellow]].map(([dx, s, c]) => {
    const n = g({}, F);
    el('path', { d: 'M 0 0 C -18 0 -20 -28 -6 -44 C -4 -30 6 -34 2 -62 C 18 -44 22 -16 14 0 Z', fill: c }, n);
    return { n, dx, s };
  });
  const smoke = [0, 1, 2].map(() => el('circle', { r: 14, fill: '#8A93A3' }));
  const B = k.buddy({ x: 150, y: FY, scale: 0.85 });
  return {
    update(t) {
      const p = seg(t, 1.1, 1.5), q = backOut(p, 2.2), grow = lerp(0, 1, q) * (1 + 0.5 * easeOut(seg(t, 1.6, 3.2)));
      fl.forEach((f, i) => {
        const fl1 = 1 + 0.12 * Math.sin(t * 17 + i * 2) * clamp(grow);
        tf(f.n, f.dx * (1 + grow * 0.4), 0, 6 * Math.sin(t * 9 + i), f.s * grow * fl1, f.s * grow * (2 - fl1));
      });
      glow.setAttribute('opacity', 0.25 * clamp(grow));
      smoke.forEach((s, i) => {
        const u = ((((t - 1.4) * 0.6 + i / 3) % 1) + 1) % 1;
        k.set(s, { cx: 290 + Math.sin(u * 5 + i) * 14, cy: 110 - u * 90, r: 10 + u * 18, opacity: t > 1.4 ? 0.35 * (1 - u) : 0 });
      });
      const jump = seg(t, 1.25, 1.75);
      B.pose({ x: lerp(160, 120, easeOut(jump)), lift: 18 * Math.sin(jump * Math.PI), armL: t > 1.25 ? lerp(10, 150, easeOut(seg(t, 1.25, 1.45))) : 10, armR: t > 1.25 ? lerp(10, 140, easeOut(seg(t, 1.25, 1.45))) : 30, lean: -10 * easeOut(jump), mood: t > 1.25 ? 'open' : 'smile', look: 0.8, squash: 1 + 0.06 * wobble(seg(t, 1.75, 2.3)) });
    }
  };
}
