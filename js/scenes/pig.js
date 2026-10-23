// pig：ブタがどろんこの水たまりに入り、ごろんと転がって泥だらけになる。まめが笑って見ている（例文 The pig rolled in the mud.）
import { seg, lerp, easeInOut, easeOut, hump, clamp, wobble } from '../ease.js';
import { P, blinkAt } from './run-after.js';
import { scene, hills, cloudG } from './nature.js';
import { beast } from './animal.js';
import { rails } from './field.js';

export const meta = { duration: 4.4, beats: [[0, 'どろんこ'], [1.4, 'ごろんと転がる'], [3.2, '泥だらけ']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const { FY } = scene(k, { FY: 226, top: '#CDE9FA', bot: '#F2FAFE', ground: '#C7DFA0', edge: '#B4D18A' });
  tf(cloudG(k, 70, 26), 300, 44); hills(k, FY);
  rails(k, 0, 400, FY + 6, 34, 66);
  el('rect', { x: 0, y: FY + 6, width: 400, height: 70, fill: '#D9C79A' });
  const MX = 236, MY = 262;
  el('ellipse', { cx: MX, cy: MY, rx: 92, ry: 20, fill: '#8A6142' }); el('ellipse', { cx: MX - 10, cy: MY - 3, rx: 60, ry: 10, fill: '#9C7250' });
  const pg = g({}), pig = beast(k, 'pig', pg);
  const spots = [[-14, -26, 6], [6, -32, 5], [18, -22, 7], [-4, -18, 5], [24, -36, 4]].map(([x, y, r]) => el('circle', { cx: x, cy: y, r, fill: '#7A5236' }, pg));
  const sp = Array.from({ length: 6 }, () => el('circle', { r: 3.5, fill: '#8A6142' }));
  const me = k.buddy({ x: 70, y: 272, scale: 0.9 });
  const xf = (t) => lerp(330, MX, easeInOut(seg(t, 0.1, 1.2)));
  return {
    update(t) {
      const x = xf(t), walk = seg(t, 0.1, 1.2) > 0 && t < 1.2 ? 1 : 0;
      const r = easeInOut(seg(t, 1.5, 2.9)), ang = -360 * r, s = 1.15;
      const cy = -(pig.c.L + pig.c.by * 0.55) * s;
      // 胴の中心を軸に転がる（少し横へ）
      const px = x - 40 * r + 40 * hump(r) * 0, py = MY + 4 - 6 * hump(r);
      pg.setAttribute('transform', `translate(${(px - 20 * r).toFixed(2)} ${(py + cy).toFixed(2)}) rotate(${ang.toFixed(1)}) translate(0 ${(-cy).toFixed(2)})`);
      pig.set({ x: 0, y: 0, s, face: -1, ph: t * 9, m: walk + hump(r) * 0.6, tail: Math.sin(t * 9) * 16, head: 6 * wobble(seg(t, 2.9, 3.6)) });
      const mud = easeOut(seg(t, 1.8, 3.0));
      spots.forEach((n, i) => n.setAttribute('opacity', mud > i / 5 ? 1 : 0));
      sp.forEach((n, i) => { const q = seg(t, 1.6 + (i % 3) * 0.35, 2.3 + (i % 3) * 0.35); k.set(n, { cx: px - 20 + (i - 2.5) * 16 * q, cy: MY - 10 - 34 * hump(q) + 10 * q, opacity: q > 0 && q < 1 ? 1 : 0 }); });
      const lol = t > 2.2;
      P(me, { x: 70, y: 272, armL: lol ? 30 : 8, armR: lol ? 30 + 10 * Math.sin(t * 16) : 8, lean: lol ? -4 + 3 * Math.sin(t * 16) : 0, look: 0.8, mood: lol ? 'grin' : t > 1.4 ? 'open' : 'smile', blink: lol ? 0.8 : blinkAt(t) });
    }
  };
}
