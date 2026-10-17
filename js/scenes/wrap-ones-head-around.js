// wrap one's head around：ごちゃごちゃの規則表を見て頭をかく→はてなが増えて、結局理解できない（I can't wrap my head around this rule.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';

export const meta = { duration: 4.0, beats: [[0, '規則表を見る'], [1.6, '頭をかく'], [3.0, '分からない']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  el('rect', { x: 0, y: FY - 14, width: 400, height: 14, fill: '#EDE6DB' });
  // 規則表：箱と絡まった矢印
  const bx = 232, by = 40;
  el('rect', { x: bx, y: by, width: 150, height: 150, rx: 8, fill: '#fff', stroke: pal.woodDark, 'stroke-width': 5 });
  const boxes = [[14, 14, pal.yellow], [92, 14, pal.mint], [14, 100, pal.blue], [92, 100, pal.coral], [52, 57, pal.violet]];
  const P = boxes.map(([x, y]) => [bx + x + 22, by + y + 14]);
  el('path', { d: `M ${P[0][0]} ${P[0][1]} C ${P[0][0] + 80} ${P[0][1] + 60} ${P[2][0] + 70} ${P[2][1] - 70} ${P[3][0]} ${P[3][1]} M ${P[1][0]} ${P[1][1]} C ${P[1][0] - 90} ${P[1][1] + 50} ${P[2][0] - 20} ${P[2][1] - 50} ${P[2][0]} ${P[2][1]} M ${P[4][0]} ${P[4][1]} C ${P[4][0] + 60} ${P[4][1] - 70} ${P[1][0] + 30} ${P[1][1] + 90} ${P[3][0]} ${P[3][1]} M ${P[0][0]} ${P[0][1]} C ${P[0][0] - 20} ${P[0][1] + 110} ${P[3][0] + 40} ${P[3][1] + 20} ${P[4][0]} ${P[4][1]}`, fill: 'none', stroke: pal.sub, 'stroke-width': 3, 'stroke-linecap': 'round' });
  boxes.forEach(([x, y, c]) => el('rect', { x: bx + x, y: by + y, width: 44, height: 28, rx: 6, fill: c, stroke: '#fff', 'stroke-width': 2 }));
  el('rect', { x: bx + 60, y: by + 134, width: 30, height: 4, rx: 2, fill: pal.line });
  // 頭の上のはてな
  const qs = [0, 1, 2].map((i) => k.text(0, 0, '?', { 'font-size': 22 + i * 4, fill: pal.violet }));
  const spiral = g({});
  el('path', { d: 'M 0 0 C 6 -6 14 -2 12 6 C 10 14 -4 14 -6 4 C -8 -6 6 -12 16 -6', fill: 'none', stroke: pal.sub, 'stroke-width': 2.4, 'stroke-linecap': 'round' }, spiral);

  const b = k.buddy({ x: 150, y: FY, facing: 1 });
  return {
    update(t) {
      const sc = seg(t, 1.5, 1.8), sh = seg(t, 3.0, 3.5);
      const scratch = Math.sin(t * 16) * 10 * hump(seg(t, 1.6, 3.0));
      const tilt = easeInOut(seg(t, 0.8, 1.5));
      b.pose({
        armR: lerp(8, 150, easeOut(sc)) + scratch - 150 * 0 - (sh > 0 ? 150 - 62 : 0) * easeInOut(sh) * 1,
        armL: lerp(8, 62, easeOut(sh)), lean: lerp(0, -7, tilt) * (1 - sh * 0.5),
        look: 0.7 + 0.2 * Math.sin(t * 2) * (1 - sc), mood: t < 1.0 ? 'flat' : 'sad',
        squash: 1 - 0.03 * Math.sin(t * 3) * sc
      });
      qs.forEach((q, i) => {
        const p = easeOut(seg(t, 1.2 + i * 0.5, 1.7 + i * 0.5));
        tf(q, 120 + i * 30 + 3 * Math.sin(t * 3 + i), 140 - 6 * i - 14 * p + 3 * Math.sin(t * 4 + i), (i - 1) * 14, p * 0.9);
        q.setAttribute('opacity', p);
      });
      tf(spiral, 150, 134 - 4 * Math.sin(t * 3), t * 120, 1.2 * easeOut(seg(t, 0.9, 1.3)));
      spiral.setAttribute('opacity', t < 1.8 ? 1 : 0);
    }
  };
}
