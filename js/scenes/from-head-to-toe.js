// from head to toe：歩いていると大雨。ぬれた色が頭から足先まで下りていき、全身ずぶぬれになる（例文 I got wet from head to toe.）
import { seg, lerp, easeInOut, easeOut, easeIn, hump, wobble } from '../ease.js';
import { P, walkTo } from './run-after.js';
import { streetBg } from './weigh.js';
import { rain } from './work-on.js';

export const meta = { duration: 4.4, beats: [[0, '歩いている'], [1.1, '頭からぬれる'], [3.0, 'つま先まで']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = streetBg(k, 236);
  const sky = el('rect', { x: 0, y: 0, width: 400, height: FY - 6, fill: '#5A6680', opacity: 0 });
  const cl = [[140, 40, 1.2], [300, 56, 1]].map(([x, y, s]) => { const c = g({}); [[0, 0, 50, 20], [-26, -8, 26, 18], [22, -12, 30, 22]].forEach(([cx, cy, rx, ry]) => el('ellipse', { cx, cy, rx, ry, fill: '#8F9AB0' }, c)); return { c, x, y, s }; });
  const puddle = el('ellipse', { cx: 200, cy: FY + 3, rx: 0, ry: 5, fill: '#9CC6EA', opacity: 0.8 });
  const BX = 200;
  const b = k.buddy({ x: 60, y: FY });
  // ぬれ色：体の形で切り抜いた青い層が、上から下へ広がる
  const cp = k.clip((c) => {
    el('rect', { x: BX - 31, y: FY - 92, width: 62, height: 82, rx: 29 }, c);
    el('rect', { x: BX - 18, y: FY - 26, width: 36, height: 26, rx: 5 }, c);
  });
  const wet = el('rect', { x: BX - 62, y: FY - 96, width: 124, height: 0, fill: '#2F6FB8', opacity: 0.42, 'clip-path': cp });
  const edge = el('rect', { x: BX - 62, y: FY - 96, width: 124, height: 3, fill: '#BFE3FA', opacity: 0, 'clip-path': cp });
  const drips = [0, 1, 2, 3, 4, 5].map(() => el('path', { d: 'M 0 -4 Q 3 1 0 3 Q -3 1 0 -4 Z', fill: '#7FB3E0' }));
  const R = rain(k, 46, FY);
  return {
    update(t) {
      const dark = easeInOut(seg(t, 0.5, 1.0));
      sky.setAttribute('opacity', 0.28 * dark);
      cl.forEach((c, i) => { tf(c.c, c.x + (i ? -1 : 1) * 30 * (1 - dark), c.y, 0, c.s); c.c.setAttribute('opacity', dark); });
      const on = seg(t, 0.9, 1.1);
      R(t, on * 0.95);
      const xf = (tt) => lerp(60, BX, easeOut(seg(tt, 0, 1.1)));
      const w = walkTo(xf, t, 60, 1);
      const p = easeInOut(seg(t, 1.1, 3.0));
      const shiver = t > 3.0 ? Math.sin(t * 40) * 1.2 * (1 - seg(t, 3.6, 4.4)) : 0;
      const shock = easeOut(seg(t, 1.0, 1.3));
      P(b, { ...w, x: w.x + shiver, armL: t > 1.0 ? lerp(8, 40, shock) : w.armL, armR: t > 1.0 ? lerp(8, 40, shock) : w.armR, look: lerp(0.4, 0, shock), mood: t < 1.0 ? 'smile' : t < 2.0 ? 'open' : 'sad', lean: t > 1.0 ? -4 * shock : w.lean, squash: 1 - 0.04 * hump(seg(t, 1.0, 1.4)) });
      k.set(wet, { height: 98 * p });
      k.set(edge, { y: FY - 96 + 98 * p - 2, opacity: p > 0 && p < 1 ? 0.9 : 0 });
      drips.forEach((d, i) => {
        const sx = BX + [-30, 30, -20, 22, -62, 62][i];
        const top = FY - [70, 66, 40, 36, 40, 42][i];
        const ph = ((t * 1.6 + i * 0.37) % 1);
        const vis = p > (FY - top) / 98 * 0.2 + 0.1 && i < 6;
        tf(d, sx, top + easeIn(ph) * (FY - top), 0, 1);
        d.setAttribute('opacity', vis ? 1 - ph * 0.6 : 0);
      });
      k.set(puddle, { rx: 50 * easeOut(seg(t, 2.0, 4.0)) });
    }
  };
}
