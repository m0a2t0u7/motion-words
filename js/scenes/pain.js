// pain：公園を走っていて、ひざに鋭い痛みが走り、ひざを押さえてうずくまる（例文 I felt a sharp pain in my knee.）
import { seg, lerp, easeInOut, easeOut, hump, clamp, wobble } from '../ease.js';
import { P, reach, hp } from './hospital.js';
import { run, tree, parkBg } from './run-after.js';

export const meta = { duration: 4.0, beats: [[0, '走っている'], [1.5, 'ひざにズキッ'], [2.6, 'ひざを押さえる']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = parkBg(k, 240);
  tree(k, 330, FY - 4, 0.9); tree(k, 60, FY - 6, 0.7);
  el('rect', { x: 0, y: FY + 10, width: 400, height: 14, fill: '#EFE6D6' });
  const S = 1.2;
  const b = k.buddy({ x: 70, y: FY, scale: S });
  const legF = b.g.children[1].children[1];
  // ズキッとする光（ギザギザ）
  const zap = g({});
  el('path', { d: 'M 0 -16 L 4 -5 L 15 -8 L 7 1 L 14 11 L 2 6 L -3 16 L -5 5 L -16 7 L -8 -1 L -14 -11 L -3 -6 Z', fill: pal.yellow, stroke: pal.red, 'stroke-width': 2.5, 'stroke-linejoin': 'round' }, zap);
  const rays = [0, 1, 2, 3, 4].map((i) => el('line', { x1: 0, y1: 0, x2: 0, y2: -9, stroke: pal.red, 'stroke-width': 3, 'stroke-linecap': 'round' }));
  const sweat = el('path', { d: 'M 0 -7 Q 5 0 0 5 Q -5 0 0 -7 Z', fill: pal.water });
  const xf = (t) => lerp(70, 220, easeOut(seg(t, 0, 1.45)) * 0.5 + seg(t, 0, 1.45) * 0.5);
  return {
    update(t) {
      const r = run(xf, t, 70);
      const hit = seg(t, 1.45, 1.7), bend = easeOut(seg(t, 1.6, 2.3));
      const shake = t > 1.6 ? wobble(seg(t, 1.6, 2.6), 5, 3) : 0;
      P(b, { x: r.x + shake * 2, walk: r.walk * (1 - hit), lift: r.lift * (1 - hit), lean: lerp(r.lean, 32, bend), squash: 1 - 0.1 * bend + 0.03 * Math.sin(t * 12) * bend,
        mood: t > 1.5 ? 'open' : 'smile', blink: t > 1.55 ? 0.7 : 0, look: 0.5, armL: r.armL * (1 - hit), armR: r.armR * (1 - hit) });
      // 痛む脚を少し前に浮かせる
      const lk = -30 * bend;
      legF.setAttribute('transform', `translate(12 ${-14 - b.state.lift}) rotate(${lk.toFixed(2)})`);
      // ひざ（脚の中ほど）の位置
      const a = (lk * Math.PI) / 180;
      const knee = { x: b.state.x + (12 - Math.sin(a) * 8) * S, y: FY + (-14 - 10 + Math.cos(a) * 8) * S };
      if (bend > 0) {
        P(b, { ...b.state, armR: lerp(b.state.armR, reach(b, S, 'R', knee.x, knee.y), bend), armL: lerp(b.state.armL, -reach(b, S, 'L', knee.x - 4, knee.y) * -1, bend) });
        legF.setAttribute('transform', `translate(12 ${-14 - b.state.lift}) rotate(${lk.toFixed(2)})`);
      }
      const z = t > 1.45 ? (t < 1.75 ? easeOut(seg(t, 1.45, 1.75)) * 1.3 : 1 + 0.12 * Math.sin(t * 18)) : 0;
      tf(zap, knee.x + 2, knee.y, t * 40, Math.max(0.001, z * 0.9));
      zap.setAttribute('opacity', t > 1.45 ? 1 - 0.5 * seg(t, 3.0, 4.0) : 0);
      rays.forEach((ry, i) => {
        const ang = -60 + i * 30, q = seg(t, 1.5 + (i % 2) * 0.1, 2.0 + (i % 2) * 0.1);
        const rr = 18 + 10 * easeOut(q);
        tf(ry, knee.x + Math.sin((ang * Math.PI) / 180) * rr, knee.y - Math.cos((ang * Math.PI) / 180) * rr, ang);
        ry.setAttribute('opacity', hump(q));
      });
      const sq = seg(t, 2.2, 3.4);
      tf(sweat, b.state.x - 26, FY - 96 * S + 30 * sq);
      sweat.setAttribute('opacity', t > 2.2 ? 1 - sq : 0);
    }
  };
}
