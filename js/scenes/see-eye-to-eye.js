// see eye to eye：最初はそれぞれ別の形を思い浮かべて目も合わない → 同じ形になり、目を合わせてうなずく（意味：意見が一致する）
import { seg, lerp, easeInOut, easeOut, backOut, wobble, hump } from '../ease.js';

export const meta = { duration: 4.4, beats: [[0, '見方がちがう'], [1.5, '考えが近づく'], [3.0, '目が合い一致']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 244, mood: 'indoor' });
  const A = k.buddy({ x: 118, y: FY, scale: 1.1 });
  const B = k.buddy({ x: 282, y: FY, scale: 1.1, facing: -1, color: pal.coral, dark: pal.coralDark });
  const mkBub = (cx) => {
    const b = g({});
    el('circle', { cx: cx < 200 ? 14 : -14, cy: 54, r: 5, fill: '#fff', stroke: '#CBD3DE', 'stroke-width': 2 }, b);
    el('ellipse', { rx: 40, ry: 30, fill: '#fff', stroke: '#CBD3DE', 'stroke-width': 2.5 }, b);
    const sq = el('rect', { x: -14, y: -14, width: 28, height: 28, rx: 5, fill: pal.blue }, b);
    const st = el('path', { d: 'M 0 -17 L 5 -5 L 18 -5 L 8 4 L 12 17 L 0 9 L -12 17 L -8 4 L -18 -5 L -5 -5 Z', fill: pal.yellow, stroke: pal.yellowDark, 'stroke-width': 2, 'stroke-linejoin': 'round' }, b);
    return { b, sq, st };
  };
  const a = mkBub(118), c = mkBub(282);
  k.set(a.sq, { fill: pal.blue }); k.set(c.sq, { fill: pal.coral });
  const chk = g({});
  el('circle', { r: 17, fill: pal.green }, chk);
  el('path', { d: 'M -8 0 L -2 6 L 9 -6', fill: 'none', stroke: '#fff', 'stroke-width': 4.5, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, chk);
  const line = el('line', { x1: 170, y1: 0, x2: 230, y2: 0, stroke: pal.sub, 'stroke-width': 2.5, 'stroke-dasharray': '3 6', 'stroke-linecap': 'round' });
  return {
    update(t) {
      const m = easeInOut(seg(t, 1.5, 2.6)); // 形が星に近づく
      [a, c].forEach((o) => {
        o.sq.setAttribute('opacity', 1 - m);
        o.st.setAttribute('opacity', m);
      });
      const bp = backOut(seg(t, 0.3, 0.8), 1.8);
      tf(a.b, 118, 88, 0, bp, bp);
      tf(c.b, 282, 88, 0, bp, bp);
      const turn = seg(t, 1.6, 2.8);
      const eyeMeet = t > 2.8;
      A.pose({
        look: eyeMeet ? 1 : lerp(-0.9, 0.2, easeOut(turn)), lean: eyeMeet ? 4 : 0,
        mood: t < 1.5 ? 'flat' : t < 2.8 ? 'smile' : 'grin', armR: 8, armL: 8,
        lift: 0
      });
      B.pose({
        look: eyeMeet ? 1 : lerp(-0.9, 0.2, easeOut(turn)), lean: eyeMeet ? 4 : 0,
        mood: t < 1.5 ? 'flat' : t < 2.8 ? 'smile' : 'grin', armR: 8, armL: 8
      });
      // うなずき
      const nod = t > 3.1 ? Math.max(0, Math.sin((t - 3.1) * 9)) * Math.exp(-(t - 3.1)) : 0;
      A.pose({ squash: 1 - 0.05 * nod }); B.pose({ squash: 1 - 0.05 * nod });
      // 目線のライン
      const lp = easeOut(seg(t, 2.8, 3.2));
      k.set(line, { y1: FY - 54, y2: FY - 54, x1: lerp(200, 160, lp), x2: lerp(200, 240, lp), opacity: t > 2.8 ? 0.8 : 0 });
      const cp = backOut(seg(t, 3.3, 3.8), 2);
      tf(chk, 200, 60, 0, cp, cp);
      chk.setAttribute('opacity', t < 3.3 ? 0 : 1);
    }
  };
}
