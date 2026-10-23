// narrow：村へ続くとても細い道を、まめが体を細くして歩いていく（例文 The road to the village is very narrow.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';
import { P, blinkAt, walkTo, parkBg, tree } from './run-after.js';

export const meta = { duration: 3.8, beats: [[0, '細い道の入口'], [1.4, '歩き進む'], [3.0, '村が見える']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = parkBg(k, 150);
  el('rect', { x: 0, y: 150, width: 400, height: 150, fill: '#CFE9C6' });
  // 遠くの村
  [[170, 36, pal.coral], [196, 30, pal.blue], [214, 38, pal.yellow]].forEach(([x, s, c]) => { el('rect', { x, y: 150 - s * 0.6, width: s * 0.7, height: s * 0.6, fill: '#F7E3C3' }); el('path', { d: `M ${x - 3} ${150 - s * 0.6} L ${x + s * 0.35} ${150 - s * 0.6 - 12} L ${x + s * 0.7 + 3} ${150 - s * 0.6} Z`, fill: c }); });
  // 細い道（奥ほど細い）
  el('path', { d: 'M 188 150 L 212 150 L 238 300 L 162 300 Z', fill: '#E8D6B5' });
  el('path', { d: 'M 188 150 L 162 300 M 212 150 L 238 300', stroke: '#C9B48E', 'stroke-width': 2, fill: 'none' });
  tree(k, 60, 232, 1.0); tree(k, 340, 250, 1.3); tree(k, 120, 190, 0.6); tree(k, 290, 180, 0.6);
  const wrap = g({});
  const b = k.buddy({ x: 0, y: 0, scale: 1, parent: wrap });
  const yf = (t) => lerp(270, 176, easeInOut(seg(t, 0.3, 3.2)));
  return {
    update(t) {
      const y = yf(t), s = lerp(0.42, 0.2, (270 - y) / 94);
      const w = walkTo(yf, t, 270);
      tf(wrap, 200, y, 0, s, s);
      P(b, { x: 0, y: 0, walk: w.walk, armL: 4 + (w.armL - 8) * 0.4, armR: 4 + (w.armR - 8) * 0.4, facing: 1, look: 0.2, mood: 'open', blink: blinkAt(t) });
    }
  };
}
