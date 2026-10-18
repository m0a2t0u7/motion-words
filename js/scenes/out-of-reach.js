// out of reach：いちばん上の棚の箱に、背伸びしてもジャンプしても指先が届かない（例文 The box on the top shelf is out of reach.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';
import { P, box, drop } from './in-common.js';

export const meta = { duration: 4.2, beats: [[0, '高い棚の箱'], [1.2, '背伸び・ジャンプ'], [3.2, '届かない']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 240, mood: 'indoor' });
  el('rect', { x: 0, y: FY - 6, width: 400, height: 6, fill: pal.line });
  el('rect', { x: 40, y: 50, width: 80, height: 64, rx: 6, fill: '#DDEFFA', stroke: '#fff', 'stroke-width': 5 });
  // 背の高い棚（動かない）
  k.shadow(276, FY, 70, 5);
  el('rect', { x: 210, y: 40, width: 132, height: FY - 40, rx: 4, fill: '#F1E4CF', stroke: pal.woodDark, 'stroke-width': 4 });
  [76, 140, 196].forEach((y) => el('rect', { x: 212, y, width: 128, height: 6, fill: pal.woodDark }));
  [[230, 140, 18, pal.blue], [252, 140, 22, pal.yellow], [300, 196, 26, pal.green], [324, 196, 18, pal.coral]].forEach(([x, y, h, c]) => el('rect', { x, y: y - h, width: 16, height: h, rx: 2, fill: c }));
  const bx = box(k, 46, 30, '#E3B77E'); tf(bx, 250, 76);
  const gap = el('line', { x1: 0, y1: 0, x2: 0, y2: 0, stroke: pal.red, 'stroke-width': 2.5, 'stroke-dasharray': '4 4' });
  const A = k.buddy({ x: 200, y: FY, scale: 1.0 });
  const sw = drop(k);
  return {
    update(t) {
      // 背伸び（0.4〜）→ジャンプ2回（1.4〜3.0）→あきらめて見上げる
      const tip = easeOut(seg(t, 0.4, 0.9)) * (1 - easeOut(seg(t, 3.0, 3.4)));
      const j = t > 1.4 && t < 3.0 ? Math.max(0, Math.sin(((t - 1.4) / 0.8) * Math.PI)) : 0;
      const crouch = t > 1.3 && t < 3.0 ? Math.max(0, -Math.sin(((t - 1.4) / 0.8) * Math.PI)) : 0;
      const lift = 6 * tip + 22 * j;
      const arm = lerp(8, 176, easeOut(seg(t, 0.3, 0.8))) - lerp(0, 150, easeOut(seg(t, 3.1, 3.5)));
      P(A, { x: 200, lift, squash: 1 + 0.05 * tip - 0.08 * crouch, armR: arm, armL: lerp(8, 30, tip), lean: -6 * tip, look: 0.5, mood: t > 3.1 ? 'sad' : 'open' });
      // 指先と箱のすき間（届いていない）
      const handY = FY - (10 + 46 + 26) - lift - 6 * tip;
      const show = t > 0.9 && t < 3.1;
      k.set(gap, { x1: 236, y1: handY - 8, x2: 236, y2: 80, opacity: show && handY - 8 > 84 ? 1 : 0 });
      sw.setAttribute('opacity', t > 3.1 ? 1 : 0); tf(sw, 170, FY - 104 + 10 * seg(t, 3.1, 4.2));
    }
  };
}
