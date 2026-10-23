// sales：まめの店で、売上のグラフが10パーセント伸びてまめが喜ぶ（例文 Sales went up 10 percent this year.）
import { seg, lerp, easeOut, backOut, hump } from '../ease.js';
import { P, blinkAt } from './run-after.js';
import { roomBg } from './look-over.js';

export const meta = { duration: 4.0, beats: [[0, '今年のはじめ'], [1.2, '売上が伸びる'], [2.8, '10%アップ']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = roomBg(k, 'office', 240);
  const bd = g({});
  el('rect', { x: 170, y: 40, width: 210, height: 160, rx: 8, fill: '#fff', stroke: pal.line, 'stroke-width': 3 }, bd);
  el('path', { d: 'M 190 60 V 176 H 364', fill: 'none', stroke: pal.sub, 'stroke-width': 3, 'stroke-linecap': 'round' }, bd);
  const hs = [60, 76], xs = [220, 300];
  const bars = hs.map((h, i) => el('rect', { x: xs[i], y: 176 - h, width: 50, height: h, rx: 4, fill: i ? pal.green : pal.blue }, bd));
  const ar = g({}); tf(ar, 325, 80);
  el('path', { d: 'M 0 26 V -10 M -12 2 L 0 -12 L 12 2', fill: 'none', stroke: pal.coralDark, 'stroke-width': 6, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, ar);
  const pc = k.text(325, 56, '+10%', { 'font-size': 20, 'font-weight': 700, fill: pal.coralDark, 'text-anchor': 'middle' });
  const coins = [0, 1, 2].map(() => el('circle', { r: 7, fill: pal.yellow, stroke: pal.yellowDark, 'stroke-width': 2 }));
  const b = k.buddy({ x: 90, y: FY, scale: 0.95 });
  return {
    update(t) {
      const up = easeOut(seg(t, 1.0, 2.4)), fin = seg(t, 2.6, 3.0);
      k.set(bars[1], { y: 176 - lerp(60, 76, up), height: lerp(60, 76, up) });
      bars[1].setAttribute('fill', up > 0.99 ? pal.green : pal.blue);
      tf(ar, 325, lerp(95, 82, up), 0, seg(t, 2.2, 2.6) || 0.001);
      pc.setAttribute('opacity', seg(t, 2.4, 2.8));
      P(b, { x: 90, armL: 20 + 140 * fin, armR: 20 + 140 * fin, lift: 12 * hump(seg(t, 2.6, 3.4)), mood: fin > 0 ? 'grin' : 'smile', look: 0.8, blink: blinkAt(t) });
      coins.forEach((c, i) => { const u = seg(t, 1.2 + i * 0.3, 2.4 + i * 0.3); k.set(c, { cx: 150 + i * 6, cy: 170 - u * 60 - hump(u) * 14, opacity: u > 0 && u < 1 ? 1 - u * u : 0 }); });
    }
  };
}
