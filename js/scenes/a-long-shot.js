// a long shot：遠くのゴールへ一か八かのシュート。入るか分からない（It's a long shot, but I'll apply.）
import { seg, lerp, easeInOut, easeOut, easeIn, backOut, smooth, wobble, hump, clamp } from '../ease.js';

export const meta = { duration: 4.0, beats: [[0, '遠いゴール'], [1.2, '一か八か'], [3.2, '入るか微妙']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 240 });
  // 距離の点線
  el('line', { x1: 80, y1: FY + 14, x2: 330, y2: FY + 14, stroke: pal.sub, 'stroke-width': 3, 'stroke-dasharray': '2 9', 'stroke-linecap': 'round' });
  // ゴール
  el('rect', { x: 345, y: 120, width: 6, height: 120, fill: '#B8C0CC' });
  el('rect', { x: 346, y: 60, width: 10, height: 66, rx: 3, fill: '#fff', stroke: '#B8C0CC', 'stroke-width': 3 });
  el('rect', { x: 302, y: 124, width: 44, height: 5, rx: 2.5, fill: pal.coralDark });
  [306, 318, 330, 342].forEach((x, i) => el('line', { x1: x, y1: 129, x2: 312 + i * 9, y2: 156, stroke: '#CBD3DE', 'stroke-width': 2 }));
  const b = k.buddy({ x: 70, y: FY, scale: 0.95 });
  const ball = g({});
  el('circle', { r: 9, fill: '#F59E54', stroke: '#C97A33', 'stroke-width': 1.8 }, ball);
  el('path', { d: 'M -9 0 H 9 M 0 -9 V 9', stroke: '#C97A33', 'stroke-width': 1.5 }, ball);
  const sweat = el('path', { d: 'M 0 -7 Q 5 0 0 5 Q -5 0 0 -7 Z', fill: pal.water });
  return {
    update(t) {
      const up = easeOut(seg(t, 0.2, 1.1));
      const rel = seg(t, 1.1, 1.3);
      const throwing = t >= 1.1;
      const armR = t < 1.1 ? lerp(8, 175, up) : lerp(175, 120, easeOut(rel));
      const hold = easeOut(seg(t, 1.3, 2.2));
      b.pose({
        armR, armL: t < 1.1 ? lerp(8, 150, up) : lerp(150, 40, rel) + 0, lean: t < 1.1 ? lerp(0, -8, up) : lerp(-8, 6, easeOut(rel)),
        look: 0.9, squash: 1 - 0.05 * up * (1 - rel), lift: 4 * hump(rel),
        mood: t < 1.1 ? 'flat' : t < 3.0 ? 'open' : 'sad'
      });
      if (!throwing) {
        const h = b.handPos('R');
        tf(ball, h.x + 1, h.y - 10, up * 60);
      } else {
        const p = seg(t, 1.1, 2.6);
        const x0 = 112, y0 = 100, x1 = 333, y1 = 116;
        let x = lerp(x0, x1, p), y = lerp(y0, y1, p) - 130 * 4 * p * (1 - p) * 0.62;
        if (t > 2.6) {
          const q = seg(t, 2.6, 3.6);
          x = lerp(x1, 337, q) + 6 * Math.sin(q * 9) * (1 - q);
          y = y1 - 30 * hump(seg(t, 2.6, 3.0)) * (1 - q) - 0 + 0 - (1 - q) * 0;
          y = y1 - 28 * hump(seg(t, 2.6, 3.1)) * (1 - 0.3 * q);
        }
        tf(ball, x, y, p * 540);
      }
      const sw = seg(t, 2.8, 3.8);
      tf(sweat, 28 + 70 + 0, FY - 108 + 22 * sw);
      sweat.setAttribute('opacity', t > 2.6 && t < 3.9 ? 1 : 0);
    }
  };
}
