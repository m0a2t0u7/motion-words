// lion：岩の上のライオンが大きく息を吸い、口を大きく開けて「ガオー！」とほえる。さくの手前のまめは耳をふさぐ（例文 The lion roared loudly.）
import { seg, lerp, easeInOut, easeOut, hump, clamp, wobble } from '../ease.js';
import { P, blinkAt } from './run-after.js';
import { scene, sunG } from './nature.js';
import { beast } from './animal.js';
import { rails } from './field.js';

export const meta = { duration: 4.2, beats: [[0, 'ライオン'], [1.0, '息を吸って'], [1.8, '大きくほえた']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const { FY } = scene(k, { FY: 210, top: '#FFE2B0', bot: '#FFF6E6', ground: '#E9CF8E', edge: '#D9BC78' });
  tf(sunG(k, 18).g, 70, 46);
  el('path', { d: `M 300 ${FY} Q 320 ${FY - 70} 360 ${FY - 60} L 400 ${FY - 40} V ${FY} Z`, fill: '#D9BC78' });
  // 岩
  k.shadow(240, FY + 2, 90, 6);
  el('path', { d: `M 150 ${FY} Q 160 ${FY - 50} 210 ${FY - 58} Q 290 ${FY - 64} 320 ${FY - 30} L 330 ${FY} Z`, fill: '#B9A58A' });
  el('path', { d: `M 170 ${FY - 40} Q 220 ${FY - 56} 290 ${FY - 52}`, stroke: '#CDBBA2', 'stroke-width': 5, fill: 'none' });
  const L = beast(k, 'lion');
  const waves = [0, 1, 2].map(() => el('path', { d: 'M 0 -18 Q 12 0 0 18', stroke: '#E86F57', 'stroke-width': 4, fill: 'none', 'stroke-linecap': 'round' }));
  el('rect', { x: 0, y: 232, width: 400, height: 68, fill: '#E2CFA0' });
  const me = k.buddy({ x: 80, y: 290, scale: 0.9 });
  rails(k, 0, 400, 292, 20, 80);
  const jaw = L.parts.jaw;
  return {
    update(t) {
      const inh = easeInOut(seg(t, 0.8, 1.6)), roar = seg(t, 1.6, 3.6), op = roar > 0 && roar < 1 ? easeOut(seg(t, 1.6, 1.8)) * (1 - easeInOut(seg(t, 3.3, 3.6))) : 0;
      const shake = op > 0.5 ? Math.sin(t * 50) * 1.2 : 0;
      L.set({ x: 236, y: FY - 56, s: 1.25, face: -1, head: -8 * inh - 14 * op + shake, squash: 1 + 0.06 * inh - 0.06 * op, tail: Math.sin(t * 3) * 10 });
      if (L.parts.mane) tf(L.parts.mane, 0, 0, 0, 1 + 0.08 * op);
      k.set(jaw, { d: `M 4 ${6 - 2 * op} Q 12 ${10 + 14 * op} 18 ${6 - 2 * op} Q 12 ${8 + 2 * op} 4 ${6 - 2 * op} Z` });
      const hd = L.headAt({ x: 236, y: FY - 56, s: 1.25, face: -1 });
      waves.forEach((w, i) => { const q = ((t - 1.7 - i * 0.22) / 0.8) % 1; const on = t > 1.7 + i * 0.22 && t < 3.6; tf(w, hd.x - 30 - 70 * q, hd.y - 4, 180, 0.6 + 0.9 * q); w.setAttribute('opacity', on ? 1 - q : 0); });
      const cov = easeOut(seg(t, 1.75, 2.0)) * (1 - easeInOut(seg(t, 3.6, 4.0)));
      P(me, { x: 80, y: 290, armL: lerp(8, 160, cov), armR: lerp(8, 160, cov), lean: -6 * cov, squash: 1 - 0.06 * cov, look: 0.9, mood: cov > 0.3 ? 'flat' : t > 3.8 ? 'smile' : 'open', blink: cov > 0.3 ? 1 : blinkAt(t) });
    }
  };
}
