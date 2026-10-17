// the tip of the iceberg：水面に出ているのは1つのミスだけ。水の下には、もっと多くのミスが隠れている（This one mistake is only the tip of the iceberg.）
import { seg, lerp, easeInOut, easeOut, backOut, hump } from '../ease.js';

export const meta = { duration: 4.4, beats: [[0, '見えるミスは1つ'], [1.4, '水の下を見る'], [3.0, 'もっと大量にある']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  k.backdrop({ floorY: 300, mood: 'outdoor' });
  el('circle', { cx: 340, cy: 40, r: 18, fill: pal.yellow, opacity: 0.8 });
  // 水と氷山の断面
  el('rect', { x: 100, y: 150, width: 300, height: 150, fill: '#BFE6F7' });
  const sub = el('path', { d: 'M 228 150 L 334 150 Q 392 196 350 252 Q 300 300 236 280 Q 190 250 196 196 Z', fill: '#E8F7FD', stroke: '#9FD3E8', 'stroke-width': 3, 'stroke-linejoin': 'round' });
  el('rect', { x: 100, y: 150, width: 300, height: 150, fill: pal.water, opacity: 0.28 });
  el('path', { d: 'M 238 150 L 258 94 L 280 120 L 302 82 L 324 150 Z', fill: '#fff', stroke: '#C9DDE8', 'stroke-width': 3, 'stroke-linejoin': 'round' });
  el('path', { d: 'M 100 150 Q 130 144 160 150 T 220 150 M 330 150 Q 350 145 370 150 T 400 150', fill: 'none', stroke: '#fff', 'stroke-width': 3, 'stroke-linecap': 'round' });
  // 岸（足場）
  el('rect', { x: 0, y: 150, width: 100, height: 150, fill: '#EEF1F5' });
  el('rect', { x: 0, y: 150, width: 100, height: 3, fill: pal.floorEdge });
  // ミスのしるし
  const xmark = (x, y, s, parent) => { const m = g({}); tf(m, x, y, 0, s); el('path', { d: 'M -6 -6 L 6 6 M 6 -6 L -6 6', stroke: pal.red, 'stroke-width': 3.6, 'stroke-linecap': 'round' }, m); return m; };
  const first = xmark(285, 126, 1.3);
  const pts = [[262, 178], [300, 176], [330, 190], [246, 214], [280, 214], [318, 224], [350, 226], [262, 252], [298, 258], [226, 190], [332, 252], [244, 236]];
  const marks = pts.map(([x, y]) => xmark(x, y, 1));
  const me = k.buddy({ x: 62, y: 150 });
  return {
    update(t) {
      const pt = easeOut(seg(t, 0.3, 0.8)), dn = easeInOut(seg(t, 1.4, 2.0));
      const aUp = Math.atan2(285 - 89, 126 - 94) * 180 / Math.PI;
      const aDn = Math.atan2(270 - 89, 215 - 94) * 180 / Math.PI;
      me.pose({
        armR: lerp(8, aUp, pt) * (1 - dn) + dn * aDn, armL: 8, lean: lerp(0, 4, dn), look: 0.8,
        mood: t < 1.5 ? 'smile' : 'open', squash: 1 + 0.02 * Math.sin(t * 8) * seg(t, 3, 4.4), blink: 0
      });
      const fp = backOut(seg(t, 0.5, 0.9));
      tf(first, 285, 128, 0, 1.3 * fp, 1.3 * fp);
      marks.forEach((m, i) => { const p = backOut(seg(t, 2.0 + i * 0.12, 2.3 + i * 0.12), 2.4); tf(m, pts[i][0], pts[i][1], 0, p, p); });
    }
  };
}
