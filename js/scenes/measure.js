// measure：メジャーの端をテーブルの端に引っかけ、反対の端まで引いて長さを読み取る（例文 I measured the length of the table.）
import { seg, lerp, easeInOut, easeOut, smooth, backOut } from '../ease.js';
import { hp, gait } from './dig.js';

export const meta = { duration: 4.4, beats: [[0, '端に引っかける'], [1.5, '引いていく'], [3.4, '長さを読む']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  k.backdrop({ floorY: 236, mood: 'indoor' });
  const b = k.buddy({ x: 40, y: 236 });
  // テーブル（人物は奥側に立つ）
  el('rect', { x: 90, y: 192, width: 222, height: 8, rx: 3, fill: pal.wood });
  el('rect', { x: 90, y: 192, width: 222, height: 3, rx: 1.5, fill: '#fff', opacity: 0.45 });
  el('rect', { x: 96, y: 200, width: 210, height: 7, fill: pal.woodDark, opacity: 0.55 });
  [100, 296].forEach((x) => { el('rect', { x: x - 4, y: 200, width: 8, height: 36, fill: pal.woodDark }); k.shadow(x, 237, 12, 2.5); });
  // 引っかけ金具
  el('path', { d: 'M 96 186 L 90 186 L 90 196', fill: 'none', stroke: '#9AA6B6', 'stroke-width': 3, 'stroke-linecap': 'round' });
  const tape = el('rect', { x: 92, y: 186, width: 0, height: 6, fill: pal.yellow, stroke: pal.yellowDark, 'stroke-width': 1 });
  const ticks = [];
  for (let i = 0; i < 19; i++) ticks.push(el('line', { stroke: pal.ink, 'stroke-width': i % 5 === 0 ? 1.6 : 1 }));
  const cs = g({});
  el('rect', { x: -9, y: -8, width: 18, height: 14, rx: 4, fill: pal.red }, cs);
  el('circle', { cx: 0, cy: -1, r: 3, fill: '#fff' }, cs);
  const bub = g({});
  el('rect', { x: -26, y: -14, width: 52, height: 26, rx: 8, fill: '#fff', stroke: pal.blue, 'stroke-width': 3 }, bub);
  el('path', { d: 'M -5 12 L 0 20 L 5 12 Z', fill: '#fff', stroke: pal.blue, 'stroke-width': 3, 'stroke-linejoin': 'round' }, bub);
  el('rect', { x: -6, y: 9, width: 12, height: 5, fill: '#fff' }, bub);
  k.text(-4, 0, '120', { 'font-size': 15, fill: pal.blueDark }, bub);
  k.text(17, 2, 'cm', { 'font-size': 8, fill: pal.sub }, bub);
  const xf = (t) => lerp(40, 256, easeInOut(seg(t, 0.4, 3.0)));
  return {
    update(t) {
      const p = gait(xf, t, 40, 12);
      const rd = smooth(seg(t, 3.1, 3.6));
      b.pose({ x: p.x, walk: p.walk, armL: p.m > 0.1 ? p.armL : 8, armR: lerp(78, 70, rd), lean: p.lean + 8 * rd, look: lerp(0.4, 0.2, rd), mood: rd > 0.5 ? 'grin' : 'smile', squash: 1 });
      const h = hp(b, 1, 'R', 26);
      const len = Math.max(0, h.x - 92);
      k.set(tape, { width: len });
      ticks.forEach((l, i) => { const x = 92 + i * 12; k.set(l, { x1: x, y1: 186, x2: x, y2: 186 + (i % 5 === 0 ? 5 : 3), opacity: x < h.x - 8 ? 1 : 0 }); });
      tf(cs, h.x + 4, h.y - 1);
      tf(bub, 296, 150, 0, Math.max(0.001, backOut(seg(t, 3.4, 3.9))));
    }
  };
}
