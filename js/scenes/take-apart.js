// take apart：まめがドライバーで古いラジオのねじを外し、裏ぶた・つまみ・スピーカーと部品ごとに分けて並べる（例文 He took apart the old radio.）
import { seg, lerp, easeInOut, easeOut, wobble, clamp } from '../ease.js';
import { reach, held, table } from './dig.js';

export const meta = { duration: 4.4, beats: [[0, '古いラジオ'], [1.4, 'ねじを外す'], [3.6, '部品に分かれた']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const TY = table(k, 150, 'indoor');
  const FY = 236;
  const RX = 270, RY = 170;
  // ラジオの中身（基板）：ふたが外れると見える
  el('rect', { x: RX - 44, y: RY - 30, width: 88, height: 52, rx: 6, fill: '#5B9A6E' });
  el('path', { d: `M ${RX - 36} ${RY - 10} h 20 v 14 h 30`, stroke: '#E8D27A', 'stroke-width': 2, fill: 'none' });
  // 部品（前面の各パーツ）
  const P = [
    { n: g({}), to: [200, 192, 0] },   // 前ぶた
    { n: g({}), to: [330, 190, 0] },   // スピーカー
    { n: g({}), to: [366, 192, 0] },   // つまみ
    { n: g({}), to: [382, 192, 0] }    // つまみ
  ];
  el('rect', { x: -46, y: -32, width: 92, height: 56, rx: 7, fill: pal.coffee }, P[0].n);
  el('rect', { x: -40, y: -26, width: 34, height: 44, rx: 4, fill: '#C9A577' }, P[0].n);
  for (let i = 0; i < 4; i++) el('line', { x1: -36, x2: -10, y1: -18 + i * 10, y2: -18 + i * 10, stroke: pal.coffee, 'stroke-width': 2 }, P[0].n);
  el('rect', { x: 4, y: -24, width: 36, height: 12, rx: 2, fill: '#FFF3C4' }, P[0].n);
  el('circle', { r: 11, fill: '#3A4152' }, P[1].n); el('circle', { r: 4, fill: '#8C96A8' }, P[1].n);
  el('circle', { r: 6, fill: '#E9E2D6', stroke: '#9A8A70', 'stroke-width': 1.5 }, P[2].n);
  el('circle', { r: 6, fill: '#E9E2D6', stroke: '#9A8A70', 'stroke-width': 1.5 }, P[3].n);
  const from = [[RX, RY, 0], [RX - 10, RY + 8, 0], [RX + 14, RY + 6, 0], [RX + 32, RY + 6, 0]];
  const screws = [[-40, -28], [40, -28], [-40, 20], [40, 20]].map(([dx, dy]) => el('circle', { cx: RX + dx, cy: RY + dy, r: 2.5, fill: '#C9CED8', stroke: '#6C7488', 'stroke-width': 1 }));
  const B = k.buddy({ x: 140, y: FY, scale: 0.85 });
  const drv = g({});
  el('rect', { x: -4, y: -4, width: 8, height: 18, rx: 3, fill: pal.red }, drv);
  el('rect', { x: -1.2, y: 14, width: 2.4, height: 16, fill: '#AEB6C4' }, drv);
  const front = g({}); el('rect', { x: 150, y: 206, width: 250, height: 14, fill: pal.wood }, front);
  return {
    update(t) {
      // 0.4〜1.8：4本のねじを順に回して外す
      let target = { x: RX - 40, y: RY - 28 };
      screws.forEach((s, i) => {
        const a = 0.4 + i * 0.35, u = seg(t, a, a + 0.3);
        const sx = RX + [-40, 40, -40, 40][i], sy = RY + [-28, -28, 20, 20][i];
        if (t > a - 0.1 && t < a + 0.35) target = { x: sx, y: sy };
        k.set(s, { cx: sx + u * 8, cy: sy - u * 14 + easeOut(seg(t, a + 0.3, a + 0.7)) * (192 - sy + 14), opacity: 1 });
      });
      const twist = t > 0.4 && t < 1.85 ? Math.sin(t * 30) * 20 : 0;
      // 1.9〜3.4：部品を一つずつ外して並べる
      P.forEach((p, i) => {
        const a = 1.9 + i * 0.4, u = easeInOut(seg(t, a, a + 0.4));
        const x = lerp(from[i][0], p.to[0], u), y = lerp(from[i][1], p.to[1] - (i ? 0 : 8), u) - 22 * Math.sin(u * Math.PI);
        tf(p.n, x, y, 0, 1, i === 0 ? lerp(1, 0.18, u) : 1);
        if (t > a - 0.05 && t < a + 0.4) target = { x, y };
      });
      if (t > 3.5) target = { x: 220, y: 150 };
      const aR = reach(B, 0.85, 'R', target.x, target.y);
      B.pose({ armR: aR, armL: 12, lean: 6, look: 0.8, mood: t > 3.6 ? 'grin' : 'flat' });
      held(k, B, 0.85, drv, 'R', 180 + twist);
      drv.setAttribute('opacity', t < 1.9 ? 1 : 0);
    }
  };
}
