// cut：はさみを持って紙に刃を入れ、端まで切って2枚に分ける（例文 I cut the paper with scissors.）
import { seg, lerp, easeInOut, easeOut, smooth } from '../ease.js';
import { hp, held, table, stepPhase } from './dig.js';

export const meta = { duration: 4.0, beats: [[0, '1枚の紙'], [1.6, '切っている'], [3.3, '2枚になった']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  table(k, 190);
  const b = k.buddy({ x: 146, y: 236 });
  // 紙（天板に平らに置く）：奥側・手前側の2片
  const px = 206, pw = 74, py = 184;
  const back = el('path', { d: '', fill: '#fff', stroke: 'none' });
  const front = el('path', { d: '', fill: '#F7F9FC', stroke: 'none' });
  const line = el('line', { stroke: '#B8C2D0', 'stroke-width': 1.6 });
  const sc = g({});
  const bl = [g({}, sc), g({}, sc)];
  bl.forEach((n, i) => {
    el('path', { d: 'M -2 14 L 2 14 L 0.5 40 Z', fill: '#DCE3EC', stroke: '#9AA6B6', 'stroke-width': 1 }, n);
    el('path', { d: `M 0 14 q ${i ? 9 : -9} -6 ${i ? 7 : -7} -16`, fill: 'none', stroke: i ? pal.red : pal.redDark || '#D9534A', 'stroke-width': 3.2, 'stroke-linecap': 'round' }, n);
    el('circle', { cx: i ? 8 : -8, cy: -4, r: 5, fill: 'none', stroke: i ? pal.red : '#D9534A', 'stroke-width': 3 }, n);
  });
  const quad = (x0, x1, y0, y1, sk = 9) => `M ${x0 + sk} ${y0} L ${x1 + sk} ${y0} L ${x1} ${y1} L ${x0} ${y1} Z`;
  return {
    update(t) {
      const cut = seg(t, 1.0, 3.0), sep = easeOut(seg(t, 2.8, 3.5));
      const tipX = lerp(px + 10, px + pw - 2, easeInOut(cut));
      const x = lerp(146, 172, easeInOut(cut));
      const op = Math.abs(Math.sin(t * 15)) * (cut > 0 && cut < 1 ? 1 : 0.15);
      b.pose({
        x, walk: stepPhase(x, 146), armR: lerp(lerp(40, 72, seg(t, 0, 0.9)), 15, easeInOut(seg(t, 3.0, 3.6))), armL: 8, lean: lerp(0, 10, easeInOut(cut)) * (1 - easeInOut(seg(t, 3.0, 3.6))) , look: 0.7, mood: t > 3.1 ? 'grin' : 'smile', squash: 1
      });
      held(k, b, 1, sc, 'R', 0);
      bl[0].setAttribute('transform', `rotate(${(-4 - 14 * op).toFixed(1)} 0 14)`);
      bl[1].setAttribute('transform', `rotate(${(4 + 14 * op).toFixed(1)} 0 14)`);
      const cutx = Math.min(px + pw, tipX);
      // 紙：切れた分だけ奥/手前に分かれ、最後はずれて2枚に
      const gap = 10 * sep;
      k.set(back, { d: quad(px, px + pw, py - sep * 2, py + 10 - gap * 0.4) });
      k.set(front, { d: quad(px - 1 * sep, px + pw - 1 * sep, py + 10 + gap * 0.6, py + 20 + sep * 4) });
      k.set(line, { x1: px + 4, y1: py + 10, x2: Math.max(px + 4, cutx - 1), y2: py + 10, opacity: t < 3.2 && cut > 0.02 ? 1 : 0 });
    }
  };
}
