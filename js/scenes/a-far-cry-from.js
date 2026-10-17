// a far cry from：写真の素敵な部屋と、実際の部屋がまったく違う（This room is a far cry from the photos.）
import { seg, lerp, easeInOut, easeOut, easeIn, backOut, smooth, wobble, hump, clamp } from '../ease.js';

export const meta = { duration: 4.0, beats: [[0, '写真と部屋'], [1.4, '離れていく'], [3.0, '大きくかけ離れ']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 252, mood: 'indoor' });
  const W = 120, Hh = 110;
  // 写真の部屋（きれい）
  const photo = g({});
  el('rect', { x: 4, y: 4, width: W, height: Hh, rx: 8, fill: pal.shadow }, photo);
  el('rect', { width: W, height: Hh, rx: 8, fill: '#fff', stroke: '#fff', 'stroke-width': 6 }, photo);
  const pc = k.clip((c) => el('rect', { width: W, height: Hh, rx: 6 }, c));
  const pin = g({ 'clip-path': pc }, photo);
  el('rect', { width: W, height: Hh, fill: '#FFF3D6' }, pin);
  el('rect', { y: 82, width: W, height: 30, fill: '#EBCB9E' }, pin);
  el('rect', { x: 14, y: 16, width: 40, height: 34, rx: 4, fill: '#BFE3FA' }, pin);
  el('circle', { cx: 44, cy: 26, r: 8, fill: pal.yellow }, pin);
  el('rect', { x: 36, y: 56, width: 66, height: 26, rx: 10, fill: pal.mint }, pin);
  el('rect', { x: 34, y: 66, width: 12, height: 22, rx: 6, fill: pal.mintDark }, pin);
  el('rect', { x: 92, y: 66, width: 12, height: 22, rx: 6, fill: pal.mintDark }, pin);
  el('rect', { x: 100, y: 20, width: 12, height: 22, rx: 3, fill: pal.violet }, pin);
  el('circle', { cx: 106, cy: 82, r: 11, fill: pal.green }, pin);
  [[20, 62], [84, 22]].forEach(([x, y], i) => el('path', { d: 'M ' + x + ' ' + (y - 7) + ' L ' + (x + 2) + ' ' + y + ' L ' + (x + 9) + ' ' + (y + 2) + ' L ' + (x + 2) + ' ' + (y + 4) + ' L ' + x + ' ' + (y + 11) + ' L ' + (x - 2) + ' ' + (y + 4) + ' L ' + (x - 9) + ' ' + (y + 2) + ' L ' + (x - 2) + ' ' + y + ' Z', fill: '#fff' }, pin));
  // 実際の部屋（ぼろぼろ）
  const real = g({});
  el('rect', { x: 4, y: 4, width: W, height: Hh, rx: 4, fill: pal.shadow }, real);
  el('rect', { width: W, height: Hh, rx: 4, fill: '#B9BEC7' }, real);
  el('rect', { y: 84, width: W, height: 26, fill: '#9AA0AB' }, real);
  el('rect', { x: 14, y: 16, width: 24, height: 22, rx: 3, fill: '#8E97A6' }, real);
  el('path', { d: 'M 66 0 L 62 24 L 72 40 L 66 60', fill: 'none', stroke: '#7B828E', 'stroke-width': 3, 'stroke-linejoin': 'round' }, real);
  el('rect', { x: 70, y: 70, width: 36, height: 18, rx: 4, fill: '#8A8F9A' }, real);
  el('ellipse', { cx: 30, cy: 94, rx: 14, ry: 5, fill: '#7B828E' }, real);
  el('path', { d: 'M 90 8 q 8 14 2 24 q 10 -2 12 -18 Z', fill: '#A6A19A' }, real);
  el('circle', { cx: 50, cy: 70, r: 9, fill: '#7B828E' }, real);
  const arrow = g({});
  const ln = el('line', { y1: 0, y2: 0, stroke: pal.red, 'stroke-width': 4, 'stroke-linecap': 'round', 'stroke-dasharray': '2 9' }, arrow);
  const hL = el('path', { d: 'M 12 -9 L 0 0 L 12 9', fill: 'none', stroke: pal.red, 'stroke-width': 4, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, arrow);
  const hR = el('path', { d: 'M -12 -9 L 0 0 L -12 9', fill: 'none', stroke: pal.red, 'stroke-width': 4, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, arrow);
  const b = k.buddy({ x: 200, y: FY, scale: 0.8 });
  return {
    update(t) {
      const p = easeInOut(seg(t, 0.9, 2.4));
      const ax = lerp(70, 14, p), bx = lerp(210, 266, p);
      tf(photo, ax, 52, -3 * (1 - p), 1, 1);
      tf(real, bx, 52, 3 * (1 - p), 1, 1);
      const x1 = ax + W + 6, x2 = bx - 6;
      tf(arrow, (x1 + x2) / 2, 108);
      const half = Math.max(0, (x2 - x1) / 2 - 10);
      k.set(ln, { x1: -half, x2: half });
      tf(hL, -half - 6, 0);
      tf(hR, half + 6, 0);
      arrow.setAttribute('opacity', seg(t, 1.2, 1.8));
      const lk = t < 1.0 ? 0 : t < 2.2 ? -0.9 : 0.9;
      const sad = easeOut(seg(t, 2.4, 3.0));
      b.pose({ look: lk, armL: lerp(8, 55, sad), armR: lerp(8, 55, sad), lean: 0, squash: 1 - 0.04 * sad, mood: t < 2.4 ? 'flat' : 'sad' });
    }
  };
}
