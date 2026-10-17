// tidy up：散らかった机の上の本・ペン・紙を、まめが1つずつ整える（例文 Please tidy up your desk.）
import { seg, lerp, easeInOut, easeOut, backOut, wobble, hump } from '../ease.js';

export const meta = { duration: 4.2, beats: [[0, '散らかった机'], [1.5, '1つずつ整える'], [3.2, 'きれいに']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 252, mood: 'indoor' });
  el('rect', { x: 150, y: 232, width: 10, height: 20, fill: pal.woodDark });
  el('rect', { x: 350, y: 232, width: 10, height: 20, fill: pal.woodDark });
  const TY = 200;
  const b = k.buddy({ x: 78, y: FY, scale: 1.05 });
  el('rect', { x: 130, y: TY, width: 250, height: 32, rx: 6, fill: pal.wood });
  const item = (w, h, c) => { const o = g({}); el('rect', { x: -w / 2, y: -h, width: w, height: h, rx: 3, fill: c, stroke: 'rgba(0,0,0,0.12)', 'stroke-width': 2 }, o); return o; };
  const items = [
    { o: item(70, 14, pal.blue), from: [200, TY - 4, 24], to: [200, TY, 0] },
    { o: item(60, 12, pal.coral), from: [226, TY - 4, -16], to: [200, TY - 14, 0] },
    { o: item(50, 12, pal.green), from: [290, TY - 2, 38], to: [200, TY - 26, 0] },
    { o: item(40, 3, pal.yellowDark), from: [330, TY - 2, 70], to: [310, TY, 0] },
    { o: item(40, 3, pal.red), from: [262, TY - 2, -60], to: [310, TY, 0] },
    { o: item(52, 2.5, '#fff'), from: [350, TY - 1, -20], to: [270, TY, 0] }
  ];
  items[3].to = [330, TY, 0]; items[4].to = [330, TY - 3.5, 0]; items[5].to = [276, TY, 0];
  items[3].o.firstChild.setAttribute('width', 60); items[4].o.firstChild.setAttribute('width', 60);
  const sp = [0, 1, 2].map(() => el('path', { d: 'M 0 -8 L 2 -2 L 8 0 L 2 2 L 0 8 L -2 2 L -8 0 L -2 -2 Z', fill: pal.yellow }));
  const T = (i) => 0.5 + 0.5 * i, D = 0.6;
  return {
    update(t) {
      let cur = -1;
      items.forEach((it, i) => {
        const p = easeInOut(seg(t, T(i), T(i) + D));
        const [fx, fy, fr] = it.from, [tx, ty, tr] = it.to;
        tf(it.o, lerp(fx, tx, p), lerp(fy, ty, p) - 14 * hump(p), lerp(fr, tr, p));
        if (t >= T(i) && t < T(i) + D + 0.1) cur = i;
      });
      const hxT = cur >= 0 ? lerp(items[cur].from[0], items[cur].to[0], easeInOut(seg(t, T(cur), T(cur) + D))) : 190;
      const hyT = cur >= 0 ? lerp(items[cur].from[1], items[cur].to[1], easeInOut(seg(t, T(cur), T(cur) + D))) - 20 : 160;
      const sx = 78 + 27 * 1.05, sy = FY - 56 * 1.05;
      const a = Math.atan2(hxT - sx, hyT - sy) * 180 / Math.PI;
      const done = t > T(5) + D;
      b.pose({ armR: done ? lerp(Math.min(a, 100), 8, seg(t, T(5) + D, T(5) + D + 0.4)) : Math.min(a, 105), armL: 8, lean: cur >= 0 && !done ? 6 : 0, look: 0.9, mood: done ? 'grin' : 'smile', x: 78 + (done ? 0 : 0) });
      sp.forEach((s, i) => { const p = seg(t, T(5) + D + i * 0.1, T(5) + D + 0.7 + i * 0.1); tf(s, 200 + i * 55, TY - 50 - 8 * p, 0, hump(p) * 1.2, hump(p) * 1.2); });
    }
  };
}
