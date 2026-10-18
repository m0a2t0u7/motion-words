// spread out：たたんだ地図をテーブルに置き、両手で左右へ大きく広げる（例文 She spread out the map on the table.）
import { seg, lerp, easeInOut, easeOut, wobble, hump } from '../ease.js';
import { hp } from './dig.js';

// 人物の手前に置くテーブル（人物を作った後に呼ぶ）。天板の奥 top〜手前 top+depth
export function tableTop(k, x0, x1, top = 182, depth = 22, FY = 236) {
  const { el, pal } = k;
  const g = k.g({});
  el('polygon', { points: `${x0 + 8},${top} ${x1 - 8},${top} ${x1},${top + depth} ${x0},${top + depth}`, fill: '#F2DDBB' }, g);
  el('rect', { x: x0, y: top + depth, width: x1 - x0, height: 12, fill: pal.wood }, g);
  el('rect', { x: x0, y: top + depth, width: x1 - x0, height: 3, fill: pal.woodDark, opacity: 0.35 }, g);
  [x0 + 10, x1 - 18].forEach((x) => el('rect', { x, y: top + depth + 12, width: 8, height: FY - top - depth - 12, fill: pal.woodDark }, g));
  k.shadow((x0 + x1) / 2, FY + 1, (x1 - x0) / 2, 4, g);
  const items = k.g({}); // 天板の上に載る物
  return { g, items, top, depth };
}

export const meta = { duration: 4.2, beats: [[0, 'たたんだ地図'], [1.6, '左右に広げる'], [3.5, '地図が広がった']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  el('rect', { x: 36, y: 44, width: 90, height: 66, rx: 6, fill: '#DDEFFA', stroke: '#fff', 'stroke-width': 4 });
  el('rect', { x: 300, y: 40, width: 60, height: 76, rx: 3, fill: '#F7EAD6', stroke: pal.woodDark, 'stroke-width': 3 });
  el('circle', { cx: 330, cy: 74, r: 18, fill: '#BFE3F5' });
  const S = 1.15, X = 200;
  const b = k.buddy({ x: X, y: FY, scale: S });
  const T = tableTop(k, 60, 340, 184, 22);
  const map = g({}, T.items);
  const inner = g({}, map);
  const W0 = 140; // 全幅
  el('polygon', { points: `${-W0 / 2 + 5},0 ${W0 / 2 - 5},0 ${W0 / 2},16 ${-W0 / 2},16`, fill: '#F4F0DC', stroke: '#C9BE96', 'stroke-width': 1.5 }, inner);
  el('path', { d: `M ${-W0 / 2 + 8} 4 Q -20 16 10 8 T ${W0 / 2 - 6} 6`, stroke: pal.water, 'stroke-width': 3, fill: 'none' }, inner);
  el('ellipse', { cx: -30, cy: 10, rx: 14, ry: 4, fill: '#BFE6C2' }, inner);
  el('ellipse', { cx: 40, cy: 11, rx: 12, ry: 3.5, fill: '#BFE6C2' }, inner);
  el('path', { d: `M -50 12 L -10 6 L 30 12 L 55 5`, stroke: pal.red, 'stroke-width': 2, 'stroke-dasharray': '4 3', fill: 'none' }, inner);
  const creases = [-35, 0, 35].map((x) => el('line', { x1: x, y1: 0, x2: x, y2: 16, stroke: '#B8AD86', 'stroke-width': 1.2 }, inner));
  const stack = [0, 1, 2].map((i) => el('rect', { x: -W0 / 8, y: -3 - i * 2.2, width: W0 / 4, height: 3, fill: '#EDE6C6', stroke: '#C9BE96', 'stroke-width': 0.8 }, map));
  return {
    update(t) {
      const sp = easeInOut(seg(t, 1.1, 3.0));
      const reachIn = easeOut(seg(t, 0.3, 1.0));
      const a = lerp(lerp(8, 18, reachIn), 64, sp) + 3 * wobble(seg(t, 3.0, 3.8), 2, 5);
      b.pose({ armR: a, armL: a, lean: 0, squash: 1 - 0.04 * hump(seg(t, 3.0, 3.4)), mood: t > 3.2 ? 'grin' : 'flat', look: 0, blink: Math.abs(t - 0.9) < 0.06 ? 1 : 0 });
      const L = hp(b, S, 'L'), R = hp(b, S, 'R');
      // 地図の幅は手の間隔に合わせる（たたみ1/4 → 全開）
      const open = seg(t, 1.15, 3.0);
      const w = lerp(W0 / 4, W0, easeInOut(open));
      tf(map, X, T.top + 3 - 3 * hump(open) * 0.6);
      inner.setAttribute('transform', `scale(${(w / W0).toFixed(3)} 1)`);
      stack.forEach((s, i) => s.setAttribute('opacity', open < 0.02 ? 1 : i === 0 ? 0 : 1 - seg(open, 0, 0.4 + i * 0.2)));
      inner.setAttribute('opacity', open < 0.01 ? 0 : 1);
      creases.forEach((c) => c.setAttribute('opacity', lerp(1, 0.4, sp)));
      void L; void R;
    }
  };
}
