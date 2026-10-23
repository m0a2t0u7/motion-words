// deep：湖の断面。まめが石を投げ込むと、水面から真ん中の底までずっと沈んでいく（例文 The lake is very deep in the middle.）
import { seg, lerp, easeInOut, easeOut, easeIn, hump, wobble } from '../ease.js';
import { hp } from './dig.js';
import { P, blinkAt } from './run-after.js';

export const meta = { duration: 4.2, beats: [[0, '石を持つ'], [1.0, '投げ込む'], [3.4, '底まで沈む']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  k.backdrop({ floorY: 130, mood: 'outdoor' });
  const SY = 130;
  el('rect', { x: 0, y: SY, width: 400, height: 170, fill: '#B98E5B' });
  el('path', { d: `M 130 ${SY} Q 160 250 200 282 Q 240 250 270 ${SY} Z`, fill: '#B98E5B' });
  el('path', { d: `M 130 ${SY} Q 150 262 200 282 Q 250 262 270 ${SY} Z`, fill: pal.water });
  el('rect', { x: 0, y: 118, width: 135, height: 14, fill: '#9BD18B' });
  el('rect', { x: 0, y: 130, width: 130, height: 170, fill: '#B98E5B' });
  el('path', { d: `M 130 ${SY} Q 150 262 200 282`, fill: 'none', stroke: '#8E6A3F', 'stroke-width': 3 });
  el('rect', { x: 270, y: 118, width: 130, height: 14, fill: '#9BD18B' });
  el('rect', { x: 270, y: 130, width: 130, height: 170, fill: '#B98E5B' });
  el('path', { d: `M 270 ${SY} Q 250 262 200 282`, fill: 'none', stroke: '#8E6A3F', 'stroke-width': 3 });
  el('path', { d: `M 140 ${SY} h 120`, stroke: '#fff', 'stroke-width': 2, opacity: 0.7 });
  const stone = el('ellipse', { rx: 6, ry: 5, fill: pal.sub, stroke: pal.ink, 'stroke-width': 1.5 });
  const rip = el('ellipse', { cx: 0, cy: 0, rx: 10, ry: 3, fill: 'none', stroke: '#fff', 'stroke-width': 2 });
  const arrow = el('g', {});
  const ln = el('line', { x1: 0, y1: 0, x2: 0, y2: 0, stroke: pal.coral, 'stroke-width': 4, 'stroke-linecap': 'round' }, arrow);
  const hd = el('path', { d: 'M -7 -9 L 0 0 L 7 -9', fill: 'none', stroke: pal.coral, 'stroke-width': 4, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, arrow);
  const b = k.buddy({ x: 70, y: 118, scale: 0.7 });
  const sink = (t) => easeIn(seg(t, 1.9, 3.5));
  return {
    update(t) {
      const th = easeInOut(seg(t, 0.7, 1.2)), back = easeInOut(seg(t, 0.2, 0.7));
      const fly = seg(t, 1.2, 1.9);
      P(b, { armR: lerp(8, 150, back) - lerp(0, 150 - 60, th) + (th >= 1 ? 0 : 0), lean: lerp(0, -8, back) + 14 * th, look: 0.8, mood: fly > 0 ? 'open' : 'smile', blink: blinkAt(t) });
      const h = hp(b, 0.7, 'R', 28);
      let x, y, show = 1;
      if (fly <= 0) { x = h.x; y = h.y; } else if (fly < 1) { x = lerp(h.x, 200, fly); y = lerp(h.y, SY, fly) - Math.sin(fly * Math.PI) * 40; } else { const s = sink(t); x = 200 + Math.sin(s * 9) * 5 * (1 - s); y = lerp(SY + 4, 276, s); }
      tf(stone, x, y, t * 90, 1, 1);
      const r = seg(t, 1.9, 2.6);
      tf(rip, 200, SY, 0, 1 + r * 2.5, 1); rip.setAttribute('opacity', r > 0 && r < 1 ? 1 - r : 0);
      const dl = (276 - SY - 4) * sink(t);
      ln.setAttribute('y2', dl); tf(arrow, 300, SY + 4);
      tf(hd, 0, dl); arrow.setAttribute('opacity', sink(t) > 0.02 ? 1 : 0);
    }
  };
}
