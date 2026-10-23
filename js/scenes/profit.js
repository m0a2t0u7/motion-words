import { seg, lerp, easeInOut, easeOut, backOut, hump, clamp } from '../ease.js';
import { P, blinkAt, walkTo } from './run-after.js';
import { hp } from './dig.js';
import { grip } from './hand-over.js';
import { roomBg, say, desk } from './look-over.js';
// profit：店のレジ。売り上げの山から経費を引くと、少しだけコインが残って利益になる（例文 The shop made a small profit this month.）
export const meta = { duration: 4.0, beats: [[0, '売り上げ'], [1.4, '経費を引く'], [2.8, '少し残る']] };
export function create(k) {
  const { el, g, tf, pal, text } = k, S = 0.95;
  const FY = roomBg(k, 'home', 240);
  const coin = (parent) => { const c = g({}, parent); el('ellipse', { rx: 11, ry: 11, fill: pal.yellow, stroke: pal.yellowDark, 'stroke-width': 2.5 }, c); el('ellipse', { rx: 5, ry: 5, fill: 'none', stroke: pal.yellowDark, 'stroke-width': 1.8 }, c); return c; };
  const b = k.buddy({ x: 90, y: FY, scale: S });
  const cs = [];
  for (let i = 0; i < 8; i++) cs.push(coin());
  const base = (i) => [230 + (i % 4) * 26 - (i > 3 ? 13 : 0), 196 - Math.floor(i / 4) * 16];
  desk(k, 190, 190, 202);
  el('rect', { x: 340, y: 150, width: 8, height: 0 });
  const plus = text(330, 190, '+', { 'font-size': 26, 'font-weight': 700, fill: pal.green, 'text-anchor': 'middle' });
  const out = [0, 1, 2, 3, 4, 5].map(() => 0);
  return {
    update(t) {
      cs.forEach((c, i) => {
        const [x, y] = base(i), gone = i >= 2, q = easeInOut(seg(t, 1.4 + (i - 2) * 0.12, 2.1 + (i - 2) * 0.12));
        const s = backOut(seg(t, 0.2 + i * 0.1, 0.6 + i * 0.1));
        tf(c, gone ? lerp(x, 80 + 20 * (i - 2), q) : x, gone ? lerp(y, y - 60 * hump(q) + 40 * q, 1) : y, 0, s * (gone ? 1 - seg(t, 2.1, 2.4) * 1 : 1));
      });
      plus.setAttribute('opacity', seg(t, 2.8, 3.2));
      const take = hump(seg(t, 1.3, 2.4));
      P(b, { x: 90, armR: 20 + 80 * take, lean: 6 * take, look: 0.8, mood: t > 2.8 ? 'grin' : 'smile', blink: blinkAt(t) });
    }
  };
}
