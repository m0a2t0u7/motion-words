// trip：2人がリュックを背負って山道を登り、頂上で両手を上げて景色を楽しむ（例文 We took a trip to the mountains.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';
import { P, blinkAt, tree } from './vehicle.js';
import { backpack } from './bus.js';

export const meta = { duration: 4.4, beats: [[0, '山へ出かける'], [1.4, '山道を登る'], [3.2, '頂上に着いた']] };

export function create(k) {
  const { el, pal } = k;
  k.backdrop({ floorY: 300 });
  el('path', { d: 'M -20 300 L 120 130 L 230 240 L 320 150 L 440 300 Z', fill: '#DCE7EE' });
  el('path', { d: 'M 104 150 L 120 130 L 136 150 L 126 146 L 120 152 L 112 146 Z', fill: '#fff' });
  // 手前の山（登る斜面）
  el('path', { d: 'M -20 300 L -20 270 L 300 110 L 420 170 L 420 300 Z', fill: '#BFE3A8' });
  el('path', { d: 'M 0 262 L 300 112', stroke: '#E3D2B0', 'stroke-width': 10, 'stroke-linecap': 'round' });
  tree(k, 360, 190, 0.5); tree(k, 60, 280, 0.6);
  el('path', { d: 'M 300 112 L 300 70', stroke: pal.ink, 'stroke-width': 3 }); el('path', { d: 'M 300 70 L 324 78 L 300 86 Z', fill: pal.red });
  const slope = (x) => 262 - (x / 300) * 150;
  const a = k.buddy({ scale: 0.62 }), b = k.buddy({ scale: 0.62, color: pal.coral, dark: pal.coralDark });
  backpack(k, a); backpack(k, b, '#6AA8F7', '#4A8BE0');
  return {
    update(t) {
      [[a, 0], [b, 34]].forEach(([p, lag], i) => {
        const x = lerp(30 - lag, 290 - lag * 1.2, easeInOut(seg(t, 0.2, 3.2)));
        const m = t > 0.2 && t < 3.2 ? 1 : 0, w = (x - 30) * 0.16;
        const top = seg(t, 3.3, 3.7);
        P(p, { x, y: slope(x) + 2, walk: m ? w : 0, lean: m ? 12 : 0, armL: 8 + Math.sin(w) * 20 * m + 150 * easeOut(top), armR: 8 - Math.sin(w) * 20 * m + 150 * easeOut(top), mood: top > 0 ? 'grin' : 'smile', look: 0.6, blink: blinkAt(t, i), lift: 8 * hump(top) });
      });
    }
  };
}
