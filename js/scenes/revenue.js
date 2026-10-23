// revenue：会社の収益が前の年より伸びた。去年の棒より今年の棒が高く伸び、コインが積み上がる（例文 The company's revenue grew last year.）
import { seg, lerp, easeOut, easeInOut, backOut, hump } from '../ease.js';
import { blinkAt, coin } from './run-after.js';
import { roomBg } from './look-over.js';
import { reach } from './dig.js';

export const meta = { duration: 4.0, beats: [[0, '前の年'], [1.2, '今年へ伸びる'], [3.0, '収益が増えた']] };
const EF = '"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif';

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = roomBg(k, 'office', 240);
  const b = k.buddy({ x: 70, y: FY, scale: 0.95 });
  el('rect', { x: 140, y: 40, width: 230, height: 190, rx: 10, fill: '#fff', stroke: pal.line, 'stroke-width': 3 });
  el('line', { x1: 156, y1: 205, x2: 354, y2: 205, stroke: pal.sub, 'stroke-width': 3, 'stroke-linecap': 'round' });
  const bld = g({}); tf(bld, 255, 70); k.text(0, 0, '🏢', { 'font-size': 26, 'font-family': EF, 'text-anchor': 'middle', 'dominant-baseline': 'central' }, bld);
  const r1 = el('rect', { x: 180, y: 205, width: 50, height: 0, rx: 5, fill: pal.blue });
  const r2 = el('rect', { x: 280, y: 205, width: 50, height: 0, rx: 5, fill: pal.mint });
  const ar = el('path', { d: 'M 236 130 Q 262 100 292 92', fill: 'none', stroke: pal.green, 'stroke-width': 5, 'stroke-linecap': 'round', opacity: 0 });
  const ah = el('path', { d: 'M 284 82 L 298 90 L 286 100', fill: 'none', stroke: pal.green, 'stroke-width': 5, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', opacity: 0 });
  const coins = [0, 1, 2, 3, 4].map(() => coin(k, g({})));
  return {
    update(t) {
      const q1 = easeOut(seg(t, 0.3, 1.1)), q2 = easeOut(seg(t, 1.6, 2.8)), h2 = 125 * q2;
      k.set(r1, { y: 205 - 60 * q1, height: 60 * q1 });
      k.set(r2, { y: 205 - h2, height: h2 });
      ar.setAttribute('opacity', seg(t, 2.4, 2.8)); ah.setAttribute('opacity', seg(t, 2.6, 2.9));
      coins.forEach((c, i) => {
        const p = seg(t, 2.6 + i * 0.18, 3.1 + i * 0.18);
        tf(c, 296 + (i % 2) * 10 - 5, lerp(70, 205 - h2 - 8 - Math.floor(i / 2) * 11, p * p), 0, p > 0 ? 1 : 0);
      });
      const pt = easeInOut(seg(t, 3.0, 3.6));
      const o = { armL: 8, armR: 10, lean: 4 * pt, mood: t > 3 ? 'grin' : 'smile', blink: blinkAt(t), look: 0.7, squash: 1, walk: 0, lift: 0 };
      b.pose(o); b.pose({ ...o, armR: lerp(10, reach(b, 0.95, 'R', 250, 120), pt) });
    }
  };
}
