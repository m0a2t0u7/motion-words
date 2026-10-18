// look after：毎日（カレンダーの日付が進む）、まめが子犬にごはんをあげ、なでて世話をする。子犬はしっぽを振る（例文 She looks after the puppy every day.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';
import { hp } from './dig.js';
import { puppy } from './get-on-with.js';
import { heart } from './weigh.js';

export const meta = { duration: 4.6, beats: [[0, 'ごはんをあげる'], [1.8, 'なでる'], [3.6, '毎日お世話']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  el('rect', { x: 40, y: 40, width: 60, height: 64, rx: 4, fill: '#fff', stroke: pal.line, 'stroke-width': 2 });
  el('rect', { x: 40, y: 40, width: 60, height: 16, rx: 4, fill: pal.mint });
  const day = k.text(70, 82, '1', { 'font-size': 24 });
  const bowl = g({}); tf(bowl, 270, 236);
  el('path', { d: 'M -18 -12 L 18 -12 L 13 0 L -13 0 Z', fill: pal.blue }, bowl);
  const food = el('ellipse', { cx: 0, cy: -12, rx: 14, ry: 4, fill: pal.coffee }, bowl);
  const dog = puppy(k);
  const b = k.buddy({ x: 190, y: FY, scale: 0.95 });
  const scoop = g({}); el('rect', { x: -8, y: -6, width: 16, height: 12, rx: 3, fill: pal.yellow }, scoop);
  const hearts = [0, 1].map(() => { const h = g({}); heart(k, h); return h; });
  return {
    update(t) {
      const cyc = t < 2.3 ? 0 : 1, u = t - cyc * 2.3;
      day.textContent = String(1 + cyc);
      // ごはん→なでる（各日）
      const pour = hump(seg(u, 0.2, 1.0)), pet = seg(u, 1.1, 2.1) > 0 && seg(u, 1.1, 2.1) < 1;
      const pp = seg(u, 1.1, 2.1);
      b.pose({ armR: pour > 0 ? lerp(20, 80, pour) : pet ? 60 + Math.sin(t * 10) * 12 : 15, lean: 10 * pour + (pet ? 16 : 0), squash: 1 - (pet ? 0.08 : 0), look: 0.7, mood: pet ? 'grin' : 'smile' });
      const h = hp(b, 0.95);
      tf(scoop, h.x + 4, h.y - 4, pour * 40); scoop.setAttribute('opacity', pour > 0.05 ? 1 : 0);
      k.set(food, { ry: u > 0.7 && u < 1.6 ? 4 : u >= 1.6 ? 1.5 : 1, opacity: u > 0.6 ? 1 : 0 });
      const eat = u > 0.9 && u < 1.6;
      dog.pose({ x: eat ? 300 : 248, y: FY, facing: eat ? -1 : -1, hop: eat ? Math.abs(Math.sin(t * 14)) * 2 : 0, wag: t * (pet ? 24 : 10), look: eat ? 6 : 0 });
      hearts.forEach((hh, i) => { const q = seg(u, 1.3 + i * 0.3, 2.1 + i * 0.3); tf(hh, 250 + i * 16, 180 - q * 30, 0, easeOut(q) * 0.8); hh.setAttribute('opacity', q > 0 && q < 1 ? 1 - seg(q, 0.7, 1) : 0); });
    }
  };
}
