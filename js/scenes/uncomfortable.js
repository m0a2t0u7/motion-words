// uncomfortable：満員の部屋に人がどんどん入ってきて、まめは押されて身を縮め、汗をかく（例文 I felt uncomfortable in the crowded room.）
import { seg, lerp, easeInOut, easeOut, hump, wobble } from '../ease.js';
import { P, blinkAt, walkTo, path, person, sweat, sym, onFace } from './confused.js';

export const meta = { duration: 4.4, beats: [[0, '部屋にいる'], [1.4, '人がぎゅうぎゅう'], [3.0, '落ち着かない']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 1;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  el('rect', { x: 0, y: FY - 12, width: 400, height: 12, fill: '#ECE6DC' });
  el('rect', { x: 150, y: 40, width: 100, height: 60, rx: 5, fill: '#DDEFFA', stroke: '#fff', 'stroke-width': 5 });
  // 後列の人（最初からいる）
  const back = ['violet', 'yellow', 'blue', 'coral', 'violet'].map((c, i) => person(k, c, { x: 40 + i * 80, y: FY - 6, scale: 0.85, facing: i % 2 ? -1 : 1 }));
  const b = k.buddy({ x: 200, y: FY, scale: S });
  // 左右から入ってくる人
  const ppl = [['coral', -1, 150], ['blue', 1, 252], ['yellow', -1, 100], ['coral', 1, 302]].map(([c, d, x], i) => ({ p: person(k, c, { scale: 0.95 }), d, x, t0: 0.8 + i * 0.45 }));
  const sw = sweat(k), sw2 = sweat(k), dot = sym(k, '!', pal.coralDark, 22);
  const brow = onFace(k, b);
  [-1, 1].forEach((d) => el('line', { x1: d * 16, y1: -63, x2: d * 5, y2: -68, stroke: pal.ink, 'stroke-width': 2.4, 'stroke-linecap': 'round' }, brow));
  return {
    update(t) {
      back.forEach((p, i) => P(p, { x: 40 + i * 80 + Math.sin(t * 2 + i) * 2, y: FY - 6, facing: i % 2 ? -1 : 1, look: 0.3, blink: blinkAt(t, i), mood: 'flat' }));
      let push = 0;
      ppl.forEach(({ p, d, x, t0 }, i) => {
        const xf = path([[t0, d > 0 ? 450 : -50], [t0 + 1.0, x]]), w = walkTo(xf, t, xf(0), -d);
        P(p, { x: w.x + Math.sin(t * 7 + i) * 1.5 * seg(t, t0 + 1, t0 + 1.2), walk: w.walk, facing: -d, armL: w.armL, armR: w.armR, lean: w.lean, mood: 'flat', look: -0.3 * d, blink: blinkAt(t, i * 0.7) });
        push += easeOut(seg(t, t0 + 0.7, t0 + 1.0));
      });
      const sq = push / 4, jig = Math.sin(t * 16) * 1.2 * sq;
      P(b, { x: 200 + jig, squash: 1 + 0.12 * sq, armL: 8 - 6 * sq, armR: 8 - 6 * sq, look: Math.sin(t * 3) * 0.6 * sq, mood: sq > 0.3 ? 'sad' : 'smile', blink: blinkAt(t), lift: 3 * hump(seg(t, 2.5, 2.8)) });
      brow.setAttribute('opacity', seg(t, 2.2, 2.6));
      sw((t * 1.2) % 1 * seg(t, 2.4, 2.8), 230, FY - 100);
      sw2(((t * 1.2) + 0.5) % 1 * seg(t, 2.8, 3.2), 170, FY - 96);
      dot(seg(t, 1.8, 2.1) * (1 - seg(t, 2.6, 2.8)), 200, FY - 120);
    }
  };
}
