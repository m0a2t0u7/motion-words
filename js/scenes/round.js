import { seg, lerp, easeInOut, easeOut, easeIn, backOut, wobble, hump, clamp } from '../ease.js';
import { P, blinkAt } from './run-after.js';
// 手先が(tx,ty)を向く腕の角度（シーン内だけで使う）
const aim = (x, y, f, s, tx, ty) => (Math.atan2((tx - (x + 27 * f * s)) * f, ty - (y - 56 * s)) * 180) / Math.PI;
// round：赤ちゃんの大きな丸い目（例文 The baby has big round eyes.）
export const meta = { duration: 3.8, beats: [[0, '赤ちゃん'], [1.1, '目を見開く'], [2.5, '丸い目']] };
export function create(k) {
  const { el, g, tf, pal } = k;
  k.backdrop({ floorY: 250, mood: 'indoor' });
  const f = g({}); tf(f, 250, 150);
  el('circle', { r: 76, fill: '#FFE3CF', stroke: '#F1BE9C', 'stroke-width': 3 }, f);
  el('path', { d: 'M -8 -74 Q 0 -96 10 -74', stroke: '#8B6A4D', 'stroke-width': 4, fill: 'none', 'stroke-linecap': 'round' }, f);
  [-30, 30].forEach((x) => el('ellipse', { cx: x * 1.8, cy: 22, rx: 11, ry: 7, fill: '#FFB7A6', opacity: 0.7 }, f));
  el('path', { d: 'M -10 38 Q 0 48 10 38', stroke: pal.coralDark, 'stroke-width': 3.5, fill: 'none', 'stroke-linecap': 'round' }, f);
  const eyes = [-30, 30].map((x) => { const e = g({}, f); tf(e, x, -4); return { e, w: el('circle', { r: 8, fill: '#fff', stroke: pal.ink, 'stroke-width': 2 }, e), p: el('circle', { r: 5, fill: pal.ink }, e), h: el('circle', { cx: -3, cy: -3, r: 2, fill: '#fff' }, e) }; });
  const ring = el('circle', { cx: 220, cy: 146, r: 22, fill: 'none', stroke: pal.coral, 'stroke-width': 3, 'stroke-dasharray': '6 5' });
  const b = k.buddy({ x: 80, y: 250, scale: 1.1 });
  return {
    update(t) {
      const o = backOut(seg(t, 1.0, 1.7)), r = lerp(7, 21, o), bl = hump(seg(t, 0.5, 0.8)) + hump(seg(t, 3.2, 3.5));
      eyes.forEach((q) => { k.set(q.w, { r, ry: r * (1 - bl * 0.9) }); q.w.setAttribute('transform', `scale(1 ${1 - bl * 0.9})`); k.set(q.p, { r: r * 0.6 }); k.set(q.h, { cx: -r * 0.25, cy: -r * 0.25, r: r * 0.25 }); });
      const a = easeOut(seg(t, 2.0, 2.6)), wob = 1 + 0.1 * wobble(seg(t, 2.1, 3.1));
      k.set(ring, { opacity: a }); ring.setAttribute('transform', `translate(${220 - 220 * wob} ${146 - 146 * wob}) scale(${wob})`);
      k.set(ring, { cx: 220, cy: 146, r: 24 });
      ring.setAttribute('transform', `translate(${(1 - wob) * 220} ${(1 - wob) * 146}) scale(${wob})`);
      const ang = aim(80, 250, 1, 1.1, 175, 128);
      P(b, { armR: lerp(8, ang, a), lean: 4 * a, look: 0.5, mood: a > 0.3 ? 'open' : 'smile', blink: blinkAt(t) });
    }
  };
}
