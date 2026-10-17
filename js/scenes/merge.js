// merge：青い会社と coral の会社のビルをまめ2人が左右から押して合わせ、1つの大きなビルになる（例文 The two companies merged last year.）
import { seg, lerp, easeInOut, easeOut, backOut, wobble, hump } from '../ease.js';

export const meta = { duration: 4.3, beats: [[0, '2つの会社'], [1.2, '近づく'], [3.0, '1つになった']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 246, mood: 'outdoor' });
  el('rect', { x: 0, y: FY, width: 400, height: 54, fill: '#E7ECF2' });
  [[30, 70], [372, 90]].forEach(([x, y]) => { el('circle', { cx: x, cy: y, r: 22, fill: '#E3F2E8' }); el('circle', { cx: x, cy: y + 20, r: 3, fill: 'none' }); });

  const half = (col, dark, wall, dir) => {
    const root = g({});
    const gb = g({}, root);
    el('rect', { x: -50, y: -130, width: 100, height: 130, fill: wall }, gb);
    el('rect', { x: -54, y: -142, width: 108, height: 16, rx: 4, fill: col }, gb);
    [-28, 6].forEach((x) => [-108, -76, -44].forEach((y) => {
      el('rect', { x, y, width: 24, height: 22, rx: 3, fill: '#FFF8E0' }, gb);
      el('rect', { x, y, width: 24, height: 22, rx: 3, fill: 'none', stroke: col, 'stroke-width': 2.5, opacity: 0.55 }, gb);
    }));
    el('rect', { x: -14, y: -34, width: 28, height: 34, rx: 4, fill: dark }, gb);
    el('rect', { x: -50, y: -6, width: 100, height: 6, fill: dark, opacity: 0.25 }, gb);
    return { root, gb };
  };
  const A = half(pal.blue, pal.blueDark, '#D9E8FB');
  const B = half(pal.coral, pal.coralDark, '#FFE4DC');
  // 境目の線（くっつくと消える）
  const seam = el('line', { x1: 200, y1: FY - 130, x2: 200, y2: FY, stroke: '#8795AB', 'stroke-width': 2, opacity: 0.6 });

  // 看板
  const mkSign = (c) => { const s = g({}); el('rect', { x: -22, y: -22, width: 44, height: 44, rx: 10, fill: '#FFFFFF', stroke: '#E1E6EE', 'stroke-width': 2 }, s); el('circle', { r: 12, fill: c }, s); return s; };
  const sA = mkSign(pal.blue), sB = mkSign(pal.coral);
  const big = g({});
  el('rect', { x: -52, y: -24, width: 104, height: 48, rx: 12, fill: '#FFFFFF', stroke: '#E1E6EE', 'stroke-width': 2 }, big);
  el('circle', { cx: -9, cy: 0, r: 17, fill: pal.blue, opacity: 0.85 }, big);
  el('circle', { cx: 9, cy: 0, r: 17, fill: pal.coral, opacity: 0.85 }, big);
  const lensId = k.clip((cp) => el('circle', { cx: -9, cy: 0, r: 17 }, cp));
  el('circle', { cx: 9, cy: 0, r: 17, fill: pal.violet, 'clip-path': lensId }, big);
  // 2色の屋根のつなぎ
  const roofBand = el('rect', { x: 194, y: 0, width: 12, height: 16, rx: 3, fill: pal.violet, opacity: 0 });

  // まめ2人
  const MS = 0.8, MY = 256;
  const bL = k.buddy({ x: 20, y: MY, scale: MS, color: pal.blue, dark: pal.blueDark });
  const bR = k.buddy({ x: 380, y: MY, scale: MS, facing: -1, color: pal.coral, dark: pal.coralDark });
  const burst = el('circle', { cx: 200, cy: 150, r: 1, fill: 'none', stroke: '#FFFFFF', 'stroke-width': 8, opacity: 0 });
  const sparks = [[110, 80], [290, 80], [200, 60], [70, 150], [330, 150]].map(([x, y], i) => {
    const s = g({});
    el('path', { d: 'M 0 -9 Q 1.5 -1.5 9 0 Q 1.5 1.5 0 9 Q -1.5 1.5 -9 0 Q -1.5 -1.5 0 -9 Z', fill: i % 2 ? pal.yellow : pal.mint }, s);
    return { s, x, y };
  });

  const T0 = 0.8, T1 = 2.4;
  return {
    update(t) {
      const mv = easeInOut(seg(t, T0, T1));
      const cA = lerp(114, 150, mv), cB = lerp(286, 250, mv);
      const pushing = t > T0 && t < T1;
      const hit = t >= T1 ? wobble(seg(t, T1, T1 + 0.5), 3, 5) : 0;
      const grow = t < 2.55 ? 0 : backOut(seg(t, 2.55, 3.05), 1.6);
      const sy = 1 + 0.32 * grow;
      tf(A.root, cA, FY, 0, 1, sy);
      tf(B.root, cB, FY, 0, 1, sy);
      seam.setAttribute('opacity', 0.6 * (1 - seg(t, T1 + 0.05, T1 + 0.3)));
      k.set(seam, { x1: (cA + cB) / 2, x2: (cA + cB) / 2, y1: FY - 130 * sy, y2: FY });
      // 単独の看板 → ひとつの看板
      const so = 1 - seg(t, 2.35, 2.6);
      sA.setAttribute('opacity', so); sB.setAttribute('opacity', so);
      tf(sA, cA, FY - 142 - 22, 0, 1, 1);
      tf(sB, cB, FY - 142 - 22, 0, 1, 1);
      const bp = t < 2.7 ? 0 : backOut(seg(t, 2.7, 3.1), 2);
      tf(big, 200, FY - 142 * 1.32 - 30, 0, bp, bp);
      // 屋根のつなぎ目と光
      k.set(roofBand, { y: FY - 142 * sy, height: 16 * sy, opacity: seg(t, 2.8, 3.1) });
      const bu = seg(t, T1, T1 + 0.5);
      k.set(burst, { r: 10 + 90 * easeOut(bu), opacity: bu > 0 && bu < 1 ? 0.9 * (1 - bu) : 0, cy: FY - 70 });

      // まめ：押す → 合わさったら跳ねる
      const happy = t >= 3.0;
      const w = pushing ? (t - T0) * 8 : 0;
      const hop = happy ? 8 * Math.abs(Math.sin((t - 3.0) * 7)) * (1 - seg(t, 3.0, 4.3) * 0.5) : 0;
      const aR = t < 0.5 ? 8 : lerp(8, 88, easeInOut(seg(t, 0.5, T0))) * (t < 3.0 ? 1 : 1 - easeInOut(seg(t, 3.0, 3.3))) + (t < 3.0 ? 0 : 8 * easeInOut(seg(t, 3.0, 3.3)));
      bL.pose({ x: cA - 50 - 42, walk: w, armR: aR, armL: happy ? 125 + 10 * Math.sin((t - 3.0) * 11) : 8, look: 0.9, lean: pushing ? 8 : 0, mood: happy ? 'grin' : pushing ? 'flat' : 'smile', lift: hop });
      bR.pose({ x: cB + 50 + 42, walk: w, armR: aR, armL: happy ? 125 - 10 * Math.sin((t - 3.0) * 11) : 8, look: 0.9, lean: pushing ? 8 : 0, mood: happy ? 'grin' : pushing ? 'flat' : 'smile', lift: hop });
      sparks.forEach((q, i) => {
        const u = seg(t, 2.8 + i * 0.1, 3.3 + i * 0.1);
        const sc = u <= 0 ? 0 : u >= 1 ? 0.9 + 0.15 * Math.sin(t * 8 + i) : easeOut(u);
        tf(q.s, q.x, q.y, t * 40, sc, sc);
      });
    }
  };
}
