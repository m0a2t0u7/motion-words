// fresh：市場の氷の上の新鮮な魚をまめが手に取り、きらきら光る魚を嬉しそうに見せる（例文 We bought fresh fish at the market.）
import { seg, lerp, easeInOut, easeOut, hump, wobble, clamp } from '../ease.js';
import { P, blinkAt, walkTo } from './run-after.js';
import { kitchenBg } from './weigh.js';
import { hp, reach } from './dig.js';

export const meta = { duration: 4.6, beats: [[0, '市場へ'], [2.0, '魚を取る'], [3.4, '新鮮な魚']] };

const kf = (t, pts) => {
  for (let i = 1; i < pts.length; i++) if (t < pts[i][0]) return lerp(pts[i - 1][1], pts[i][1], easeInOut(seg(t, pts[i - 1][0], pts[i][0])));
  return pts[pts.length - 1][1];
};
const star = 'M 0 -6 L 1.6 -1.6 L 6 0 L 1.6 1.6 L 0 6 L -1.6 1.6 L -6 0 L -1.6 -1.6 Z';

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'outdoor' });
  const S = 1.2, SP = { x: 193, y: 182 };
  // 屋台の屋根・台・氷
  for (let i = 0; i < 8; i++) el('path', { d: `M ${166 + i * 30} 26 h 30 l -4 28 h -22 Z`, fill: i % 2 ? '#fff' : pal.coral });
  el('rect', { x: 166, y: 52, width: 240, height: 5, fill: pal.coralDark });
  k.shadow(290, FY, 110, 7);
  el('rect', { x: 176, y: 198, width: 214, height: 9, rx: 3, fill: pal.wood });
  [[190, 207], [368, 207]].forEach(([x, y]) => el('rect', { x, y, width: 9, height: 29, rx: 2, fill: pal.woodDark }));
  el('path', { d: 'M 180 198 Q 182 190 196 190 H 330 Q 344 190 346 198 Z', fill: '#CFE9F7' });
  [[230, 194], [270, 193], [310, 194]].forEach(([x, y]) => el('rect', { x, y, width: 9, height: 7, rx: 2, fill: '#fff', opacity: 0.8 }));
  const fish = (parent, col = '#8FB4D9') => {
    el('path', { d: 'M -14 8 L -24 1 L -24 15 Z', fill: col }, parent);
    el('ellipse', { cx: 0, cy: 8, rx: 15, ry: 7, fill: col }, parent);
    el('path', { d: 'M -6 9 Q 2 14 10 9', fill: 'none', stroke: '#fff', 'stroke-width': 1.5, opacity: 0.7 }, parent);
    el('circle', { cx: 9, cy: 6, r: 2.4, fill: '#fff' }, parent); el('circle', { cx: 9.5, cy: 6, r: 1.2, fill: pal.ink }, parent);
  };
  [[246, 182], [286, 182]].forEach(([x, y], i) => { const f = g({}); tf(f, x, y); fish(f, i ? '#9DC5A8' : '#8FB4D9'); });
  const mine = g({}); fish(mine);
  const b = k.buddy({ x: 130, y: FY, scale: S });
  P(b, {});
  const aT = reach(b, S, 'R', SP.x, SP.y), aM = 150;
  const sp = [0, 1, 2, 3].map(() => el('path', { d: star, fill: pal.yellow }));
  const xf = (t) => 130 - 170 * (1 - easeOut(seg(t, 0, 1.6)));
  return {
    update(t) {
      const w = walkTo(xf, t, 130);
      const walking = t < 1.7;
      const a = walking ? w.armR : kf(t, [[1.7, w.armR], [2.0, 8], [2.4, 8], [2.8, aT], [3.0, aT], [3.6, aM], [4.6, aM]]);
      P(b, { x: w.x, walk: w.walk, facing: 1, armR: a, armL: walking ? w.armL : 8, lean: walking ? w.lean : 0, look: 0.3, mood: t < 3.2 ? 'smile' : 'grin', blink: blinkAt(t) });
      const holding = t > 3.0, h = hp(b, S, 'R');
      if (holding) tf(mine, h.x - 3, h.y - 4, 8 * Math.sin(t * 6) * seg(t, 3.4, 3.8), S);
      else tf(mine, SP.x, SP.y, 0, 1);
      sp.forEach((s, i) => {
        const on = seg(t, 3.5, 3.8), u = (t * 1.2 + i / 4) % 1;
        tf(s, h.x + [-14, 14, 28, -28][i] * S, h.y + [-30, -36, -14, -10][i] * S, 0, on * (0.5 + 0.7 * hump(u)));
        s.setAttribute('opacity', on);
      });
    }
  };
}
