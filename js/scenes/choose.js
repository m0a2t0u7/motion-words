// choose：いろいろな色の玉が並ぶ棚の前で、まめが見比べて好きな一つを選び取る（例文 You can choose any color.）
import { seg, lerp, easeInOut, easeOut, wobble, hump } from '../ease.js';
import { hp, reach } from './dig.js';

export const meta = { duration: 4.6, beats: [[0, '色がならぶ'], [1.8, '見比べる'], [3.9, '選んだ']] };

const track = (t, pts) => {
  if (t <= pts[0][0]) return pts[0][1];
  for (let i = 1; i < pts.length; i++) if (t <= pts[i][0]) return lerp(pts[i - 1][1], pts[i][1], easeInOut(seg(t, pts[i - 1][0], pts[i][0])));
  return pts[pts.length - 1][1];
};

export function create(k) {
  const { el, g, tf, pal } = k;
  const R = { FY: k.backdrop({ floorY: 236, mood: 'indoor' }) };
  el('rect', { x: 0, y: 200, width: 400, height: 14, fill: '#F2DDBB' });
  // 壁の飾り
  el('rect', { x: 40, y: 44, width: 70, height: 60, rx: 8, fill: '#DDEFFA' });
  el('line', { x1: 75, y1: 44, x2: 75, y2: 104, stroke: '#fff', 'stroke-width': 4 });
  el('rect', { x: 250, y: 60, width: 110, height: 6, rx: 3, fill: pal.woodDark });
  const xs = [176, 218, 260, 302, 344], cols = [pal.coral, pal.blue, pal.mint, pal.yellow, pal.violet], PICK = 3;
  const BY = 192;
  const mk = (x, i) => {
    el('ellipse', { cx: x, cy: 204, rx: 14, ry: 3.5, fill: pal.shadow });
    el('ellipse', { cx: x, cy: 202, rx: 11, ry: 3, fill: pal.woodDark });
    const n = g({});
    el('circle', { r: 11, fill: cols[i] }, n);
    el('circle', { cx: -3.5, cy: -4, r: 3.6, fill: '#fff', opacity: 0.4 }, n);
    return n;
  };
  const balls = [];
  xs.forEach((x, i) => { if (i !== PICK) balls[i] = mk(x, i); });
  const S = 0.98;
  const b = k.buddy({ x: 50, y: R.FY, scale: S });
  el('rect', { x: 0, y: 214, width: 400, height: 40, fill: pal.wood });
  el('rect', { x: 0, y: 214, width: 400, height: 3, fill: pal.woodDark, opacity: 0.4 });
  el('rect', { x: 0, y: 200, width: 400, height: 2, fill: '#fff', opacity: 0.6 });
  balls[PICK] = mk(xs[PICK], PICK);
  const hand = el('circle', { r: 6.5 * S, fill: pal.mint, stroke: pal.mintDark, 'stroke-width': 2.4 });
  return {
    update(t) {
      const bx = track(t, [[0, 50], [1.0, xs[1] - 56], [1.5, xs[1] - 56], [2.3, xs[PICK] - 56], [4.6, xs[PICK] - 56]]);
      const mv = Math.abs(track(t + 0.03, [[0, 50], [1.0, 166], [1.5, 166], [2.3, 246]]) - track(t - 0.03, [[0, 50], [1.0, 166], [1.5, 166], [2.3, 246]])) / 0.06;
      const walk = Math.abs(bx - 50) * 0.107;
      const mvm = Math.min(1, mv / 25);
      // 目標：見比べ中は玉の上、選ぶときは玉へ
      const hov = track(t, [[0, 0], [1.0, 0], [1.0001, 1], [1.5, 1], [2.3, 2]]);
      const tgtIdx = t < 1.7 ? 1 : PICK;
      const down = easeInOut(seg(t, 2.55, 3.0)), lift = easeInOut(seg(t, 3.1, 3.9));
      const tx = xs[tgtIdx], ty = lerp(BY - 20 + 3 * Math.sin(t * 6) * (1 - down), BY, down);
      b.pose({ x: bx, walk: mvm > 0.1 ? walk : Math.round(walk / Math.PI) * Math.PI, armL: 8, lean: 4 * mvm + 2, look: 0.6, mood: lift > 0.5 ? 'grin' : 'smile', squash: 1, armR: 60 });
      let a = t < 0.9 ? 40 + 10 * easeOut(seg(t, 0, 0.9)) : reach(b, S, 'R', tx, ty);
      if (t >= 0.9 && t < 1.7) a = lerp(a, reach(b, S, 'R', xs[1], BY - 20 + 3 * Math.sin(t * 6)), 1);
      a = lerp(a, 150, lift);
      b.pose({ armR: a, lean: 4 * mvm + 2 + 6 * lift * 0 });
      const h = hp(b, S, 'R', 26);
      balls.forEach((n, i) => {
        if (i === PICK && t > 3.0) {
          const c = hp(b, S, 'R', 33);
          tf(n, c.x, c.y - 3, 0, 1 + 0.08 * hump(seg(t, 3.0, 3.5)));
        } else tf(n, xs[i], BY);
      });
      k.set(hand, { cx: h.x, cy: h.y });
    }
  };
}
