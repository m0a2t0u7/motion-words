// supplier：まめが地元の業者のトラックから、紙の箱を受け取る（例文 We buy our paper from a local supplier.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';
import { P, blinkAt, walkTo } from './run-after.js';
import { held } from './look-over.js';

export const meta = { duration: 4.6, beats: [[0, '業者が来る'], [1.4, '箱を受ける'], [3.4, '紙を持ち帰る']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 0.95;
  const FY = k.backdrop({ floorY: 240, mood: 'outdoor' });
  el('rect', { x: 0, y: FY - 6, width: 400, height: 6, fill: pal.line });
  const shop = g({});
  el('rect', { x: 250, y: 120, width: 140, height: FY - 126, fill: '#F6C9B8', stroke: pal.line, 'stroke-width': 2 }, shop);
  el('path', { d: 'M 244 120 L 396 120 L 388 96 L 252 96 Z', fill: pal.coral }, shop);
  el('rect', { x: 296, y: 160, width: 44, height: FY - 166, rx: 2, fill: '#fff' }, shop);
  const tr = g({});
  k.shadow(0, 0, 70, 5, tr);
  el('rect', { x: -60, y: -62, width: 76, height: 56, rx: 4, fill: '#fff', stroke: pal.line, 'stroke-width': 2 }, tr);
  el('rect', { x: 16, y: -48, width: 36, height: 42, rx: 5, fill: pal.blue }, tr);
  el('rect', { x: 28, y: -42, width: 18, height: 14, rx: 2, fill: '#DDEFFA' }, tr);
  k.text(-22, -34, '地元', { 'font-size': 15, 'font-weight': 700, fill: pal.blueDark, 'text-anchor': 'middle', 'dominant-baseline': 'central' }, tr);
  [-36, 30].forEach((x) => { el('circle', { cx: x, cy: -4, r: 9, fill: pal.ink }, tr); el('circle', { cx: x, cy: -4, r: 3.5, fill: '#fff' }, tr); });
  const box = g({});
  el('rect', { x: -15, y: -10, width: 30, height: 22, rx: 2, fill: '#D9B27C', stroke: pal.woodDark, 'stroke-width': 2 }, box);
  el('rect', { x: -15, y: -10, width: 30, height: 7, fill: '#fff', opacity: 0.9 }, box);
  const b = k.buddy({ x: 270, y: FY + 10, scale: S });
  const trx = (t) => lerp(-90, 150, easeOut(seg(t, 0.1, 1.5)));
  const mx = (t) => t < 1.5 ? 270 : t < 2.7 ? lerp(270, 192, easeInOut(seg(t, 1.5, 2.4))) : lerp(192, 300, easeInOut(seg(t, 3.0, 4.4)));
  return {
    update(t) {
      const X = trx(t); tf(tr, X + 20, FY + 6);
      const w = walkTo(mx, t, 270, -1), got = t > 2.7;
      const toShop = t > 3.0;
      P(b, { x: w.x, walk: w.walk, armL: w.armL, armR: got ? 70 : w.armR, lean: w.lean, facing: toShop ? 1 : -1, look: 0.4, mood: got ? 'grin' : 'smile', blink: blinkAt(t) });
      if (got) held(k, b, S, box, 'R', 70); else tf(box, X - 22, FY - 56);
    }
  };
}
