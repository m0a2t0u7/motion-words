// check off：まめがペンで、リストの項目に1つずつチェック印を付けていく（例文 I checked off each item on the list.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';
import { P, blinkAt } from './run-after.js';
import { reach, hp } from './weigh.js';
import { held } from './dig.js';

export const meta = { duration: 4.4, beats: [[0, 'やることリスト'], [1.4, '1つずつ印'], [3.8, '全部済んだ']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  // 壁のクリップボード
  el('rect', { x: 172, y: 40, width: 150, height: 168, rx: 8, fill: pal.woodDark });
  el('rect', { x: 182, y: 52, width: 130, height: 148, rx: 3, fill: '#fff' });
  el('rect', { x: 222, y: 34, width: 50, height: 16, rx: 4, fill: '#8F9BB0' });
  const ys = [76, 108, 140, 172];
  const ticks = ys.map((y, i) => {
    el('rect', { x: 194, y: y - 8, width: 16, height: 16, rx: 3, fill: 'none', stroke: pal.sub, 'stroke-width': 2 });
    el('rect', { x: 220, y: y - 3, width: [70, 56, 80, 48][i], height: 6, rx: 3, fill: '#C9D1DC' });
    return el('path', { d: `M ${195} ${y} l 6 7 l 13 -16`, stroke: pal.green, 'stroke-width': 4, fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-dasharray': '30', 'stroke-dashoffset': 30 });
  });
  const S = 0.9;
  const b = k.buddy({ x: 120, y: FY, scale: S });
  const pen = g({}); el('rect', { x: -2.5, y: 0, width: 5, height: 22, rx: 2, fill: pal.blue }, pen); el('path', { d: 'M -2.5 22 L 0 28 L 2.5 22 Z', fill: pal.ink }, pen);
  const T0 = 0.6, D = 0.8;
  return {
    update(t) {
      // 各行：ペン先を箱へ運び、チェックの形になぞる
      const i = Math.max(0, Math.min(3, Math.floor((t - T0) / D))), u = seg(t - T0 - i * D, 0, D);
      const move = easeInOut(seg(u, 0, 0.4)), draw = seg(u, 0.45, 0.85);
      const from = i === 0 ? { x: 170, y: 150 } : { x: 208, y: ys[i - 1] - 9 };
      let tx = lerp(from.x, 196, move), ty = lerp(from.y, ys[i], move);
      if (draw > 0) { const d = draw < 0.35 ? draw / 0.35 : 1, e = draw < 0.35 ? 0 : (draw - 0.35) / 0.65; tx = 196 + 6 * d + 13 * e; ty = ys[i] + 7 * d - 16 * e; }
      if (t > T0 + 4 * D) { const r = easeInOut(seg(t, T0 + 4 * D, T0 + 4 * D + 0.4)); tx = lerp(208, 170, r); ty = lerp(ys[3] - 9, 190, r); }
      const pre = easeOut(seg(t, 0, T0));
      P(b, { x: 120, facing: 1, armR: 60, lean: 4, look: 0.8, mood: t > 3.9 ? 'grin' : 'smile', blink: blinkAt(t) });
      // ペン先（腕の先＋ペンの長さ）を目標に合わせる
      const r = reach(b, S, 'R', tx, ty);
      P(b, { x: 120, facing: 1, armR: lerp(8, r, pre), lean: 4, look: 0.8, mood: t > 3.9 ? 'grin' : 'smile', squash: 1 - 0.04 * hump(seg(t, 3.9, 4.3)), blink: blinkAt(t) });
      held(k, b, S, pen, 'R', 0, 0);
      ticks.forEach((tk, j) => { const p = seg(t, T0 + j * D + 0.45 * D, T0 + j * D + 0.85 * D); tk.setAttribute('stroke-dashoffset', (30 * (1 - p)).toFixed(1)); });
    }
  };
}
