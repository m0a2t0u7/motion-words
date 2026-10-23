// warm：寒い部屋でストーブをつけると、じんわり暖かくなって腕を広げてほっとする（例文 It's warm in this room.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';
import { P, blinkAt } from './run-after.js';
import { roomBg } from './look-over.js';

export const meta = { duration: 3.8, beats: [[0, '寒い部屋'], [1.4, 'ストーブ点火'], [3.0, '暖かい']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = roomBg(k, 'home', 244);
  const glow = el('rect', { x: 0, y: 0, width: 400, height: 300, fill: '#FFB866', opacity: 0 });
  // ストーブ
  const st = g({}); k.shadow(300, FY, 40, 5, st);
  el('rect', { x: 262, y: FY - 70, width: 76, height: 70, rx: 10, fill: pal.coral }, st);
  el('rect', { x: 272, y: FY - 58, width: 56, height: 36, rx: 6, fill: '#5A3A30' }, st);
  const coils = [0, 1, 2].map((i) => el('rect', { x: 276, y: FY - 54 + i * 11, width: 48, height: 5, rx: 2.5, fill: '#7A5A50' }, st));
  const heat = [0, 1, 2].map(() => el('path', { d: 'M 0 0 Q 6 -8 0 -16 Q -6 -24 0 -32', fill: 'none', stroke: '#FF9A4D', 'stroke-width': 3.5, 'stroke-linecap': 'round' }));
  const b = k.buddy({ x: 150, y: FY, scale: 0.95 });
  const sweat = el('ellipse', { cx: 0, cy: 0, rx: 3, ry: 4.5, fill: pal.blue });
  const shiv = el('path', { d: 'M 0 0 l 4 -4 l -4 -4 l 4 -4', fill: 'none', stroke: pal.sub, 'stroke-width': 2 });
  return {
    update(t) {
      const on = easeOut(seg(t, 1.3, 2.4)), cold = 1 - easeInOut(seg(t, 1.8, 3.0)), open = easeInOut(seg(t, 2.6, 3.3));
      const tr = Math.sin(t * 34) * cold;
      coils.forEach((c) => c.setAttribute('fill', on > 0 ? `rgb(${Math.round(122 + 133 * on)},${Math.round(90 + 30 * on)},${Math.round(80 - 30 * on)})` : '#7A5A50'));
      glow.setAttribute('opacity', 0.16 * on * easeInOut(seg(t, 1.4, 3.2)));
      heat.forEach((h, i) => { const u = (t * 0.6 + i / 3) % 1; tf(h, 285 + i * 16, FY - 78 - u * 20, 0); h.setAttribute('opacity', on * (1 - u)); });
      P(b, { armL: lerp(70, 8, 0) * cold * (1 - open) + lerp(8, 100, open) * (1 - cold) * open + 8 * (1 - open) * (1 - cold),
        armR: lerp(70, 8, 0) * cold * (1 - open) + lerp(8, 100, open) * (1 - cold) * open + 8 * (1 - open) * (1 - cold),
        x: 150 + tr * 1.5, squash: 1 - 0.04 * cold, mood: cold > 0.5 ? 'sad' : 'smile', look: 0.5, blink: blinkAt(t) });
      tf(shiv, 118, FY - 90, 0); shiv.setAttribute('opacity', cold > 0.3 ? 1 : 0);
      sweat.setAttribute('opacity', 0);
    }
  };
}
