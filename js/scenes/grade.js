// grade：数学のテスト用紙に赤ペンの「A」がつき、まめが喜ぶ（例文 She got a good grade on the math test.）
import { seg, lerp, easeInOut, easeOut, backOut, hump } from '../ease.js';
import { P, blinkAt } from './run-after.js';
import { roomBg, desk, hp } from './look-over.js';
import { grip } from './hand-over.js';

export const meta = { duration: 4.2, beats: [[0, '返却前'], [1.5, '採点'], [3.0, 'よい成績']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 0.95;
  const FY = roomBg(k, 'office', 240);
  const b = k.buddy({ x: 150, y: FY, scale: S });
  const sheet = g({});
  el('rect', { x: -34, y: -46, width: 68, height: 92, rx: 4, fill: '#fff', stroke: pal.line, 'stroke-width': 2 }, sheet);
  ['3+4=7', '6-2=4', '2x5=10'].forEach((s, i) => k.text(-26, -28 + i * 14, s, { 'font-size': 11, 'font-weight': 700, fill: pal.sub, 'text-anchor': 'start' }, sheet));
  const marks = [0, 1, 2].map((i) => {
    const c = el('path', { d: `M 24 ${-36 + i * 14} l 3 3 l 7 -8`, fill: 'none', stroke: pal.red, 'stroke-width': 2.6, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, sheet);
    return c;
  });
  const big = g({}, sheet);
  tf(big, 8, 28);
  k.text(0, 9, 'A', { 'font-size': 32, 'font-weight': 900, fill: pal.red }, big);
  el('circle', { cx: 0, cy: 0, r: 15, fill: 'none', stroke: pal.red, 'stroke-width': 2.6 }, big);
  const star = el('path', { d: 'M 0 -9 L 2.6 -3 L 9 -2.5 L 4 2 L 5.6 8.5 L 0 5 L -5.6 8.5 L -4 2 L -9 -2.5 L -2.6 -3 Z', fill: pal.yellow });
  const gr = grip(k, pal.mint, pal.mintDark, S);
  return {
    update(t) {
      const up = easeInOut(seg(t, 0.3, 1.2)), ck = seg(t, 1.5, 2.3), bg = backOut(seg(t, 2.4, 3.0));
      const jump = hump(seg(t, 3.0, 3.6));
      P(b, { armR: lerp(25, 72, up) + jump * 20, armL: 8 + jump * 50, lean: 3, lift: jump * 14, mood: t > 2.9 ? 'grin' : 'smile', blink: blinkAt(t), look: 4 });
      const h = hp(b, S, 'R');
      tf(sheet, lerp(300, h.x + 34, up), lerp(199, h.y - 28, up), 0, 0.9, 0.9);
      gr(h);
      marks.forEach((m, i) => m.setAttribute('opacity', ck * 3 > i + 0.5 ? 1 : 0));
      tf(big, 8, 28, 0, bg + 0.001, bg + 0.001);
      tf(star, h.x + 70, h.y - 66 - jump * 6, 0, hump(seg(t, 2.8, 3.8)) + 0.001, hump(seg(t, 2.8, 3.8)) + 0.001);
    }
  };
}
