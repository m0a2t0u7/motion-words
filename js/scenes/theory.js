// theory：白衣のまめが黒板の仮説の図を見て、ボールを何度も落として確かめ、毎回✓（例文 Scientists tested the theory many times.）
import { seg, lerp, easeInOut, easeOut, easeIn, backOut, hump } from '../ease.js';
import { P, blinkAt } from './run-after.js';
import { roomBg, hp } from './look-over.js';
import { reach } from './dig.js';

export const meta = { duration: 4.4, beats: [[0, '仮説を見る'], [1.4, '何度も落とす'], [3.6, '毎回✓']] };

const CL = 1.35; // 1回ぶんの長さ

export function create(k) {
  const { el, g, tf, pal } = k, S = 0.95;
  const FY = roomBg(k, 'home', 240);
  // 黒板
  el('rect', { x: 196, y: 34, width: 188, height: 108, rx: 6, fill: pal.woodDark });
  el('rect', { x: 202, y: 40, width: 176, height: 96, rx: 3, fill: '#4E7F6C' });
  // 仮説の図：ボールから床へ破線の矢印
  el('circle', { cx: 226, cy: 58, r: 7, fill: '#fff' });
  el('line', { x1: 226, y1: 68, x2: 226, y2: 104, stroke: '#fff', 'stroke-width': 2.4, 'stroke-dasharray': '4 4' });
  el('path', { d: 'M 220 100 L 226 110 L 232 100', fill: 'none', stroke: '#fff', 'stroke-width': 2.6, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' });
  el('line', { x1: 210, y1: 118, x2: 244, y2: 118, stroke: '#fff', 'stroke-width': 2.6, 'stroke-linecap': 'round' });
  k.text(262, 76, '?', { 'font-size': 20, fill: '#FFE9A8' });
  el('line', { x1: 270, y1: 48, x2: 270, y2: 128, stroke: '#fff', 'stroke-width': 1.6, opacity: 0.6 });
  // 結果の列：ボールの印と✓
  const rows = [0, 1, 2].map((i) => {
    const y = 66 + i * 26;
    el('circle', { cx: 292, cy: y, r: 5.5, fill: '#fff' });
    const c = g({}); tf(c, 330, y);
    el('path', { d: 'M -9 0 L -3 7 L 9 -8', fill: 'none', stroke: '#9BF0B5', 'stroke-width': 5, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, c);
    return c;
  });
  const BR = 7;
  const b = k.buddy({ x: 150, y: FY, scale: S });
  P(b, { armR: 130 });
  const BX = hp(b, S, 'R').x + 3;
  el('ellipse', { cx: BX, cy: FY - 1, rx: 12, ry: 3, fill: pal.sub, opacity: 0.35 });
  // 白衣
  const coat = g({}); b.body.insertBefore(coat, b.body.children[4]);
  el('rect', { x: -30, y: -34, width: 60, height: 34, rx: 16, fill: '#fff' }, coat);
  el('path', { d: 'M -4 -34 L 0 -14 L 4 -34 Z', fill: pal.mint }, coat);
  const ball = el('circle', { r: BR, fill: pal.coral, stroke: pal.coralDark, 'stroke-width': 2 });

  return {
    update(t) {
      const c = Math.min(2, Math.floor(t / CL)), u = t - c * CL, last = c === 2;
      P(b, { armR: 130 });
      const H = hp(b, S, 'R'), flr = FY - BR - 1;
      let ar, lean = 0;
      if (!last) {
        const dn = easeInOut(seg(u, 0.85, 1.05)), up = easeInOut(seg(u, 1.1, 1.35));
        P(b, { armR: 70, lean: 12 });
        const aim = reach(b, S, 'R', BX, flr);
        ar = u < 0.85 ? lerp(130, 70, easeOut(seg(u, 0.3, 0.8))) : u < 1.1 ? lerp(70, aim, dn) : lerp(aim, 130, up);
        lean = 12 * (dn - up);
      } else ar = u < 0.8 ? lerp(130, 70, easeOut(seg(u, 0.3, 0.8))) : lerp(70, 20, easeInOut(seg(u, 0.9, 1.3)));
      const fin = t > 3.5;
      P(b, { armR: ar, armL: fin ? lerp(8, 60, easeOut(seg(t, 3.5, 3.9))) : 8, lean, look: 0.5, mood: fin ? 'grin' : 'smile', blink: blinkAt(t) });
      let bx, by;
      if (u < 0.3 || (!last && u >= 1.0)) { const h = hp(b, S, 'R'); bx = h.x + 3; by = h.y - 2; }
      else if (u < 0.7) { bx = H.x + 3; by = lerp(H.y - 2, flr, easeIn(seg(u, 0.3, 0.7))); }
      else { bx = BX; by = flr - 12 * hump(seg(u, 0.7, 0.88)) * (1 - seg(u, 0.88, 1.0)); }
      k.set(ball, { cx: bx, cy: by });
      rows.forEach((r, i) => {
        const p = seg(t, i * CL + 0.85, i * CL + 1.1);
        tf(r, 330, 66 + i * 26, 0, p <= 0 ? 0.001 : backOut(p), p <= 0 ? 0.001 : backOut(p));
        r.setAttribute('opacity', p > 0 ? 1 : 0);
      });
    }
  };
}
