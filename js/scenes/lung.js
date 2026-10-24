// lung：まめが深呼吸し、胸の半透明の肺が空気でふくらんで縮み、また吸いこむ（例文 We breathe air into our lungs.）
import { seg, lerp, easeInOut, easeOut } from '../ease.js';
import { P, blinkAt } from './run-after.js';

export const meta = { duration: 4.4, beats: [[0, '空気を吸う'], [1.8, 'はき出す'], [3.2, '肺にいっぱい']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 1.6;
  const FY = k.backdrop({ floorY: 262, mood: 'outdoor' });
  el('rect', { x: 0, y: FY, width: 400, height: 40, fill: '#DCEFD9' });
  el('circle', { cx: 330, cy: 60, r: 22, fill: '#FFE9A8' });
  const b = k.buddy({ x: 200, y: FY, scale: S });
  // 肺（体の中。顔の下に重ねる）
  const lg = g({}); b.body.insertBefore(lg, b.body.children[4]);
  const lungs = g({}, lg);
  const lobe = (d) => el('path', { d, fill: '#FF8FA3', opacity: 0.72, stroke: '#E5677F', 'stroke-width': 1.8, 'stroke-linejoin': 'round' }, lungs);
  lobe('M -4 -35 C -18 -38 -27 -22 -26 -9 C -25 -3 -16 -3 -9 -6 C -5 -9 -4 -20 -4 -35 Z');
  lobe('M 4 -35 C 18 -38 27 -22 26 -9 C 25 -3 16 -3 9 -6 C 5 -9 4 -20 4 -35 Z');
  el('path', { d: 'M 0 -42 L 0 -31 M 0 -31 L -9 -25 M 0 -31 L 9 -25', stroke: '#E5677F', 'stroke-width': 3, 'stroke-linecap': 'round', fill: 'none' }, lg);
  // 空気の矢印（口へ入る／出る）
  const fx = g({}); const arr = [0, 1, 2].map(() => {
    const a = g({}, fx);
    el('line', { x1: -9, y1: 0, x2: 7, y2: 0, stroke: pal.blue, 'stroke-width': 4, 'stroke-linecap': 'round' }, a);
    el('path', { d: 'M 3 -6 L 11 0 L 3 6 Z', fill: pal.blue }, a);
    return a;
  });
  // 体内の空気（気道のしるし）
  const inner = [0, 1].map(() => el('circle', { r: 2.8, fill: '#fff', opacity: 0 }, lg));

  // 吸う 0.2〜1.5 / はく 1.9〜2.9 / 吸う 3.1〜4.2
  const level = (t) => (t < 1.9 ? easeInOut(seg(t, 0.2, 1.5)) : t < 3.1 ? 1 - easeInOut(seg(t, 1.9, 2.9)) * 0.88 : 0.12 + 0.88 * easeInOut(seg(t, 3.1, 4.2)));
  const flow = (t) => ((t > 0.2 && t < 1.5) || (t > 3.1 && t < 4.2) ? 1 : t > 1.9 && t < 2.9 ? -1 : 0);

  return {
    update(t) {
      const L = level(t), f = flow(t);
      P(b, { armL: lerp(10, 62, L), armR: lerp(10, 62, L), squash: 1 + 0.03 * L, look: 0, mood: f > 0 ? 'flat' : f < 0 ? 'open' : 'smile', blink: f ? 0 : blinkAt(t) });
      tf(lungs, 0, 0, 0, 1, 1);
      lungs.setAttribute('transform', `translate(0 -21) scale(${(0.72 + 0.42 * L).toFixed(3)} ${(0.78 + 0.34 * L).toFixed(3)}) translate(0 21)`);
      tf(fx, b.state.x, b.state.y, 0, S, S);
      const ph = (t * 0.9) % 1;
      arr.forEach((a, i) => {
        const u = f > 0 ? (ph + i / 3) % 1 : 1 - ((ph + i / 3) % 1);
        const x = lerp(-78, -34, u), y = lerp(-76, -50, u);
        tf(a, x, y, (f > 0 ? 1 : -1) * 0 + (f > 0 ? 30 : 210), 0.9, 0.9);
        a.setAttribute('opacity', f ? Math.sin(u * Math.PI) : 0);
      });
      inner.forEach((c, i) => {
        const u = f > 0 ? (ph * 1.2 + i / 2) % 1 : 1 - ((ph * 1.2 + i / 2) % 1);
        k.set(c, { cx: lerp(-1, i ? 14 : -14, seg(u, 0.4, 1)) * 0.8, cy: lerp(-42, -18, u), opacity: f ? Math.sin(u * Math.PI) * 0.9 : 0 });
      });
    }
  };
}
