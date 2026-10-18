// put together：二人で板を1枚ずつはめて、ばらばらの部品から棚を組み立てる。時計は1時間進む（例文 We put together the shelf in an hour.）
import { seg, lerp, easeInOut, easeOut, wobble, clamp } from '../ease.js';
import { reach } from './dig.js';

export const meta = { duration: 4.4, beats: [[0, 'ばらばらの部品'], [1.6, '組み立てる'], [3.6, '棚ができた']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 240, mood: 'indoor' });
  // 壁時計：長針が1周
  el('circle', { cx: 340, cy: 70, r: 24, fill: '#fff', stroke: pal.ink, 'stroke-width': 3 });
  const hh = el('line', { x1: 340, y1: 70, x2: 340, y2: 58, stroke: pal.ink, 'stroke-width': 3.2, 'stroke-linecap': 'round' });
  const mh = el('line', { x1: 340, y1: 70, x2: 340, y2: 52, stroke: pal.ink, 'stroke-width': 2.2, 'stroke-linecap': 'round' });
  // 部品：床に寝かせた状態→棚の位置へ（中心座標）
  const CX = 200;
  const P = [
    { w: 10, h: 110, from: [96, FY - 5, 90], to: [CX - 50, FY - 55, 0] },   // 左側板
    { w: 10, h: 110, from: [300, FY - 5, 90], to: [CX + 50, FY - 55, 0] },  // 右側板
    { w: 110, h: 8, from: [120, FY - 14, 0], to: [CX, FY - 6, 0] },           // 底板
    { w: 110, h: 8, from: [280, FY - 14, 0], to: [CX, FY - 56, 0] },          // 中板
    { w: 110, h: 8, from: [200, FY - 4, 0], to: [CX, FY - 106, 0] }           // 天板
  ];
  const parts = P.map((p) => ({ ...p, n: el('rect', { x: -p.w / 2, y: -p.h / 2, width: p.w, height: p.h, rx: 2, fill: p.w > 20 ? pal.wood : pal.woodDark, stroke: pal.woodDark, 'stroke-width': 1 }) }));
  const sh = k.shadow(CX, FY + 1, 60, 4);
  const A = k.buddy({ x: 100, y: FY, scale: 0.8 });
  const C = k.buddy({ x: 300, y: FY, scale: 0.8, facing: -1, color: pal.coral, dark: pal.coralDark });
  const T = [0.3, 0.9, 1.5, 2.1, 2.7];
  return {
    update(t) {
      let aA = 12, aC = 12, lA = 0, lC = 0;
      parts.forEach((p, i) => {
        const u = easeInOut(seg(t, T[i], T[i] + 0.5));
        const x = lerp(p.from[0], p.to[0], u), y = lerp(p.from[1], p.to[1], u) - 30 * Math.sin(u * Math.PI);
        const snap = wobble(seg(t, T[i] + 0.5, T[i] + 0.8), 3, 6);
        tf(p.n, x, y + snap * 1.5, lerp(p.from[2], p.to[2], u));
        const active = t > T[i] - 0.15 && t < T[i] + 0.6;
        if (active) {
          const who = i % 2 ? C : A;
          const hx = x + (i % 2 ? p.w / 2 * (p.w > 20 ? 1 : 0) : -p.w / 2 * (p.w > 20 ? 1 : 0)), hy = y;
          const a = reach(who, 0.8, 'R', hx, hy);
          if (i % 2) { aC = a; lC = 12; } else { aA = a; lA = 12; }
        }
      });
      const done = t > 3.4;
      A.pose({ armR: done ? lerp(12, 140, easeOut(seg(t, 3.4, 3.8))) : aA, armL: done ? lerp(12, 140, easeOut(seg(t, 3.4, 3.8))) : 12, lean: lA, mood: done ? 'grin' : 'flat', look: 0.6 });
      C.pose({ armR: done ? lerp(12, 140, easeOut(seg(t, 3.4, 3.8))) : aC, armL: done ? lerp(12, 140, easeOut(seg(t, 3.4, 3.8))) : 12, lean: lC, mood: done ? 'grin' : 'flat', look: 0.6 });
      const h = easeInOut(seg(t, 0.2, 3.3));
      const ma = h * Math.PI * 2, ha = h * Math.PI / 6;
      k.set(mh, { x2: 340 + Math.sin(ma) * 18, y2: 70 - Math.cos(ma) * 18 });
      k.set(hh, { x2: 340 + Math.sin(ha) * 12, y2: 70 - Math.cos(ha) * 12 });
    }
  };
}
