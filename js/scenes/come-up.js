// come up：会議中、ボードに新しい話題のカードがぱっと加わり、みんながそちらを見る（例文 A new topic came up at the meeting.）
import { seg, lerp, easeInOut, easeOut, hump, wobble } from '../ease.js';
import { person, pop } from './queue-up.js';
import { tableTop } from './spread-out.js';

export const meta = { duration: 4.2, beats: [[0, '会議中'], [1.8, '新しい話題'], [3.6, 'みんなで注目']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  el('rect', { x: 120, y: 26, width: 170, height: 112, rx: 6, fill: '#fff', stroke: '#C9D3E0', 'stroke-width': 4 });
  const cards = [[136, 40, pal.yellow], [136, 72, pal.blue]];
  cards.forEach(([x, y, c]) => { el('rect', { x, y, width: 60, height: 24, rx: 3, fill: c, opacity: 0.85 }); el('line', { x1: x + 8, y1: y + 12, x2: x + 48, y2: y + 12, stroke: '#fff', 'stroke-width': 3 }); });
  const nc = g({});
  el('rect', { x: -34, y: -14, width: 68, height: 28, rx: 3, fill: pal.coral }, nc);
  k.text(0, 1, 'NEW', { 'font-size': 13, fill: '#fff' }, nc);
  const star = el('path', { d: 'M 0 -9 L 3 -3 L 9 0 L 3 3 L 0 9 L -3 3 L -9 0 L -3 -3 Z', fill: pal.yellow });
  const S = 0.85;
  const P = [k.buddy({ x: 110, y: FY - 6, scale: S }), person(k, 'coral', { x: 200, y: FY - 6, scale: S }), person(k, 'blue', { x: 290, y: FY - 6, scale: S, facing: -1 })];
  tableTop(k, 50, 350, 196, 18);
  return {
    update(t) {
      const n = pop(seg(t, 1.6, 2.1));
      tf(nc, 248, lerp(118, 98, easeOut(seg(t, 1.6, 2.1))), 4 * wobble(seg(t, 2.0, 2.8), 2, 5), Math.max(0.001, n));
      nc.setAttribute('opacity', t > 1.6 ? 1 : 0);
      const sp = seg(t, 1.7, 2.4);
      star.setAttribute('opacity', sp > 0 && sp < 1 ? 1 : 0); tf(star, 290, 84 - 8 * sp, sp * 90, 0.3 + hump(sp));
      const look = easeOut(seg(t, 1.8, 2.3));
      P.forEach((b, i) => {
        const talk = Math.sin(t * 6 + i * 2);
        b.pose({ armR: i === 1 && t < 1.6 ? 40 + 20 * talk : lerp(20, i === 1 ? 140 : 20, look * (i === 1 ? 1 : 0)), look: lerp(i === 0 ? 0.5 : -0.5, i === 2 ? -0.4 : 0.4, look), mood: t < 1.8 ? (i === 1 ? 'open' : 'smile') : 'open', lift: 6 * hump(seg(t, 1.8 + i * 0.08, 2.2 + i * 0.08)) });
      });
    }
  };
}
