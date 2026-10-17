// hit the nail on the head：釘をトンカチでまっすぐ打ち込み、ぴたっと核心を突く（例文 You hit the nail on the head.）
import { seg, lerp, easeInOut, easeOut, easeIn, backOut, wobble, hump } from '../ease.js';

export const meta = { duration: 4.0, beats: [[0, '釘が出ている'], [1.3, 'トンカチで打つ'], [3.0, 'ぴたり命中']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  const NY = FY - 58;
  // 柱
  k.shadow(250, FY + 4, 46, 5);
  el('rect', { x: 206, y: 96, width: 46, height: 140, rx: 4, fill: pal.wood });
  el('rect', { x: 246, y: 96, width: 6, height: 140, fill: pal.woodDark });
  el('path', { d: 'M 216 120 Q 226 126 220 140 M 232 170 Q 240 176 234 190', fill: 'none', stroke: pal.woodDark, 'stroke-width': 2, opacity: 0.5 });
  // 釘
  const nail = g({}, g({ 'clip-path': k.clip((c) => el('rect', { x: 0, y: 0, width: 206, height: 300 }, c)) }));
  el('rect', { x: 0, y: -2.2, width: 28, height: 4.4, rx: 1.5, fill: '#9AA5B5' }, nail);
  el('rect', { x: -5, y: -7, width: 6, height: 14, rx: 2, fill: '#7C8798' }, nail);
  // トンカチ（原点＝手の位置、柄は+y方向）
  const ham = g({});
  el('rect', { x: -3.5, y: -4, width: 7, height: 46, rx: 3, fill: pal.woodDark }, ham);
  el('rect', { x: -9, y: 38, width: 18, height: 30, rx: 4, fill: '#8A94A6' }, ham);
  el('rect', { x: -9, y: 38, width: 18, height: 6, rx: 3, fill: '#A9B2C1' }, ham);
  const spark = g({});
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    el('line', { x1: Math.cos(a) * 8, y1: Math.sin(a) * 8, x2: Math.cos(a) * 20, y2: Math.sin(a) * 20, stroke: pal.yellowDark, 'stroke-width': 3.5, 'stroke-linecap': 'round' }, spark);
  }
  const chk = g({});
  el('circle', { r: 17, fill: pal.green }, chk);
  el('path', { d: 'M -8 0 L -2 6 L 9 -6', fill: 'none', stroke: '#fff', 'stroke-width': 4.5, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, chk);

  const b = k.buddy({ x: 86, y: FY, scale: 1 });
  const HITS = [1.55, 2.15, 2.75];
  return {
    update(t) {
      // 打つたびに釘が奥へ、まめも少し前へ
      let prog = 0;
      HITS.forEach((h, i) => { prog += easeOut(seg(t, h, h + 0.08)) * (i === 2 ? 0.34 : 0.33); });
      // 振り：ふりかぶる→打つ
      let a = 100, hit = 0;
      if (t < 1.1) a = 100 + 15 * easeInOut(seg(t, 0.5, 1.1));
      else {
        const T = [1.1, ...HITS];
        for (let i = 0; i < 3; i++) {
          const s = T[i], e = HITS[i];
          if (t >= s && t < e + 0.25) {
            const up = easeOut(seg(t, s, s + 0.25 + (i ? 0 : 0.0)));
            const dn = easeIn(seg(t, e - 0.2, e));
            const back = easeOut(seg(t, e, e + 0.25));
            a = t < e ? lerp(100, 165, up) * (1 - dn) + 92 * dn : lerp(92, i < 2 ? 145 : 108, back);
            if (t < s + 0.25 && i > 0) a = lerp(a, a, 1);
            hit = hump(seg(t, e - 0.02, e + 0.2));
          }
        }
        if (t >= HITS[2] + 0.25) a = 108;
      }
      const bx = 86 + prog * 30;
      b.pose({ x: bx, armR: a, armL: 8, lean: (a - 100) * -0.05 + 4, squash: 1 - 0.03 * hit, mood: t > 3.0 ? 'grin' : 'flat', look: 0.8 });
      const hp = b.handPos('R');
      tf(ham, hp.x, hp.y, -a);
      // 釘：頭の位置は 190→206
      const nx = lerp(176, 206, prog);
      tf(nail, nx, NY, 0);
      k.set(nail, { opacity: 1 });
      // きらめき・チェック
      const sp = seg(t, 2.8, 3.2);
      tf(spark, 222, NY - 2, 0, 0.6 + sp * 0.8, 0.6 + sp * 0.8);
      spark.setAttribute('opacity', sp > 0 && sp < 1 ? 1 - sp * 0.7 : 0);
      const cp = backOut(seg(t, 3.0, 3.5), 2);
      tf(chk, 290, 76, 0, cp, cp);
      chk.setAttribute('opacity', t < 3.0 ? 0 : 1);
    }
  };
}
