// freezing：雪の外で凍えるほど寒い。震えるまめが暖かいコートを着ると体を丸めて落ち着く（例文 It's freezing outside. Wear a warm coat.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';
import { P, blinkAt, parkBg } from './run-after.js';

export const meta = { duration: 4.0, beats: [[0, '凍えて震える'], [1.6, 'コートを着る'], [3.0, '暖かい']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = parkBg(k, 240);
  el('rect', { x: 0, y: 0, width: 400, height: 300, fill: '#CFE4F5', opacity: 0.35 });
  el('rect', { x: 0, y: FY, width: 400, height: 64, fill: '#F4F8FC' });
  el('rect', { x: 0, y: FY, width: 400, height: 2, fill: '#DCE8F2' });
  [[60, 30], [330, 40]].forEach(([x, s]) => { el('rect', { x: x - 4, y: FY - s - 34, width: 8, height: s + 34, fill: pal.woodDark }); el('ellipse', { cx: x, cy: FY - s - 40, rx: 26, ry: 22, fill: '#EAF2F8' }); });
  [0, 1, 2].forEach((i) => el('path', { d: `M ${150 + i * 40} 40 l 0 12 l 5 -4 l -5 14`, stroke: '#9FD4F2', 'stroke-width': 4, fill: 'none' }));
  const b = k.buddy({ x: 200, y: FY, scale: 1 });
  const coat = g({}, b.body);
  el('rect', { x: -32, y: -36, width: 64, height: 34, rx: 16, fill: pal.coral }, coat);
  el('rect', { x: -3, y: -36, width: 6, height: 34, fill: pal.coralDark, opacity: 0.6 }, coat);
  const flakes = Array.from({ length: 16 }, (_, i) => el('circle', { r: 2 + (i % 3) * 0.7, fill: '#fff' }));
  const breath = el('ellipse', { rx: 8, ry: 5, fill: '#fff', opacity: 0, stroke: '#DCE8F2' });
  const trem = el('path', { d: 'M 0 0 l 4 -4 l -4 -4 l 4 -4', fill: 'none', stroke: pal.blue, 'stroke-width': 2.4 });
  return {
    update(t) {
      const on = easeOut(seg(t, 1.6, 2.4)), cold = 1 - easeInOut(seg(t, 2.2, 3.2));
      const sh = Math.sin(t * 38) * cold;
      coat.setAttribute('opacity', on > 0 ? 1 : 0);
      tf(coat, 0, (1 - on) * -4);
      P(b, { x: 200 + sh * 2, armL: lerp(10, 36, easeInOut(seg(t, 0.2, 0.8))), armR: lerp(10, 36, easeInOut(seg(t, 0.2, 0.8))) + 0, lean: 8 * cold, squash: 1 - 0.05 * cold, mood: cold > 0.5 ? 'sad' : 'smile', look: 0.3, blink: blinkAt(t) });
      flakes.forEach((f, i) => { const u = ((t * 0.35 + i * 0.37) % 1); tf(f, (i * 53 + Math.sin(t * 2 + i) * 12) % 400, u * (FY + 10)); });
      const u = (t * 0.8) % 1;
      tf(breath, 232 + u * 20, 186 - u * 8, 0, 0.6 + u, 0.6 + u); breath.setAttribute('opacity', (1 - u) * 0.9);
      tf(trem, 150, 190); trem.setAttribute('opacity', cold > 0.4 ? 1 : 0);
    }
  };
}
