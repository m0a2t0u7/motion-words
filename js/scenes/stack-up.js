// stack up：まめが箱を一つずつ運び、壁ぎわにきちんと積み重ねていく（例文 He stacked up the boxes against the wall.）
import { seg, lerp, easeInOut, easeOut, wobble, clamp } from '../ease.js';
import { reach, gait } from './dig.js';

export const meta = { duration: 4.6, beats: [[0, '床の箱'], [1.8, '積み重ねる'], [4.0, '3段に積んだ']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 240, mood: 'indoor' });
  // 右の壁
  el('rect', { x: 340, y: 0, width: 60, height: FY, fill: '#E9E2D6' });
  el('rect', { x: 336, y: 0, width: 6, height: FY, fill: '#D8CFC0' });
  const box = () => { const n = g({}); el('rect', { x: -26, y: -40, width: 52, height: 40, rx: 3, fill: '#D8B98E', stroke: '#B48E62', 'stroke-width': 1.5 }, n); el('rect', { x: -6, y: -40, width: 12, height: 40, fill: '#E9DFA8', opacity: 0.8 }, n); return n; };
  const SRC = [[60, FY], [100, FY], [140, FY]];
  const DST = [[308, FY], [308, FY - 40], [308, FY - 80]];
  const sh = [0, 1, 2].map(() => k.shadow(0, FY + 1, 28, 4));
  const B = k.buddy({ x: 180, y: FY, scale: 0.8 });
  const boxes = [0, 1, 2].map(box);
  // 1箱あたり：取りに行く→持ち上げる→運ぶ→置く
  const S = [0.2, 1.6, 3.0], D = 1.35;
  function bx(t) {
    for (let i = 2; i >= 0; i--) if (t >= S[i]) return { i, u: (t - S[i]) / D };
    return { i: 0, u: 0 };
  }
  const xf = (t) => {
    const { i, u } = bx(t);
    const from = i === 0 ? 180 : 262, pick = SRC[2 - i][0] + 34, put = 262;
    if (u < 0.3) return lerp(from, pick, easeInOut(u / 0.3));
    if (u < 0.45) return pick;
    if (u < 0.8) return lerp(pick, put, easeInOut((u - 0.45) / 0.35));
    return put;
  };
  return {
    update(t) {
      const { i, u } = bx(t);
      const p = gait(xf, t, 180);
      const carry = u >= 0.38 && u < 0.92;
      const fwd = u < 0.3 ? (xf(t + 0.02) < xf(t) ? -1 : 1) : u < 0.45 ? -1 : 1;
      const done = t > S[2] + D;
      B.pose({ x: p.x, walk: p.walk, facing: done ? -1 : fwd, armL: carry ? 70 : p.armL, armR: carry ? 70 : p.armR, lean: (u > 0.3 && u < 0.45 ? 16 : 0) + (carry ? -4 : 0) + p.lean, squash: 1 - (u > 0.3 && u < 0.45 ? 0.06 : 0), mood: done ? 'grin' : 'flat', look: 0.5 });
      boxes.forEach((n, j) => {
        const src = SRC[2 - j], dst = DST[j];
        let x = src[0], y = src[1], lift = 0;
        if (j < i || (j === i && u >= 0.92) || (j < i)) { x = dst[0]; y = dst[1]; }
        if (j === i && u >= 0.38 && u < 0.92) {
          const h = B.state.x + 30 * B.state.facing * 0.8;
          const set = seg(u, 0.8, 0.92);
          x = lerp(h, dst[0], set); y = lerp(FY - 40, dst[1], easeInOut(set)) + (u < 0.45 ? lerp(40, 0, seg(u, 0.38, 0.45)) : 0);
          lift = 1;
        }
        if (j === i && u >= 0.92) y += 2 * wobble(seg(u, 0.92, 1.05), 2, 6);
        tf(n, x, y);
        tf(sh[j], x, 0); sh[j].setAttribute('opacity', (y >= FY - 0.5 || x === dst[0] && dst[1] === FY) ? 1 : 0);
      });
    }
  };
}
