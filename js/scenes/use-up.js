// use up：二人で紙の束から1枚ずつ取って使い、最後は空っぽになる（例文 We used up all the paper.）
import { seg, lerp, easeInOut, easeOut, clamp } from '../ease.js';
import { reach, hp, table } from './dig.js';

export const meta = { duration: 4.4, beats: [[0, '紙の束'], [1.6, '次々に使う'], [3.6, 'なくなった']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const TY = table(k, 120, 'indoor');
  const FY = 236;
  // 紙のトレー
  el('rect', { x: 226, y: 170, width: 64, height: 12, rx: 3, fill: '#C9CED8' });
  const N = 8;
  const sheets = Array.from({ length: N }, (_, i) => el('rect', { x: 0, y: 0, width: 54, height: 4, rx: 1, fill: '#fff', stroke: pal.line, 'stroke-width': 1 }));
  // 机に描いた紙が増えていく（使った紙）
  const used = Array.from({ length: N }, (_, i) => { const n = g({}); el('rect', { x: -14, y: -3, width: 28, height: 6, rx: 1, fill: '#fff', stroke: pal.line, 'stroke-width': 1 }, n); el('path', { d: 'M -8 0 Q -4 -2 0 0 T 8 0', stroke: i % 2 ? pal.coral : pal.blue, 'stroke-width': 1.2, fill: 'none' }, n); return n; });
  const A = k.buddy({ x: 150, y: FY, scale: 0.8 });
  const C = k.buddy({ x: 360, y: FY, scale: 0.8, facing: -1, color: pal.coral, dark: pal.coralDark });
  const front = g({});
  el('rect', { x: 120, y: 206, width: 280, height: 14, fill: pal.wood }, front);
  const T0 = 0.5, DT = 0.42;
  return {
    update(t) {
      let ar = 12, cr = 12;
      sheets.forEach((s, i) => {
        const who = i % 2 ? C : A, side = i % 2 ? 1 : -1;
        const u = t - (T0 + i * DT);
        const top = 168 - i * 4 + (N - 1) * 4 - (N - 1) * 4;
        const sy = 168 - (N - 1 - i) * 4;
        const dst = { x: (i % 2 ? 330 : 172) + ((i >> 1) % 2) * 6 * side, y: 188 - (i >> 1) * 2 };
        const f = easeInOut(seg(u, 0.1, 0.45));
        const reachP = Math.sin(clamp(u / 0.45) * Math.PI);
        if (i % 2) cr = Math.max(cr, lerp(12, reach(C, 0.8, 'R', 258, 168), u > 0 && u < 0.45 ? reachP : 0)); else ar = Math.max(ar, lerp(12, reach(A, 0.8, 'R', 258, 168), u > 0 && u < 0.45 ? reachP : 0));
        const x = lerp(231, dst.x - 27, f), y = lerp(sy, dst.y, f) - 16 * Math.sin(f * Math.PI);
        k.set(s, { x, y, opacity: f >= 1 ? 0 : 1 });
        tf(used[i], dst.x, dst.y); used[i].setAttribute('opacity', f >= 1 ? 1 : 0);
      });
      // 束の残り（上から順に取るので、まだ取られていない紙を下から積み直す）
      sheets.forEach((s, i) => { const u = t - (T0 + i * DT); if (u <= 0.1) k.set(s, { y: 176 - 4 * (N - 1 - i) - 2 }); });
      const done = t > T0 + N * DT + 0.2;
      A.pose({ armR: ar, armL: 10, look: 0.6, mood: done ? 'open' : 'smile', lean: 4 });
      C.pose({ armR: cr, armL: 10, look: 0.6, mood: done ? 'open' : 'smile', lean: 4 });
    }
  };
}
