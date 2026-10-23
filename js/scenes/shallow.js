import { seg, lerp, easeInOut, easeOut, easeIn, backOut, wobble, hump, clamp } from '../ease.js';
import { P, blinkAt } from './run-after.js';
// 手先が(tx,ty)を向く腕の角度（シーン内だけで使う）
const aim = (x, y, f, s, tx, ty) => (Math.atan2((tx - (x + 27 * f * s)) * f, ty - (y - 56 * s)) * 180) / Math.PI;
// shallow：浅い水の中で子どもたちが安全に遊ぶ（例文 Children can play safely in the shallow water.）
export const meta = { duration: 4.0, beats: [[0, '浅い水辺'], [1.2, 'ぴょんと跳ぶ'], [2.8, '水しぶき']] };
export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 200, mood: 'outdoor' });
  el('rect', { x: 0, y: FY, width: 400, height: 100, fill: '#F2E4BF' });
  const a = k.buddy({ x: 140, y: 244, scale: 0.9 });
  const c = k.buddy({ x: 250, y: 252, scale: 0.9, facing: -1, color: pal.coral, dark: pal.coralDark });
  el('rect', { x: 20, y: 226, width: 360, height: 70, rx: 10, fill: pal.water, opacity: 0.6 });
  el('rect', { x: 20, y: 226, width: 360, height: 3, fill: '#fff', opacity: 0.7 });
  const m = g({}); el('rect', { x: 0, y: 0, width: 6, height: 62, rx: 3, fill: pal.woodDark }, m);
  [0, 1, 2, 3].forEach((i) => el('line', { x1: 0, y1: 8 + i * 15, x2: -9, y2: 8 + i * 15, stroke: pal.woodDark, 'stroke-width': 2 }, m));
  tf(m, 352, 190);
  const drops = [0, 1, 2, 3, 4].map(() => el('circle', { r: 3.2, fill: '#fff', stroke: pal.blue, 'stroke-width': 1.5 }));
  return {
    update(t) {
      const j = (s0) => Math.max(0, Math.sin(seg(t, s0, s0 + 0.8) * Math.PI));
      const ja = j(1.2) + j(2.6), jc = j(1.6) + j(3.0);
      P(a, { y: 244 - 18 * ja, armL: 40 + 80 * ja, armR: 40 + 80 * ja, mood: 'grin', blink: blinkAt(t), squash: 1 - 0.06 * (1 - ja) * 0 });
      P(c, { y: 252 - 16 * jc, armL: 40 + 80 * jc, armR: 40 + 80 * jc, mood: 'grin', blink: blinkAt(t, 1) });
      drops.forEach((d, i) => {
        const p = ((t - 1.9 - (i % 3) * 0.04) % 1.4 + 1.4) % 1.4 / 1.4, on = t > 1.8;
        const sx = (i < 3 ? 140 : 250) + (i - 2) * 12, q = p * 1.1;
        tf(d, sx + (i - 2) * 14 * q, 226 - 40 * Math.sin(Math.min(q, 1) * Math.PI), 0); d.setAttribute('opacity', on && q < 1 ? 1 : 0);
      });
    }
  };
}
