// out of breath：まめが全力で走ってきて止まり、ひざに手をついて肩で息をする（例文 I was out of breath after running.）
import { seg, lerp, easeInOut, easeOut, hump, clamp } from '../ease.js';
import { P, run, streetBg, drop } from './in-common.js';

export const meta = { duration: 4.2, beats: [[0, '全力で走る'], [1.4, '止まる'], [2.6, 'ハァハァ']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = streetBg(k, 236);
  el('rect', { x: 0, y: FY, width: 400, height: 64, fill: '#E9EDF2' });
  const lines = [0, 1, 2].map(() => el('line', { x1: 0, y1: 0, x2: -22, y2: 0, stroke: pal.sub, 'stroke-width': 3, 'stroke-linecap': 'round' }));
  const A = k.buddy({ x: -40, y: FY + 6, scale: 1.0 });
  const puffs = [0, 1, 2].map(() => el('ellipse', { rx: 7, ry: 5, fill: '#fff', stroke: pal.line, 'stroke-width': 2 }));
  const drops = [0, 1].map(() => drop(k));
  const xf = (t) => lerp(-40, 210, easeOut(seg(t, 0, 1.45)));
  return {
    update(t) {
      const r = run(xf, t, -40);
      const stopped = t > 1.45;
      const bend = easeInOut(seg(t, 1.4, 1.8));
      const pant = stopped ? Math.sin((t - 1.45) * 15) : 0;
      const calm = seg(t, 3.4, 4.2);
      const amp = 1 - 0.5 * calm;
      if (!stopped) P(A, { x: r.x, y: FY + 6, walk: r.walk, armL: r.armL, armR: r.armR, lean: r.lean, lift: r.lift, look: 0.6, mood: 'open' });
      else P(A, { x: 210, y: FY + 6, lean: lerp(11, 26, bend) - 3 * pant * amp, squash: 1 - 0.035 * (0.5 + 0.5 * pant) * amp - 0.03 * bend, armL: lerp(8, 34, bend), armR: lerp(8, 34, bend), look: 0.4, mood: 'open', blink: 0.4 * bend });
      lines.forEach((l, i) => { tf(l, r.x - 40 - i * 8, FY - 70 + i * 18); l.setAttribute('opacity', stopped ? 0 : 0.7 * r.m); });
      puffs.forEach((p, i) => {
        const q = ((((t - 1.6) * 2.2 + i / 3) % 1) + 1) % 1;
        k.set(p, { cx: 262 + 26 * q, cy: FY - 52 - 8 * q, rx: 4 + 7 * q, ry: 3 + 4 * q, opacity: t > 1.6 ? (1 - q) * amp : 0 });
      });
      drops.forEach((d, i) => { const q = ((t * 0.9 + i * 0.5) % 1); tf(d, 184 + i * 22, FY - 98 + 22 * q); d.setAttribute('opacity', t > 1.5 ? 1 - q : 0); });
    }
  };
}
