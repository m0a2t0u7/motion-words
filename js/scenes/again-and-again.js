// again and again：楽譜の前で歌う→終わったらまた最初から→何度も繰り返し、回数の印が増えていく（例文 I practiced the song again and again.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';
import { P, blinkAt } from './run-after.js';
import { roomBg } from './look-over.js';

function note(k) {
  const g = k.g({});
  k.el('ellipse', { cx: 0, cy: 0, rx: 5, ry: 4, fill: k.pal.violet, transform: 'rotate(-20)' }, g);
  k.el('line', { x1: 4.5, y1: -1, x2: 4.5, y2: -18, stroke: k.pal.violet, 'stroke-width': 2.4 }, g);
  k.el('path', { d: 'M 4.5 -18 Q 12 -14 10 -6', stroke: k.pal.violet, 'stroke-width': 2.4, fill: 'none' }, g);
  return g;
}

export const meta = { duration: 4.4, beats: [[0, '歌う'], [1.0, 'また最初から'], [3.2, '何度も']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = roomBg(k, 'home', 240);
  // 譜面台
  k.shadow(270, FY + 1, 22, 4);
  el('line', { x1: 270, y1: FY, x2: 270, y2: FY - 92, stroke: pal.ink, 'stroke-width': 4 });
  el('path', { d: `M 254 ${FY} L 270 ${FY - 14} L 286 ${FY}`, stroke: pal.ink, 'stroke-width': 4, fill: 'none' });
  el('rect', { x: 238, y: FY - 140, width: 64, height: 48, rx: 3, fill: '#fff', stroke: pal.line, 'stroke-width': 2 });
  for (let i = 0; i < 4; i++) el('line', { x1: 244, x2: 296, y1: FY - 130 + i * 9, y2: FY - 130 + i * 9, stroke: pal.sub, 'stroke-width': 1 });
  const cursor = el('rect', { x: 244, y: FY - 136, width: 3, height: 36, fill: pal.coral, opacity: 0.8 });
  const b = k.buddy({ x: 170, y: FY, facing: 1 });
  const notes = [0, 1, 2, 3, 4, 5].map(() => note(k));
  // 回数の印（正の字のように1本ずつ）
  el('rect', { x: 146, y: 28, width: 82, height: 40, rx: 5, fill: '#fff', stroke: pal.line, 'stroke-width': 2 });
  const tally = [0, 1, 2, 3, 4].map((i) => el('line', { x1: 0, y1: 0, x2: 0, y2: 22, stroke: pal.coralDark, 'stroke-width': 4, 'stroke-linecap': 'round', opacity: 0 }));
  const loop = g({});
  el('path', { d: 'M 10 -4 A 11 11 0 1 0 11 4', stroke: pal.green, 'stroke-width': 3.5, fill: 'none', 'stroke-linecap': 'round' }, loop);
  el('path', { d: 'M 6 -9 L 11 -3 L 15 -9', stroke: pal.green, 'stroke-width': 3.5, fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, loop);
  const sweat = el('path', { d: 'M 0 -6 Q 4 0 0 4 Q -4 0 0 -6 Z', fill: pal.water });
  return {
    update(t) {
      const L = 0.82, t0 = 0.2;
      const r = Math.max(0, Math.floor((t - t0) / L)), q = ((t - t0) % L) / L;
      const reps = Math.min(5, r);
      const singing = t > t0 && r < 5 && q < 0.8;
      const sway = Math.sin(t * 7);
      P(b, { x: 170, facing: 1, look: 0.7, lean: singing ? 4 + 3 * sway : 0, armR: singing ? 50 + 30 * hump(q) : 20, armL: singing ? 30 + 10 * sway : 10, mood: singing ? (Math.sin(t * 16) > 0 ? 'open' : 'grin') : 'flat', blink: blinkAt(t), squash: 1 + (singing ? 0.02 * sway : 0) });
      k.set(cursor, { x: 244 + 50 * (singing ? q / 0.8 : r >= 5 ? 1 : 0) });
      notes.forEach((n, i) => {
        const nq = ((t * 1.2 + i / 6) % 1);
        tf(n, 200 + nq * 30 + 6 * Math.sin(nq * 9 + i), FY - 100 - nq * 70, 0, 1);
        n.setAttribute('opacity', singing ? 1 - nq : 0);
      });
      tally.forEach((l, i) => { tf(l, 162 + i * 12, 37 - 3 * hump(seg(t, t0 + (i + 1) * L - 0.1, t0 + (i + 1) * L + 0.2))); l.setAttribute('opacity', i < reps ? 1 : 0); });
      const lp = r >= 1 && r < 5 && q < 0.3;
      tf(loop, 270, FY - 160, -q * 900, lp ? 1 : 0.001);
      tf(sweat, 146, FY - 96 + ((t * 2) % 1) * 12);
      sweat.setAttribute('opacity', reps >= 3 ? 1 - ((t * 2) % 1) : 0);
    }
  };
}
