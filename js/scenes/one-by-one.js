// one by one：教室のドアから生徒が1人ずつ、間をあけて入ってきて席の前に並ぶ（例文 The students came in one by one.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';
import { P, blinkAt, walkTo } from './run-after.js';
import { door, person } from './queue-up.js';
import { popS } from './from-scratch.js';

export const meta = { duration: 4.4, beats: [[0, 'ドアが開く'], [0.9, '1人ずつ入る'], [3.6, '全員そろう']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  el('rect', { x: 0, y: FY - 14, width: 400, height: 14, fill: '#ECE6DC' });
  // 黒板
  el('rect', { x: 30, y: 36, width: 220, height: 84, rx: 4, fill: '#3E6B5A', stroke: pal.woodDark, 'stroke-width': 6 });
  el('rect', { x: 60, y: 120, width: 60, height: 5, fill: pal.woodDark });
  el('path', { d: 'M 60 70 Q 80 56 100 70 T 140 70', stroke: '#fff', 'stroke-width': 2, fill: 'none', opacity: 0.6 });
  // ドア（右）
  el('rect', { x: 300, y: FY - 124, width: 76, height: 124, fill: '#D9E2EC' });
  const mid = g({});
  const cols = ['blue', 'yellow', 'mint', 'violet'];
  const S = cols.map((c, i) => person(k, c, { x: 338, y: FY, facing: -1, scale: 0.86, parent: mid }));
  const D = door(k, { x: 300, y: FY - 124, w: 76, h: 124, hinge: 'R', color: pal.blue });
  el('rect', { x: 294, y: FY - 130, width: 88, height: 6, rx: 2, fill: pal.woodDark });
  const seats = [70, 130, 190, 250];
  const T0 = [0.7, 1.4, 2.1, 2.8];
  const nums = S.map((_, i) => k.text(0, 0, String(i + 1), { 'font-size': 15, fill: pal.coralDark }));
  // 机の列（手前）
  seats.forEach((x) => { k.shadow(x, FY + 9, 24, 3); el('rect', { x: x - 24, y: FY - 28, width: 48, height: 6, rx: 2, fill: pal.wood }); el('rect', { x: x - 3, y: FY - 22, width: 6, height: 30, fill: pal.woodDark }); });
  return {
    update(t) {
      D.set(easeInOut(seg(t, 0.2, 0.6)));
      S.forEach((s, i) => {
        const a = T0[i];
        const xf = (tt) => lerp(338, seats[i], easeInOut(seg(tt, a, a + 0.9 + i * 0.12)));
        const w = walkTo(xf, t, 338, -1);
        const arrived = t > a + 0.9 + i * 0.12;
        s.g.setAttribute('opacity', t > a ? 1 : 0);
        P(s, { ...w, facing: arrived ? 1 : -1, y: FY, look: arrived ? 0.1 : -0.3, mood: arrived ? 'smile' : 'smile', blink: blinkAt(t, i * 0.7), squash: 1 - 0.04 * hump(seg(t, a + 0.9 + i * 0.12, a + 1.2 + i * 0.12)) });
        tf(nums[i], seats[i], FY - 98, 0, popS(seg(t, a + 0.9 + i * 0.12, a + 1.2 + i * 0.12)));
      });
    }
  };
}
