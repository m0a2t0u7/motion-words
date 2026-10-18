// open up：テーブルの箱のふたの端に手をかけ、ゆっくり持ち上げて開け、中が見える（例文 She opened up the box slowly.）
import { seg, lerp, easeInOut, easeOut, wobble, hump } from '../ease.js';
import { reach } from './dig.js';
import { tableTop } from './spread-out.js';

export const meta = { duration: 4.2, beats: [[0, '閉じた箱'], [1.6, 'ゆっくり開ける'], [3.6, '中が見えた']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  el('rect', { x: 36, y: 44, width: 90, height: 66, rx: 6, fill: '#DDEFFA', stroke: '#fff', 'stroke-width': 4 });
  el('rect', { x: 296, y: 60, width: 62, height: 48, rx: 3, fill: '#F7EAD6', stroke: pal.woodDark, 'stroke-width': 3 });
  const S = 1.25;
  const b = k.buddy({ x: 150, y: FY, scale: S });
  const T = tableTop(k, 130, 390, 188, 20);
  const X0 = 222, X1 = 286, TOPY = 166; // 箱の左端・右端（蝶番）・上面
  const glow = el('ellipse', { cx: (X0 + X1) / 2, cy: TOPY, rx: 30, ry: 10, fill: '#FFF3C4' });
  const rays = g({});
  [-40, -15, 10, 35].forEach((a) => el('line', { x1: 0, y1: -10, x2: 0, y2: -30, stroke: pal.yellow, 'stroke-width': 3, 'stroke-linecap': 'round', transform: `rotate(${a})` }, rays));
  const gem = g({}); el('path', { d: 'M -10 0 L -5 -8 L 5 -8 L 10 0 L 0 10 Z', fill: pal.water, stroke: '#5FB4DD', 'stroke-width': 1.5 }, gem);
  el('rect', { x: X0, y: TOPY, width: X1 - X0, height: 30, rx: 3, fill: pal.violet });
  el('rect', { x: (X0 + X1) / 2 - 6, y: TOPY, width: 12, height: 30, fill: pal.yellow });
  const lid = g({});
  el('rect', { x: -(X1 - X0) - 3, y: -9, width: X1 - X0 + 6, height: 9, rx: 3, fill: '#8A70E0' }, lid);
  el('rect', { x: -(X1 - X0) / 2 - 6, y: -9, width: 12, height: 9, fill: pal.yellowDark }, lid);
  return {
    update(t) {
      // ふたの角度：手で 0→40° までゆっくり、その後は自分の重さで 105° まで倒れて止まる
      const guide = easeInOut(seg(t, 1.0, 2.9));
      const fall = easeOut(seg(t, 2.9, 3.5));
      const ang = lerp(lerp(0, 40, guide), 105, fall) + (t > 3.5 ? 3 * wobble(seg(t, 3.5, 4.1), 2, 5) : 0);
      const r = (ang * Math.PI) / 180, W = X1 - X0 + 3;
      const edge = { x: X1 - W * Math.cos(r), y: TOPY - W * Math.sin(r) };
      tf(lid, X1, TOPY, ang);
      const into = easeOut(seg(t, 0.3, 0.9)), off = easeInOut(seg(t, 2.9, 3.3));
      const lean = 10 * into;
      b.pose({ lean, look: 0.7, mood: t > 3.3 ? 'open' : 'flat', blink: Math.abs(t - 0.5) < 0.06 ? 1 : 0 });
      const a = reach(b, S, 'R', edge.x, edge.y + 2);
      b.pose({ armR: lerp(lerp(10, a, into), 40, off), lean: lerp(lean, 4, off), squash: 1 - 0.03 * hump(seg(t, 3.3, 3.7)) });
      const o = seg(t, 1.6, 3.3);
      glow.setAttribute('opacity', o); rays.setAttribute('opacity', o * 0.9);
      tf(rays, (X0 + X1) / 2, TOPY, 0, 0.6 + 0.4 * o + 0.03 * Math.sin(t * 8));
      tf(gem, (X0 + X1) / 2, TOPY - 2 - 12 * easeOut(seg(t, 2.8, 3.6)), 8 * wobble(seg(t, 3.0, 4.2), 1.5, 3));
      gem.setAttribute('opacity', seg(t, 2.6, 3.0));
      void T;
    }
  };
}
