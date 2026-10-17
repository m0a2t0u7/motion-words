// rinse off：泡だらけの手を蛇口の水ですすぎ、泡を洗い流す（例文 Rinse off your hands with water.）
import { seg, lerp, easeInOut, easeOut, hump, clamp } from '../ease.js';

export const meta = { duration: 4.6, beats: [[0, '泡のついた手'], [1.5, '水ですすぐ'], [3.8, 'きれいな手']] };

const hand = (b) => {
  const m = b.armR.hand.getCTM && b.armR.hand.getCTM();
  if (!m) return b.handPos('R');
  return { x: m.c * 26 + m.e, y: m.d * 26 + m.f };
};

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  for (let y = 60; y < 150; y += 22) for (let x = (y / 22) % 2 ? 0 : -20; x < 400; x += 40) el('rect', { x: x + 2, y: y + 2, width: 36, height: 18, rx: 3, fill: '#fff', opacity: 0.7 });
  el('rect', { x: 0, y: 150, width: 400, height: 28, fill: '#F5F0E8' });
  el('rect', { x: 0, y: 176, width: 400, height: 60, fill: pal.wood });
  el('rect', { x: 0, y: 176, width: 400, height: 4, fill: pal.woodDark });
  [60, 150, 240, 330].forEach((x) => { el('rect', { x: x - 38, y: 186, width: 76, height: 44, rx: 4, fill: pal.woodDark, opacity: 0.35 }); el('rect', { x: x - 6, y: 192, width: 12, height: 4, rx: 2, fill: pal.yellowDark }); });
  // シンク
  el('ellipse', { cx: 280, cy: 166, rx: 56, ry: 12, fill: '#CAD3DF' });
  el('ellipse', { cx: 280, cy: 167, rx: 50, ry: 9, fill: pal.water, opacity: 0.55 });
  // 蛇口
  el('rect', { x: 238, y: 146, width: 14, height: 16, rx: 3, fill: '#B8C2D0' });
  el('path', { d: 'M 245 150 L 245 122 Q 245 112 260 112 L 284 112 L 284 119', fill: 'none', stroke: '#B8C2D0', 'stroke-width': 8, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' });
  const lever = g({});
  el('rect', { x: -20, y: -3.5, width: 22, height: 7, rx: 3.5, fill: pal.blueDark }, lever);
  el('circle', { cx: -19, cy: 0, r: 5, fill: pal.blue }, lever);
  tf(lever, 244, 158);
  // 水流
  const SX = 284;
  const stream = el('line', { x1: SX, y1: 122, x2: SX, y2: 167, stroke: pal.water, 'stroke-width': 0, 'stroke-linecap': 'round' });
  const flow = el('line', { x1: SX, y1: 122, x2: SX, y2: 167, stroke: '#fff', 'stroke-width': 1.6, 'stroke-dasharray': '5 7', opacity: 0 });
  const b = k.buddy({ x: 205, y: FY, scale: 0.85 });
  const foam = g({});
  [[-7, -4, 6], [5, -6, 6.5], [0, 2, 7.5], [9, 3, 5], [-9, 5, 5]].forEach(([x, y, r]) => el('circle', { cx: x, cy: y, r, fill: '#fff', stroke: '#D7E8F5', 'stroke-width': 1.3 }, foam));
  const bub = [0, 1, 2, 3].map((j) => el('circle', { r: 3 + (j % 2) * 2, fill: 'none', stroke: '#BFD9EE', 'stroke-width': 1.5 }));
  const sp = [0, 1, 2, 3].map(() => el('circle', { r: 1.8, fill: pal.water }));
  const star = g({});
  el('path', { d: 'M 0 -9 L 3 -3 L 9 0 L 3 3 L 0 9 L -3 3 L -9 0 L -3 -3 Z', fill: pal.yellow }, star);

  return {
    update(t) {
      const w1 = easeInOut(seg(t, 0.55, 0.95)), w2 = easeInOut(seg(t, 2.95, 3.3));
      const x = t < 0.55 ? 205 : t < 2.95 ? lerp(205, 249, w1) + (t > 0.95 ? 3 * Math.sin(t * 15) : 0) : lerp(249, 205, w2);
      const walking = (t > 0.55 && t < 0.95) || (t > 2.95 && t < 3.3);
      const rin = t > 0.95 && t < 2.95;
      let arm = lerp(20, 160, easeOut(seg(t, 0.05, 0.3)));
      if (t > 0.55) arm = 150 + (rin ? 7 * Math.sin(t * 15 + 1) : 0);
      if (t > 2.95) arm = lerp(150, 160, w2);
      if (t > 3.7) arm = lerp(160, 168, easeInOut(seg(t, 3.7, 4.1)));
      b.pose({ x, armR: arm, armL: 8, walk: walking ? t * 9 : 0, mood: t > 3.6 ? 'grin' : 'smile', look: 0.6 });
      const h = hand(b);
      // レバー：手で押し上げて開け、押し下げて閉める
      const on = t < 3.4 ? easeOut(seg(t, 0.28, 0.5)) : 1 - easeOut(seg(t, 3.4, 3.6));
      tf(lever, 244, 158, -25 + 60 * on);
      // 水
      const flowAmt = t < 3.4 ? easeOut(seg(t, 0.5, 0.8)) : 1 - easeInOut(seg(t, 3.5, 3.85));
      const under = clamp(1 - Math.abs(h.x - SX) / 14) * (t > 0.6 ? 1 : 0);
      const endY = lerp(167, h.y - 9, under);
      stream.setAttribute('y2', endY); stream.setAttribute('stroke-width', 6 * flowAmt);
      flow.setAttribute('y2', endY); flow.setAttribute('opacity', 0.85 * flowAmt);
      flow.setAttribute('stroke-dashoffset', -t * 70);
      // 泡
      const fa = t < 0.95 ? 1 : 1 - easeInOut(seg(t, 1.0, 2.7));
      tf(foam, h.x, h.y - 2, 0, 0.2 + 0.9 * fa);
      foam.setAttribute('opacity', fa > 0.02 ? 1 : 0);
      bub.forEach((c, j) => {
        const u = (t * 1.1 + j / 4) % 1;
        const act = rin && t < 2.9 ? 1 : 0;
        c.setAttribute('cx', h.x + (j - 1.5) * 9 + Math.sin(u * 6 + j) * 3);
        c.setAttribute('cy', h.y - 8 - 28 * u);
        c.setAttribute('opacity', act * hump(u) * (0.4 + 0.6 * fa));
      });
      sp.forEach((c, j) => {
        const u = (t * 3 + j * 0.25) % 1, d = j % 2 ? 1 : -1;
        c.setAttribute('cx', h.x + d * (6 + 14 * u) * (1 + j * 0.1));
        c.setAttribute('cy', h.y - 4 - 14 * u + 30 * u * u);
        c.setAttribute('opacity', under > 0.5 && flowAmt > 0.3 ? hump(u) : 0);
      });
      const q = seg(t, 3.8, 4.5);
      tf(star, h.x, h.y - 18 - 4 * q, q * 90, 0.2 + 1.1 * hump(q));
      star.setAttribute('opacity', q > 0 && q < 1 ? 1 : 0);
    }
  };
}
