// split：町の近くで一本の道がY字に分かれる。まめが道を歩いて分かれ道に着き、左右の道を見比べる（例文 The road splits into two near the town.）
import { seg, lerp, easeInOut, easeOut, smooth, clamp } from '../ease.js';
import { gait } from './dig.js';

export const meta = { duration: 4.4, beats: [[0, '一本道'], [1.8, '分かれ道'], [3.4, '二手に分かれる']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  k.backdrop({ floorY: 120, mood: 'outdoor' });
  el('rect', { x: 0, y: 120, width: 400, height: 180, fill: '#CDEBC0' });
  el('path', { d: 'M 0 120 Q 80 96 160 120 Q 250 92 400 120 Z', fill: '#B5DDA6' });
  // 町（分かれ道の向こう側）
  const house = (x, y, c, s = 1) => { const h = g({}); tf(h, x, y, 0, s); k.shadow(0, 0, 20, 3, h); el('rect', { x: -16, y: -22, width: 32, height: 22, rx: 2, fill: '#fff' }, h); el('path', { d: 'M -20 -21 L 0 -38 L 20 -21 Z', fill: c }, h); el('rect', { x: -4, y: -13, width: 8, height: 13, fill: pal.woodDark }, h); el('rect', { x: 7, y: -17, width: 6, height: 6, fill: '#CFE9F7' }, h); };
  house(150, 126, pal.coral, 0.8); house(180, 121, pal.blue, 0.7); house(222, 121, pal.yellow, 0.7); house(252, 126, pal.violet, 0.8);
  // 道（手前の幹線と、左右に分かれる枝）
  const F = [200, 150];
  const road = '#E8DFC9', edge = '#D5CAB0';
  const stem = `M 150 300 L 250 300 L ${F[0] + 20} ${F[1]} L ${F[0] - 20} ${F[1]} Z`;
  const left = `M ${F[0] - 20} ${F[1]} L ${F[0] + 2} ${F[1] - 1} L 118 118 L 74 118 Q 120 134 ${F[0] - 20} ${F[1]} Z`;
  const right = `M ${F[0] + 20} ${F[1]} L ${F[0] - 2} ${F[1] - 1} L 282 118 L 326 118 Q 280 134 ${F[0] + 20} ${F[1]} Z`;
  [[stem, edge, 4], [left, edge, 4], [right, edge, 4]].forEach(([d, c, w]) => el('path', { d, fill: c, stroke: c, 'stroke-width': w, 'stroke-linejoin': 'round' }));
  [stem, left, right].forEach((d) => el('path', { d, fill: road }));
  el('ellipse', { cx: F[0], cy: F[1] + 3, rx: 20, ry: 3, fill: road });
  // 中央線（幹線）
  for (let i = 0; i < 6; i++) { const y0 = 296 - i * 24, y1 = y0 - 12, x = 200; el('line', { x1: x, y1: y0, x2: x, y2: y1, stroke: '#fff', 'stroke-width': 2 + (y0 - 150) / 70, 'stroke-linecap': 'round' }); }
  // 分かれ道の標識
  const sg = g({}); tf(sg, 214, 154);
  el('rect', { x: -1.5, y: -30, width: 3, height: 30, fill: pal.woodDark }, sg);
  el('path', { d: 'M -14 -30 L 6 -30 L 12 -25 L 6 -20 L -14 -20 Z', fill: pal.blue }, sg);
  // 道をたどる線（左→右の順に、枝の道を強調）
  const trL = el('path', { d: `M ${F[0]} ${F[1] - 2} Q 140 132 96 119`, fill: 'none', stroke: pal.mint, 'stroke-width': 4, 'stroke-linecap': 'round', 'stroke-dasharray': '120', 'stroke-dashoffset': 120 });
  const trR = el('path', { d: `M ${F[0]} ${F[1] - 2} Q 260 132 304 119`, fill: 'none', stroke: pal.coral, 'stroke-width': 4, 'stroke-linecap': 'round', 'stroke-dasharray': '120', 'stroke-dashoffset': 120 });
  const wk = g({});
  const b = k.buddy({ parent: wk, x: 0, y: 0 });
  const yf = (t) => lerp(292, 190, easeInOut(seg(t, 0.2, 1.8)));
  return {
    update(t) {
      const y = yf(t), s = lerp(1.0, 0.56, (292 - y) / 102);
      const p = gait((tt) => 300 - yf(tt), t, 300 - 292, 16, 0.107 * 1.0);
      const sc = lerp(1.0, 0.56, clamp((292 - y) / 102));
      const look = t < 1.9 ? 0.2 : t < 2.6 ? -0.9 : t < 3.4 ? 0.9 : 0;
      b.pose({ x: 0, y: 0, walk: p.walk, armL: p.armL, armR: t < 1.9 ? p.armR : lerp(8, 100, smooth(seg(t, 2.8, 3.2))) * 1 + (t < 2.6 ? 0 : 0), lean: p.lean, look, mood: 'smile', squash: 1 });
      tf(wk, 200 + 6 * Math.sin((292 - y) * 0.0), y, 0, sc);
      k.set(trL, { 'stroke-dashoffset': 120 * (1 - easeInOut(seg(t, 2.2, 3.0))), opacity: 1 });
      k.set(trR, { 'stroke-dashoffset': 120 * (1 - easeInOut(seg(t, 3.0, 3.8))), opacity: 1 });
    }
  };
}
