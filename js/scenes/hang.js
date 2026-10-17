// hang：コートを手に持って壁のフックまで腕を上げ、掛ける（例文 She hung her coat on the hook.）
import { seg, lerp, easeInOut, easeOut, wobble } from '../ease.js';
import { hp } from './dig.js';

export const meta = { duration: 3.8, beats: [[0, '手に持つ'], [1.2, '腕を上げる'], [3.2, '掛かった']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  k.backdrop({ floorY: 236, mood: 'indoor' });
  el('rect', { x: 0, y: 232, width: 400, height: 4, fill: pal.woodDark, opacity: 0.35 });
  // 玄関ドア風の壁飾りと靴箱
  el('rect', { x: 40, y: 60, width: 70, height: 176, rx: 4, fill: '#E7DAC6' });
  el('circle', { cx: 98, cy: 150, r: 4, fill: pal.yellowDark });
  const b = k.buddy({ x: 160, y: 236 });
  const A = { armR: 152, lean: 6, armL: 8 };
  b.pose(A);
  const hk = hp(b, 1, 'R', 30);
  b.pose({ armR: 8, lean: 0 });
  // 壁のフック板
  el('rect', { x: hk.x - 24, y: hk.y - 14, width: 76, height: 20, rx: 6, fill: pal.wood });
  [-14, 26].forEach((d) => { el('circle', { cx: hk.x + d, cy: hk.y - 4, r: 3.5, fill: pal.woodDark }); });
  el('path', { d: `M ${hk.x + 26} ${hk.y - 4} q 0 -10 -8 -4`, fill: 'none', stroke: pal.sub, 'stroke-width': 3, 'stroke-linecap': 'round' });
  const coat = g({});
  const cs = g({}, coat);
  el('path', { d: 'M 0 -2 q 10 -12 0 -16 q -8 4 0 16', fill: 'none', stroke: pal.sub, 'stroke-width': 2.5 }, cs);
  el('path', { d: 'M -18 2 L 18 2 L 36 14 L 34 44 L 24 42 L 22 56 L -22 56 L -24 42 L -34 44 L -36 14 Z', fill: pal.violet }, cs);
  el('path', { d: 'M -18 2 L 0 14 L 18 2 L 12 0 L 0 8 L -12 0 Z', fill: '#8D72E0' }, cs);
  el('rect', { x: -1, y: 14, width: 2, height: 42, fill: '#8D72E0' }, cs);
  [26, 38].forEach((y) => el('circle', { cx: 6, cy: y, r: 2.2, fill: pal.white }, cs));
  const sh = k.shadow(190, 240, 24, 5);
  return {
    update(t) {
      const up = easeInOut(seg(t, 0.5, 1.9));
      const down = easeInOut(seg(t, 2.1, 2.8));
      const on = t < 2.0;
      b.pose({
        armR: on ? lerp(62, 152, up) : lerp(152, 8, down), lean: lerp(0, 6, up) * (1 - down), squash: 1 - 0.03 * Math.sin(Math.PI * seg(t, 0.2, 0.7)),
        armL: lerp(10, 30, up) * (1 - down) + 8 * down, look: 0.5, mood: t > 1.9 ? 'grin' : 'smile'
      });
      const h = hp(b, 1, 'R', 30);
      const sw = wobble(seg(t, 2.0, 3.5), 2.5, 3.2) * 9;
      const carry = lerp(0, 6, Math.sin(t * 2));
      if (on) tf(coat, h.x, h.y - 3, lerp(carry, 0, up) + 3 * Math.sin(t * 4) * (1 - up));
      else tf(coat, hk.x, hk.y - 3, sw);
      tf(cs, 0, 0, 0, 1, 1);
      k.set(sh, { opacity: 1 });
    }
  };
}
