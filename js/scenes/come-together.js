// come together：広場に、ばらばらの方向から人が歩いて来て一か所に集まる（例文 People came together in the square.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';
import { person, path, walk } from './queue-up.js';

export const meta = { duration: 4.2, beats: [[0, 'ばらばら'], [1.8, '集まってくる'], [3.6, '集まった']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 200, mood: 'outdoor' });
  [[0, 90], [90, 120], [300, 100], [350, 130]].forEach(([x, h], i) => el('rect', { x, y: FY - h, width: 70, height: h, rx: 3, fill: i % 2 ? '#F3E6DC' : '#E4EEF7' }));
  el('ellipse', { cx: 200, cy: 246, rx: 190, ry: 40, fill: '#E6E2DA' });
  // 噴水（動かない）
  el('ellipse', { cx: 200, cy: 206, rx: 50, ry: 10, fill: '#C9D3E0' });
  el('rect', { x: 194, y: 160, width: 12, height: 46, fill: '#C9D3E0' });
  el('ellipse', { cx: 200, cy: 160, rx: 24, ry: 6, fill: '#C9D3E0' });
  const spray = el('path', { fill: pal.water, opacity: 0.8 });
  const S = 0.75;
  const P = [
    [k.buddy({ x: -40, y: 252, scale: S }), [[0.2, -40], [2.6, 150]], 252],
    [person(k, 'coral', { x: 450, y: 252, scale: S, facing: -1 }), [[0.4, 450], [2.8, 250]], 252],
    [person(k, 'blue', { x: -40, y: 236, scale: S * 0.92 }), [[0.8, -40], [3.2, 190]], 236],
    [person(k, 'yellow', { x: 450, y: 236, scale: S * 0.92, facing: -1 }), [[0.6, 450], [3.0, 222]], 236]
  ];
  // 奥の2人を先に描く
  [P[2][0], P[3][0]].forEach((b) => b.g.parentNode.insertBefore(b.g, P[0][0].g));
  const xfs = P.map((p) => path(p[1]));
  return {
    update(t) {
      const h = 34 + 4 * Math.sin(t * 12);
      spray.setAttribute('d', `M 192 160 Q 200 ${160 - h} 208 160 Z`);
      P.forEach(([b, pts, y], i) => {
        const done = t > pts[1][0];
        const right = pts[0][1] < 0;
        walk(b, xfs[i], t, { y, facing: right ? 1 : -1, look: right ? 0.4 : -0.4, mood: done ? 'grin' : 'smile' });
        if (t > 3.4) b.pose({ armR: 120 + 20 * Math.sin((t - 3.4) * 9 + i), lift: 4 * hump(seg(t, 3.4 + i * 0.05, 3.8 + i * 0.05)) });
      });
      void easeOut; void easeInOut; void lerp; void tf; void g;
    }
  };
}
