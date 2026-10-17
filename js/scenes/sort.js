// sort：バラバラの書類を日付の順に1・2・3と仕分け棚へ入れていく（例文 Please sort the papers by date.）
import { seg, lerp, easeInOut, easeOut, hump, clamp } from '../ease.js';
import { hp, reach, gait } from './weigh.js';

export const meta = { duration: 5.4, beats: [[0, 'バラバラの書類'], [2.3, '日付順に入れる'], [4.9, '順番に並んだ']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  el('rect', { x: 20, y: 44, width: 76, height: 56, rx: 5, fill: '#DDEFFA', stroke: '#fff', 'stroke-width': 5 });
  // 机（左）と仕分け棚（壁）
  el('rect', { x: 20, y: 196, width: 100, height: 8, rx: 3, fill: pal.woodDark });
  el('rect', { x: 26, y: 204, width: 7, height: FY - 204, fill: pal.woodDark }); el('rect', { x: 108, y: 204, width: 7, height: FY - 204, fill: pal.woodDark });
  k.shadow(70, FY + 1, 54, 4);
  el('rect', { x: 182, y: 128, width: 104, height: 62, rx: 6, fill: '#F0E4D2' });
  const S = 1.1, X = [200, 232, 264], PX = [{ x: 62, a: -14 }, { x: 76, a: 3 }, { x: 90, a: 14 }];
  const NUM = [3, 1, 2];
  const papers = NUM.map((n, i) => {
    const p = g({});
    el('rect', { x: -11, y: -16, width: 22, height: 30, rx: 2.5, fill: '#fff', stroke: '#C9D1DD', 'stroke-width': 1.5 }, p);
    el('rect', { x: -11, y: -16, width: 22, height: 10, rx: 2.5, fill: pal.red }, p);
    k.text(0, -11, String(n), { 'font-size': 10, fill: '#fff' }, p);
    [-2, 3, 8].forEach((y) => el('rect', { x: -7, y, width: 14, height: 2, rx: 1, fill: '#B5BFCE' }, p));
    return p;
  });
  const order = [1, 2, 0]; // 取る順（1,2,3 → papers の添字）
  const b = k.buddy({ x: 125, y: FY, scale: S, facing: -1 });
  // 棚の手前フチ（紙の下側を隠す）
  X.forEach((x) => { el('path', { d: `M ${x - 18} 190 L ${x - 18} 160 L ${x + 18} 160 L ${x + 18} 190 Z`, fill: 'none' }); });
  const lips = X.map((x, i) => { el('rect', { x: x - 15, y: 168, width: 30, height: 22, rx: 3, fill: '#CDB794' }); k.text(x, 179, String(i + 1), { 'font-size': 12, fill: '#fff' }); });
  const T0 = 0.3, CY = 1.25;
  // 歩行位置：取る位置(165) ⇔ 入れる位置
  const bx = (t) => {
    let x = 125;
    for (let i = 0; i < 3; i++) {
      const s = T0 + CY * i, xi = X[i] - 50;
      if (t < s) break;
      x = lerp(i ? X[i - 1] - 50 : 125, 125, easeInOut(seg(t, s, s + 0.3)));
      if (t > s + 0.55) x = lerp(125, xi, easeInOut(seg(t, s + 0.55, s + 0.95)));
    }
    return x;
  };
  return {
    update(t) {
      const gt = gait(bx, t, 125, 12, 0.11);
      let face = -1, aim = null, ph = 'idle', ci = -1;
      for (let i = 0; i < 3; i++) { const s = T0 + CY * i; if (t >= s) { ci = i; } }
      let carry = -1, tgt = null;
      const pos = papers.map((p, i) => ({ x: PX[i].x, y: 182, a: PX[i].a }));
      for (let i = 0; i < 3; i++) {
        const s = T0 + CY * i, pi = order[i], hnd = (u) => null;
        if (t < s) continue;
        const u = t - s;
        if (u < 0.3) { face = -1; }
        else if (u < 0.55) { face = -1; carry = u > 0.45 ? pi : -1; tgt = { x: PX[pi].x, y: 180 }; }
        else if (u < 1.0) { face = 1; carry = pi; tgt = null; }
        else { face = 1; carry = u < 1.12 ? pi : -1; tgt = { x: X[i], y: lerp(140, 152, easeInOut(seg(u, 1.0, 1.12))) }; }
        if (u >= 1.05) pos[pi] = { x: X[i], y: lerp(140, 152, easeOut(seg(u, 1.0, 1.2))), a: 0, done: true };
        if (u >= 1.2) pos[pi] = { x: X[i], y: 152, a: 0, done: true };
        if (carry === pi) pos[pi] = null;
      }
      // 既に入れた紙は固定
      for (let i = 0; i < 3; i++) { const s = T0 + CY * i; if (t >= s + 1.0) pos[order[i]] = { x: X[i], y: lerp(140, 152, easeOut(seg(t - s, 1.0, 1.25))), a: 0 }; }
      b.pose({ armR: 0 });
      const midx = bx(t);
      b.pose({ x: midx, facing: face, walk: gt.walk });
      let arm = gt.armR;
      const i0 = Math.max(ci, 0), s0 = T0 + CY * i0, u = t - s0;
      if (t >= s0) {
        const pi = order[i0];
        if (u < 0.3) arm = gt.armR;
        else if (u < 0.55) arm = reach(b, S, 'R', PX[pi].x, 182);
        else if (u < 1.0) arm = lerp(reach(b, S, 'R', PX[pi].x + 0, 182), 70, easeOut(seg(u, 0.55, 0.8)));
        else arm = lerp(70, reach(b, S, 'R', X[i0], 140), easeInOut(seg(u, 1.0, 1.1)));
        if (u > 1.2) arm = lerp(reach(b, S, 'R', X[i0], 140), 8, easeInOut(seg(u, 1.2, 1.3)));
      }
      const done = t > T0 + CY * 2 + 1.3;
      if (done) b.pose({ x: lerp(bx(t), 140, easeInOut(seg(t, T0 + CY * 2 + 1.3, T0 + CY * 2 + 1.7))) });
      b.pose({ armR: arm, armL: done ? 8 : gt.armL, lean: 3 * gt.m, mood: done ? 'grin' : 'smile', look: 0.4 * face * 0 + 0.3 });
      const hand = hp(b, S, 'R', 30);
      papers.forEach((p, i) => {
        if (pos[i]) tf(p, pos[i].x, pos[i].y, pos[i].a); else tf(p, hand.x, hand.y - 6, 0);
      });
    }
  };
}
