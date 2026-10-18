// from scratch：粉を袋から注ぎ、卵を割り入れ、混ぜて焼き、ケーキを一から作る（例文 She made the cake from scratch.）
// このファイルは「決まり文句」シーン群の共有ヘルパーも export する
import { seg, lerp, easeInOut, easeOut, backOut, hump, wobble, clamp } from '../ease.js';
import { hp, reach } from './dig.js';
import { say } from './get-on-with.js';
import { P } from './run-after.js';

// ===== 共有ヘルパー =====
// 短い英語の合図入り吹き出し。show(x, y, p)
export function cue(k, str, w = 60, h = 30, fs = 13) {
  const s = say(k, w, h);
  if (str) k.text(0, 1, str, { 'font-size': fs }, s.inner);
  return s;
}
// しゃべっている口（区間 a〜b の間 open/smile を交互に）
export const talk = (t, a, b, rest = 'smile') => (t > a && t < b && Math.sin(t * 22) > -0.2 ? 'open' : rest);
// 0→1 のポン（出現）。scale に使う
export const popS = (p) => Math.max(0.001, p <= 0 ? 0 : p >= 1 ? 1 : backOut(p));
// 曜日のカレンダー列（n 日分のマス）。mark(i, node) でマスに印を置く。hi(i) で今日を強調
export function days(k, x, y, n, cw = 30, ch = 30, parent) {
  const { el, pal } = k;
  const g = k.g({}, parent);
  const cells = [];
  for (let i = 0; i < n; i++) {
    const c = k.g({}, g); k.tf(c, x + i * (cw + 4), y);
    el('rect', { x: 0, y: 0, width: cw, height: ch, rx: 4, fill: '#fff', stroke: pal.line, 'stroke-width': 2 }, c);
    el('rect', { x: 0, y: 0, width: cw, height: 7, rx: 3, fill: pal.coral, opacity: 0.85 }, c);
    cells.push(c);
  }
  const ring = el('rect', { x: -3, y: -3, width: cw + 6, height: ch + 6, rx: 6, fill: 'none', stroke: pal.blueDark, 'stroke-width': 3 }, g);
  return { g, cells, cx: (i) => x + i * (cw + 4) + cw / 2, hi(fi) { const i = clamp(fi, 0, n - 1); k.set(ring, { x: x + i * (cw + 4) - 3, y: y - 3, opacity: fi < -0.5 ? 0 : 1 }); } };
}
// 電話（小）。原点＝中心
export function handset(k, parent) {
  const g = k.g({}, parent);
  k.el('rect', { x: -7, y: -12, width: 14, height: 24, rx: 3.5, fill: k.pal.ink }, g);
  const scr = k.el('rect', { x: -5, y: -9, width: 10, height: 16, rx: 1.5, fill: '#9FB4CC' }, g);
  return { g, scr };
}
// 呼び出し音の波線（原点＝電話の位置）
export function ringWaves(k) {
  const g = k.g({});
  [10, 17].forEach((r) => [1, -1].forEach((d) => k.el('path', { d: `M ${d * r} ${-r * 0.7} Q ${d * (r + 5)} 0 ${d * r} ${r * 0.7}`, stroke: k.pal.coralDark, 'stroke-width': 2.5, fill: 'none', 'stroke-linecap': 'round' }, g)));
  return g;
}

// ===== from scratch 本体 =====
export const meta = { duration: 4.4, beats: [[0, '粉を入れる'], [1.6, '卵・混ぜる'], [3.4, 'ケーキ完成']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  el('rect', { x: 40, y: 50, width: 90, height: 64, rx: 6, fill: '#DDEFFA', stroke: '#fff', 'stroke-width': 5 });
  el('line', { x1: 85, y1: 50, x2: 85, y2: 114, stroke: '#fff', 'stroke-width': 4 });
  // 調理台
  const TY = 190;
  el('rect', { x: 186, y: TY - 8, width: 214, height: 14, fill: '#F2DDBB' });
  el('rect', { x: 186, y: TY + 6, width: 214, height: FY - TY - 6, fill: pal.wood });
  el('rect', { x: 186, y: TY + 6, width: 214, height: 3, fill: pal.woodDark, opacity: 0.35 });
  // 材料（牛乳・砂糖・卵ケース）
  el('rect', { x: 330, y: TY - 46, width: 22, height: 42, rx: 3, fill: '#fff', stroke: pal.line, 'stroke-width': 2 });
  el('path', { d: `M 330 ${TY - 46} L 341 ${TY - 56} L 352 ${TY - 46} Z`, fill: pal.blue });
  el('rect', { x: 360, y: TY - 30, width: 28, height: 26, rx: 4, fill: '#F7F1E6', stroke: pal.woodDark, 'stroke-width': 1.5 });
  el('rect', { x: 238, y: TY - 12, width: 40, height: 10, rx: 2, fill: '#D7C3A4' });
  el('ellipse', { cx: 266, cy: TY - 14, rx: 6, ry: 7.5, fill: '#FFF8EC', stroke: '#E6D6BC' });
  const egg0 = el('ellipse', { cx: 250, cy: TY - 14, rx: 6, ry: 7.5, fill: '#FFF8EC', stroke: '#E6D6BC' });
  // ボウル→ケーキ
  const BX = 216;
  const stream = el('rect', { x: BX - 3, y: 0, width: 6, height: 0, rx: 3, fill: '#EADFC8', stroke: '#D8C9AA', 'stroke-width': 1 });
  const fill = el('ellipse', { cx: BX, cy: TY - 18, rx: 0, ry: 4, fill: '#EADFC8', stroke: '#D8C9AA', 'stroke-width': 1 });
  const yolk = el('circle', { cx: BX, cy: 0, r: 4.5, fill: pal.yellow });
  const bowl = g({}); tf(bowl, BX, TY - 4);
  el('path', { d: 'M -24 -16 Q -22 4 0 4 Q 22 4 24 -16 Z', fill: pal.blue }, bowl);
  el('ellipse', { cx: 0, cy: -16, rx: 24, ry: 4, fill: pal.blueDark, opacity: 0.4 }, bowl);
  const cake = g({});
  k.shadow(0, 2, 30, 4, cake);
  el('rect', { x: -26, y: -30, width: 52, height: 30, rx: 6, fill: '#F6D7A6' }, cake);
  el('rect', { x: -26, y: -16, width: 52, height: 5, fill: '#fff' }, cake);
  el('path', { d: 'M -27 -30 Q -27 -36 -20 -36 L 20 -36 Q 27 -36 27 -30 Q 22 -24 16 -30 Q 10 -24 4 -30 Q -2 -24 -8 -30 Q -14 -24 -20 -30 Q -24 -26 -27 -30 Z', fill: '#fff' }, cake);
  [-14, 0, 14].forEach((x) => el('circle', { cx: x, cy: -39, r: 5, fill: pal.red }, cake));
  // 粉の袋・卵・へら（手に持つ物）
  const bag = g({});
  el('path', { d: 'M -10 -4 L 10 -4 L 12 30 L -12 30 Z', fill: '#F7EFE0', stroke: pal.woodDark, 'stroke-width': 1.5 }, bag);
  el('rect', { x: -7, y: 8, width: 14, height: 10, rx: 2, fill: pal.coral, opacity: 0.6 }, bag);
  const egg = el('ellipse', { rx: 6, ry: 7.5, fill: '#FFF8EC', stroke: '#E6D6BC' });
  const whisk = g({});
  el('line', { x1: 0, y1: -2, x2: 0, y2: 26, stroke: pal.sub, 'stroke-width': 3, 'stroke-linecap': 'round' }, whisk);
  el('ellipse', { cx: 0, cy: 30, rx: 5, ry: 8, fill: 'none', stroke: pal.sub, 'stroke-width': 2 }, whisk);
  const b = k.buddy({ x: 150, y: FY, facing: 1, scale: 1.1 });
  const sp = [0, 1, 2].map(() => el('path', { d: 'M 0 -6 L 1.6 -1.6 L 6 0 L 1.6 1.6 L 0 6 L -1.6 1.6 L -6 0 L -1.6 -1.6 Z', fill: pal.yellow }));
  return {
    update(t) {
      // 段階：粉 0.2-1.5、卵 1.6-2.3、混ぜる 2.3-3.2、ケーキ 3.3
      const pour = easeInOut(seg(t, 0.3, 0.8)) * (1 - easeInOut(seg(t, 1.3, 1.6)));
      const eggP = seg(t, 1.6, 2.3), stir = seg(t, 2.3, 3.2);
      let armR = 60, lean = 8;
      if (t < 1.6) { P(b, { x: 150, lean: 8 }); const A = reach(b, 1.1, 'R', BX - 6, TY - 62), B = reach(b, 1.1, 'R', 200, TY - 38); armR = t < 1.3 ? lerp(30, A, easeInOut(seg(t, 0.3, 0.8))) : lerp(A, B, easeInOut(seg(t, 1.3, 1.6))); lean = 8; }
      else if (t < 2.3) { const tx = lerp(250, BX, easeInOut(seg(t, 1.75, 2.1))); const lq = 20 * hump(seg(t, 1.6, 2.1)) + 10; P(b, { x: 150, lean: lq }); armR = reach(b, 1.1, 'R', tx, TY - 34); lean = lq; }
      else if (t < 3.25) { P(b, { x: 150, lean: 12 }); armR = reach(b, 1.1, 'R', BX + Math.sin(stir * Math.PI * 8) * 8, TY - 50); lean = 12; }
      else armR = lerp(62, 150, easeOut(seg(t, 3.5, 3.9)));
      P(b, { x: 150, lean: lerp(lean, 0, seg(t, 3.25, 3.5)), armR, armL: t > 3.5 ? lerp(8, 30, easeOut(seg(t, 3.5, 3.9))) : 10, look: 0.6, mood: t > 3.4 ? 'grin' : 'smile' });
      const h = hp(b, 1.1);
      // 袋：持ち上げて傾けて注ぐ
      if (t < 1.6) tf(bag, h.x, h.y + 2, t < 1.3 ? lerp(-15, 128, easeInOut(seg(t, 0.3, 0.8))) : lerp(128, 0, easeInOut(seg(t, 1.3, 1.6))), 1.1);
      else tf(bag, 200, TY - 34, 0, 1.1);
      const on = t > 0.75 && t < 1.3;
      k.set(stream, { y: TY - 66, height: on ? 46 : 0 });
      stream.setAttribute('x', h.x - 3); k.set(stream, { y: h.y + 4, height: on ? TY - 22 - h.y : 0 });
      k.set(fill, { rx: 20 * easeOut(seg(t, 0.8, 1.4)) });
      // 卵：卵ケースから取って、ボウルの上で割る
      egg.setAttribute('opacity', t > 1.85 && eggP < 0.72 ? 1 : 0); egg0.setAttribute('opacity', t > 1.85 ? 0 : 1);
      tf(egg, h.x, h.y, 0);
      const yd = seg(t, 2.1, 2.3);
      k.set(yolk, { cy: lerp(TY - 34, TY - 18, yd), opacity: t > 2.1 && t < 3.3 ? 1 : 0 });
      // 泡立て器
      whisk.setAttribute('opacity', t > 2.3 && t < 3.25 ? 1 : 0);
      tf(whisk, h.x, h.y - 6, Math.sin(stir * Math.PI * 8) * 12);
      if (t > 2.3) k.set(fill, { fill: t > 2.6 ? '#F6E2B8' : '#FBF5EA' });
      // ボウル→ケーキ
      const c = seg(t, 3.25, 3.6);
      bowl.setAttribute('opacity', 1 - c); fill.setAttribute('opacity', 1 - c); if (c > 0) yolk.setAttribute('opacity', 0);
      cake.setAttribute('opacity', c > 0 ? 1 : 0);
      tf(cake, BX + 16, TY - 2, 0, popS(seg(t, 3.25, 3.75)));
      sp.forEach((s, i) => { const q = seg(t, 3.7 + i * 0.12, 4.3); tf(s, BX + 16 + [-36, 34, 2][i], TY - 50 - [0, 10, 30][i], 0, Math.max(0.001, hump(q))); });
    }
  };
}
