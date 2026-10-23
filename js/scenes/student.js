// student：試験前の教室。生徒たちが教科書を開いてノートに書き、まめも真剣に勉強する（例文 The students are studying for the exam.）
import { seg, lerp, easeInOut, easeOut, hump, clamp } from '../ease.js';
import { CO, BL, reach, held, P, blinkAt, wear, deskFront } from './member.js';
import { pencil } from './check.js';
import { calendar } from './so-far-so-good.js';

export const meta = { duration: 4.2, beats: [[0, '試験の前'], [1.2, '勉強中'], [3.0, 'がんばる']] };

export function create(k) {
  const { el, g, tf, pal } = k, FY = 236;
  k.backdrop({ floorY: FY, mood: 'indoor' });
  el('rect', { x: 110, y: 26, width: 180, height: 70, rx: 4, fill: '#3E6B5A', stroke: pal.woodDark, 'stroke-width': 6 });
  k.text(200, 52, 'EXAM', { 'font-size': 20, fill: '#fff' }); k.text(200, 76, 'FRIDAY', { 'font-size': 12, fill: '#fff', opacity: 0.8 });
  el('circle', { cx: 350, cy: 54, r: 18, fill: '#fff', stroke: pal.ink, 'stroke-width': 3 });
  const hh = el('line', { x1: 350, y1: 54, x2: 350, y2: 42, stroke: pal.ink, 'stroke-width': 2.4, 'stroke-linecap': 'round' });
  const xs = [[80, CO(k), 0.85], [200, {}, 0.95], [320, BL(k), 0.85]];
  const ppl = xs.map(([x, c, s]) => ({ x, s, b: k.buddy({ x, y: FY, scale: s, facing: 1, ...c }) }));
  wear(k, ppl[1].b, 'band', pal.red);
  const TOP = FY - 40;
  const pens = [], books = [];
  ppl.forEach(({ x }) => {
    deskFront(k, x - 10, 74, TOP, FY);
    const bk = g({}); tf(bk, x + 50, TOP);
    el('path', { d: 'M -16 0 L -14 -14 L 0 -12 L 0 0 Z', fill: '#fff', stroke: pal.line }, bk); el('path', { d: 'M 16 0 L 14 -14 L 0 -12 L 0 0 Z', fill: '#fff', stroke: pal.line }, bk);
    el('rect', { x: x + 8, y: TOP - 3, width: 22, height: 3, fill: '#fff', stroke: pal.line, 'stroke-width': 0.8 });
    pens.push(pencil(k));
  });
  return {
    update(t) {
      hh.setAttribute('transform', `rotate(${t * 40} 350 54)`);
      ppl.forEach(({ x, s, b }, i) => {
        const q = (t * (1.4 + i * 0.2) + i * 0.3) % 1;
        const read = Math.sin(t * 1.5 + i) > 0.6;
        P(b, { x, lean: 12, look: read ? 1 : 0.7, blink: i === 1 ? 0.35 : blinkAt(t, i), mood: i === 1 ? 'flat' : 'flat', squash: 0.98 });
        const tip = read ? { x: x + 46, y: TOP - 10 } : { x: x + 12 + 14 * q, y: TOP - 4 + 2 * Math.sin(q * 20) };
        b.pose({ armR: reach(b, s, 'R', tip.x, tip.y) });
        held(k, b, s, pens[i], 'R', 0, 20);
      });
    }
  };
}
