// snow：雪の積もった公園で、子ども2人が雪玉を投げ合って遊ぶ。雪だるまもいる（例文 The kids played in the snow.）
import { seg, lerp, easeInOut, easeOut, easeIn, clamp, hump, wobble } from '../ease.js';
import { scene, treeG, fall, hp, P, blinkAt, popIn } from './nature.js';

export function snowman(k, parent) {
  const g = k.g({}, parent);
  k.shadow(0, 0, 24, 4, g);
  k.el('circle', { cx: 0, cy: -20, r: 21, fill: '#fff', stroke: '#DCE6F0', 'stroke-width': 2 }, g);
  k.el('circle', { cx: 0, cy: -52, r: 14, fill: '#fff', stroke: '#DCE6F0', 'stroke-width': 2 }, g);
  k.el('circle', { cx: -5, cy: -55, r: 1.8, fill: k.pal.ink }, g); k.el('circle', { cx: 5, cy: -55, r: 1.8, fill: k.pal.ink }, g);
  k.el('path', { d: 'M 0 -51 L 10 -49 L 0 -47 Z', fill: '#FF9A3C' }, g);
  k.el('path', { d: 'M -14 -40 Q 0 -34 14 -40 L 14 -36 Q 0 -30 -14 -36 Z', fill: k.pal.red }, g);
  k.el('path', { d: 'M -20 -26 L -36 -38 M 20 -26 L 36 -38', stroke: '#9B7653', 'stroke-width': 2.5, 'stroke-linecap': 'round' }, g);
  return g;
}

export const meta = { duration: 4.2, beats: [[0, '雪の中で'], [1.2, '雪玉を投げる'], [2.6, '雪遊び']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 0.7;
  const { FY } = scene(k, { FY: 236, top: '#C9DCEB', bot: '#F2F7FB', ground: '#FAFCFF', edge: '#E3ECF4' });
  el('path', { d: `M 0 ${FY - 20} Q 120 ${FY - 50} 240 ${FY - 22} T 400 ${FY - 30} V ${FY} H 0 Z`, fill: '#EEF4FA' });
  tf(treeG(k, 0.95, '#E8F1F8', '#DCE8F2').g, 50, FY + 2);
  tf(snowman(k), 200, FY + 4);
  const a = k.buddy({ x: 110, y: FY + 10, scale: S });
  const c = k.buddy({ x: 300, y: FY + 10, scale: S, color: pal.coral, dark: pal.coralDark, facing: -1 });
  const ball = el('circle', { r: 6, fill: '#fff', stroke: '#C9D6E3', 'stroke-width': 1.5 });
  const puff = [0, 1, 2, 3, 4].map(() => el('circle', { r: 3, fill: '#fff', stroke: '#DCE6F0', 'stroke-width': 1 }));
  const snow = fall(k, { n: 34, FY: 250, speed: 40 });
  const T1 = 1.5, T2 = 2.3;
  return {
    update(t) {
      snow(t);
      // まめ：しゃがんで雪玉を作り（0.2〜1.0）、振りかぶって（1.0〜1.5）投げる
      const crouch = hump(seg(t, 0.2, 1.1)), wind = easeInOut(seg(t, 1.0, T1 - 0.1)), thr = easeOut(seg(t, T1 - 0.1, T1 + 0.2));
      P(a, { y: FY + 10, squash: 1 - 0.12 * crouch, lean: 20 * crouch - 10 * wind + 18 * thr, armR: lerp(lerp(20, 40, crouch), 170, wind) - 110 * thr, armL: 30 + 20 * crouch, look: 0.6, mood: t > T2 ? 'grin' : 'open', blink: blinkAt(t) });
      const h = hp(a, S, 'R', 28);
      const p = seg(t, T1, T2);
      if (t < T1) { tf(ball, h.x, h.y, 0, t < 0.5 ? 0.001 : popIn(seg(t, 0.5, 0.9))); }
      else if (p < 1) { tf(ball, lerp(h.x, 296, p), lerp(h.y, FY - 38, p) - 60 * hump(p)); }
      else tf(ball, 0, 0, 0, 0.001);
      const hit = seg(t, T2, T2 + 0.5);
      puff.forEach((n, i) => { const an = i * 1.3; tf(n, 296 + Math.cos(an) * 18 * easeOut(hit), FY - 38 + Math.sin(an) * 14 * easeOut(hit), 0, hit > 0 && hit < 1 ? 1 - hit : 0.001); });
      const rx = wobble(hit, 2, 4);
      P(c, { y: FY + 10, facing: -1, lean: -10 * rx, armL: 30 + 120 * hump(seg(t, T2, 3.4)), armR: 30 + 120 * hump(seg(t, T2 + 0.1, 3.5)), lift: 10 * hump(seg(t, 3.2, 3.6)), look: -0.5, mood: t > T2 ? 'grin' : 'smile', blink: Math.max(blinkAt(t, 1), hump(seg(t, T2 - 0.1, T2 + 0.3))) });
    }
  };
}
