// on the mend：病気で寝ている父。日がたつにつれ熱のグラフが下がり、ベッドで起き上がって笑顔に（まだ寝床の中）（My dad is sick, but he's on the mend.）
import { seg, lerp, easeInOut, easeOut, hump, clamp } from '../ease.js';
import { roomBg } from './look-over.js';
import { P, blinkAt, calendar } from './so-far-so-good.js';

export const meta = { duration: 4.4, beats: [[0, '病気で寝ている'], [1.6, '熱が下がる'], [3.2, '起き上がれた']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = roomBg(k, 'home', 240);
  // 体温グラフ（壁）
  el('rect', { x: 236, y: 30, width: 130, height: 84, rx: 6, fill: '#fff', stroke: pal.line, 'stroke-width': 2 });
  el('line', { x1: 250, y1: 102, x2: 356, y2: 102, stroke: pal.sub, 'stroke-width': 2 });
  el('line', { x1: 250, y1: 102, x2: 250, y2: 40, stroke: pal.sub, 'stroke-width': 2 });
  el('line', { x1: 250, y1: 82, x2: 356, y2: 82, stroke: pal.green, 'stroke-width': 1.5, 'stroke-dasharray': '4 4', opacity: 0.7 });
  const pts = [[258, 46], [282, 50], [306, 62], [330, 74], [350, 80]];
  const line = el('polyline', { points: pts.map((p) => p.join(',')).join(' '), fill: 'none', stroke: pal.red, 'stroke-width': 3, 'stroke-linejoin': 'round', 'stroke-linecap': 'round', 'stroke-dasharray': 120, 'stroke-dashoffset': 120 });
  const dot = el('circle', { r: 4.5, fill: pal.red });
  const cal = calendar(k, 172, 50, 40);
  // ベッド
  const BT = FY - 40;
  k.shadow(250, FY + 1, 130, 5);
  el('rect', { x: 116, y: BT - 56, width: 12, height: 96, rx: 4, fill: pal.woodDark });
  el('ellipse', { cx: 156, cy: BT - 8, rx: 26, ry: 11, fill: '#fff', stroke: pal.line, 'stroke-width': 2 });
  const hold = g({});
  const D = k.buddy({ parent: hold, x: 0, y: 0, color: pal.coral, dark: pal.coralDark });
  const ice = el('rect', { x: -18, y: -92, width: 36, height: 10, rx: 4, fill: '#BFE3F5', stroke: pal.blue, 'stroke-width': 1.5 }, D.body);
  D.g.children[0].setAttribute('opacity', 0);
  el('path', { d: `M 196 ${BT + 4} Q 198 ${BT - 40} 232 ${BT - 42} L 372 ${BT - 38} L 372 ${BT + 4} Z`, fill: pal.blue });
  el('rect', { x: 120, y: BT, width: 256, height: 30, rx: 5, fill: '#fff', stroke: pal.line, 'stroke-width': 2 });
  el('rect', { x: 372, y: BT - 40, width: 12, height: 80, rx: 4, fill: pal.woodDark });
  [124, 364].forEach((x) => el('rect', { x, y: BT + 30, width: 10, height: 10, fill: pal.woodDark }));
  const G = k.buddy({ x: 64, y: FY, scale: 0.72 });
  return {
    update(t) {
      const day = Math.min(3, 1 + Math.floor(seg(t, 0.6, 2.9) * 2.999));
      cal.set(String(day), hump(seg((t - 0.6) % 1.1, 0.9, 1.1)) * (t > 0.6 && t < 2.9 ? 1 : 0));
      const L = easeInOut(seg(t, 0.4, 2.9));
      line.setAttribute('stroke-dashoffset', 120 * (1 - L));
      const i = Math.min(3, Math.floor(L * 4)), f = L * 4 - i, a = pts[i], b = pts[Math.min(4, i + 1)];
      tf(dot, lerp(a[0], b[0], f), lerp(a[1], b[1], f));
      const col = L < 0.75 ? pal.red : pal.green; line.setAttribute('stroke', col); dot.setAttribute('fill', col);
      const up = easeInOut(seg(t, 2.8, 3.6));
      tf(hold, 250 + 10 * up, BT - 8 + 6 * up, lerp(-84, -8, up));
      ice.setAttribute('opacity', t < 3.0 ? 1 : 0);
      P(D, { mood: t < 2.4 ? 'sad' : t < 3.4 ? 'flat' : 'grin', blink: t < 1.4 ? 0.7 : blinkAt(t), look: up * 0.5,
        armR: lerp(8, 100, easeOut(seg(t, 3.5, 4.0))), armL: 8, squash: 1 + 0.02 * Math.sin(t * 3) * (1 - up) });
      P(G, { facing: 1, look: 0.7, mood: t > 3.4 ? 'grin' : 'flat', lift: 8 * hump(seg(t, 3.5, 3.9)), armL: 8, armR: 8 + 120 * hump(seg(t, 3.5, 4.2)), blink: blinkAt(t, 1) });
    }
  };
}
