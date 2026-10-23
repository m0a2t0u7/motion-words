// mark：英語のテスト用紙に赤い丸つきの高い点数「95」がつく（例文 I got a high mark in English this term.）
import { seg, lerp, easeInOut, easeOut, backOut, hump } from '../ease.js';
import { P, blinkAt } from './run-after.js';
import { roomBg, desk, hp } from './look-over.js';
import { grip } from './hand-over.js';

export const meta = { duration: 4.2, beats: [[0, '英語の答案'], [1.6, '点がつく'], [3.2, '高い点数']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 0.95;
  const FY = roomBg(k, 'home', 240);
  const b = k.buddy({ x: 150, y: FY, scale: S });
  const sheet = g({});
  el('rect', { x: -36, y: -46, width: 72, height: 92, rx: 4, fill: '#fff', stroke: pal.line, 'stroke-width': 2 }, sheet);
  k.text(-26, -30, 'English', { 'font-size': 11, 'font-weight': 800, fill: pal.blueDark, 'text-anchor': 'start' }, sheet);
  [-18, -8, 2].forEach((y) => el('line', { x1: -26, x2: 26, y1: y, y2: y, stroke: pal.line, 'stroke-width': 3, 'stroke-linecap': 'round' }, sheet));
  const sc = g({}, sheet); tf(sc, 0, 26);
  const ring = el('circle', { cx: 0, cy: 0, r: 17, fill: 'none', stroke: pal.red, 'stroke-width': 3, 'stroke-dasharray': 107, 'stroke-linecap': 'round', transform: 'rotate(-90)' }, sc);
  k.text(0, 8, '95', { 'font-size': 22, 'font-weight': 900, fill: pal.red }, sc);
  const spark = [0, 1, 2].map(() => el('path', { d: 'M 0 -7 L 2 -2 L 7 0 L 2 2 L 0 7 L -2 2 L -7 0 L -2 -2 Z', fill: pal.yellow }));
  const gr = grip(k, pal.mint, pal.mintDark, S);
  return {
    update(t) {
      const up = easeInOut(seg(t, 0.3, 1.2)), dr = easeInOut(seg(t, 1.6, 2.4)), pop = backOut(seg(t, 2.0, 2.7));
      const jump = hump(seg(t, 3.0, 3.6));
      P(b, { armR: lerp(25, 72, up) + jump * 20, armL: 8 + jump * 55, lean: 3, lift: jump * 14, mood: t > 2.9 ? 'grin' : 'smile', blink: blinkAt(t), look: 4 });
      const h = hp(b, S, 'R');
      const px = lerp(300, h.x + 34, up), py = lerp(199, h.y - 28, up);
      tf(sheet, px, py, 0, 0.9, 0.9);
      gr(h);
      k.set(ring, { 'stroke-dashoffset': 107 * (1 - dr) });
      tf(sc, 0, 26, 0, lerp(0.3, 1, pop) * (t > 2.0 ? 1 : 0.001), lerp(0.3, 1, pop) * (t > 2.0 ? 1 : 0.001));
      spark.forEach((s, i) => {
        const p = hump(seg(t, 2.9 + i * 0.15, 3.8 + i * 0.15));
        tf(s, px + [-44, 46, 40][i] * 0.9, py + [-40, -44, 4][i], 0, p + 0.001, p + 0.001);
      });
    }
  };
}
