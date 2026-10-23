// active：白髪のおばあちゃん（まめ）が公園を元気に走り、跳んで腕を振る。若い人は後ろで息切れ（例文 My grandmother is very active for her age.）
import { seg, lerp, easeInOut, easeOut, hump, wobble } from '../ease.js';
import { P, blinkAt, run, walkTo, path, person, elder, scene, treeG, sweat, sparkle } from './confused.js';

export const meta = { duration: 4.4, beats: [[0, '走り出す'], [1.6, '軽やかに走る'], [3.0, 'まだまだ元気']] };

export function create(k) {
  const { el, tf, pal } = k, S = 0.95;
  const { FY } = scene(k);
  [[50, 0.8], [350, 0.9]].forEach(([x, s]) => { const t = treeG(k, s); tf(t.g, x, FY); });
  el('path', { d: `M 0 ${FY + 14} L 400 ${FY + 14}`, stroke: '#E9DFC9', 'stroke-width': 18 });
  const young = person(k, 'blue', { scale: 0.95 });
  const b = k.buddy({ x: 40, y: FY, scale: S });
  elder(k, b);
  const sw = sweat(k), sp = [0, 1, 2].map(() => sparkle(k));
  const gx = path([[0.2, 40], [2.6, 260]]), yx = path([[0.6, -40], [3.4, 110]]);
  return {
    update(t) {
      const r = run(gx, t, 40, 1), jump = t > 2.7 ? Math.abs(Math.sin((t - 2.7) * 6.5)) : 0, jj = seg(t, 2.7, 2.9);
      P(b, { x: r.x, walk: r.walk, lean: r.lean, lift: r.lift + 22 * jump * jj, armL: t > 2.7 ? lerp(r.armL, 40 + 120 * jump, jj) : r.armL, armR: t > 2.7 ? lerp(r.armR, 40 + 120 * jump, jj) : r.armR,
        squash: 1 + 0.06 * (jump - 0.5) * jj, mood: 'grin', look: t > 2.7 ? -0.3 : 0.5, blink: blinkAt(t) });
      const y = walkTo(yx, t, -40, 1);
      P(young, { x: y.x, walk: y.walk, lean: 16 * seg(t, 2.2, 3.4), armL: 10, armR: 10, squash: 1 - 0.04 * Math.abs(Math.sin(t * 8)) * seg(t, 3.0, 3.4), mood: 'open', look: 0.6, blink: blinkAt(t, 1) });
      sw((t * 1.3) % 1 * seg(t, 1.8, 2.2), y.x + 22, FY - 96);
      sp.forEach((s, i) => { const q = ((t * 1.1) + i / 3) % 1; tf(s, r.x - 40 + i * 40, FY - 130 - 20 * q - 22 * jump * jj, t * 90, t > 2.8 ? Math.max(0.001, hump(q)) : 0.001); });
    }
  };
}
