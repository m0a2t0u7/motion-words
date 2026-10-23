// humid：日本の夏。強い日ざしと、空気中のじっとり湿気。まめは汗をかき、うちわであおぐ（例文 Summer in Japan is hot and humid.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';
import { P, blinkAt, parkBg } from './run-after.js';
import { held } from './dig.js';

export const meta = { duration: 3.8, beats: [[0, '暑い夏'], [1.3, '汗がでる'], [2.6, 'じめじめ']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = parkBg(k, 240);
  el('rect', { x: 0, y: 0, width: 400, height: 300, fill: '#FFE9B8', opacity: 0.35 });
  const sun = g({}); tf(sun, 330, 56);
  const rays = Array.from({ length: 10 }, (_, i) => el('line', { x1: 0, y1: -34, x2: 0, y2: -46, stroke: '#FFB84D', 'stroke-width': 4, 'stroke-linecap': 'round', transform: `rotate(${i * 36})` }, sun));
  el('circle', { r: 28, fill: '#FF9F43' }, sun);
  // 湿気のもや
  const haze = Array.from({ length: 7 }, (_, i) => el('ellipse', { rx: 34 + (i % 3) * 8, ry: 12, fill: '#fff', opacity: 0 }));
  const dr = Array.from({ length: 8 }, () => el('path', { d: 'M 0 -5 Q 3 0 0 3 Q -3 0 0 -5 Z', fill: pal.water, opacity: 0 }));
  const b = k.buddy({ x: 170, y: FY + 8, scale: 1 });
  const fan = g({}); el('rect', { x: -2, y: -4, width: 4, height: 14, rx: 2, fill: pal.woodDark }, fan); el('path', { d: 'M -16 -4 Q 0 -30 16 -4 Z', fill: pal.coral, stroke: pal.coralDark, 'stroke-width': 1.5 }, fan);
  const sw = [0, 1, 2].map(() => el('path', { d: 'M 0 -5 Q 3 0 0 3 Q -3 0 0 -5 Z', fill: pal.water }));
  return {
    update(t) {
      const hot = easeInOut(seg(t, 0.3, 1.8)), hum = easeInOut(seg(t, 1.8, 3.0));
      sun.setAttribute('transform', `translate(330 56) scale(${1 + 0.05 * Math.sin(t * 3)})`);
      rays.forEach((r) => r.setAttribute('opacity', 0.6 + 0.4 * hot));
      const fp = easeInOut(seg(t, 1.0, 1.6)), sway = Math.sin(t * 13) * 14 * fp;
      P(b, { armR: lerp(8, 85, fp) + sway, armL: 8 + 20 * hot, lean: -4 * hot + 3 * hum, squash: 1 + 0.015 * Math.sin(t * 4) * hot, look: 0.4, mood: hum > 0.3 ? 'sad' : hot > 0.4 ? 'flat' : 'smile', blink: blinkAt(t) });
      if (fp > 0) held(k, b, 1, fan, 'R', b.state.armR - b.state.lean); else tf(fan, -50, -50);
      fan.setAttribute('opacity', fp > 0 ? 1 : 0);
      sw.forEach((s, i) => { const u = (t * 0.7 + i / 3) % 1; tf(s, 170 + 12 + i * 4, FY - 98 + u * 38); s.setAttribute('opacity', hot * (1 - u * u)); });
      haze.forEach((h, i) => { const u = (t * 0.12 + i / 7) % 1; tf(h, (i * 83 + u * 70) % 440 - 20, 90 + (i % 4) * 36 - Math.sin(u * 6.28) * 6); h.setAttribute('opacity', hum * 0.5 * hump(u)); });
      dr.forEach((d, i) => { const u = (t * 0.5 + i * 0.125) % 1; tf(d, 30 + i * 48, 80 + ((i * 53) % 120) + u * 24); d.setAttribute('opacity', hum * 0.8 * hump(u)); });
    }
  };
}
