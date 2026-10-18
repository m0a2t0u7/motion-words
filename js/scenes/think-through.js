// think through：まめが考え雲の中で、手順1→2→3を順にたどり、最後の結果（旗）まで考え抜く（例文 You should think through the plan carefully.）
import { seg, lerp, easeInOut, easeOut, hump, backOut } from '../ease.js';
import { roomBg, cloud, faceAt } from './look-over.js';

export const meta = { duration: 4.6, beats: [[0, '計画を考える'], [1.6, '順にたどる'], [3.8, '最後まで見通す']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = roomBg(k, 'home', 240);
  const b = k.buddy({ x: 90, y: FY, scale: 0.95 });
  const cl = cloud(k, 230, 120, -1);
  const P = [[-78, 10], [-30, -14], [18, 12], [70, -12]];
  el('path', { d: `M ${P[0][0]} ${P[0][1]} Q -54 -14 ${P[1][0]} ${P[1][1]} Q -6 22 ${P[2][0]} ${P[2][1]} Q 44 18 ${P[3][0]} ${P[3][1]}`, fill: 'none', stroke: pal.line, 'stroke-width': 4, 'stroke-dasharray': '6 6' }, cl.g);
  const dots = P.slice(0, 3).map(([x, y], i) => { const c = el('circle', { cx: x, cy: y, r: 13, fill: '#F2F5F9', stroke: pal.line, 'stroke-width': 2 }, cl.g); k.text(x, y + 1, String(i + 1), { 'font-size': 14, fill: pal.blueDark }, cl.g); return c; });
  const fl = g({}, cl.g); tf(fl, P[3][0], P[3][1] + 12);
  el('line', { x1: 0, y1: 0, x2: 0, y2: -30, stroke: pal.ink, 'stroke-width': 2.5 }, fl);
  const flag = el('path', { d: 'M 0 -30 L 18 -25 L 0 -19 Z', fill: pal.line }, fl);
  const dot = el('circle', { r: 6, fill: pal.mintDark }, cl.g);
  const pt = (u) => {
    const s = Math.min(2, Math.floor(u * 3)), f = u * 3 - s, A = P[s], B = P[s + 1];
    const C = [[-54, -14], [-6, 22], [44, 18]][s];
    const q = (a, c, b2) => (1 - f) * (1 - f) * a + 2 * (1 - f) * f * c + f * f * b2;
    return [q(A[0], C[0], B[0]), q(A[1], C[1], B[1])];
  };
  return {
    update(t) {
      cl.show(easeOut(seg(t, 0.2, 0.7)), 250, 96);
      const u = seg(t, 0.9, 3.7);
      // 区間ごとに一度止まってからまた進む
      const st = Math.min(2.999, u * 3), sI = Math.floor(st), fr = st - sI, uu = (sI + easeInOut(Math.min(1, fr * 1.4))) / 3;
      const [x, y] = pt(Math.min(0.9999, uu));
      k.set(dot, { cx: x, cy: y, opacity: t > 0.9 ? 1 : 0 });
      dots.forEach((d, i) => k.set(d, { fill: uu * 3 >= i - 0.01 && t > 0.9 ? pal.yellow : '#F2F5F9' }));
      k.set(flag, { fill: u >= 1 ? pal.red : pal.line });
      tf(fl, P[3][0], P[3][1] + 12, 0, 1 + 0.15 * hump(seg(t, 3.7, 4.1)));
      const tap = Math.max(0, Math.sin(st * Math.PI * 2 - 1)) * (u > 0 && u < 1);
      b.pose({ armR: 8 + 120 * seg(t, 0.6, 0.9) - 20 * tap, armL: 12, lean: 3 * tap, mood: t > 3.8 ? 'grin' : 'flat', look: 0.8, lift: 3 * hump(seg(t, 3.8, 4.1)) });
      faceAt(b, 5, -6 + 2 * tap);
    }
  };
}
