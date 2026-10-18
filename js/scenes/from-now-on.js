// from now on：これまでの日は寝坊（太陽が高い）。今日、目覚ましを6時に合わせて決意→この先の日に早起きの印が並ぶ（例文 From now on, I'll get up early.）
import { seg, lerp, easeInOut, easeOut, hump, wobble } from '../ease.js';
import { P, blinkAt, clock } from './run-after.js';
import { roomBg } from './look-over.js';
import { hp } from './dig.js';
import { days, popS } from './from-scratch.js';

// 太陽（高い＝寝坊 / 地平線＝早起き）
function sunIcon(k, parent, early) {
  const g = k.g({}, parent);
  if (early) {
    k.el('path', { d: 'M -9 2 A 9 9 0 0 1 9 2 Z', fill: k.pal.yellow }, g);
    k.el('line', { x1: -12, y1: 3, x2: 12, y2: 3, stroke: k.pal.coralDark, 'stroke-width': 2, 'stroke-linecap': 'round' }, g);
  } else {
    k.el('circle', { cx: 0, cy: -2, r: 5, fill: k.pal.yellow, opacity: 0.6 }, g);
    k.text(0, 4, 'z', { 'font-size': 11, fill: k.pal.sub }, g);
  }
  return g;
}

export const meta = { duration: 4.4, beats: [[0, 'これまで寝坊'], [1.0, '6時に合わせる'], [2.9, 'これからは毎日']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = roomBg(k, 'home', 240);
  // ベッド
  k.shadow(300, FY + 1, 70, 5);
  el('rect', { x: 230, y: FY - 70, width: 12, height: 70, rx: 4, fill: pal.woodDark });
  el('rect', { x: 236, y: FY - 34, width: 140, height: 24, rx: 6, fill: pal.wood });
  el('rect', { x: 240, y: FY - 46, width: 134, height: 16, rx: 8, fill: '#fff' });
  el('rect', { x: 280, y: FY - 48, width: 96, height: 18, rx: 8, fill: pal.blue });
  el('ellipse', { cx: 258, cy: FY - 50, rx: 16, ry: 8, fill: '#fff', stroke: pal.line });
  el('rect', { x: 200, y: FY - 74, width: 44, height: 6, rx: 3, fill: pal.woodDark });
  // 目覚まし時計（手で持つ）
  const C = clock(k, 0, 0, 15);
  const bellL = el('circle', { cx: -11, cy: -15, r: 5, fill: pal.coral }, C.g);
  el('circle', { cx: 11, cy: -15, r: 5, fill: pal.coral }, C.g);
  const b = k.buddy({ x: 150, y: FY, facing: 1 });
  // カレンダー：これまで3日（寝坊）・今日・これから4日
  const D = days(k, 70, 18, 8, 30, 26);
  [0, 1, 2].forEach((i) => tf(sunIcon(k, D.cells[i], false), 15, 16));
  const fut = [4, 5, 6, 7].map((i) => { const s = sunIcon(k, D.cells[i], true); return s; });
  const today = sunIcon(k, D.cells[3], true);
  const arrow = el('path', { d: 'M 0 0 L 118 0 M 110 -6 L 118 0 L 110 6', stroke: pal.green, 'stroke-width': 3, fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' });
  const greyPast = el('rect', { x: 66, y: 14, width: 106, height: 34, rx: 6, fill: '#AAB3C2', opacity: 0.25 });
  return {
    update(t) {
      D.hi(t < 0.5 ? lerp(0, 2, seg(t, 0, 0.5)) : 3);
      const set = seg(t, 1.0, 2.0);
      const up = easeOut(seg(t, 0.6, 1.0)) * (1 - easeInOut(seg(t, 2.0, 2.4)));
      const fist = easeOut(seg(t, 2.4, 2.8));
      P(b, { x: 150, armR: lerp(30, 70, up), armL: lerp(8, 160, fist) - 10 * hump(seg(t, 2.8, 3.2)), look: up > 0.2 ? 0.5 : 0.3, mood: t > 2.4 ? 'grin' : t < 0.8 ? 'flat' : 'smile', lean: up * 4, squash: 1 - 0.05 * hump(seg(t, 2.6, 3.0)), blink: blinkAt(t) });
      const h = hp(b, 1);
      // 時計：ベッド脇の台→手の上で針を6時に→台へ戻す
      const rest = { x: 222, y: FY - 89 };
      const cx = up > 0 ? lerp(rest.x, h.x + 4, up) : rest.x, cy = up > 0 ? lerp(rest.y, h.y - 16, up) : rest.y;
      tf(C.g, cx, cy, 0, lerp(1, 1.3, up));
      const tm = lerp(540, 360, easeInOut(set));
      C.set(Math.floor(tm / 60), tm % 60);
      tf(today, 15, 16, 0, popS(seg(t, 2.0, 2.3)));
      fut.forEach((f, i) => tf(f, 15, 16, 0, popS(seg(t, 2.9 + i * 0.25, 3.2 + i * 0.25))));
      k.set(arrow, { transform: `translate(${70 + 3 * 34 + 15} 54) scale(${Math.max(0.001, easeOut(seg(t, 2.8, 3.8)))} 1)` });
      greyPast.setAttribute('opacity', 0.25 * seg(t, 0.5, 0.9));
    }
  };
}
