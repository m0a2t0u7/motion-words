// data：利用者の人たちから、情報の粒（データ）が集まって、まめの持つ箱にたまり「500」になる（例文 We collected data from 500 users.）
import { seg, lerp, easeInOut, easeOut, backOut, hump } from '../ease.js';
import { P, blinkAt } from './run-after.js';
import { roomBg, hp, reach } from './look-over.js';

export const meta = { duration: 4.2, beats: [[0, '利用者たち'], [1.2, '集める'], [3.4, '500たまった']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 1.0;
  const FY = roomBg(k, 'home', 240);
  const b = k.buddy({ x: 330, y: FY, scale: S, facing: -1 });
  const cols = [pal.blue, pal.coral, pal.violet, pal.yellow, pal.blueDark];
  const us = cols.map((c, i) => {
    const u = g({}); tf(u, 48 + i * 40, FY);
    k.shadow(0, 0, 13, 3, u);
    el('rect', { x: -10, y: -26, width: 20, height: 26, rx: 9, fill: c }, u);
    el('circle', { cx: 0, cy: -36, r: 9, fill: '#F6D7B8' }, u);
    return u;
  });
  const dots = [];
  for (let i = 0; i < 10; i++) dots.push(el('rect', { x: -3.5, y: -3.5, width: 7, height: 7, rx: 2, fill: cols[i % 5] }));
  const boxG = g({});
  const fill = el('rect', { x: -17, y: 0, width: 34, height: 0, fill: pal.mint }, boxG);
  el('path', { d: 'M -20 -4 L -16 22 L 16 22 L 20 -4', fill: 'rgba(255,255,255,0.55)', stroke: pal.blueDark, 'stroke-width': 3, 'stroke-linejoin': 'round' }, boxG);
  const tag = g({}); el('rect', { x: -26, y: -12, width: 52, height: 24, rx: 12, fill: pal.ink }, tag);
  k.text(0, 6, '500', { 'font-size': 16, fill: '#fff', 'font-weight': 700 }, tag);
  return {
    update(t) {
      const o = { x: 330, facing: -1, lean: 2, armL: 8, look: -0.5, mood: t > 3.4 ? 'grin' : 'smile', blink: blinkAt(t) };
      P(b, { ...o, armR: 8 });
      const s = hp(b, S, 'R', 0);
      const a = reach(b, S, 'R', s.x - 28, s.y - 6);
      P(b, { ...o, armR: lerp(8, a, easeOut(seg(t, 0, 0.8))) + 4 });
      const h = hp(b, S, 'R');
      tf(boxG, h.x - 6, h.y - 18);
      let n = 0;
      dots.forEach((d, i) => {
        const st = 1.0 + (i % 5) * 0.28 + Math.floor(i / 5) * 0.9, p = seg(t, st, st + 1.0);
        const x0 = 48 + (i % 5) * 40, y0 = FY - 56;
        const x1 = h.x - 6, y1 = h.y - 22;
        n += p >= 1 ? 1 : 0;
        const e = easeInOut(p);
        tf(d, lerp(x0, x1, e), lerp(y0, y1, e) - Math.sin(e * Math.PI) * 50);
        d.setAttribute('opacity', p > 0 && p < 1 ? 1 : 0);
      });
      k.set(fill, { y: 22 - 4 - n * 1.8, height: 4 + n * 1.8 });
      tf(tag, h.x - 6, h.y - 62, 0, t < 3.4 ? 0.001 : backOut(seg(t, 3.4, 3.9)));
    }
  };
}
