// budget：旅行用の500ドルの封筒をスーツケースの横に置き、予算を決める（例文 We have a budget of 500 dollars for the trip.）
import { seg, lerp, easeInOut, easeOut, backOut, hump, clamp } from '../ease.js';
import { P, blinkAt, walkTo } from './run-after.js';
import { roomBg, desk, say, cloud } from './look-over.js';
import { hp, held, reach } from './dig.js';
function pz(b, S, o, R, L) { P(b, o); const a = {}; if (R) a.armR = reach(b, S, 'R', R[0], R[1]); if (L) a.armL = reach(b, S, 'L', L[0], L[1]); P(b, { ...o, ...a }); }

export const meta = { duration: 4.0, beats: [[0, '封筒を持つ'], [1.2, '机に置く'], [2.6, '予算が決まった']] };

export function create(k) {
  const { el, g, pal } = k;
  const FY = roomBg(k, 'home');
  const S = 1.1;
  const b = k.buddy({ x: 130, y: FY, scale: S });
  // 机の上：スーツケース
  const TY = 196;
  el('rect', { x: 236, y: 140, width: 74, height: 56, rx: 8, fill: pal.blue });
  el('rect', { x: 262, y: 130, width: 22, height: 12, rx: 4, fill: 'none', stroke: pal.blueDark, 'stroke-width': 4 });
  el('rect', { x: 244, y: 140, width: 6, height: 56, fill: pal.blueDark, opacity: 0.35 });
  el('rect', { x: 296, y: 140, width: 6, height: 56, fill: pal.blueDark, opacity: 0.35 });
  desk(k, 200, 190, TY);
  const bar = el('rect', { x: 330, y: 190, width: 0, height: 0 });
  const env = g({});
  el('rect', { x: -22, y: -14, width: 44, height: 28, rx: 4, fill: '#fff', stroke: pal.greenDark || pal.green, 'stroke-width': 2.5 }, env);
  el('path', { d: 'M -22 -13 L 0 3 L 22 -13', fill: 'none', stroke: pal.green, 'stroke-width': 2.5, 'stroke-linejoin': 'round' }, env);
  const tag = k.g({}, env); el('rect', { x: -17, y: -2, width: 34, height: 14, rx: 4, fill: pal.green }, tag);
  k.text(0, 9, '$500', { 'font-size': 11, fill: '#fff' }, tag);
  // 予算メーター（満タン）
  const m = k.g({}); k.tf(m, 350, 100);
  el('rect', { x: -9, y: -4, width: 18, height: 74, rx: 6, fill: '#fff', stroke: pal.line, 'stroke-width': 2 }, m);
  const fill = el('rect', { x: -6, y: 66, width: 12, height: 0, rx: 3, fill: pal.green }, m);
  return {
    update(t) {
      const down = easeInOut(seg(t, 1.0, 1.9)), f = easeOut(seg(t, 2.1, 3.0));
      const rx = lerp(180, 262, down), ry = lerp(150, 176, down);
      pz(b, S, { x: 130, facing: 1, lean: lerp(0, 8, down), look: 1, blink: blinkAt(t), mood: f > 0.9 ? 'grin' : 'smile' }, [rx, ry], null);
      const h = hp(b, S, 'R', 22);
      if (down < 1) k.tf(env, h.x + 6, h.y - 8, -8, 1.1, 1.1); else k.tf(env, 276, TY - 14 + 0, -6, 1.1, 1.1);
      k.set(fill, { y: 66 - 66 * f, height: 66 * f });
    }
  };
}
