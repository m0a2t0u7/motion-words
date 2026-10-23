// keyboard：コーヒーのカップを持ったまま傾けて、キーボードにこぼしてしまう（例文 I spilled coffee on my keyboard.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';
import { P, blinkAt } from './run-after.js';
import { desk, hp, reach } from './look-over.js';

export const meta = { duration: 4.0, beats: [[0, 'カップを持つ'], [1.0, 'こぼれる'], [2.6, 'キーボードが汚れた']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 1.3;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  desk(k, 185, 215, 200);
  // モニター
  el('rect', { x: 300, y: 112, width: 86, height: 58, rx: 5, fill: pal.ink });
  el('rect', { x: 305, y: 117, width: 76, height: 48, rx: 3, fill: '#BFE3F5' });
  el('rect', { x: 338, y: 170, width: 10, height: 24, fill: '#9AA6B8' });
  // キーボード（遠近つき）
  el('path', { d: 'M 205 199 L 330 199 L 322 183 L 213 183 Z', fill: '#E7ECF3', stroke: '#C5CEDB', 'stroke-width': 1.5 });
  for (let r = 0; r < 3; r++) for (let c = 0; c < 9; c++) el('rect', { x: 216 + c * 11.5 - r * 1.5, y: 185 + r * 5, width: 8, height: 3.4, rx: 1, fill: '#fff' });
  const pud = el('ellipse', { cx: 240, cy: 192, rx: 1, ry: 1, fill: pal.coffee, opacity: 0 });
  const drops = [0, 1, 2, 3].map(() => el('circle', { r: 2.4, fill: pal.coffee, opacity: 0 }));
  const b = k.buddy({ x: 140, y: FY, scale: S });
  const cup = g({});
  el('path', { d: 'M -10 -12 L 10 -12 L 8 12 L -8 12 Z', fill: '#fff', stroke: pal.line, 'stroke-width': 1.8 }, cup);
  el('path', { d: 'M -10 -6 q -9 2 -2 10', fill: 'none', stroke: pal.line, 'stroke-width': 2.4 }, cup);
  el('ellipse', { cx: 0, cy: -12, rx: 10, ry: 2.4, fill: pal.coffee }, cup);
  return {
    update(t) {
      const tilt = easeInOut(seg(t, 0.9, 1.5)) * (1 - easeInOut(seg(t, 2.3, 2.9))), spill = seg(t, 1.2, 2.3);
      const o = { lean: 14, armL: lerp(10, 150, seg(t, 1.6, 2.0) * (1 - seg(t, 3.0, 3.4))), look: 0.6, blink: blinkAt(t), mood: t < 1.5 ? 'smile' : t < 2.9 ? 'open' : 'sad' };
      P(b, o);
      const x = lerp(205, 218, seg(t, 0, 0.9)), y = lerp(158, 165, seg(t, 0, 0.9)) - 4 * hump(seg(t, 0.2, 0.9));
      P(b, { ...o, armR: reach(b, S, 'R', x, y) });
      const h = hp(b, S, 'R'), rot = tilt * 80;
      tf(cup, h.x, h.y, rot);
      const a = rot * Math.PI / 180, lx = h.x + 10 * Math.cos(a) + 12 * Math.sin(a), ly = h.y + 10 * Math.sin(a) - 12 * Math.cos(a);
      const pouring = t > 1.2 && t < 2.3;
      drops.forEach((d, i) => {
        const u = ((t - 1.2) * 2.2 + i / 4) % 1, ty = 190;
        k.set(d, { cx: lx + 4 * u, cy: lerp(ly, ty, u * u), opacity: pouring ? 1 : 0 });
      });
      k.set(pud, { cx: lx + 6, cy: 191, rx: 2 + 20 * easeOut(spill), ry: 0.6 + 3.4 * easeOut(spill), opacity: spill > 0 ? 0.9 : 0 });
    }
  };
}
