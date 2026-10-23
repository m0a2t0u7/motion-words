// quantity：まめが注文した紙の束が、どんどん届いて大きな山になる（例文 We ordered a large quantity of paper.）
import { seg, lerp, easeOut, backOut, hump } from '../ease.js';
import { P, blinkAt } from './run-after.js';
import { roomBg } from './look-over.js';

export const meta = { duration: 4.2, beats: [[0, '紙を注文'], [1.0, '届いていく'], [3.2, 'たくさんの山']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = roomBg(k, 'office', 240);
  k.shadow(280, FY + 2, 80, 6);
  const reams = [];
  for (let r = 0; r < 4; r++) for (let c = 0; c < 4 - r; c++) {
    const n = reams.length, o = g({});
    el('rect', { x: -22, y: -16, width: 44, height: 16, rx: 2, fill: '#fff', stroke: pal.line, 'stroke-width': 2 }, o);
    el('rect', { x: -22, y: -11, width: 44, height: 6, fill: n % 2 ? pal.blue : pal.coral, opacity: 0.85 }, o);
    reams.push({ o, x: 280 + (c - (3 - r) / 2) * 48, y: FY - r * 16, t0: 0.9 + n * 0.22 });
  }
  const b = k.buddy({ x: 110, y: FY, scale: 0.95 });
  return {
    update(t) {
      const aw = seg(t, 3.0, 3.4);
      P(b, { x: 110, armR: 40 + 60 * aw, armL: 20 + 70 * aw, mood: aw > 0 ? 'open' : 'smile', look: 0.7, blink: blinkAt(t) });
      reams.forEach((r) => {
        const u = seg(t, r.t0, r.t0 + 0.35);
        const fall = (1 - easeOut(u)) * 150;
        tf(r.o, r.x, r.y - fall, 0, 1, 1 - 0.12 * hump(seg(u, 0.85, 1.0)));
        r.o.setAttribute('opacity', u > 0 ? 1 : 0);
      });
    }
  };
}
