// go with：まめが相手のドレスと同じ色の靴を見せて足元に置くと、靴とドレスがよく合う（例文 These shoes go with your dress.）
import { seg, lerp, easeInOut, easeOut, backOut, hump } from '../ease.js';
import { P, blinkAt, walkTo, star } from './run-after.js';
import { hp, reach } from './weigh.js';

export const meta = { duration: 4.4, beats: [[0, '靴を見せる'], [1.8, '足元に置く'], [3.4, 'よく合う']] };

const shoe = (k, parent, c, d) => { const s = k.g({}, parent); k.el('path', { d: 'M -10 0 L -10 -7 Q -6 -10 -2 -7 L 4 -4 Q 11 -3 11 0 Z', fill: c, stroke: d, 'stroke-width': 1.6 }, s); return s; };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  // 姿見と棚
  el('rect', { x: 316, y: 60, width: 60, height: 150, rx: 30, fill: '#E3EEF6', stroke: pal.woodDark, 'stroke-width': 5 });
  el('path', { d: 'M 334 90 L 356 76 M 332 112 L 360 94', stroke: '#fff', 'stroke-width': 4, 'stroke-linecap': 'round' });
  k.shadow(346, 237, 34, 4);
  el('rect', { x: 30, y: 110, width: 70, height: 6, rx: 3, fill: pal.woodDark });
  [[38, pal.yellow], [62, pal.blue]].forEach(([x, c]) => el('path', { d: `M ${x} 110 l 0 -8 q 4 -4 8 0 l 6 4 q 6 1 6 4 Z`, fill: c }));
  const S = 0.85;
  const c = k.buddy({ x: 270, y: FY, scale: S, facing: -1, color: pal.coral, dark: pal.coralDark });
  // ドレス（体の前・顔の下）
  const dress = k.el('path', { d: 'M -22 -40 L 22 -40 L 34 -2 Q 0 6 -34 -2 Z', fill: pal.violet }, null);
  c.body.insertBefore(dress, c.body.children[3]);
  el('path', { d: 'M -22 -40 L 22 -40', stroke: '#8C70DD', 'stroke-width': 4 }, dress.parentNode);
  const b = k.buddy({ x: 120, y: FY, scale: S });
  const pair = g({}); shoe(k, pair, pal.violet, '#8C70DD'); tf(shoe(k, pair, pal.violet, '#8C70DD'), 10, 2);
  const link = el('path', { d: 'M 0 0', stroke: pal.yellowDark, 'stroke-width': 2.5, 'stroke-dasharray': '4 4', fill: 'none' });
  const sp = [0, 1, 2].map(() => star(k));
  const xf = (t) => lerp(110, 178, easeInOut(seg(t, 1.1, 1.9)));
  const DROP = { x: 226, y: FY - 1 };
  return {
    update(t) {
      const wk = walkTo(xf, t, 110);
      const show = easeOut(seg(t, 0.2, 0.7));
      const bend = easeInOut(seg(t, 1.9, 2.4)) * (1 - easeInOut(seg(t, 2.8, 3.2)));
      const base = { ...wk, facing: 1, look: 0.7, lean: wk.lean + 26 * bend, squash: 1 - 0.1 * bend, mood: t > 3.2 ? 'grin' : 'smile', blink: blinkAt(t) };
      P(b, { ...base, armR: 90 });
      const down = reach(b, S, 'R', DROP.x, DROP.y - 6);
      const armR = t < 1.9 ? lerp(8, 100, show) + (t > 1.1 ? -40 * easeInOut(seg(t, 1.1, 1.5)) : 0) : t < 2.5 ? lerp(60, down, easeInOut(seg(t, 1.9, 2.4))) : lerp(down, 10, easeInOut(seg(t, 2.6, 3.1)));
      P(b, { ...base, armR });
      const h = hp(b, S, 'R');
      const placed = t > 2.45;
      tf(pair, placed ? DROP.x : h.x - 4, placed ? DROP.y : h.y + 6);
      const look = easeInOut(seg(t, 2.6, 3.1));
      P(c, { x: 270, facing: -1, look: 0.4 + 0.3 * look, lean: 10 * look * (1 - seg(t, 3.4, 3.8)), armL: 8, armR: lerp(8, 30, seg(t, 3.4, 3.8)), mood: t > 3.3 ? 'grin' : 'smile', squash: 1 - 0.05 * hump(seg(t, 3.4, 3.8)), blink: blinkAt(t, 1) });
      const lq = easeOut(seg(t, 3.2, 3.7));
      link.setAttribute('d', `M ${DROP.x + 5} ${DROP.y - 10} Q ${DROP.x - 14} ${FY - 40} ${lerp(DROP.x, 252, lq)} ${lerp(DROP.y - 10, FY - 40, lq)}`);
      link.setAttribute('opacity', lq > 0 ? 1 : 0);
      sp.forEach((s, i) => s.set([224, 262, 250][i], [FY - 18, FY - 70, FY - 34][i], seg(t, 3.3 + i * 0.15, 4.1 + i * 0.1)));
    }
  };
}
