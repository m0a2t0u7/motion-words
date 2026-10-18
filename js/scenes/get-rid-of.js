// get rid of：ぼろぼろの古いソファを、まめと相手が2人で持ち上げて部屋の外へ運び出す（例文 We need to get rid of this old sofa.）
import { seg, lerp, easeInOut, easeOut, hump, wobble } from '../ease.js';
import { stepPhase } from './dig.js';
import { star } from './get-on-with.js';

export const meta = { duration: 4.6, beats: [[0, '古いソファ'], [1.6, '2人で運び出す'], [4.0, 'なくなった']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  el('rect', { x: 60, y: 52, width: 90, height: 66, rx: 6, fill: '#DDEFFA', stroke: '#fff', 'stroke-width': 5 });
  // 右端の出口
  el('rect', { x: 352, y: 92, width: 60, height: 144, fill: '#CFE6D6' });
  el('rect', { x: 346, y: 86, width: 8, height: 150, fill: pal.woodDark });
  const mark = el('ellipse', { cx: 170, cy: 238, rx: 64, ry: 6, fill: '#E2DACB', opacity: 0 });
  const sp = [0, 1, 2].map((i) => { const s = g({}); star(k, s, 7 + i * 2); return s; });
  const shS = k.shadow(170, 237, 68, 5);
  const a = k.buddy({ x: 90, y: FY, scale: 0.85 });
  const c = k.buddy({ x: 250, y: FY, scale: 0.85, color: pal.coral, dark: pal.coralDark, facing: 1 });
  // ソファ（原点＝底の中央）：色あせ、つぎはぎ、飛び出たバネ
  const so = g({});
  el('rect', { x: -66, y: -54, width: 132, height: 34, rx: 10, fill: '#B9A07C' }, so);
  el('rect', { x: -70, y: -30, width: 22, height: 26, rx: 8, fill: '#A88D68' }, so);
  el('rect', { x: 48, y: -30, width: 22, height: 26, rx: 8, fill: '#A88D68' }, so);
  el('rect', { x: -50, y: -26, width: 100, height: 20, rx: 5, fill: '#C7B08D' }, so);
  el('rect', { x: -30, y: -50, width: 18, height: 14, rx: 2, fill: '#9C8F78', transform: 'rotate(-8 -21 -43)' }, so);
  el('path', { d: 'M 20 -26 q 4 -8 -2 -10 q -6 -2 -2 -10', stroke: pal.sub, 'stroke-width': 2, fill: 'none' }, so);
  el('rect', { x: -60, y: -4, width: 6, height: 6, fill: pal.woodDark }, so);
  el('rect', { x: 54, y: -4, width: 6, height: 6, fill: pal.woodDark }, so);
  const xf = (t) => lerp(170, 580, easeInOut(seg(t, 1.3, 3.6)));
  return {
    update(t) {
      const crouch = hump(seg(t, 0.5, 1.1)), lift = easeOut(seg(t, 0.85, 1.3));
      const sx = xf(t), moving = t > 1.3 && t < 3.6;
      const bob = moving ? Math.abs(Math.sin(t * 8)) * 2 : 0;
      const sy = FY - lift * 18 - bob;
      tf(so, sx, sy, moving ? Math.sin(t * 8) * 1.5 : wobble(seg(t, 1.3, 1.9), 2, 5) * 2);
      k.set(shS, { cx: sx, rx: 68 - lift * 12, opacity: 1 - lift * 0.4 });
      const arm = lerp(30, 64, easeInOut(seg(t, 0.3, 0.8)));
      const w = stepPhase(sx, 170) * 1.05;
      a.pose({ x: sx - 86, walk: moving ? w : 0, armR: arm, armL: arm - 10, squash: 1 - 0.12 * crouch, lean: 6 * crouch + (moving ? 6 : 0), mood: lift > 0 && t < 3.6 ? 'flat' : 'smile', look: 0.5 });
      c.pose({ x: sx + 86, walk: moving ? w + 1.5 : 0, facing: 1, armL: arm, armR: arm - 10, squash: 1 - 0.12 * crouch, lean: -4 * crouch, mood: lift > 0 ? 'flat' : 'smile', look: -0.4 });
      // 運び出したあと：床の跡と、きらめき
      mark.setAttribute('opacity', seg(t, 3.6, 4.0) * 0.8);
      sp.forEach((s, i) => { const q = seg(t, 3.8 + i * 0.15, 4.4 + i * 0.15); tf(s, 120 + i * 50, 200 - i * 12 - q * 8, q * 90, easeOut(q) * (1 - seg(q, 0.7, 1) * 0.3)); s.setAttribute('opacity', q > 0 ? 1 : 0); });
    }
  };
}
