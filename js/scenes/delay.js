// delay：大雪のホームで待つ。時計だけが進み、電車は予定の時刻を過ぎてからゆっくり着く（例文 Heavy snow delayed the train.）
import { seg, lerp, easeInOut, easeOut, smooth } from '../ease.js';
import { hp } from './dig.js';

export const meta = { duration: 4.8, beats: [[0, '定刻前'], [2.2, '時刻を過ぎた'], [4.3, '遅れて到着']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 240, mood: 'outdoor' });
  el('rect', { x: 0, y: 0, width: 400, height: 150, fill: '#E4EAF1' });
  [[20, 60], [110, 84], [260, 70], [330, 90]].forEach(([x, h]) => el('rect', { x: x, y: 190 - h, width: 56, height: h, rx: 3, fill: '#D4DCE6' }));
  el('rect', { x: 0, y: 190, width: 400, height: 50, fill: '#C9D1DC' });
  el('rect', { x: 0, y: 216, width: 400, height: 3, fill: '#9AA6B6' });
  el('rect', { x: 0, y: 219, width: 400, height: 21, fill: '#E3E8EE' });
  el('rect', { x: 0, y: 236, width: 400, height: 4, fill: pal.yellow });
  // 電車（左から入る）
  const train = g({});
  el('rect', { x: 0, y: 130, width: 300, height: 76, rx: 14, fill: '#F2F5F8', stroke: '#C8D0DB', 'stroke-width': 2 }, train);
  el('rect', { x: 0, y: 168, width: 300, height: 10, fill: pal.blue }, train);
  [16, 66, 116, 176, 226].forEach((x) => el('rect', { x, y: 142, width: 34, height: 24, rx: 5, fill: '#BFE3F5' }, train));
  el('rect', { x: 150, y: 138, width: 20, height: 62, rx: 3, fill: '#DCE3EC' }, train);
  el('circle', { cx: 290, cy: 190, r: 6, fill: pal.yellow }, train);
  [30, 90, 210, 270].forEach((x) => el('circle', { cx: x, cy: 208, r: 8, fill: pal.ink }, train));
  const cap = el('path', { d: 'M 8 134 Q 150 118 292 134 Q 290 128 270 126 L 30 126 Q 10 128 8 134 Z', fill: '#fff', opacity: 0 }, train);
  // 時計と時刻表
  const sign = g({}); tf(sign, 200, 34);
  el('rect', { x: -66, y: -24, width: 132, height: 48, rx: 8, fill: '#fff', stroke: pal.line, 'stroke-width': 3 }, sign);
  el('line', { x1: -30, y1: 24, x2: -30, y2: 56, stroke: pal.sub, 'stroke-width': 3 }, sign); el('line', { x1: 30, y1: 24, x2: 30, y2: 56, stroke: pal.sub, 'stroke-width': 3 }, sign);
  const cl = g({}); tf(cl, -34, 0, 0, 1, 1); sign.appendChild(cl);
  el('circle', { r: 19, fill: '#fff', stroke: pal.ink, 'stroke-width': 3 }, cl);
  for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6; el('line', { x1: Math.sin(a) * 15, y1: -Math.cos(a) * 15, x2: Math.sin(a) * 17, y2: -Math.cos(a) * 17, stroke: pal.sub, 'stroke-width': 1.6 }, cl); }
  const hh = el('line', { x1: 0, y1: 0, x2: 0, y2: -10, stroke: pal.ink, 'stroke-width': 3.6, 'stroke-linecap': 'round' }, cl);
  const mm = el('line', { x1: 0, y1: 0, x2: 0, y2: -16, stroke: pal.ink, 'stroke-width': 2.6, 'stroke-linecap': 'round' }, cl);
  const tg = el('line', { x1: 0, y1: -19, x2: 0, y2: -13, stroke: pal.red, 'stroke-width': 3.4, 'stroke-linecap': 'round' }, cl); // 定刻の目印（10:00）
  k.text(30, -8, '10:00', { 'font-size': 15 }, sign); k.text(30, 10, '▶', { 'font-size': 10, fill: pal.red }, sign);
  const b = k.buddy({ x: 200, y: 232 });
  const piles = [[60, 4], [160, 3], [270, 5], [350, 4]].map(([x, h]) => el('ellipse', { cx: x, cy: 238, rx: 22, ry: 0.1, fill: '#fff' }));
  const dim = el('rect', { x: 0, y: 0, width: 400, height: 300, fill: '#C9D6E6', opacity: 0 });
  const fl = Array.from({ length: 46 }, () => el('circle', { fill: '#fff', stroke: '#DCE6F2', 'stroke-width': 0.6 }));
  const tx = (t) => lerp(-300, 40, easeOut(seg(t, 2.6, 4.5)));
  return {
    update(t) {
      const mt = lerp(55, 80, easeInOut(seg(t, 0.5, 2.6)));
      tf(hh, 0, 0, ((9 + mt / 60) % 12) * 30); tf(mm, 0, 0, mt * 6); tf(tg, 0, 0, 0);
      tf(train, tx(t), 0); cap.setAttribute('opacity', seg(t, 1.5, 4.2));
      const dens = smooth(seg(t, 0, 1.6)) * 0.5 + smooth(seg(t, 1.0, 3.0)) * 0.5;
      k.set(dim, { opacity: 0.25 * dens });
      fl.forEach((f, i) => {
        const sp = 40 + (i % 5) * 14, x = ((i * 71) % 400) + Math.sin(t * 2 + i) * 9, y = (t * sp + i * 43) % 250 + 8;
        k.set(f, { cx: x, cy: y, r: 1.6 + (i % 3) * 0.7, opacity: i / 46 < dens ? 1 : 0 });
      });
      piles.forEach((p, i) => k.set(p, { ry: 0.2 + 3.5 * seg(t, 0.8 + i * 0.3, 4.2) }));
      const look = seg(t, 1.3, 1.8), shv = t > 1.4 ? Math.sin(t * 38) * 0.8 : 0;
      const wr = Math.sin(seg(t, 1.3, 2.1) * Math.PI);
      const arrived = seg(t, 4.2, 4.6);
      b.pose({ x: 200 + shv, armR: lerp(8, 105, easeOut(look)) * (1 - seg(t, 2.6, 3.0)) + 8 * seg(t, 2.6, 3.0) + 0 * wr, armL: 8 + 20 * Math.sin(t * 3) * 0, squash: 0.97 + 0.01 * Math.sin(t * 2), lean: 2, look: lerp(0.6, -0.6, seg(t, 0.2, 0.3)) * 0 + (t < 2.8 ? 0.6 : -0.6), mood: t < 0.5 ? 'smile' : arrived > 0 ? 'smile' : 'sad' });
    }
  };
}
