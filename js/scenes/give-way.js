// give way：古い木の橋に、まめが重い荷車を押し出す。真ん中で橋がたわみ、ひびが入って重みで崩れ落ちる（例文 The old bridge gave way under the weight.）
import { seg, lerp, easeInOut, easeOut, easeIn, hump, wobble, clamp } from '../ease.js';

export const meta = { duration: 4.2, beats: [[0, '古い橋'], [2.0, '重みでたわむ'], [3.2, '崩れ落ちた']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236 });
  const L = 130, R = 270, M = 200;
  // 谷と川
  el('rect', { x: L, y: FY, width: R - L, height: 64, fill: '#CFE6F2' });
  el('rect', { x: L, y: 266, width: R - L, height: 34, fill: pal.water });
  el('path', { d: `M ${L} ${FY} L ${L + 8} 300 L ${L} 300 Z`, fill: '#C9B79C' });
  el('path', { d: `M ${R} ${FY} L ${R - 8} 300 L ${R} 300 Z`, fill: '#C9B79C' });
  el('rect', { x: 0, y: FY, width: L, height: 64, fill: '#E2D6C2' }); el('rect', { x: R, y: FY, width: 130, height: 64, fill: '#E2D6C2' });
  el('rect', { x: 0, y: FY, width: L, height: 3, fill: pal.floorEdge }); el('rect', { x: R, y: FY, width: 130, height: 3, fill: pal.floorEdge });
  const ripple = el('ellipse', { cx: M, cy: 270, rx: 4, ry: 1.5, fill: 'none', stroke: '#fff', 'stroke-width': 2.5, opacity: 0 });
  // 橋：左右の半分がそれぞれ岸を支点に回る
  const half = (dir) => {
    const h = g({});
    el('rect', { x: dir > 0 ? 0 : -70, y: -2, width: 70, height: 9, fill: '#B89B74' }, h);
    for (let i = 0; i < 5; i++) el('line', { x1: dir * (6 + i * 14), y1: -2, x2: dir * (6 + i * 14), y2: 7, stroke: '#8E7353', 'stroke-width': 1.5 }, h);
    el('rect', { x: dir > 0 ? 0 : -70, y: -26, width: 70, height: 3, fill: '#A58762' }, h);
    for (let i = 0; i < 3; i++) el('rect', { x: dir * (14 + i * 22) - 1.5, y: -26, width: 3, height: 24, fill: '#A58762' }, h);
    return h;
  };
  const hl = half(1), hr = half(-1);
  const crack = el('path', { d: `M ${M} ${FY - 2} l -3 4 l 5 3 l -3 4`, stroke: pal.ink, 'stroke-width': 2, fill: 'none', opacity: 0 });
  // 荷車と重い箱
  const cart = g({}), sh = k.shadow(0, FY, 34, 4);
  el('rect', { x: -32, y: -60, width: 64, height: 48, rx: 4, fill: '#8A97AB' }, cart);
  el('rect', { x: -32, y: -60, width: 64, height: 8, rx: 3, fill: '#6E7B90' }, cart);
  k.text(0, -33, '10t', { 'font-size': 16, fill: '#fff' }, cart);
  el('rect', { x: -36, y: -14, width: 72, height: 6, rx: 2, fill: pal.ink }, cart);
  const wheels = [-22, 22].map((x) => { const w = g({}, cart); el('circle', { r: 8, fill: pal.ink }, w); el('line', { x1: -6, y1: 0, x2: 6, y2: 0, stroke: '#fff', 'stroke-width': 2 }, w); return [w, x]; });
  const b = k.buddy({ x: 20, y: FY, scale: 0.85 });
  const drops = Array.from({ length: 6 }, () => el('circle', { r: 3, fill: pal.water }));
  return {
    update(t) {
      // 押す（重い）→手を離して転がる→真ん中で止まる
      const push = easeInOut(seg(t, 0.2, 1.3)), roll = easeOut(seg(t, 1.3, 2.0));
      let cx = lerp(70, 110, push) + roll * (M - 110);
      const sag = easeInOut(seg(t, 2.0, 2.6)) * 6 + wobble(seg(t, 2.0, 2.6), 4, 1) * 1.5;
      const brk = easeIn(seg(t, 2.7, 3.1));
      const ang = sag * 0.12 + brk * 72;
      tf(hl, L, FY, ang); tf(hr, R, FY, -ang);
      crack.setAttribute('opacity', seg(t, 2.3, 2.4) * (1 - brk));
      const fall = easeIn(seg(t, 2.75, 3.2));
      const cy = FY + sag * 0.9 + fall * 90;
      tf(cart, cx, cy, fall * 14);
      wheels.forEach(([w, x]) => tf(w, x, -8, ((cx - 70) / 8) * 57));
      k.set(sh, { cx, opacity: fall > 0 ? 0 : 1 });
      // まめ：ためて押す→手を離して見守る→驚く
      const bx = cx - 62;
      const strain = hump(seg(t, 0.1, 0.4));
      b.pose({ x: Math.min(bx, 48 + push * 6), walk: push > 0 && push < 1 ? (t - 0.2) * 8 : 0, armR: t < 1.4 ? 88 : lerp(88, 10, seg(t, 1.4, 1.7)), armL: t < 1.4 ? 80 : 10,
        lean: t < 1.4 ? 16 + 4 * strain : lerp(16, -10, seg(t, 2.6, 3.0)), squash: 1 - 0.06 * strain, look: 0.8, mood: t > 2.7 ? 'open' : t < 1.4 ? 'flat' : 'smile', lift: hump(seg(t, 2.8, 3.1)) * 8 });
      // しぶき
      const sp = seg(t, 3.1, 3.9);
      drops.forEach((d, i) => { const a = -Math.PI * (0.15 + 0.7 * (i / 5)); k.set(d, { cx: M + Math.cos(a) * 60 * sp, cy: 270 + Math.sin(a) * 50 * sp + 70 * sp * sp, opacity: sp > 0 && sp < 1 ? 1 : 0 }); });
      k.set(ripple, { rx: 4 + 50 * easeOut(seg(t, 3.2, 4.2)), ry: 1.5 + 5 * seg(t, 3.2, 4.2), opacity: t > 3.2 ? 1 - seg(t, 3.6, 4.2) * 0.6 : 0 });
    }
  };
}
