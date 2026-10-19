// lip：冬、くちびるがカサカサ。リップクリームをぬると、つやつやになる（例文 My lips are dry in winter.）
import { seg, lerp, easeInOut, easeOut, hump, clamp } from '../ease.js';
import { hp, reach, P, blinkAt, bp, faceOf, ache, twinkle, pop } from './body.js';
import { homeBg } from './furniture.js';

export const meta = { duration: 4.4, beats: [[0, '冬の日'], [1.0, 'カサカサ'], [2.2, 'リップをぬる']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 1.5, FY = 250;
  homeBg(k, { FY, winX: 270, winW: 100, sky: '#DCE6F0' });
  const flakes = Array.from({ length: 12 }, () => el('circle', { r: 2.4, fill: '#fff' }));
  const b = k.buddy({ x: 160, y: FY, scale: S });
  el('rect', { x: -31, y: -30, width: 62, height: 10, rx: 5, fill: pal.violet }, b.body);
  b.mouth.setAttribute('opacity', 0);
  const lips = g({}, faceOf(b));
  const lipP = el('path', { d: 'M -8 -42 Q -4 -46 0 -43.5 Q 4 -46 8 -42 Q 0 -36 -8 -42 Z', fill: '#E88B8B', stroke: '#C96A6A', 'stroke-width': 1 }, lips);
  const cracks = el('path', { d: 'M -4 -44 l 1 3 M 1 -44 l -1 3 M 5 -43 l 0.5 2.5', stroke: '#fff', 'stroke-width': 1, opacity: 0.9 }, lips);
  const gloss = el('ellipse', { cx: -2, cy: -41, rx: 3, ry: 1, fill: '#fff', opacity: 0 }, lips);
  const balm = g({}); el('rect', { x: -4, y: -14, width: 8, height: 20, rx: 2, fill: pal.blue }, balm); el('rect', { x: -3.5, y: -20, width: 7, height: 7, rx: 3, fill: '#F7A9B4' }, balm);
  const hurt = ache(k, '#C96A6A');
  const sp = [0, 1].map(() => twinkle(k, null, '#fff'));
  return {
    update(t) {
      flakes.forEach((f, i) => k.set(f, { cx: 280 + (i * 17) % 84 + 4 * Math.sin(t * 2 + i), cy: 50 + ((i * 23 + t * 22) % 64) }));
      const dry = 1 - easeInOut(seg(t, 2.6, 3.4));
      const touch = easeInOut(seg(t, 0.8, 1.2)) * (1 - easeInOut(seg(t, 1.6, 1.9)));
      const app = easeInOut(seg(t, 2.0, 2.4)) * (1 - easeInOut(seg(t, 3.4, 3.8)));
      P(b, { look: 0.3, blink: blinkAt(t), mood: 'flat', lean: 2 });
      const L = bp(b, S, 0 + 1.8, -42);
      const sweep = t > 2.4 && t < 3.4 ? 7 * Math.sin((t - 2.4) * 9) : 0;
      const tgt = app > 0 ? { x: lerp(b.state.x + 40, L.x + 12 + sweep, app), y: lerp(FY - 30, L.y + 6, app) } : { x: lerp(b.state.x + 40, L.x + 10, touch), y: lerp(FY - 30, L.y + 6, touch) };
      b.pose({ armR: reach(b, S, 'R', tgt.x, tgt.y) });
      const h = hp(b, S, 'R', 24);
      tf(balm, h.x - 4, h.y - 6, -30, app > 0.05 ? 1 : 0.001);
      cracks.setAttribute('opacity', dry.toFixed(2));
      lipP.setAttribute('fill', dry > 0.5 ? '#E3A09A' : '#F27A86');
      gloss.setAttribute('opacity', (1 - dry).toFixed(2));
      hurt.set(easeOut(seg(t, 1.0, 1.3)) * (1 - seg(t, 1.9, 2.1)), L.x + 26, L.y - 4, t, 70);
      if (t > 3.6) b.pose({ mood: 'smile' });
      sp.forEach((s, i) => { const q = seg(t, 3.5 + i * 0.2, 4.4); tf(s, L.x - 10 + i * 22, L.y - 6 - i * 6, 45 * q, pop(easeOut(seg(q, 0, 0.3)) * 0.7)); });
    }
  };
}
