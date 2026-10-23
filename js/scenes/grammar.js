import { seg, lerp, easeInOut, easeOut, backOut, hump, clamp } from '../ease.js';
import { P, blinkAt, walkTo } from './run-after.js';
import { hp } from './dig.js';
import { grip } from './hand-over.js';
import { roomBg, say, desk } from './look-over.js';
// grammar：ことばのブロックが順番どおりに並ぶと正しい文になる。まめが並べてチェック（例文 English grammar is easy once you learn the rules.）
export const meta = { duration: 4.0, beats: [[0, 'ばらばら'], [1.2, '並べる'], [2.8, '文になる']] };
export function create(k) {
  const { el, g, tf, pal, text } = k, S = 0.95;
  const FY = roomBg(k, 'home', 240);
  const lab = ['I', 'eat', 'rice'], cols = [pal.blue, pal.coral, pal.green], W = [40, 62, 74];
  const bl = lab.map((s, i) => { const n = g({}); el('rect', { x: -W[i] / 2, y: -17, width: W[i], height: 34, rx: 9, fill: cols[i] }, n); text(0, 7, s, { 'font-size': 20, 'font-weight': 700, fill: '#fff', 'text-anchor': 'middle' }, n); return n; });
  const from = [[270, 120], [190, 160], [320, 170]], to = [[205, 130], [262, 130], [340, 130]];
  const ck = el('path', { d: 'M 0 0 l 10 11 l 22 -26', fill: 'none', stroke: pal.green, 'stroke-width': 7, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' });
  const b = k.buddy({ x: 100, y: FY, scale: S });
  return {
    update(t) {
      bl.forEach((n, i) => { const q = easeInOut(seg(t, 1.0 + i * 0.4, 1.7 + i * 0.4)); tf(n, lerp(from[i][0], to[i][0], q), lerp(from[i][1], to[i][1], q) - 14 * hump(q), lerp(i ? -10 : 8, 0, q)); });
      const place = hump(seg(t, 1.0, 2.6));
      P(b, { x: 100, armR: 50 + 60 * place, lean: 5 * place, look: 0.8, mood: t > 2.9 ? 'grin' : 'smile', blink: blinkAt(t) });
      tf(ck, 228, 190, 0, backOut(seg(t, 2.8, 3.3)));
    }
  };
}
