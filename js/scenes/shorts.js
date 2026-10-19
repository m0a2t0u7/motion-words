// shorts：とても暑い日、まめが半ズボンとTシャツで歩き、汗をふく（例文 He wore shorts and a T-shirt because it was so hot.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';
import { wardrobe, gait, P, blinkAt } from './skirt.js';

export const meta = { duration: 4.2, beats: [[0, 'とても暑い'], [1.3, '半ズボンで歩く'], [2.9, '汗をふく']] };

export function create(k) {
  const { el, g, pal, tf } = k, S = 1.4;
  const FY = k.backdrop({ floorY: 236 });
  el('rect', { x: 0, y: 0, width: 400, height: FY, fill: '#FFF3DC', opacity: 0.55 });
  // 太陽
  const sun = g({}); tf(sun, 330, 58);
  const rays = g({}, sun);
  for (let i = 0; i < 12; i++) el('rect', { x: -3, y: -50, width: 6, height: 14, rx: 3, fill: pal.yellowDark, transform: `rotate(${i * 30})` }, rays);
  el('circle', { r: 30, fill: pal.yellow }, sun);
  el('circle', { r: 30, fill: '#FFB347', opacity: 0.35 }, sun);
  // 温度計
  el('rect', { x: 48, y: 60, width: 22, height: 110, rx: 11, fill: '#fff', stroke: pal.line, 'stroke-width': 3 });
  el('circle', { cx: 59, cy: 172, r: 15, fill: pal.red });
  const merc = el('rect', { x: 54, y: 70, width: 10, height: 100, rx: 5, fill: pal.red });
  [80, 100, 120, 140].forEach((y) => el('line', { x1: 72, y1: y, x2: 78, y2: y, stroke: pal.sub, 'stroke-width': 2 }));
  // 地面（歩道）と木陰
  el('rect', { x: 0, y: FY, width: 400, height: 64, fill: '#F2E6D2' });
  el('rect', { x: 0, y: FY, width: 400, height: 3, fill: '#E2D2B6' });
  const waves = [0, 1, 2].map((i) => el('path', { d: 'M 0 0 q 6 -6 12 0 t 12 0 t 12 0', fill: 'none', stroke: '#F6B26B', 'stroke-width': 2.5, 'stroke-linecap': 'round' }));
  const b = k.buddy({ x: 140, y: FY, scale: S });
  const W = wardrobe(k, b);
  W.top({ color: '#fff', dark: pal.line, sleeve: 'short', to: -15 });
  W.bottom({ kind: 'shorts', color: pal.coral, dark: pal.coralDark, from: -15 });
  W.feet('shoe', pal.blue);
  const drops = [0, 1, 2].map(() => el('path', { d: 'M 0 -6 Q 4 0 0 4 Q -4 0 0 -6 Z', fill: pal.water }));
  const xf = (t) => lerp(140, 250, easeInOut(seg(t, 0.9, 2.5)));
  return {
    update(t) {
      tf(rays, 0, 0, t * 20, 1 + 0.06 * Math.sin(t * 6));
      k.set(merc, { y: lerp(120, 70, easeOut(seg(t, 0, 1.0))), height: lerp(50, 100, easeOut(seg(t, 0, 1.0))) });
      waves.forEach((w, i) => { const q = (t * 0.6 + i / 3) % 1; tf(w, 150 + i * 70, FY - 20 - q * 40); w.setAttribute('opacity', hump(q) * 0.7); });
      const p = gait(xf, t, 140);
      const wipe = seg(t, 2.8, 3.8), wp = hump(wipe);
      P(b, { x: p.x, walk: p.walk, lean: p.lean, armL: t < 2.6 ? p.armL : 8,
        armR: t < 2.6 ? p.armR : lerp(8, 160, easeOut(seg(t, 2.6, 2.9))) * (1 - easeInOut(seg(t, 3.7, 4.1))) + 8 * easeInOut(seg(t, 3.7, 4.1)),
        mood: t > 3.8 ? 'smile' : 'open', squash: 1 - 0.02 * Math.sin(t * 5), look: 0.3, blink: blinkAt(t) });
      // 額をぬぐう腕の左右の動き
      if (t > 2.9 && t < 3.7) b.pose({ armR: 160 + 14 * Math.sin((t - 2.9) * 14) * wp });
      drops.forEach((d, i) => {
        const q = ((t * 0.9 + i * 0.33) % 1);
        const side = i % 2 ? 1 : -1;
        tf(d, p.x + side * (28 + q * 14) * S * 0.8, FY - 100 * S + q * 40);
        d.setAttribute('opacity', t < 3.4 ? hump(q) : hump(q) * (1 - seg(t, 3.4, 3.8)));
      });
    }
  };
}
