// economic：まめが、経済のグラフが下がっていく掲示板に向き合い、困る（例文 The country faces serious economic problems.）
import { seg, lerp, easeInOut, hump } from '../ease.js';
import { P, blinkAt, walkTo } from './run-after.js';

export const meta = { duration: 4.2, beats: [[0, 'グラフを見る'], [1.4, '下がっていく'], [3.0, '深刻な問題']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 240, mood: 'indoor' });
  const bd = g({});
  el('rect', { x: 190, y: 40, width: 190, height: 150, rx: 8, fill: '#fff', stroke: pal.line, 'stroke-width': 3 }, bd);
  el('path', { d: 'M 210 62 V 168 H 362', fill: 'none', stroke: pal.sub, 'stroke-width': 3, 'stroke-linecap': 'round' }, bd);
  const pts = [[216, 84], [246, 74], [276, 96], [306, 126], [334, 150], [356, 162]];
  const path = el('path', { fill: 'none', stroke: pal.red, 'stroke-width': 5, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, bd);
  const dot = el('circle', { r: 7, fill: pal.red }, bd);
  const warn = g({}); tf(warn, 346, 66);
  el('path', { d: 'M 0 -16 L 16 12 H -16 Z', fill: pal.yellow, stroke: pal.yellowDark, 'stroke-width': 3, 'stroke-linejoin': 'round' }, warn);
  k.text(0, 4, '!', { 'font-size': 16, 'font-weight': 700, fill: pal.ink, 'text-anchor': 'middle', 'dominant-baseline': 'central' }, warn);
  const coins = [0, 1, 2].map((i) => el('circle', { r: 7, fill: pal.yellow, stroke: pal.yellowDark, 'stroke-width': 2 }));
  const b = k.buddy({ x: 30, y: FY, scale: 0.95 });
  const xf = (t) => lerp(30, 130, easeInOut(seg(t, 0.1, 1.2)));
  return {
    update(t) {
      const d = seg(t, 1.0, 3.0), w = walkTo(xf, t, 30), sad = seg(t, 2.2, 2.7);
      P(b, { x: w.x, walk: w.walk, armL: w.armL + 30 * sad, armR: w.armR + 40 * sad, lean: w.lean, facing: 1, look: 0.8, mood: sad > 0 ? 'sad' : 'flat', blink: blinkAt(t) });
      const n = Math.max(2, Math.ceil(d * (pts.length - 1)) + 1);
      const cur = [];
      for (let i = 0; i < pts.length - 1; i++) { const s = clamp01(d * (pts.length - 1) - i); if (s > 0) { if (!cur.length) cur.push(pts[i]); cur.push([lerp(pts[i][0], pts[i + 1][0], s), lerp(pts[i][1], pts[i + 1][1], s)]); } }
      const p = cur.length ? cur : [pts[0], pts[0]];
      path.setAttribute('d', 'M ' + p.map((q) => q.join(' ')).join(' L '));
      const e = p[p.length - 1]; k.set(dot, { cx: e[0], cy: e[1] });
      tf(warn, 346, 66, 0, seg(t, 2.4, 2.9) * (1 + 0.1 * hump(seg(t, 2.4, 3.4))));
      coins.forEach((c, i) => { const u = seg(t, 1.4 + i * 0.4, 2.6 + i * 0.4); k.set(c, { cx: 260 + i * 36, cy: 196 + u * 40, opacity: u > 0 ? 1 - u * u : 0 }); });
    }
  };
}
const clamp01 = (v) => Math.max(0, Math.min(1, v));
