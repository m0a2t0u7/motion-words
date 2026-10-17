// adjacent：上から見た地図で、まめが駐車場を押して、ビルのすぐ隣にぴったりくっつける（例文 The parking lot is adjacent to the building.）
import { seg, lerp, easeInOut, easeOut, backOut, wobble, hump } from '../ease.js';

export const meta = { duration: 4.2, beats: [[0, 'ビル'], [1.0, '隣に来る'], [2.9, '隣接している']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  // 地図の下地
  el('rect', { x: 0, y: 0, width: 400, height: 300, fill: '#E6F3EA' });
  el('rect', { x: 0, y: 238, width: 400, height: 62, fill: '#D5DCE5' });
  for (let i = 0; i < 8; i++) el('rect', { x: 8 + i * 52, y: 266, width: 30, height: 5, rx: 2.5, fill: '#FFFFFF', opacity: 0.85 });
  [[26, 40], [64, 22], [350, 36], [380, 74], [20, 224]].forEach(([x, y]) => { el('circle', { cx: x, cy: y, r: 14, fill: '#BFE5CF' }); el('circle', { cx: x - 3, cy: y - 3, r: 7, fill: '#CFEDDB' }); });
  [0, 1, 2].forEach((i) => el('line', { x1: 0, y1: 20 + i * 0, x2: 0, y2: 20, stroke: 'none' }));

  // ビル（屋上）
  const BX0 = 30, BX1 = 170, BY0 = 70, BY1 = 224;
  el('rect', { x: BX0 + 4, y: BY0 + 6, width: BX1 - BX0, height: BY1 - BY0, rx: 8, fill: pal.shadow });
  el('rect', { x: BX0, y: BY0, width: BX1 - BX0, height: BY1 - BY0, rx: 8, fill: '#F4F6FA', stroke: '#C9D1DD', 'stroke-width': 3 });
  el('rect', { x: BX0 + 12, y: BY0 + 12, width: BX1 - BX0 - 24, height: BY1 - BY0 - 24, rx: 5, fill: '#E4E9F1' });
  [[46, 86, 34, 26], [92, 86, 26, 26], [46, 130, 26, 26]].forEach(([x, y, w, h]) => { el('rect', { x, y, width: w, height: h, rx: 4, fill: '#CBD3DE' }); el('circle', { cx: x + w / 2, cy: y + h / 2, r: Math.min(w, h) / 2 - 5, fill: 'none', stroke: '#AEB9C8', 'stroke-width': 2.5 }); });
  el('rect', { x: 52, y: 180, width: 76, height: 22, rx: 6, fill: pal.blue });
  k.text(90, 191.5, 'BUILDING', { 'font-size': 11, fill: '#FFFFFF' });

  // ギャップの表示（離れているあいだだけ）
  const gap = g({});
  const gapLine = el('line', { x1: 170, y1: 148, x2: 230, y2: 148, stroke: pal.coralDark, 'stroke-width': 3, 'stroke-dasharray': '5 5', 'stroke-linecap': 'round' }, gap);
  el('path', { d: 'M 176 141 L 168 148 L 176 155', fill: 'none', stroke: pal.coralDark, 'stroke-width': 3, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, gap);
  const gapR = el('path', { d: '', fill: 'none', stroke: pal.coralDark, 'stroke-width': 3, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, gap);

  // 駐車場（原点＝左上）
  const LW = 112, LH = 154;
  const lot = g({});
  const lsh = el('rect', { x: 4, y: 6, width: LW, height: LH, rx: 8, fill: pal.shadow }, lot);
  el('rect', { width: LW, height: LH, rx: 8, fill: '#69758A' }, lot);
  el('rect', { x: 3, y: 3, width: LW - 6, height: LH - 6, rx: 6, fill: 'none', stroke: '#FFFFFF', 'stroke-width': 2, opacity: 0.35 }, lot);
  // 白線の駐車枠（上下2列）
  [0, 1].forEach((row) => {
    const y0 = row ? 92 : 14;
    for (let i = 0; i <= 3; i++) el('line', { x1: 10 + i * 31, y1: y0, x2: 10 + i * 31, y2: y0 + 48, stroke: '#FFFFFF', 'stroke-width': 3, 'stroke-linecap': 'round' }, lot);
  });
  const carD = (x, y, c) => { const cg = g({ transform: `translate(${x} ${y})` }, lot); el('rect', { x: -10, y: -19, width: 20, height: 38, rx: 7, fill: c }, cg); el('rect', { x: -7, y: -9, width: 14, height: 11, rx: 3, fill: '#EAF4FB' }, cg); el('rect', { x: -7, y: 6, width: 14, height: 5, rx: 2, fill: 'rgba(40,52,70,0.25)' }, cg); };
  carD(25, 38, pal.coral); carD(87, 38, pal.yellow); carD(56, 116, pal.mint);
  // Pマーク
  el('circle', { cx: 86, cy: 116, r: 13, fill: pal.blue, stroke: '#FFFFFF', 'stroke-width': 2.5 }, lot);
  k.text(86, 117, 'P', { 'font-size': 17, fill: '#FFFFFF' }, lot);

  // 境目の光
  const glow = el('rect', { x: 164, y: 72, width: 12, height: LH, rx: 6, fill: pal.yellow, opacity: 0 });
  const seam = el('line', { x1: 170, y1: 78, x2: 170, y2: 78 + LH - 8, stroke: '#FFFFFF', 'stroke-width': 3, 'stroke-linecap': 'round', opacity: 0 });

  // まめ（地図の上に立って、駐車場を左へ押す）
  const MS = 0.6, MY = 214;
  const b = k.buddy({ x: 372, y: MY, scale: MS, facing: -1 });
  const sparks = [[170, 90], [170, 150], [170, 214], [200, 60]].map(([x, y], i) => {
    const s = g({});
    el('path', { d: 'M 0 -8 Q 1.5 -1.5 8 0 Q 1.5 1.5 0 8 Q -1.5 1.5 -8 0 Q -1.5 -1.5 0 -8 Z', fill: i % 2 ? '#FFFFFF' : pal.yellow }, s);
    return { s, x, y };
  });

  const X0 = 232, X1 = 170, PY = 70;
  return {
    update(t) {
      const mv = easeInOut(seg(t, 1.1, 2.8));
      const lx = lerp(X0, X1, mv);
      const bump = t >= 2.8 ? wobble(seg(t, 2.8, 3.4), 3, 5) : 0;
      tf(lot, lx + 1.8 * bump, PY, 0, 1, 1);
      // まめの足取り
      const pushing = t > 1.1 && t < 2.8;
      const w = pushing ? (t - 1.1) * 7 : 0;
      const arm = t < 0.7 ? 8 : lerp(8, 86, easeInOut(seg(t, 0.7, 1.1))) * (t < 3.0 ? 1 : 1 - easeInOut(seg(t, 3.0, 3.4))) + 8 * (t < 3.0 ? 0 : easeInOut(seg(t, 3.0, 3.4)));
      const happy = t >= 3.3;
      b.pose({
        x: lx + LW + 32, walk: w, armR: arm, armL: happy ? 125 + 10 * Math.sin((t - 3.3) * 11) : 8,
        look: -0.8, lean: pushing ? 8 : 0, mood: happy ? 'grin' : pushing ? 'flat' : 'smile',
        lift: happy ? 5 * Math.abs(Math.sin((t - 3.3) * 7)) * (1 - seg(t, 3.3, 4.2)) : 0
      });
      // 離れているときだけ、すき間の矢印
      const gp = (1 - seg(t, 2.4, 2.85)) * seg(t, 0.2, 0.5);
      gap.setAttribute('opacity', gp);
      const gx = lx;
      k.set(gapLine, { x1: 176, x2: gx - 6 });
      k.set(gapR, { d: `M ${gx - 12} 141 L ${gx - 4} 148 L ${gx - 12} 155` });
      // 境目の光
      const gl = seg(t, 2.85, 3.3);
      k.set(glow, { opacity: 0.55 * gl * (0.75 + 0.25 * Math.sin(t * 7)) });
      k.set(seam, { opacity: gl });
      sparks.forEach((q, i) => {
        const u = seg(t, 2.95 + i * 0.1, 3.4 + i * 0.1);
        const sc = u <= 0 ? 0 : u >= 1 ? 0.9 + 0.15 * Math.sin(t * 8 + i) : easeOut(u);
        tf(q.s, q.x, q.y, t * 40, sc, sc);
      });
    }
  };
}
