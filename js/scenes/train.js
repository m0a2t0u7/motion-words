// train：2人が大会に向けて、コーンの間をダッシュで何度も往復し、汗だくになる（例文 They train hard for the race.）
import { seg, lerp, easeInOut, easeOut, hump, clamp } from '../ease.js';
import { P, run } from './run-after.js';
import { drop } from './so-far-so-good.js';
import { sign } from './queue-up.js';

export const meta = { duration: 4.4, beats: [[0, 'ダッシュ'], [1.6, '何度も往復'], [3.5, '汗だく']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 0.62;
  const FY = k.backdrop({ floorY: 226, mood: 'outdoor' });
  el('rect', { x: 0, y: 150, width: 400, height: 76, fill: '#DCEFE0' });
  sign(k, 200, 160, 'RACE', { w: 84, h: 30, color: pal.yellow, post: 30 });
  el('rect', { x: 0, y: FY, width: 400, height: 74, fill: '#E98A6A' });
  [FY + 24, FY + 50].forEach((y) => el('line', { x1: 0, y1: y, x2: 400, y2: y, stroke: '#fff', 'stroke-width': 3 }));
  const cone = (x) => { k.shadow(x, FY + 1, 12, 3); el('path', { d: `M ${x - 10} ${FY} L ${x} ${FY - 26} L ${x + 10} ${FY} Z`, fill: '#FF9E4A' }); el('rect', { x: x - 6, y: FY - 14, width: 12, height: 4, fill: '#fff' }); };
  cone(40); cone(360);
  const A = k.buddy({ y: FY + 4, scale: S });
  const B = k.buddy({ y: FY + 30, scale: S * 1.04, color: pal.coral, dark: pal.coralDark });
  const drops = [0, 1, 2, 3].map(() => drop(k));
  // 往復：0〜3.3 秒で 1.5 往復して止まる
  const shuttle = (t, d) => { const u = clamp((t - d) / 3.3); const ph = u * 3; const i = Math.floor(Math.min(ph, 2.999)); const f = easeInOut(ph - i); const a = i % 2 ? 330 : 70, b = i % 2 ? 70 : 330; return u >= 1 ? 330 : lerp(a, b, f); };
  return {
    update(t) {
      [[A, 0, FY + 4], [B, 0.15, FY + 30]].forEach(([p, d, y], j) => {
        const r = run((tt) => shuttle(tt, d) - 40 * j, t, 70 - 40 * j, 1);
        const tired = seg(t, 3.4 + d, 3.9 + d);
        P(p, { x: r.x, y, walk: r.walk, armL: r.armL, armR: r.armR, facing: r.facing, lift: r.lift, lean: r.lean * (1 - tired) + 26 * tired,
          armL: lerp(r.armL, 40, tired), armR: lerp(r.armR, 40, tired), squash: 1 - 0.05 * tired * (1 + Math.sin(t * 14)), mood: tired > 0.5 ? 'open' : 'flat', blink: tired * 0.4, look: r.facing * 0.5 });
        drops.slice(j * 2, j * 2 + 2).forEach((dd, i) => { const q = ((t * 1.3 + i * 0.5 + j * 0.2) % 1);
          tf(dd, r.x + (i ? 1 : -1) * (20 + q * 6) * S, y - 80 * S + q * 26, 0, 0.9); dd.setAttribute('opacity', t > 1.2 ? Math.sin(q * Math.PI) : 0); });
      });
    }
  };
}
