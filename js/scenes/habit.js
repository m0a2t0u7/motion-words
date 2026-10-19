// habit：食事を食べ終えたまめが洗面台で歯をみがく。毎食後のチェックが3つ並ぶ（例文 Brushing your teeth after every meal is a very good habit.）
import { seg, lerp, easeInOut, easeOut, hump, backOut } from '../ease.js';
import { reach, hp, held, gait } from './dig.js';
import { plate, counter } from './diet.js';
import { mark } from './so-far-so-good.js';

export const meta = { duration: 4.4, beats: [[0, '食べ終わる'], [1.4, '歯をみがく'], [3.2, '毎食後の習慣']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  k.backdrop({ floorY: 250, mood: 'indoor' });
  // 洗面台と鏡（右）
  el('rect', { x: 268, y: 92, width: 74, height: 84, rx: 8, fill: '#DCEBF5', stroke: '#fff', 'stroke-width': 5 });
  el('path', { d: 'M 340 196 V 186 Q 340 180 334 180 H 326', fill: 'none', stroke: '#AEB7C4', 'stroke-width': 4 });
  // 毎食後のマーク（朝・昼・夜の皿）
  const slots = [0, 1, 2].map((i) => {
    const o = g({}); tf(o, 52 + i * 52, 38);
    el('rect', { x: -22, y: -20, width: 44, height: 40, rx: 8, fill: '#fff', stroke: pal.line, 'stroke-width': 2 }, o);
    el('ellipse', { cx: 0, cy: 6, rx: 14, ry: 4, fill: '#F1F3F6', stroke: pal.line, 'stroke-width': 1.5 }, o);
    el('circle', { cx: 0, cy: -8, r: 5, fill: [pal.yellow, pal.coral, pal.violet][i] }, o);
    return mark(k, 'check', o, 1.4);
  });
  const S = 1.12, b = k.buddy({ x: 120, y: 232, scale: S });
  counter(k, 212);
  el('ellipse', { cx: 306, cy: 213, rx: 34, ry: 6, fill: '#fff', stroke: pal.line, 'stroke-width': 2 });
  plate(k, 176, 214, 62);
  const fork = g({}); el('line', { x1: 0, y1: 0, x2: 0, y2: 22, stroke: '#AEB7C4', 'stroke-width': 3, 'stroke-linecap': 'round' }, fork);
  const brush = g({});
  el('rect', { x: -2.5, y: 0, width: 5, height: 26, rx: 2, fill: pal.blue }, brush);
  el('rect', { x: -4, y: 24, width: 8, height: 7, rx: 2, fill: '#fff', stroke: pal.line, 'stroke-width': 1 }, brush);
  const foam = [0, 1, 2].map(() => el('circle', { r: 3.5, fill: '#fff', stroke: '#D5DEE9', 'stroke-width': 1 }));
  const xf = (t) => lerp(120, 270, easeInOut(seg(t, 1.0, 1.7)));
  return {
    update(t) {
      const p = gait(xf, t, 120);
      const eat = t < 0.9 ? hump(seg(t, 0.1, 0.8)) : 0;
      const br = easeInOut(seg(t, 1.75, 2.0)) * (1 - easeInOut(seg(t, 3.1, 3.4)));
      b.pose({ x: p.x, walk: 0, lean: p.lean, armL: 10, look: 0.5, mood: br > 0.5 ? 'grin' : 'smile' });
      const my = 232 - 54 * S;
      let ar = t < 0.9 ? lerp(40, reach(b, S, 'R', 180, 200), 1 - eat) : 30;
      if (eat > 0.5) ar = reach(b, S, 'R', p.x + 14, my);
      if (br > 0) ar = lerp(30, reach(b, S, 'R', p.x + 20, my - 2 + 3 * Math.sin(t * 30)), br);
      b.pose({ armR: ar });
      held(k, b, S, fork, 'R', 0, 30); fork.setAttribute('opacity', t < 0.95 ? 1 : 0);
      held(k, b, S, brush, 'R', 180, 26); brush.setAttribute('opacity', t > 1.6 && t < 3.4 ? 1 : 0);
      foam.forEach((f, i) => k.set(f, { cx: p.x + 22 * S + i * 4, cy: my + 4 + Math.sin(t * 20 + i) * 2, opacity: br > 0.6 ? 1 : 0 }));
      slots.forEach((m, i) => { const q = seg(t, 3.2 + i * 0.3, 3.45 + i * 0.3); tf(m, 14, 12, 0, q <= 0 ? 0.001 : backOut(q) * 1.4); });
    }
  };
}
