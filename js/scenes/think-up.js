// think up：まめが首をかしげて考える→頭の上に電球がポンと浮かび上がる→考え雲に「時間を短縮する」アイデアの時計が出る（例文 She thought up a clever way to save time.）
import { seg, lerp, easeInOut, easeOut, hump, backOut } from '../ease.js';
import { roomBg, cloud, faceAt } from './look-over.js';
import { bulb } from './look-to.js';

export const meta = { duration: 4.4, beats: [[0, '考える'], [1.8, 'ひらめいた'], [3.2, '時間短縮の案']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = roomBg(k, 'office', 240);
  const b = k.buddy({ x: 140, y: FY, scale: 1 });
  const bl = g({}); bulb(k, bl);
  const rays = [0, 1, 2, 3, 4].map((i) => el('line', { x1: 0, y1: -18, x2: 0, y2: -26, stroke: pal.yellowDark, 'stroke-width': 3, 'stroke-linecap': 'round', transform: `rotate(${-60 + i * 30})` }, bl));
  const cl = cloud(k, 120, 84, -1);
  const C = g({}, cl.g);
  el('circle', { r: 26, fill: '#fff', stroke: pal.ink, 'stroke-width': 3 }, C);
  const long = el('path', { d: 'M 0 0 L 0 -22 A 22 22 0 1 1 -19 11 Z', fill: pal.red, opacity: 0.25 }, C);
  const short = el('path', { d: 'M 0 0 L 0 -22 A 22 22 0 0 1 19 -11 Z', fill: pal.green, opacity: 0.8 }, C);
  el('line', { x1: 0, y1: 0, x2: 0, y2: -16, stroke: pal.ink, 'stroke-width': 2.5, 'stroke-linecap': 'round' }, C);
  const q = k.text(0, 0, '?', { 'font-size': 26, fill: pal.sub });
  return {
    update(t) {
      const think = seg(t, 0.2, 0.6) * (1 - seg(t, 1.6, 1.8)), pop = seg(t, 1.7, 2.1);
      b.pose({ armR: 8 + 125 * think, lean: -6 * think + 4 * hump(seg(t, 1.7, 2.1)), squash: 1 - 0.06 * hump(seg(t, 1.6, 1.8)), lift: 8 * hump(seg(t, 1.8, 2.2)), armL: 8 + 140 * easeOut(seg(t, 1.8, 2.1)), mood: pop > 0 ? 'grin' : 'flat', look: 0.4 + 0.3 * Math.sin(t * 2) * think });
      faceAt(b, 2, -6 * think);
      k.set(q, { x: 150, y: lerp(150, 140, think), opacity: think * (Math.sin(t * 4) > -0.6 ? 1 : 0.6) });
      tf(bl, 140, lerp(160, 104, easeOut(pop)), 0, pop <= 0 ? 0.001 : backOut(pop));
      bl.setAttribute('opacity', pop);
      rays.forEach((r) => r.setAttribute('opacity', Math.abs(Math.sin(t * 6)) * seg(t, 2.1, 2.3)));
      cl.show(easeOut(seg(t, 2.6, 3.0)), 276, 92);
      const sh = seg(t, 3.0, 3.6);
      long.setAttribute('opacity', 0.25 * (1 - sh * 0.6)); short.setAttribute('opacity', 0.8 * sh);
    }
  };
}
