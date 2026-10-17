// run out of：牛乳パックから注ぐと流れが細くなり、ついに何も出なくなる（例文 We've run out of milk.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';

const R = 4.6 / 4.4; // 内部の時間割は 4.6 秒分。表示は 4.4 秒に収める
export const meta = { duration: 4.4, beats: [[0, '注ぐ'], [1.8, '少なくなる'], [3.0, '空っぽ']].map(([a, n]) => [+(a / R).toFixed(2), n]) };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  // 台所：冷蔵庫、壁の棚
  el('rect', { x: 14, y: 46, width: 74, height: 192, rx: 10, fill: '#DCE9F5' });
  el('line', { x1: 14, y1: 108, x2: 88, y2: 108, stroke: '#B9CDE0', 'stroke-width': 3 });
  el('rect', { x: 74, y: 62, width: 5, height: 30, rx: 2.5, fill: '#9FB4CB' });
  el('rect', { x: 74, y: 124, width: 5, height: 44, rx: 2.5, fill: '#9FB4CB' });
  el('circle', { cx: 40, cy: 150, r: 7, fill: pal.coral });
  el('rect', { x: 290, y: 66, width: 100, height: 7, rx: 3, fill: pal.woodDark });
  el('rect', { x: 300, y: 42, width: 18, height: 24, rx: 5, fill: pal.mint });
  el('rect', { x: 326, y: 50, width: 16, height: 16, rx: 4, fill: pal.yellow });
  el('rect', { x: 352, y: 38, width: 20, height: 28, rx: 5, fill: pal.coral });
  // カウンター
  const CX = 270, CT = 212, CS = 1.35, S = 1.1;
  el('rect', { x: 214, y: CT, width: 220, height: 40, fill: pal.woodDark });
  el('rect', { x: 214, y: CT, width: 220, height: 11, rx: 3, fill: pal.wood });
  el('rect', { x: 230, y: CT + 16, width: 90, height: 20, rx: 4, fill: '#FFFFFF', opacity: 0.25 });
  // コップ（原点＝底の中央、内側の深さ 26）
  const cup = g({});
  const CUPH = 30;
  el('rect', { x: -15, y: -CUPH, width: 30, height: CUPH, rx: 6, fill: '#D5EAF7', stroke: '#9FC4DD', 'stroke-width': 2.5 }, cup);
  const milk = el('rect', { x: -12, y: -3, width: 24, height: 0, rx: 3, fill: '#FFFFFF', stroke: '#C9DAE8', 'stroke-width': 1.5 }, cup);
  el('rect', { x: -10, y: -CUPH + 5, width: 4, height: 16, rx: 2, fill: '#FFFFFF', opacity: 0.6 }, cup);
  tf(cup, CX, CT + 1, 0, CS, CS);
  const cupSh = k.shadow(CX, CT + 3, 26, 4);
  cup.parentNode.insertBefore(cupSh, cup);

  // 牛乳パック（原点＝中心）
  const carton = g({});
  const cr = g({}, carton);
  el('rect', { x: -15, y: -22, width: 30, height: 44, rx: 3, fill: pal.blue }, cr);
  el('path', { d: 'M -15 -22 L -9 -35 L 9 -35 L 15 -22 Z', fill: pal.blueDark, 'stroke-linejoin': 'round' }, cr);
  el('rect', { x: 9, y: -38, width: 8, height: 5, rx: 1.5, fill: '#FFFFFF', transform: 'rotate(8 13 -35)' }, cr);
  el('path', { d: 'M 3 -12 Q 10 -2 3 3 Q -4 -2 3 -12 Z', fill: '#FFFFFF' }, cr);
  el('rect', { x: -13, y: -17, width: 9, height: 35, rx: 3.5, fill: '#EAF3FD' }, cr);
  const gauge = el('rect', { x: -12, y: 17, width: 7, height: 0, rx: 2.5, fill: '#FFFFFF', stroke: '#9FC4DD', 'stroke-width': 1 }, cr);

  const b = k.buddy({ x: 140, y: FY, scale: S });
  const bub = g({});
  el('path', { d: 'M -10 20 L -2 32 L 8 20 Z', fill: '#FFFFFF', stroke: pal.line, 'stroke-width': 2, 'stroke-linejoin': 'round' }, bub);
  el('rect', { x: -38, y: -22, width: 76, height: 44, rx: 22, fill: '#FFFFFF', stroke: pal.line, 'stroke-width': 2 }, bub);
  el('rect', { x: -12, y: 18, width: 22, height: 6, fill: '#FFFFFF' }, bub);
  el('path', { d: 'M -24 -10 L -18 -16 L -10 -16 L -6 -10 L -6 12 L -24 12 Z', fill: 'none', stroke: pal.sub, 'stroke-width': 2.4, 'stroke-dasharray': '4 3', 'stroke-linejoin': 'round' }, bub);
  k.text(18, 1, '0', { 'font-size': 26, fill: pal.coralDark }, bub);
  const stream = g({});
  const sOut = el('path', { d: '', stroke: '#C9DAE8', fill: 'none', 'stroke-linecap': 'round' }, stream);
  const sIn = el('path', { d: '', stroke: '#FFFFFF', fill: 'none', 'stroke-linecap': 'round' }, stream);
  const drops = [0, 1, 2].map(() => el('path', { d: 'M 0 -6 Q 4.5 1 0 4.5 Q -4.5 1 0 -6 Z', fill: '#FFFFFF', stroke: '#C9DAE8', 'stroke-width': 1.5 }));

  const flowW = (t) => (t < 0.95 ? 0 : t < 1.1 ? 6.5 * easeOut(seg(t, 0.95, 1.1)) : t < 1.7 ? 6.5 : t < 2.4 ? lerp(6.5, 1.8, easeInOut(seg(t, 1.7, 2.4))) : 0);
  const DT = [2.45, 2.95, 3.35];

  return {
    update(tt) {
      const t = tt * R;
      // 傾きと腕
      const tilt = 70 * easeInOut(seg(t, 0.35, 1.0)) + 32 * easeInOut(seg(t, 1.9, 2.8)) + 14 * easeInOut(seg(t, 2.8, 3.1));
      const shake = t > 3.0 && t < 3.9 ? Math.sin((t - 3.0) * 26) * 9 * (1 - seg(t, 3.5, 3.9)) : 0;
      const down = easeInOut(seg(t, 3.85, 4.4));
      const th = tilt + shake - down * 50;
      const arm = lerp(80, 148, easeInOut(seg(t, 0.35, 1.0))) + 18 * easeInOut(seg(t, 2.8, 3.1)) - down * 66;
      const pourX = CX;
      // 注ぎ口が真上に来るよう、まめの x を少し調整
      const place = (x) => {
        b.pose({ x, armR: arm, armL: 8, lean: 3 + 4 * easeInOut(seg(t, 0.35, 1.0)) - down * 6, mood: t < 2.7 ? 'smile' : t < 3.9 ? 'flat' : 'sad', look: 0.5 - down * 0.5 });
        const h = b.handPos('R');
        const r = (th * Math.PI) / 180;
        const sp = { x: h.x + (13 * Math.cos(r) + 33 * Math.sin(r)) * S, y: h.y + (13 * Math.sin(r) - 33 * Math.cos(r)) * S };
        return { h, sp };
      };
      let x = 140, o = place(x);
      const adj = easeInOut(seg(t, 0.4, 1.0)) * (1 - easeInOut(seg(t, 3.6, 4.2)));
      x = 140 + (pourX - 4 - o.sp.x) * adj;
      o = place(x);
      const bp = easeOut(seg(t, 3.3, 3.7));
      tf(bub, x + 4, 96, 0, bp, bp);
      tf(carton, o.h.x, o.h.y, th, S, S);
      // パックの残量ゲージ
      const lv = t < 0.95 ? 1 : lerp(1, 0.14, easeInOut(seg(t, 0.95, 2.3))) * (1 - easeInOut(seg(t, 2.35, 2.9))) + 0;
      k.set(gauge, { height: 33 * lv, y: 17 - 33 * lv });
      // コップの水位（満杯にはならない）
      let lvl = 14 * (0.9 * easeOut(seg(t, 1.0, 2.2)) + 0.1 * seg(t, 2.2, 2.5));
      const surf = 3 + lvl;
      k.set(milk, { height: lvl, y: -3 - lvl });
      // 流れ
      const w = flowW(t);
      const sx = o.sp.x, sy = o.sp.y;
      const ey = CT - surf * CS;
      if (w > 0.1) {
        const d = `M ${sx} ${sy} Q ${sx + 5} ${sy + (ey - sy) * 0.35} ${pourX} ${ey}`;
        k.set(sOut, { d, 'stroke-width': w * 1.3 + 2.4 });
        k.set(sIn, { d, 'stroke-width': w * 1.3 });
      } else {
        k.set(sOut, { d: '' }); k.set(sIn, { d: '' });
      }
      // しずく（最後の数滴）
      drops.forEach((dr, i) => {
        const p = seg(t, DT[i], DT[i] + 0.3);
        const on = p > 0 && p < 1 && i < 2 || (i === 2 && false);
        if (on) {
          const gx = lerp(sx, pourX, easeIn2(p));
          tf(dr, gx, lerp(sy, ey, p * p), 0, 0.5 + 0.5 * (1 - i * 0.2), 0.7 + 0.3 * p);
          dr.setAttribute('opacity', 1);
        } else if (i === 2 && t > DT[2] && t < DT[2] + 0.4) {
          // 3回目はふくらんで落ちずに止まる（もう出ない）
          const q = seg(t, DT[2], DT[2] + 0.25);
          tf(dr, sx, sy + 4, 0, 0.4 + q * 0.5, 0.4 + q * 0.7);
          dr.setAttribute('opacity', 1 - seg(t, DT[2] + 0.25, DT[2] + 0.4));
        } else dr.setAttribute('opacity', 0);
      });
    }
  };
}
const easeIn2 = (p) => p;
