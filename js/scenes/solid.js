// solid：型に入った水がこおって、かたい氷のかたまりになる。まめがコンとたたいても形は変わらない（例文 Ice is water in a solid form.）
import { seg, lerp, easeInOut, easeOut, hump, wobble } from '../ease.js';
import { P, blinkAt, star } from './run-after.js';
import { roomBg, waves } from './look-over.js';

export const meta = { duration: 3.8, beats: [[0, '水'], [1.3, 'こおる'], [2.6, 'かたい氷']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = roomBg(k, 'home', 240);
  k.shadow(270, FY + 2, 70, 5);
  el('rect', { x: 200, y: 211, width: 140, height: 8, rx: 3, fill: pal.wood });
  el('rect', { x: 208, y: 219, width: 7, height: 21, fill: pal.woodDark }); el('rect', { x: 325, y: 219, width: 7, height: 21, fill: pal.woodDark });
  const body = el('path', { d: '', fill: pal.water, opacity: 0.9 });
  const facet = el('path', { d: 'M 238 160 L 262 160 L 238 186 Z', fill: '#fff', opacity: 0 });
  const frame = el('rect', { x: 236, y: 158, width: 68, height: 53, rx: 6, fill: 'none', stroke: '#CFE4F5', 'stroke-width': 3, opacity: 0.8 });
  const b = k.buddy({ x: 185, y: FY + 8, scale: 1 });
  const flakes = [0, 1, 2, 3].map(() => star(k, '#fff'));
  const w = waves(k, pal.blueDark);
  return {
    update(t) {
      const fr = easeInOut(seg(t, 1.1, 2.4)), kn = (t > 2.7) ? Math.abs(Math.sin((t - 2.7) * 6)) * (1 - seg(t, 3.4, 3.8)) : 0;
      // 水面は波うち、こおるほど平らで角ばる
      const top = 160 + (1 - fr) * 4, wv = (1 - fr) * 3 * Math.sin(t * 6);
      body.setAttribute('d', `M 238 ${top + wv} Q 255 ${top - wv} 270 ${top + wv} T 302 ${top} L 302 209 L 238 209 Z`);
      const c = (a, bb) => Math.round(lerp(a, bb, fr));
      body.setAttribute('fill', `rgb(${c(125, 205)},${c(190, 235)},${c(240, 250)})`);
      facet.setAttribute('opacity', fr * 0.75);
      frame.setAttribute('stroke-width', 3 - fr * 1);
      P(b, { armR: (t > 2.4 ? lerp(8, 92, easeOut(seg(t, 2.4, 2.8))) - kn * 12 : 0), armL: 8, lean: 3 + 3 * kn, look: 0.7, mood: fr > 0.8 ? 'open' : 'smile', blink: blinkAt(t) });
      w(t > 2.8 && t < 3.6 ? 1 : 0, (t * 1.5) % 1, 275, 148, 1, 0.8);
      flakes.forEach((f, i) => { const u = (seg(t, 1.2, 2.4) + i * 0.25) % 1; f.set(244 + i * 17, 140, fr > 0 && fr < 1 ? u : 0); });
    }
  };
}
