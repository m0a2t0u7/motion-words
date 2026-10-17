// pass on：お礼のメッセージ（ハート）を、まめから次の人、そのまた次の人へ伝えていく（例文 Please pass on my thanks to your mother.）
import { seg, lerp, easeInOut, easeOut, backOut, wobble, hump } from '../ease.js';

export const meta = { duration: 4.0, beats: [[0, '最初の人'], [1.3, '次の人へ渡す'], [2.6, 'その先へ伝わる']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 240, mood: 'indoor' });
  const S = 0.85;
  const xs = [70, 200, 330];
  const A = k.buddy({ x: xs[0], y: FY, scale: S, facing: 1 });
  const B = k.buddy({ x: xs[1], y: FY, scale: S, color: pal.blue, dark: pal.blueDark, facing: 1 });
  const C = k.buddy({ x: xs[2], y: FY, scale: S, color: pal.coral, dark: pal.coralDark, facing: -1 });
  const heart = g({});
  el('path', { d: 'M 0 8 C -16 -4 -12 -16 -4 -14 C -1 -13 0 -10 0 -8 C 0 -10 1 -13 4 -14 C 12 -16 16 -4 0 8 Z', fill: pal.red }, heart);
  const lab = k.text(0, 0, '', {});
  const trail = [0, 1, 2].map((i) => el('path', { d: 'M 0 4 C -8 -2 -6 -8 -2 -7 C 0 -6 0 -5 0 -4 C 0 -5 1 -6 2 -7 C 6 -8 8 -2 0 4 Z', fill: pal.red, opacity: 0 }));
  const sp = [0, 1, 2].map(() => el('path', { d: 'M 0 -8 L 2 -2 L 8 0 L 2 2 L 0 8 L -2 2 L -8 0 L -2 -2 Z', fill: pal.yellow }));
  return {
    update(t) {
      const p1 = easeInOut(seg(t, 1.2, 2.0)), p2 = easeInOut(seg(t, 2.4, 3.2));
      const gy = FY - 56 * S - 6;
      const handA = lerp(8, 90, easeOut(seg(t, 0.9, 1.4))) * (1 - seg(t, 2.0, 2.3)) + 8 * seg(t, 2.0, 2.3);
      A.pose({ armR: handA, armL: 8, look: 0.8, mood: 'smile' });
      B.pose({ armR: lerp(8, 90, seg(t, 1.6, 2.0)) * (1 - seg(t, 2.8, 3.1)) + 8, armL: lerp(8, 80, seg(t, 2.1, 2.5)) * (1 - seg(t, 2.8, 3.1)) + 8 * seg(t, 2.8, 3.1), look: 0.7, mood: 'smile', lean: 2 * Math.sin(t * 4) * hump(seg(t, 1.2, 3.0)) });
      C.pose({ armL: lerp(8, 90, seg(t, 2.6, 3.0)), armR: 8, look: 0.9, mood: t > 3.1 ? 'grin' : 'smile' });
      // ハートの位置：A の手 → B の手 → C の手
      const hA = A.handPos('R'), hB = B.handPos('R'), hC = C.handPos('L');
      let x, y;
      if (t < 1.2) { x = hA.x + 14; y = hA.y - 4; }
      else if (t < 2.4) { x = lerp(hA.x + 14, hB.x + 14, p1); y = lerp(hA.y - 4, hB.y - 4, p1) - 22 * hump(p1); }
      else { x = lerp(hB.x + 14, hC.x - 14, p2); y = lerp(hB.y - 4, hC.y - 4, p2) - 22 * hump(p2); }
      const pop = backOut(seg(t, 0.5, 1.0), 2);
      tf(heart, x, y, 6 * Math.sin(t * 5), pop * (1 + 0.1 * Math.sin(t * 8)), pop * (1 + 0.1 * Math.sin(t * 8)));
      // 軌跡
      trail.forEach((tr, i) => {
        const q = (i + 1) * 0.07;
        let u = p1 > 0 && p1 < 1 ? p1 - q : p2 > 0 && p2 < 1 ? p2 - q : -1;
        if (u <= 0) { tr.setAttribute('opacity', 0); return; }
        const [fx, fy, tx, ty] = p1 > 0 && p1 < 1 ? [hA.x + 14, hA.y - 4, hB.x + 14, hB.y - 4] : [hB.x + 14, hB.y - 4, hC.x - 14, hC.y - 4];
        tf(tr, lerp(fx, tx, u), lerp(fy, ty, u) - 22 * hump(u));
        tr.setAttribute('opacity', 0.55 - i * 0.15);
      });
      sp.forEach((s, i) => { const p = seg(t, 3.2 + i * 0.1, 3.8 + i * 0.1); tf(s, hC.x - 30 + i * 22, hC.y - 42 - 8 * p, 0, hump(p), hump(p)); });
    }
  };
}
