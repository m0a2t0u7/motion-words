// check：答案用紙の答えを、鉛筆で1問ずつなぞって確かめ、チェックを付ける（例文 Please check your answers again.）
// このファイルは z1 系シーンの共有ヘルパーも書き出す（pencil / sheet / tap）
import { seg, lerp, easeInOut, easeOut, hump, clamp, wobble } from '../ease.js';
import { hp, held, reach } from './dig.js';
import { desk } from './get-on-with.js';
import { P, blinkAt } from './run-after.js';
import { check as tick } from './work-on.js';

// 鉛筆（原点＝握り、+y が先端方向。先端は y=22）
export function pencil(k, parent) {
  const g = k.g({}, parent), pal = k.pal;
  k.el('rect', { x: -2.6, y: -8, width: 5.2, height: 24, rx: 1, fill: pal.yellow, stroke: pal.yellowDark, 'stroke-width': 1 }, g);
  k.el('rect', { x: -2.6, y: -10, width: 5.2, height: 4, rx: 1, fill: '#F7A9B4' }, g);
  k.el('path', { d: 'M -2.6 16 L 2.6 16 L 0 23 Z', fill: '#F2D7AE' }, g);
  k.el('path', { d: 'M -0.9 20.6 L 0.9 20.6 L 0 23 Z', fill: pal.ink }, g);
  return g;
}
// 罫線入りの紙（左上原点）。rows 行ぶんの横線を引き、行の y を返す
export function sheet(k, x, y, w, h, rows, parent) {
  const g = k.g({}, parent), pal = k.pal;
  k.el('rect', { x: x + 3, y: y + 3, width: w, height: h, rx: 3, fill: '#000', opacity: 0.08 }, g);
  k.el('rect', { x, y, width: w, height: h, rx: 3, fill: '#fff', stroke: pal.line, 'stroke-width': 2 }, g);
  const ys = [];
  for (let i = 0; i < rows; i++) ys.push(y + 14 + i * ((h - 20) / Math.max(1, rows - 1 || 1)));
  return { g, ys };
}
// 一定の間隔でたたく動き（0→1→0）
export const tap = (t, a, len = 0.3) => hump(seg(t, a, a + len));

export const meta = { duration: 4.2, beats: [[0, '答案を見る'], [1.0, '1問ずつ確かめる'], [3.4, '全部チェック']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 1.1, FY = 236;
  k.backdrop({ floorY: FY, mood: 'indoor' });
  // 教室の黒板と時計
  el('rect', { x: 20, y: 34, width: 150, height: 86, rx: 4, fill: '#3E6B5A', stroke: pal.woodDark, 'stroke-width': 6 });
  el('path', { d: 'M 40 64 h 40 M 40 84 h 70 M 40 100 h 30', stroke: '#fff', 'stroke-width': 3, opacity: 0.55, 'stroke-linecap': 'round' });
  el('circle', { cx: 330, cy: 60, r: 20, fill: '#fff', stroke: pal.ink, 'stroke-width': 3 });
  el('path', { d: 'M 330 60 L 330 47 M 330 60 L 340 64', stroke: pal.ink, 'stroke-width': 2.6, 'stroke-linecap': 'round' });
  const top = desk(k, 120, 230, FY);
  // 机の上に立てかけた答案（ボード）
  const SX = 204, SY = 110, SW = 76, SH = 80;
  el('rect', { x: SX + 30, y: SY + SH - 2, width: 26, height: top - SY - SH + 2, fill: pal.woodDark });
  const sh = sheet(k, SX, SY, SW, SH, 4);
  el('rect', { x: SX + SW / 2 - 14, y: SY - 5, width: 28, height: 9, rx: 3, fill: pal.sub });
  const rows = [0, 1, 2, 3].map((i) => SY + 16 + i * 18);
  const ticks = rows.map((y, i) => {
    k.text(SX + 11, y, String(i + 1), { 'font-size': 11, fill: pal.sub });
    el('path', { d: `M ${SX + 22} ${y + 2} q 6 -8 12 0 t 12 0 t 10 -2`, stroke: pal.blueDark, 'stroke-width': 2.2, fill: 'none', 'stroke-linecap': 'round' });
    return tick(k, SX + SW - 14, y, 0.7, pal.red);
  });
  el('line', { x1: SX + 6, y1: SY + SH - 8, x2: SX + SW - 6, y2: SY + SH - 8, stroke: pal.line, 'stroke-width': 1.5 });
  // 腕が答案の手前に来るよう、バディは答案の後に描く
  const b = k.buddy({ x: 168, y: FY, scale: S, facing: 1 });
  const pen = pencil(k);
  const ink = g({});
  return {
    update(t) {
      // 1問ずつ：鉛筆の先で答えをなぞり（左→右）、右端でチェック
      const t0 = 0.9, dt = 0.62;
      const i = clamp(Math.floor((t - t0) / dt), 0, 3), q = seg(t - t0 - i * dt, 0, dt);
      const on = t > t0 && t < t0 + 4 * dt;
      let tx = SX + SW - 14, ty = rows[3] - 10;
      if (t < t0) { tx = lerp(SX + 40, SX + 24, easeInOut(seg(t, 0.3, t0))); ty = lerp(SY + 60, rows[0] - 4, easeInOut(seg(t, 0.3, t0))); }
      else if (on) { tx = lerp(SX + 24, SX + SW - 14, easeInOut(seg(q, 0, 0.7))); ty = rows[i] - 2 + 3 * tap(q, 0.72, 0.25) - (q > 0.97 ? 0 : 0); }
      else ty = lerp(rows[3], rows[3] - 26, easeOut(seg(t, t0 + 4 * dt, t0 + 4 * dt + 0.4)));
      P(b, { lean: 8, look: 0.9, blink: blinkAt(t), armL: 14, mood: t > 3.5 ? 'grin' : 'smile' });
      // 鉛筆の先（肩から 28+18 の位置）が目標へ届く角度
      const o = hp(b, S, 'R', 0), ang = reach(b, S, 'R', tx, ty);
      b.pose({ armR: ang });
      held(k, b, S, pen, 'R', 0);
      ticks.forEach((f, j) => f(clamp(seg(t, t0 + j * dt + 0.72 * dt, t0 + j * dt + 0.95 * dt))));
      // 読むたびに頭が小さくうなずく
      b.body.children[3].setAttribute('transform', `translate(${(4 + 2 * Math.sin(q * Math.PI)).toFixed(2)} ${(on ? 2 * tap(q, 0.7, 0.3) : 0).toFixed(2)})`);
      void o;
    }
  };
}
