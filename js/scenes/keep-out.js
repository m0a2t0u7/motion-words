// keep out：門に「KEEP OUT」の札。近づいた人は札を読み、中へ入らずに引き返す（例文 The sign on the gate says "Keep out."）
import { seg, lerp, easeInOut, hump } from '../ease.js';
import { path, walk } from './queue-up.js';
import { fenceGate } from './let-out.js';

export const meta = { duration: 4.0, beats: [[0, '門に近づく'], [1.6, '札を読む'], [3.4, '入らない']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'outdoor' });
  el('rect', { x: 150, y: 70, width: 140, height: 96, rx: 6, fill: '#E4E8EE' });
  el('path', { d: 'M 140 74 L 220 34 L 300 74 Z', fill: '#B9C2CF' });
  const F = fenceGate(k, FY, { gx: 180, gw: 84, gh: 70, label: 'KEEP OUT' });
  const S = 0.85;
  const b = k.buddy({ parent: F.front, x: 40, y: FY + 8, scale: S });
  const xf = path([[0, 40], [1.4, 160], [2.6, 160], [3.6, 70]]);
  const mark = g({});
  el('circle', { r: 11, fill: '#fff', stroke: pal.red, 'stroke-width': 2.5 }, mark);
  el('line', { x1: -6, y1: -6, x2: 6, y2: 6, stroke: pal.red, 'stroke-width': 3, 'stroke-linecap': 'round' }, mark);
  return {
    update(t) {
      const back = t > 2.6;
      const p = walk(b, xf, t, { y: FY + 8, facing: back ? -1 : 1, look: back ? -0.2 : 0.6, mood: t < 1.5 ? 'smile' : back ? 'flat' : 'open' });
      if (t > 1.4 && t < 2.6) b.pose({ lean: -4 * hump(seg(t, 1.5, 2.0)), squash: 1 + 0.03 * hump(seg(t, 1.5, 1.8)), armR: 20 });
      const m = seg(t, 1.6, 1.9);
      mark.setAttribute('opacity', t > 1.6 && t < 2.8 ? 1 : 0);
      tf(mark, 160 + 26, FY - 96 - 6 * m, 0, 0.6 + 0.4 * m);
      void lerp; void easeInOut; void p;
    }
  };
}
