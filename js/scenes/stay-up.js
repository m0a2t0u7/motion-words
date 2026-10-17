// stay up：窓の外は暗くなっても、まめは眠気をこらえて宿題を最後まで続ける（例文 I stayed up late to finish my homework.）
import { seg, lerp, easeInOut, easeOut, clamp } from '../ease.js';

export const meta = { duration: 4.2, beats: [[0, '宿題を始める'], [1.6, '眠気をこらえる'], [3.2, '終わるまで起きる']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 252, mood: 'indoor' });
  // 窓（夜空）
  el('rect', { x: 36, y: 34, width: 86, height: 76, rx: 8, fill: '#5E5A8E' });
  el('path', { d: 'M 92 52 a 14 14 0 1 0 8 24 a 11 11 0 1 1 -8 -24 Z', fill: '#FFE9A8' });
  [[52, 56], [70, 90], [104, 94], [58, 76]].forEach(([x, y]) => el('circle', { cx: x, cy: y, r: 2, fill: '#fff' }));
  el('line', { x1: 79, y1: 34, x2: 79, y2: 110, stroke: '#fff', 'stroke-width': 4 });
  el('rect', { x: 36, y: 34, width: 86, height: 76, rx: 8, fill: 'none', stroke: '#fff', 'stroke-width': 4 });
  // 時計
  const clk = g({});
  el('circle', { r: 24, fill: '#fff', stroke: pal.ink, 'stroke-width': 4 }, clk);
  const hh = el('line', { x1: 0, y1: 0, x2: 0, y2: -11, stroke: pal.ink, 'stroke-width': 4, 'stroke-linecap': 'round' }, clk);
  const mm = el('line', { x1: 0, y1: 0, x2: 0, y2: -18, stroke: pal.ink, 'stroke-width': 3, 'stroke-linecap': 'round' }, clk);
  tf(clk, 190, 70);
  // 机・ランプ
  const b = k.buddy({ x: 150, y: FY, scale: 1.1 });
  el('rect', { x: 196, y: 232, width: 10, height: 20, rx: 3, fill: pal.woodDark });
  el('rect', { x: 330, y: 232, width: 10, height: 20, rx: 3, fill: pal.woodDark });
  el('rect', { x: 186, y: 218, width: 170, height: 14, rx: 5, fill: pal.wood });
  el('path', { d: 'M 330 218 L 336 176 L 360 160', fill: 'none', stroke: pal.ink, 'stroke-width': 4, 'stroke-linecap': 'round' });
  el('path', { d: 'M 348 156 L 376 166 L 366 184 Z', fill: pal.yellow });
  const glow = el('ellipse', { cx: 300, cy: 218, rx: 60, ry: 10, fill: '#FFF3C4', opacity: 0.8 });
  // ノート
  el('rect', { x: 214, y: 196, width: 80, height: 22, rx: 3, fill: '#fff', stroke: '#D5DBE5', 'stroke-width': 2 });
  const rows = [0, 1, 2].map((i) => el('line', { x1: 222, y1: 202 + i * 6, x2: 222, y2: 202 + i * 6, stroke: pal.blue, 'stroke-width': 2.6, 'stroke-linecap': 'round' }));
  const pen = g({});
  el('line', { x1: -4, y1: -12, x2: 0, y2: 0, stroke: pal.coralDark, 'stroke-width': 5, 'stroke-linecap': 'round' }, pen);
  const done = el('path', { d: 'M 0 0 l 8 8 l 18 -20', fill: 'none', stroke: pal.green, 'stroke-width': 6, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', pathLength: 1, 'stroke-dasharray': 1 });
  const zz = k.text(0, 0, 'z', { 'font-size': 16, fill: pal.sub });
  return {
    update(t) {
      const p = seg(t, 0.2, 3.4) * 3;
      rows.forEach((r, i) => r.setAttribute('x2', 222 + 64 * clamp(p - i)));
      const li = clamp(Math.floor(p), 0, 2);
      const tx = 222 + 64 * clamp(p - li), ty = 202 + li * 6;
      tf(pen, tx + 2, ty);
      const sx = 150 + 27 * 1.1, sy = FY - 56 * 1.1;
      const a = (Math.atan2(tx + 2 - sx, ty - sy) * 180) / Math.PI;
      // 眠気：まぶたが重くなるが、ぱっと目を覚ます
      const nod = seg(t, 1.4, 2.4) * (1 - seg(t, 3.0, 3.2));
      const droop = nod * (0.5 + 0.4 * Math.sin(t * 6));
      const jolt = seg(t, 2.6, 2.7) * (1 - seg(t, 2.7, 3.0));
      b.pose({ armR: a, armL: 8, lean: 6 + 6 * nod + 4 * Math.sin(t * 6) * nod, blink: droop * (1 - jolt), mood: nod > 0.3 ? 'flat' : 'smile', look: 0.6, squash: 1 });
      // 時計：夜が更けていく
      const ang = lerp(0, 330, easeInOut(seg(t, 0.4, 3.6)));
      tf(mm, 0, 0, ang); tf(hh, 0, 0, ang / 12 + 300);
      glow.setAttribute('opacity', 0.6 + 0.2 * Math.sin(t * 3));
      const dp = seg(t, 3.3, 3.8);
      done.setAttribute('stroke-dashoffset', 1 - dp);
      tf(done, 304, 192, -6);
      tf(zz, 120 + 4 * Math.sin(t * 3), FY - 112, 0, nod, nod);
      zz.setAttribute('opacity', nod * 0.0);
    }
  };
}
