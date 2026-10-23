// school：子どもたち（まめと友だち）がリュックを背負って学校へ歩いていく（My kids walk to school.）
import { seg, lerp, easeInOut, hump } from '../ease.js';
import { P, blinkAt, walkTo, tree } from './run-after.js';

export const meta = { duration: 4.2, beats: [[0, '家の前'], [1.6, '歩く'], [3.6, '学校の前']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 0.95;
  const FY = k.backdrop({ floorY: 236, mood: 'outdoor' });
  el('rect', { x: 0, y: FY, width: 400, height: 64, fill: '#E9E4D6' });
  el('rect', { x: 0, y: FY + 22, width: 400, height: 3, fill: '#D8D1BE' });
  tree(k, 30, FY - 2, 0.8);
  // 学校の建物
  el('rect', { x: 250, y: 104, width: 140, height: FY - 104, fill: '#F6DDB8' });
  el('path', { d: `M 242 106 L 320 66 L 398 106 Z`, fill: pal.coral });
  el('circle', { cx: 320, cy: 92, r: 11, fill: '#fff', stroke: pal.line, 'stroke-width': 2 });
  el('path', { d: 'M 320 92 V 85 M 320 92 L 325 94', stroke: pal.ink, 'stroke-width': 2, 'stroke-linecap': 'round', fill: 'none' });
  [[264, 120], [346, 120], [264, 170], [346, 170]].forEach(([x, y]) => el('rect', { x, y, width: 28, height: 30, rx: 3, fill: '#DDEFFA', stroke: '#fff', 'stroke-width': 3 }));
  el('rect', { x: 303, y: 176, width: 34, height: FY - 176, rx: 3, fill: pal.woodDark });
  el('line', { x1: 320, y1: 176, x2: 320, y2: FY, stroke: pal.wood, 'stroke-width': 2 });
  el('line', { x1: 392, y1: 40, x2: 392, y2: 70, stroke: pal.sub, 'stroke-width': 2 });
  el('path', { d: 'M 392 40 L 378 46 L 392 52 Z', fill: pal.red });
  const kids = [[pal.mint, pal.mintDark, 70, 1.0], [pal.coral, pal.coralDark, 15, 0.9]].map(([c, d, x0, sc]) => {
    const b = k.buddy({ x: x0, y: FY, scale: S * sc, color: c, dark: d });
    el('rect', { x: -35, y: -62, width: 13, height: 28, rx: 5, fill: pal.blue, stroke: pal.blueDark, 'stroke-width': 2 }, b.body);
    return { b, x0 };
  });
  return {
    update(t) {
      kids.forEach(({ b, x0 }, i) => {
        const xf = (u) => x0 + 150 * easeInOut(seg(u, 0.3 + i * 0.1, 3.6));
        const { m, ...w } = walkTo(xf, t, x0);
        const done = seg(t, 3.5, 3.8);
        P(b, { ...w, look: 0.3, mood: done > 0 ? 'grin' : 'smile', blink: blinkAt(t, i), armR: lerp(w.armR, 40, hump(done)) });
      });
    }
  };
}
