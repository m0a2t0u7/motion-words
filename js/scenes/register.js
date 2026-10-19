// register：英語教室の受付で、まめが名簿の空いた行に名前を書き込み、受付の人が確認の印を付ける（例文 I registered for the English class.）
import { seg, lerp, easeInOut, easeOut, hump, wobble } from '../ease.js';
import { hp, held, reach } from './dig.js';
import { P, blinkAt } from './run-after.js';
import { walk, path } from './queue-up.js';
import { drawOn, check as tick } from './work-on.js';
import { pencil } from './check.js';

export const meta = { duration: 4.4, beats: [[0, '英語教室の受付'], [1.4, '名前を書く'], [3.2, '登録できた']] };

export function create(k) {
  const { el, g, tf, pal } = k, FY = 236;
  k.backdrop({ floorY: FY, mood: 'indoor' });
  el('rect', { x: 0, y: FY - 6, width: 400, height: 6, fill: pal.line });
  // 教室の看板：ENGLISH CLASS と ABC
  el('rect', { x: 210, y: 28, width: 170, height: 44, rx: 8, fill: pal.blue });
  k.text(295, 44, 'ENGLISH', { 'font-size': 14, fill: '#fff' });
  k.text(295, 61, 'CLASS', { 'font-size': 12, fill: '#fff' });
  el('rect', { x: 40, y: 40, width: 110, height: 70, rx: 4, fill: '#3E6B5A', stroke: pal.woodDark, 'stroke-width': 5 });
  k.text(95, 76, 'ABC', { 'font-size': 22, fill: '#fff', opacity: 0.8 });
  const staff = k.buddy({ x: 334, y: FY, scale: 1.15, facing: -1, color: pal.coral, dark: pal.coralDark });
  // 受付カウンター
  el('rect', { x: 200, y: 188, width: 200, height: 8, rx: 3, fill: pal.woodDark });
  el('rect', { x: 206, y: 196, width: 194, height: 40, fill: pal.wood });
  k.shadow(300, FY + 1, 100, 4);
  // 名簿（カウンターの上に立てたボード）
  const SX = 222, SY = 100, SW = 70, SH = 88;
  el('rect', { x: SX + 2, y: SY + 2, width: SW, height: SH, rx: 3, fill: '#000', opacity: 0.08 });
  el('rect', { x: SX, y: SY, width: SW, height: SH, rx: 3, fill: '#fff', stroke: pal.line, 'stroke-width': 2 });
  el('rect', { x: SX + SW / 2 - 14, y: SY - 5, width: 28, height: 9, rx: 3, fill: pal.sub });
  const rows = [118, 136, 154, 172];
  rows.forEach((y, i) => {
    el('line', { x1: SX + 8, x2: SX + SW - 8, y1: y + 6, y2: y + 6, stroke: pal.line, 'stroke-width': 1.5 });
    if (i < 2) el('path', { d: `M ${SX + 10} ${y + 2} q 5 -7 10 0 t 10 0 t 10 0`, stroke: pal.sub, 'stroke-width': 2, fill: 'none' });
  });
  const name = el('path', { d: `M ${SX + 10} ${rows[2] + 2} q 5 -8 10 0 t 10 0 t 10 0 t 8 -2`, stroke: pal.mintDark, 'stroke-width': 2.4, fill: 'none', 'stroke-linecap': 'round' });
  const write = drawOn(name);
  const ok = tick(k, SX + SW - 12, rows[2] - 1, 0.6, pal.red);
  const me = k.buddy({ x: 30, y: FY, scale: 1.0, facing: 1 });
  const pen = pencil(k);
  const xf = path([[0, 30], [1.2, 180]]);
  return {
    update(t) {
      walk(me, xf, t, { facing: 1, look: 0.6, blink: blinkAt(t) });
      const w = seg(t, 1.5, 2.6);
      const tx = lerp(SX + 10, SX + 48, w) , ty = rows[2] - 2 + (w > 0 && w < 1 ? 3 * Math.sin(w * 30) : 0);
      const up = easeInOut(seg(t, 1.2, 1.5)) * (1 - easeInOut(seg(t, 2.7, 3.0)));
      if (t > 1.2) {
        P(me, { x: 180, facing: 1, look: 0.9, blink: blinkAt(t), lean: 8 * up, armL: 10, armR: 10, mood: t > 3.2 ? 'grin' : 'smile', lift: 8 * hump(seg(t, 3.4, 3.8)) });
        me.pose({ armR: lerp(10, reach(me, 1.0, 'R', tx, ty + 6), up) });
      }
      held(k, me, 1.0, pen, 'R', 0);
      pen.setAttribute('opacity', t > 1.0 ? 1 : 0);
      write(w);
      // 受付：書き終わったのを見て印を付ける
      const st = easeInOut(seg(t, 2.8, 3.1)) * (1 - easeInOut(seg(t, 3.4, 3.7)));
      P(staff, { facing: -1, look: 0.7, blink: blinkAt(t, 1), mood: t > 3.0 ? 'grin' : 'smile', armL: 10, armR: 10 });
      staff.pose({ armR: lerp(10, reach(staff, 1.15, 'R', SX + SW - 10, rows[2]), st) });
      ok(seg(t, 3.0, 3.3));
    }
  };
}
