// helicopter：庭にいるまめの家の上を、ヘリコプターがプロペラを回して飛んでいく（例文 A helicopter flew over our house.）
import { seg, lerp, easeInOut } from '../ease.js';
import { P, blinkAt, tree } from './vehicle.js';

export const meta = { duration: 4.2, beats: [[0, 'バタバタ音'], [1.4, '家の上を飛ぶ'], [3.2, '飛んでいった']] };

export function heli(k, color = '#F2685B') {
  const { el, g, pal } = k, o = g({});
  el('path', { d: 'M -20 -2 L -70 -6 L -76 -18 L -66 -16 L -20 -12', fill: color }, o);
  el('ellipse', { cx: 0, cy: 0, rx: 30, ry: 20, fill: color }, o);
  el('path', { d: 'M 6 -14 Q 28 -12 28 2 L 6 2 Z', fill: '#CFE9F7' }, o);
  el('path', { d: 'M -18 26 L 22 26 M -10 18 L -12 26 M 10 18 L 12 26', stroke: pal.ink, 'stroke-width': 3, 'stroke-linecap': 'round' }, o);
  el('rect', { x: -2, y: -26, width: 4, height: 8, fill: pal.ink }, o);
  const rot = el('ellipse', { cx: 0, cy: -27, rx: 50, ry: 3, fill: pal.ink, opacity: 0.7 }, o);
  const tail = el('ellipse', { cx: -74, cy: -12, rx: 3, ry: 10, fill: pal.ink, opacity: 0.6 }, o);
  return { g: o, set(x, y, t, s = 1) { k.tf(o, x, y, -4, s); k.set(rot, { rx: Math.abs(Math.cos(t * 40)) * 50 + 4 }); k.set(tail, { ry: Math.abs(Math.sin(t * 50)) * 10 + 2 }); } };
}
export function create(k) {
  const { el, pal } = k;
  const FY = 240;
  k.backdrop({ floorY: FY });
  el('rect', { x: 0, y: FY, width: 400, height: 60, fill: '#DCEFD9' });
  // 家
  el('rect', { x: 140, y: 150, width: 130, height: 90, fill: '#F6EDE2' });
  el('path', { d: 'M 126 154 L 205 104 L 284 154 Z', fill: pal.coral });
  el('rect', { x: 160, y: 176, width: 34, height: 28, rx: 3, fill: '#DDEFFA', stroke: '#fff', 'stroke-width': 3 });
  el('rect', { x: 220, y: 184, width: 30, height: 56, rx: 3, fill: pal.wood });
  tree(k, 50, FY, 0.8);
  const me = k.buddy({ x: 330, y: FY + 6, scale: 0.8, facing: -1 });
  const h = heli(k);
  return {
    update(t) {
      const x = lerp(-90, 500, t / 4.2), y = 60 + Math.sin(t * 2) * 6;
      h.set(x, y, t, 1);
      const look = (x - 330) / 160;
      P(me, { x: 330, y: FY + 6, facing: x < 330 ? -1 : 1, look: Math.min(1, Math.abs(look)), lean: -10, mood: t > 1 && t < 3.4 ? 'open' : 'smile', blink: blinkAt(t), armR: 8 + 150 * easeInOut(seg(t, 1.2, 1.6)) * (1 - seg(t, 3.4, 3.8)) });
      me.body.children[3].setAttribute('transform', `translate(${(6 * Math.max(-1, Math.min(1, look)) * (x < 330 ? -1 : 1)).toFixed(1)} -6)`);
    }
  };
}
