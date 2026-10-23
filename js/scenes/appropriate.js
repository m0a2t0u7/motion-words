import { seg, lerp, easeInOut, easeOut, backOut, hump, clamp } from '../ease.js';
import { P, blinkAt, walkTo } from './run-after.js';
import { hp } from './dig.js';
import { grip } from './hand-over.js';
import { roomBg, say, desk } from './look-over.js';
// appropriate：結婚式の会場の前で、まめがジーンズを広げると、ドレスコードの看板に合わず×の印が出る（例文 Jeans are not appropriate for a wedding.）
export const meta = { duration: 4.0, beats: [[0, 'ジーンズ'], [1.2, '式に合わせる'], [2.8, 'ふさわしくない']] };
export function create(k) {
  const { el, g, tf, pal, text } = k, S = 0.95;
  const FY = 236;
  k.backdrop({ floorY: FY, mood: 'outdoor' });
  el('rect', { x: 250, y: 90, width: 120, height: 146, fill: '#FBEFF1' });
  el('path', { d: 'M 240 92 L 310 50 L 380 92 Z', fill: pal.coral });
  el('rect', { x: 292, y: 168, width: 36, height: 68, rx: 18, fill: pal.woodDark });
  const bells = g({}); tf(bells, 310, 118); text(0, 0, '💒', { 'font-size': 30, 'text-anchor': 'middle', 'dominant-baseline': 'central', 'font-family': '"Apple Color Emoji","Noto Color Emoji",sans-serif' }, bells);
  const jn = g({});
  el('path', { d: 'M -16 -28 H 16 L 20 22 H 5 L 0 -6 L -5 22 H -20 Z', fill: pal.blue, stroke: pal.blueDark, 'stroke-width': 2 }, jn);
  el('line', { x1: -16, y1: -22, x2: 16, y2: -22, stroke: pal.blueDark, 'stroke-width': 2 }, jn);
  const x = g({}); tf(x, 200, 120);
  el('line', { x1: -22, y1: -22, x2: 22, y2: 22, stroke: pal.red, 'stroke-width': 9, 'stroke-linecap': 'round' }, x);
  el('line', { x1: 22, y1: -22, x2: -22, y2: 22, stroke: pal.red, 'stroke-width': 9, 'stroke-linecap': 'round' }, x);
  const b = k.buddy({ x: 90, y: FY, scale: S });
  const gr = grip(k, pal.mint, pal.mintDark, S);
  return {
    update(t) {
      const up = easeOut(seg(t, 0.2, 1.0));
      P(b, { x: 90, armR: lerp(20, 105, up), lean: 4 * up, look: 0.9, mood: t > 2.8 ? 'sad' : 'smile', blink: blinkAt(t) });
      const h = hp(b, S, 'R');
      tf(jn, h.x + 2, h.y + 26, 8 * Math.sin(t * 3) * (1 - up), S * 1.1);
      gr({ x: h.x, y: h.y });
      tf(x, 310, 190, 0, backOut(seg(t, 2.8, 3.3)));
      tf(bells, 310, 118, 0, 1);
    }
  };
}
