// in return：重い箱を相手に一緒に持ち上げてもらう→今度は自分が相手の箱を手伝う（例文 He helped me, so I helped him in return.）
import { seg, lerp, easeInOut, easeOut, hump, wobble } from '../ease.js';
import { P, reach, box, drop, heart, walk, path, sc } from './in-common.js';

export const meta = { duration: 4.4, beats: [[0, '手伝ってもらう'], [1.8, 'お返しに'], [3.6, '手伝い返した']] };

export function create(k) {
  const { el, tf, pal } = k;
  const FY = k.backdrop({ floorY: 240, mood: 'indoor' });
  el('rect', { x: 0, y: FY - 6, width: 400, height: 6, fill: pal.line });
  el('rect', { x: 40, y: 40, width: 76, height: 60, rx: 6, fill: '#DDEFFA', stroke: '#fff', 'stroke-width': 5 });
  // 作業台（動かない）
  k.shadow(190, FY, 120, 5);
  el('rect', { x: 92, y: 190, width: 196, height: 8, rx: 3, fill: pal.woodDark });
  el('rect', { x: 98, y: 198, width: 8, height: FY - 198, fill: pal.woodDark });
  el('rect', { x: 274, y: 198, width: 8, height: FY - 198, fill: pal.woodDark });
  const S = 0.86;
  const A = k.buddy({ x: 92, y: FY, scale: S });
  const C = k.buddy({ x: 430, y: FY, scale: S, facing: -1, color: pal.coral, dark: pal.coralDark });
  const bA = box(k, 44, 34, '#E3B77E'), bB = box(k, 44, 34, '#9CC9EE');
  const sw = drop(k), sw2 = drop(k);
  const hearts = [heart(k, k.g({}), pal.red), heart(k, k.g({}), pal.red)];
  const xA = path([[1.85, 92], [2.8, 192]]);
  const xC = path([[0, 430], [0.8, 192], [1.6, 192], [2.2, 290]]);
  const lift = (t, a) => easeInOut(seg(t, a, a + 0.7));
  const hold = (b, bx, by, side) => {
    const tx = bx - side * 24, ty = by - 16;
    b.pose({ armR: reach(b, S, 'R', tx, ty), armL: reach(b, S, 'L', tx, ty) * 0.9 });
  };
  return {
    update(t) {
      const la = lift(t, 0.95), lb = lift(t, 3.0);
      const jig = (t > 0.15 && t < 0.9 ? 1.2 * Math.sin(t * 40) : 0);
      const jigB = (t > 2.25 && t < 2.95 ? 1.2 * Math.sin(t * 40) : 0);
      const yA = lerp(FY, 190, la) - 4 * hump(la) + jig * 0.5, yB = lerp(FY, 190, lb) - 4 * hump(lb) + jigB * 0.5;
      tf(bA, 140 + jig, yA); tf(bB, 240 + jigB, yB);
      // まめ：箱Aで踏ん張る→Bへ移動→Bを手伝う
      const aw = t > 1.85 && t < 2.85;
      const strain = t > 0.1 && t < 0.95;
      walk(A, xA, t, { facing: 1, look: 0.5, mood: strain ? 'flat' : t > 3.7 ? 'grin' : 'smile', lean: strain ? 14 : aw ? 3 : 6, squash: strain ? 0.95 : 1 });
      if (!aw) {
        if (t < 1.85) hold(A, 140, yA, 1); else hold(A, 240, yB, 1);
        if (t > 1.65 && t < 1.85) A.pose({ armR: 30, armL: 30 });
      }
      // ピンク：歩いてきて手伝う→自分の箱Bで踏ん張る
      const cw = t < 0.85 || (t > 1.6 && t < 2.25);
      const cStrain = t > 2.25 && t < 3.0;
      walk(C, xC, t, { facing: t > 1.6 && t < 2.25 ? 1 : t >= 2.25 ? -1 : -1, look: 0.5, mood: cStrain ? 'flat' : t > 3.7 ? 'grin' : 'smile', lean: cStrain ? 14 : cw ? 3 : 6, squash: cStrain ? 0.95 : 1 });
      if (!cw) { if (t < 1.6) hold(C, 140, yA, -1); else hold(C, 240, yB, -1); }
      if (t > 0.8 && t < 0.95) C.pose({ armR: 40, armL: 40 });
      // 汗（ひとりで持てない）
      sw.setAttribute('opacity', strain && t > 0.3 ? 1 : 0); tf(sw, 70, FY - 92 + 10 * seg(t, 0.3, 0.95));
      sw2.setAttribute('opacity', cStrain && t > 2.4 ? 1 : 0); tf(sw2, 314, FY - 92 + 10 * seg(t, 2.4, 3.0));
      const h = easeOut(seg(t, 3.75, 4.2));
      tf(hearts[0].parentNode, 160, 140 - 10 * h, 0, sc(h)); tf(hearts[1].parentNode, 220, 136 - 10 * h, 0, sc(h));
      [A, C].forEach((b, i) => { if (t > 3.75) b.pose({ armR: lerp(b.state.armR, 20, h), armL: lerp(b.state.armL, 20, h), lean: lerp(b.state.lean, 0, h) }); });
    }
  };
}
