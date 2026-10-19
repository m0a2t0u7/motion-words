// wood：木目のテーブルを、まめがコンコンとたたく。考え雲に「木→丸太→板→テーブル」が出る（例文 This table is made of wood.）
import { seg, lerp, easeInOut, easeOut, clamp, hump } from '../ease.js';
import { treeG, thinkCloud, reach, P, blinkAt, popIn } from './nature.js';

export const meta = { duration: 4.4, beats: [[0, 'テーブル'], [1.0, 'コンコン'], [2.4, '木でできている']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 1;
  const FY = k.backdrop({ floorY: 240, mood: 'indoor' });
  el('rect', { x: 0, y: FY, width: 400, height: 60, fill: '#E9E2D8' });
  // 木のテーブル（木目）
  const TX = 200, TY = 176;
  k.shadow(TX, FY + 2, 100, 6);
  el('rect', { x: TX - 86, y: TY + 12, width: 14, height: FY - TY - 12, fill: '#B98A5A' });
  el('rect', { x: TX + 72, y: TY + 12, width: 14, height: FY - TY - 12, fill: '#B98A5A' });
  el('rect', { x: TX - 100, y: TY, width: 200, height: 16, rx: 3, fill: '#D9A86C' });
  [3, 7, 11].forEach((y, i) => el('path', { d: `M ${TX - 96} ${TY + y} q 40 ${i % 2 ? 3 : -3} 80 0 t 80 0 t 30 0`, stroke: '#B98A5A', 'stroke-width': 1.4, fill: 'none' }));
  el('ellipse', { cx: TX + 30, cy: TY + 8, rx: 8, ry: 3, fill: 'none', stroke: '#B98A5A', 'stroke-width': 1.4 });
  const b = k.buddy({ x: 70, y: FY, scale: S });
  const knock = [0, 1].map(() => el('path', { d: 'M -8 -4 l -6 -6 M 0 -8 v -8 M 8 -4 l 6 -6', stroke: pal.ink, 'stroke-width': 2.4, 'stroke-linecap': 'round' }));
  const th = thinkCloud(k, 230, 74, 1);
  const tr = treeG(k, 0.36, '#7FCB92', '#6BBF84', th.g); tf(tr.g, -80, 22);
  const log = g({}, th.g);
  el('rect', { x: -22, y: -8, width: 44, height: 16, rx: 6, fill: '#C48E57' }, log);
  el('ellipse', { cx: 22, cy: 0, rx: 5, ry: 8, fill: '#E8C493', stroke: '#B98A5A' }, log);
  const planks = g({}, th.g);
  [0, 1, 2].forEach((i) => el('rect', { x: -20, y: -12 + i * 9, width: 40, height: 7, rx: 1.5, fill: '#D9A86C', stroke: '#B98A5A', 'stroke-width': 1 }, planks));
  const tbl = g({}, th.g);
  el('rect', { x: -18, y: -6, width: 36, height: 6, rx: 1.5, fill: '#D9A86C' }, tbl);
  el('path', { d: 'M -14 0 V 14 M 14 0 V 14', stroke: '#B98A5A', 'stroke-width': 4 }, tbl);
  const arrows = [-48, 0, 48].map((x) => k.text(x + 4, 2, '›', { 'font-size': 18, fill: pal.sub }, th.g));
  return {
    update(t) {
      // 2回コンコン
      const kk = hump(seg(t, 0.8, 1.05)) + hump(seg(t, 1.15, 1.4));
      P(b, { look: 0.6, lean: 6, mood: t > 2.4 ? 'grin' : 'smile', blink: blinkAt(t), armL: 12 });
      b.pose({ armR: reach(b, S, 'R', 116, TY - 6 - 18 * kk) - 4 });
      knock.forEach((n, i) => { const p = seg(t, 0.95 + i * 0.35, 1.25 + i * 0.35); tf(n, 116, TY - 10, 0, p > 0 && p < 1 ? 1 : 0.001); n.setAttribute('opacity', 1 - p); });
      th.show(seg(t, 1.6, 2.1), 236, 70);
      [log, planks, tbl].forEach((n, i) => tf(n, -26 + i * 48 + (i === 0 ? 0 : 0), 0, 0, popIn(seg(t, 2.1 + i * 0.4, 2.5 + i * 0.4))));
      tf(log, -26, 2, 0, popIn(seg(t, 2.1, 2.5)));
      tf(planks, 22, 2, 0, popIn(seg(t, 2.5, 2.9)));
      tf(tbl, 72, 0, 0, popIn(seg(t, 2.9, 3.3)));
      arrows.forEach((a, i) => a.setAttribute('opacity', seg(t, 2.0 + i * 0.4, 2.2 + i * 0.4)));
      arrows.forEach((a, i) => a.setAttribute('x', [-52, -2, 46][i]));
    }
  };
}
