// wet：雨で水たまりに足を踏み入れ、靴がぬれて色が濃くなる。まめは足元を見てしょんぼり（例文 My shoes got wet in the rain.）
import { seg, lerp, easeInOut, easeOut, hump, wobble } from '../ease.js';
import { P, blinkAt, parkBg } from './run-after.js';

export const meta = { duration: 3.6, beats: [[0, '雨が降る'], [1.2, '水たまりへ'], [2.6, '靴がぬれた']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = parkBg(k, 240);
  el('rect', { x: 0, y: 0, width: 400, height: 300, fill: '#7C8FA6', opacity: 0.3 });
  el('ellipse', { cx: 200, cy: FY + 14, rx: 80, ry: 12, fill: pal.water, opacity: 0.9 });
  const b = k.buddy({ x: 200, y: FY + 8, scale: 1 });
  // 靴（足の先に重ねる）
  const shoes = [-12, 12].map((x) => el('ellipse', { cx: 0, cy: 0, rx: 12, ry: 6, fill: '#E9E2D6', stroke: pal.sub, 'stroke-width': 1.5 }));
  const rips = [0, 1].map(() => el('ellipse', { cx: 0, cy: 0, rx: 10, ry: 3, fill: 'none', stroke: '#fff', 'stroke-width': 2 }));
  const drops = Array.from({ length: 22 }, () => el('line', { x1: 0, y1: 0, x2: -3, y2: 11, stroke: '#EAF3FB', 'stroke-width': 2, 'stroke-linecap': 'round' }));
  const drip = el('ellipse', { rx: 2.5, ry: 4, fill: pal.water });
  return {
    update(t) {
      const wetP = easeInOut(seg(t, 1.5, 2.6)), step = hump(seg(t, 1.1, 1.6));
      const sad = easeInOut(seg(t, 2.2, 2.8));
      P(b, { x: 200 + lerp(-50, 0, easeOut(seg(t, 0.4, 1.4))), walk: seg(t, 0.4, 1.4) < 1 ? t * 9 : 0, armL: 8, armR: 8, squash: 1 - 0.03 * step, lean: 6 * sad, look: -0.2, mood: sad > 0.4 ? 'sad' : 'flat', blink: blinkAt(t) });
      const bx = b.state.x;
      shoes.forEach((s, i) => { tf(s, bx + (i ? 12 : -12), FY + 8, 0); const c = Math.round(lerp(233, 110, wetP)); s.setAttribute('fill', `rgb(${c},${Math.round(lerp(226, 125, wetP))},${Math.round(lerp(214, 140, wetP))})`); });
      rips.forEach((r, i) => { const u = (seg(t, 1.2 + i * 0.5, 2.4 + i * 0.5)); tf(r, bx, FY + 11, 0, 1 + u * 3, 1 + u * 1.5); r.setAttribute('opacity', u > 0 && u < 1 ? 1 - u : 0); });
      drops.forEach((d, i) => { const u = (t * 1.6 + i * 0.173) % 1; tf(d, (i * 37 + 11) % 400, -10 + u * (FY + 30)); });
      const du = (t * 0.9) % 1; tf(drip, bx + 12, FY + 12 + du * 12); drip.setAttribute('opacity', wetP * (1 - du));
    }
  };
}
