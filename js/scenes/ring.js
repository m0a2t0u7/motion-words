// ring：指にはめた金の指輪。手を上げて眺めると、きらりと光る（拡大図で指の指輪を見せる）（例文 She wears a gold ring on her finger.）
import { seg, lerp, easeInOut, easeOut, backOut, hump, clamp, wobble } from '../ease.js';
import { hp, held, reach, P, blinkAt, face, homeBg } from './bag.js';

// 指を広げた手と指輪（拡大図用、中心＝手のひら）
export function bigHand(k, parent, col, dark) {
  const g = k.g({}, parent), { el, pal } = k;
  [[-17, -30, -14], [-6, -36, -4], [6, -35, 5], [16, -28, 15]].forEach(([x, y, r]) => el('rect', { x: -5.5, y: -24, width: 11, height: 28, rx: 5.5, fill: col, stroke: dark, 'stroke-width': 2, transform: `translate(${x} ${y + 24}) rotate(${r})` }, g));
  el('rect', { x: -26, y: -4, width: 11, height: 22, rx: 5.5, fill: col, stroke: dark, 'stroke-width': 2, transform: 'rotate(-40 -20 8)' }, g);
  el('rect', { x: -21, y: -8, width: 42, height: 38, rx: 16, fill: col, stroke: dark, 'stroke-width': 2 }, g);
  // 薬指の指輪
  const ring = k.g({}, g);
  k.tf(ring, 6, -14, 5);
  el('rect', { x: -7.5, y: -3, width: 15, height: 6, rx: 2.5, fill: pal.yellow, stroke: pal.yellowDark, 'stroke-width': 1.5 }, ring);
  el('circle', { cx: 0, cy: -4, r: 3.4, fill: '#FFF6D0', stroke: pal.yellowDark, 'stroke-width': 1.2 }, ring);
  return { g, ring };
}
export function glint(k, parent) {
  return k.el('path', { d: 'M 0 -10 L 2.5 -2.5 L 10 0 L 2.5 2.5 L 0 10 L -2.5 2.5 L -10 0 L -2.5 -2.5 Z', fill: '#FFF3B0', stroke: k.pal.yellowDark, 'stroke-width': 1 }, parent);
}

export const meta = { duration: 4.2, beats: [[0, '指に'], [1.2, '金の指輪'], [2.4, 'はめている']] };

export function create(k) {
  const { el, tf, pal } = k, S = 1.25, FY = 236, X = 150;
  homeBg(k, { FY, winX: 30, winW: 80, wall: '#F5EFF3' });
  const b = k.buddy({ x: X, y: FY, scale: S });
  // 手にはめた小さな指輪（手の円をまく金の帯）
  const small = k.g({});
  el('rect', { x: -7, y: -2, width: 14, height: 4.5, rx: 2, fill: pal.yellow, stroke: pal.yellowDark, 'stroke-width': 1.2 }, small);
  const sp = glint(k);
  // 拡大図（虫めがねの円）
  const zoom = k.g({});
  const zin = k.g({}, zoom);
  el('circle', { r: 62, fill: '#FFF8EC', stroke: pal.sub, 'stroke-width': 4 }, zin);
  const cp = k.clip((c) => el('circle', { r: 60 }, c));
  const inner = k.g({ 'clip-path': cp }, zin);
  const hand = bigHand(k, inner, pal.mint, pal.mintDark); tf(hand.g, 0, 14, 0, 1.2);
  const sp2 = glint(k, zin);
  const link = el('path', { d: '', stroke: pal.sub, 'stroke-width': 2, 'stroke-dasharray': '4 4', fill: 'none' });
  return {
    update(t) {
      const up = easeInOut(seg(t, 0.6, 1.3));
      P(b, { x: X, look: 0.8, blink: blinkAt(t), mood: t > 1.3 ? 'grin' : 'smile', lean: -2 * up });
      face(b, 4, -2 * up);
      const tx = X + 46, ty = FY - 92;
      b.pose({ armR: lerp(10, reach(b, S, 'R', tx, ty), up) });
      const h = held(k, b, S, small, 'R', 0, 24);
      const g1 = seg(t, 1.3, 1.8);
      tf(sp, h.x + 8, h.y - 6, g1 * 90, hump(g1) * 1.1 + 0.001);
      const z = seg(t, 1.8, 2.3);
      const zx = 296, zy = 118;
      tf(zoom, zx, zy, 0, z <= 0 ? 0.001 : backOut(z));
      zoom.setAttribute('opacity', clamp(z * 3));
      k.set(link, { d: `M ${h.x + 6} ${h.y - 4} L ${zx - 60} ${zy + 14}`, opacity: clamp(z * 3) });
      const g2 = seg((t - 2.6) % 1.2, 0, 0.6);
      tf(sp2, 10, -22, g2 * 90, t > 2.6 ? hump(g2) * 1.3 + 0.001 : 0.001);
      tf(hand.g, 0, 14 + 2 * Math.sin(t * 2), Math.sin(t * 1.5) * 3, 1.2);
    }
  };
}
