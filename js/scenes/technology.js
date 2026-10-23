import { seg, lerp, easeInOut, easeOut, backOut, hump, clamp } from '../ease.js';
import { P, blinkAt, walkTo } from './run-after.js';
import { hp } from './dig.js';
import { grip } from './hand-over.js';
import { roomBg, say, desk } from './look-over.js';
// technology：はじめはまめが箱を手で運ぶ。新しい機械（ベルトコンベア）が入ると箱が自動で運ばれ、まめは楽になる（例文 New technology changes how we work.）
export const meta = { duration: 4.4, beats: [[0, '手で運ぶ'], [1.6, '機械が入る'], [3.0, 'ラクになる']] };
export function create(k) {
  const { el, g, tf, pal, text } = k, S = 0.9;
  const FY = roomBg(k, 'office', 240);
  const belt = g({}); tf(belt, 0, 0);
  const bx = el('rect', { x: 150, y: 206, width: 230, height: 20, rx: 10, fill: '#59616C' }, belt);
  [0, 1, 2, 3, 4, 5, 6].forEach((i) => el('circle', { cx: 168 + i * 34, cy: 216, r: 5, fill: '#8C95A1' }, belt));
  const bxs = [0, 1, 2].map(() => { const n = g({}); el('rect', { x: -15, y: -26, width: 30, height: 26, rx: 4, fill: '#E7C48A', stroke: '#C79B58', 'stroke-width': 2 }, n); el('line', { x1: -15, y1: -14, x2: 15, y2: -14, stroke: '#C79B58', 'stroke-width': 2 }, n); return n; });
  const bt = g({}); tf(bt, 205, 160);
  el('rect', { x: -26, y: -6, width: 52, height: 6, fill: pal.mint }, bt);
  const b = k.buddy({ x: 100, y: FY, scale: S });
  const gr = grip(k, pal.mint, pal.mintDark, S);
  const spark = text(300, 180, '', { 'font-size': 22, 'text-anchor': 'middle' });
  return {
    update(t) {
      const mach = seg(t, 1.6, 2.4), hand = 1 - easeInOut(mach);
      belt.setAttribute('opacity', mach); bt.setAttribute('opacity', 0);
      const hh = hp(b, S, 'R');
      bxs.forEach((n, i) => {
        if (t < 1.6) tf(n, i === 0 ? hh.x + 2 : 1000, hh.y - 2, 0, S);
        else if (t < 2.4) tf(n, i === 0 ? lerp(hh.x + 2, 160, easeInOut(mach)) : 1000, i === 0 ? lerp(hh.y - 2, 206, easeInOut(mach)) : 0, 0, S);
        else tf(n, 160 + (((t - 2.4) * 60 + i * 63) % 190), 206, 0, S);
      });
      const walk = t < 1.4 ? 1 : 0;
      P(b, { x: 100, armR: lerp(95, 8, easeInOut(seg(t, 1.6, 2.4))), armL: 8, lean: 4 * hand, walk: 0, look: 0.7, mood: t > 3 ? 'grin' : 'smile', blink: blinkAt(t) });
      const h = hp(b, S, 'R'); gr(h);
    }
  };
}
