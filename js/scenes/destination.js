// destination：地図の道をたどって歩き、正午（時計が12時）に旗の立つ目的地の灯台へ着く（例文 We reached our destination at noon.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';
import { P, blinkAt, walk, path, clock, popIn } from './vehicle.js';
import { backpack } from './bus.js';

export const meta = { duration: 4.4, beats: [[0, '歩いて向かう'], [1.8, 'もう少し'], [3.4, '正午に到着']] };

export function create(k) {
  const { el, g, pal } = k;
  const FY = 236;
  k.backdrop({ floorY: FY });
  el('rect', { x: 0, y: FY, width: 400, height: 64, fill: '#E3D2B0' });
  el('rect', { x: 330, y: 190, width: 70, height: 110, fill: '#7CC7EC' });
  // 目的地の灯台とゴールの旗
  el('path', { d: 'M 296 236 L 304 110 L 336 110 L 344 236 Z', fill: '#fff', stroke: pal.line, 'stroke-width': 2 });
  [140, 180, 216].forEach((y) => el('rect', { x: 300 + (236 - y) * 0.03, y, width: 40 - (236 - y) * 0.06, height: 12, fill: pal.red }));
  el('rect', { x: 298, y: 92, width: 44, height: 18, rx: 4, fill: pal.yellow }); el('path', { d: 'M 296 92 L 320 76 L 344 92 Z', fill: pal.red });
  el('line', { x1: 270, y1: FY, x2: 270, y2: 180, stroke: pal.ink, 'stroke-width': 3 });
  const flag = el('path', { d: 'M 270 180 L 300 188 L 270 196 Z', fill: pal.green });
  const sun = el('circle', { r: 20, fill: '#FFD57A' });
  const ck = clock(k, 60, 60, 22);
  const me = k.buddy({ x: -30, y: FY + 8, scale: 0.85 }); backpack(k, me);
  const X = path([[0, -30], [3.4, 240]]);
  return {
    update(t) {
      const p = t / 4.4;
      k.set(sun, { cx: lerp(120, 200, p), cy: lerp(80, 36, easeOut(seg(t, 0, 3.4))) });
      const m = 60 * easeInOut(seg(t, 0, 3.4));
      ck.set(m >= 60 ? 12 : 11, m % 60);
      walk(me, X, t, { mood: t > 3.4 ? 'grin' : 'smile', look: 0.6, blink: blinkAt(t) });
      if (t > 3.4) me.pose({ armR: 8 + 150 * easeOut(seg(t, 3.4, 3.8)), armL: 8 + 150 * easeOut(seg(t, 3.5, 3.9)), lift: 10 * hump(seg(t, 3.4, 3.9)) });
      k.set(flag, { transform: `translate(270 188) scale(1 ${(1 + 0.15 * Math.sin(t * 6)).toFixed(3)}) translate(-270 -188)` });
      void g; void popIn;
    }
  };
}
