// provide：ホテルの朝食会場。係の人が無料の朝食をトレーで運び、まめのテーブルに出す（例文 The hotel provides free breakfast.）
import { seg, lerp, easeInOut, easeOut, hump, wobble } from '../ease.js';
import { hp } from './dig.js';
import { P, blinkAt } from './run-after.js';
import { walk, path } from './queue-up.js';

// ホテルの室内（HOTEL 表示・呼び鈴付きの壁、カーテン窓）
export function hotelBg(k, FY = 236) {
  const { el, pal } = k;
  k.backdrop({ floorY: FY, mood: 'indoor' });
  el('rect', { x: 0, y: 0, width: 400, height: 22, fill: '#EADFCF' });
  el('rect', { x: 0, y: FY - 6, width: 400, height: 6, fill: '#E2D3BE' });
  el('rect', { x: 150, y: 36, width: 100, height: 26, rx: 5, fill: pal.ink });
  k.text(200, 50, 'HOTEL', { 'font-size': 14, fill: '#FFE08A' });
  el('rect', { x: 30, y: 40, width: 76, height: 80, rx: 4, fill: '#DDEFFA', stroke: '#fff', 'stroke-width': 5 });
  el('path', { d: 'M 26 36 Q 40 80 34 124 L 22 124 Z M 110 36 Q 96 80 102 124 L 114 124 Z', fill: pal.violet, opacity: 0.7 });
  return FY;
}
// 朝食の皿（中心原点）
export function breakfast(k, parent) {
  const g = k.g({}, parent), pal = k.pal;
  k.el('ellipse', { cx: 0, cy: 0, rx: 20, ry: 5, fill: '#fff', stroke: pal.line, 'stroke-width': 1.5 }, g);
  k.el('rect', { x: -16, y: -12, width: 15, height: 11, rx: 3, fill: '#E9B46A' }, g);
  k.el('ellipse', { cx: 7, cy: -3, rx: 9, ry: 4, fill: '#fff' }, g);
  k.el('circle', { cx: 7, cy: -4, r: 3.2, fill: pal.yellow }, g);
  k.el('path', { d: 'M 22 -16 L 30 -16 L 29 0 L 23 0 Z', fill: '#FFB347', stroke: '#fff', 'stroke-width': 1 }, g);
  return g;
}

export const meta = { duration: 4.2, beats: [[0, 'ホテルの朝'], [1.4, '朝食を出す'], [3.0, '無料の朝食']] };

export function create(k) {
  const { el, g, tf, pal } = k, FY = 236;
  hotelBg(k, FY);
  const me = k.buddy({ x: 112, y: FY, scale: 0.95, facing: 1 });
  // テーブル（まめの前）
  k.shadow(176, FY + 1, 56, 4);
  el('rect', { x: 128, y: 188, width: 100, height: 8, rx: 3, fill: '#fff' });
  el('path', { d: 'M 128 196 L 228 196 L 222 212 L 134 212 Z', fill: '#fff', stroke: pal.line, 'stroke-width': 1.5 });
  el('rect', { x: 172, y: 212, width: 8, height: 24, fill: pal.woodDark });
  // 卓上カード「FREE」
  el('path', { d: 'M 136 188 L 142 170 L 160 170 L 166 188 Z', fill: pal.yellow, stroke: pal.yellowDark, 'stroke-width': 1.5 });
  k.text(151, 180, 'FREE', { 'font-size': 8 });
  const staff = k.buddy({ x: 380, y: FY, scale: 1.0, facing: -1, color: pal.coral, dark: pal.coralDark });
  const tray = g({});
  el('rect', { x: -26, y: 0, width: 52, height: 4, rx: 2, fill: pal.sub }, tray);
  const food = breakfast(k);
  const xf = path([[0, 380], [1.5, 262]]);
  return {
    update(t) {
      const reachP = easeInOut(seg(t, 1.6, 2.2)), back = easeInOut(seg(t, 2.4, 2.8));
      walk(staff, xf, t, { facing: -1, look: 0.5, armL: 10, armR: 88, blink: blinkAt(t) });
      if (t > 1.5) P(staff, { x: 262, facing: -1, look: 0.6, armL: 10, armR: lerp(88, 100, reachP) * (1 - back) + 10 * back, lean: 8 * reachP * (1 - back), mood: 'grin', blink: blinkAt(t) });
      const h = hp(staff, 1.0, 'R');
      // トレーは手の上、皿はトレーの上 → テーブルへ
      const put = t > 2.25;
      tf(tray, h.x - 18, h.y - 6);
      tray.setAttribute('opacity', back < 1 ? 1 : 0);
      if (!put) tf(food, h.x - 16, h.y - 8);
      else tf(food, 194, 188, 0, 1 + 0.05 * wobble(seg(t, 2.25, 2.8), 2, 5), 1 - 0.06 * wobble(seg(t, 2.25, 2.8), 2, 5));
      // まめ：待つ→喜んで食べる
      const eat = t > 3.1 ? Math.max(0, Math.sin((t - 3.1) * 7)) : 0;
      P(me, { look: 0.7, blink: blinkAt(t, 1), mood: t > 2.3 ? (eat > 0.5 ? 'open' : 'grin') : 'smile', armR: t > 3.1 ? 60 + 20 * eat : 10, armL: 10, lift: 8 * hump(seg(t, 2.4, 2.8)) });
    }
  };
}
