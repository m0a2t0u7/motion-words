// as usual：相手が待つ部屋。9時を過ぎてから彼が慌てて駆け込む。カレンダーのこれまでの日にも同じ遅刻の印（例文 He was late as usual.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';
import { P, blinkAt, clock, run } from './run-after.js';
import { officeBg } from './get-on-with.js';
import { door } from './queue-up.js';
import { days, popS } from './from-scratch.js';

// 遅刻の印（赤い時計）
export function lateMark(k, parent) {
  const g = k.g({}, parent);
  k.el('circle', { r: 7, fill: '#fff', stroke: k.pal.red, 'stroke-width': 2.4 }, g);
  k.el('path', { d: 'M 0 -4 L 0 0 L 3.5 2', stroke: k.pal.red, 'stroke-width': 2, fill: 'none', 'stroke-linecap': 'round' }, g);
  return g;
}

export const meta = { duration: 4.4, beats: [[0, '待っている'], [1.9, '遅れて来る'], [3.4, 'いつも通り']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = officeBg(k, 236, 40);
  const C = clock(k, 200, 60, 20);
  // ドア（右）
  el('rect', { x: 300, y: FY - 122, width: 74, height: 122, fill: '#E9EEF4' });
  const mid = g({});
  const b = k.buddy({ x: 340, y: FY, facing: -1, parent: mid });
  const D = door(k, { x: 300, y: FY - 122, w: 74, h: 122, hinge: 'R', color: pal.blue });
  el('rect', { x: 294, y: FY - 128, width: 86, height: 6, rx: 2, fill: pal.woodDark });
  // テーブルと待つ人
  const c = k.buddy({ x: 110, y: FY, facing: 1, color: pal.coral, dark: pal.coralDark });
  k.shadow(170, FY + 1, 40, 4);
  el('rect', { x: 130, y: FY - 50, width: 80, height: 8, rx: 3, fill: pal.wood });
  el('rect', { x: 166, y: FY - 42, width: 8, height: 42, fill: pal.woodDark });
  el('rect', { x: 150, y: FY - 58, width: 22, height: 8, rx: 2, fill: '#fff', stroke: pal.line });
  const Dd = days(k, 250, 160 - 140, 4, 30, 26);
  [0, 1, 2].forEach((i) => tf(lateMark(k, Dd.cells[i]), 15, 16));
  const today = lateMark(k, Dd.cells[3]);
  const sweat = el('path', { d: 'M 0 -6 Q 4 0 0 4 Q -4 0 0 -6 Z', fill: pal.water });
  return {
    update(t) {
      Dd.hi(3);
      const tm = 540 + 18 * easeInOut(seg(t, 0.2, 2.0)) + 2 * seg(t, 2.0, 4.4);
      C.set(Math.floor(tm / 60), tm % 60);
      const op = easeInOut(seg(t, 1.8, 2.2));
      D.set(op);
      const xf = (tt) => lerp(338, 250, easeOut(seg(tt, 2.0, 2.9)));
      const r = run(xf, t, 338, -1);
      mid.setAttribute('opacity', t > 1.85 ? 1 : 0);
      const bow = easeInOut(seg(t, 3.0, 3.4)) * (1 - easeInOut(seg(t, 3.9, 4.3)));
      P(b, { ...r, facing: -1, lean: t > 2.9 ? 22 * bow : r.lean, armL: t > 2.9 ? 10 : r.armL, armR: t > 2.9 ? 10 + 160 * bow * 0 : r.armR, mood: t > 2.9 ? 'flat' : 'open', look: -0.3, squash: 1 - 0.05 * hump(seg(t, 2.85, 3.1)) });
      tf(sweat, r.x - 24, FY - 90 + 8 * ((t * 1.5) % 1));
      sweat.setAttribute('opacity', t > 2.1 ? 1 - ((t * 1.5) % 1) * 0.5 : 0);
      // 待つ人：時計を見る→ため息
      const sigh = easeOut(seg(t, 3.1, 3.6));
      P(c, { x: 110, facing: 1, look: t < 1.8 ? 0.2 : 0.9, lean: t < 1.8 ? -3 : 0, mood: t > 3.1 ? 'flat' : 'flat', armL: lerp(8, 50, sigh), armR: lerp(8 + 6 * Math.max(0, Math.sin(t * 6)) * (t < 1.8 ? 1 : 0), 60, sigh), squash: 1 - 0.04 * hump(seg(t, 3.1, 3.7)), blink: blinkAt(t) });
      c.body.children[3].setAttribute('transform', `translate(${(t < 1.8 ? 2 : 6).toFixed(2)} ${(t < 1.8 ? -8 * hump(seg(t % 1.6, 0.3, 1.2)) : 0).toFixed(2)})`);
      tf(today, 15, 16, 0, popS(seg(t, 3.5, 3.9)));
    }
  };
}
