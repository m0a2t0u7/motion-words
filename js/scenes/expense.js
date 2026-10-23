// expense：毎月の出費の棒グラフ。食費がいちばん高い棒になる（例文 Food is our biggest expense each month.）
import { seg, lerp, easeOut, easeInOut, backOut, hump } from '../ease.js';
import { P, blinkAt } from './run-after.js';
import { roomBg } from './look-over.js';
import { reach } from './dig.js';

export const meta = { duration: 3.8, beats: [[0, '出費を並べる'], [1.2, '棒が伸びる'], [2.8, '食費が最大']] };
const EF = '"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif';

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = roomBg(k, 'office', 240);
  const b = k.buddy({ x: 70, y: FY, scale: 0.95 });
  el('rect', { x: 140, y: 40, width: 230, height: 190, rx: 10, fill: '#fff', stroke: pal.line, 'stroke-width': 3 });
  el('line', { x1: 156, y1: 200, x2: 354, y2: 200, stroke: pal.sub, 'stroke-width': 3, 'stroke-linecap': 'round' });
  k.text(255, 62, '/ month', { 'font-size': 13, fill: pal.sub, 'text-anchor': 'middle' });
  const D = [['🚃', 70, pal.blue], ['🍚', 150, pal.coral], ['📱', 50, pal.yellow]];
  const bars = D.map(([e, h, c], i) => {
    const x = 170 + i * 62;
    const r = el('rect', { x, y: 200, width: 44, height: 0, rx: 5, fill: c });
    const ic = g({}); k.text(0, 0, e, { 'font-size': 24, 'font-family': EF, 'text-anchor': 'middle', 'dominant-baseline': 'central' }, ic);
    return { r, ic, x, h };
  });
  const crown = g({}); k.text(0, 0, '👑', { 'font-size': 22, 'font-family': EF, 'text-anchor': 'middle', 'dominant-baseline': 'central' }, crown);
  return {
    update(t) {
      bars.forEach((o, i) => {
        const q = easeOut(seg(t, 0.8 + i * 0.3, 2.0 + i * 0.3)), h = o.h * q;
        k.set(o.r, { y: 200 - h, height: h });
        tf(o.ic, o.x + 22, 218, 0, backOut(seg(t, 0.5 + i * 0.3, 0.9 + i * 0.3)));
      });
      tf(crown, 263, 200 - 150 - 16, 0, backOut(seg(t, 2.6, 3.1)));
      const pt = easeInOut(seg(t, 2.5, 3.1));
      const o = { armL: 8, armR: 10, lean: 4 * pt, mood: t > 2.6 ? 'open' : 'smile', blink: blinkAt(t), look: 0.7, squash: 1, walk: 0, lift: 0 };
      b.pose(o); b.pose({ ...o, armR: lerp(10, reach(b, 0.95, 'R', 250, 70), pt) });
    }
  };
}
