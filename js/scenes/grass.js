// grass：公園の芝生へ歩いてきた2人が、草の上に並んで腰を下ろす（例文 We sat on the grass.）
import { seg, lerp, easeInOut, wobble, hump } from '../ease.js';
import { scene, hills, treeG, sunG, gait, P, blinkAt, tufts } from './nature.js';

export const meta = { duration: 4.2, beats: [[0, '芝生へ'], [1.8, '腰を下ろす'], [3.0, '草の上に座った']] };

export function create(k) {
  const { tf, pal } = k, S = 0.85;
  const { FY } = scene(k, { FY: 210, ground: '#9ED69F', edge: '#8CCB8F' });
  hills(k, 210);
  const sun = sunG(k, 16); tf(sun.g, 340, 44);
  tf(treeG(k, 1.1).g, 330, 212);
  const GY = 250;
  const a = k.buddy({ x: -40, y: GY, scale: S });
  const c = k.buddy({ x: -110, y: GY, scale: S, color: pal.coral, dark: pal.coralDark });
  tufts(k, GY, 0, 400, '#7FC284', 16);
  tufts(k, GY + 14, 0, 400, '#8ACB8E', 12);
  const fa = (t) => lerp(-40, 220, easeInOut(seg(t, 0.1, 1.9)));
  const fc = (t) => lerp(-110, 160, easeInOut(seg(t, 0.25, 2.1)));
  const sit = (t, b, f, x0, t0, off) => {
    const w = gait(f, t, x0, 16, 0.12);
    const s = easeInOut(seg(t, t0, t0 + 0.6)), land = wobble(seg(t, t0 + 0.6, t0 + 1.2), 2, 5);
    P(b, { x: w.x, y: GY + 16 * s, walk: w.walk * (1 - s), armL: lerp(w.armL, 40, s), armR: lerp(w.armR, 40, s), lean: w.lean * (1 - s) - 4 * s, squash: 1 - 0.08 * s - 0.04 * land, look: lerp(0.5, off ? 0.4 : -0.4, s), mood: s > 0.6 ? 'grin' : 'smile', blink: blinkAt(t, off) });
  };
  return {
    update(t) {
      sit(t, a, fa, -40, 2.1, 0);
      sit(t, c, fc, -110, 2.35, 1);
      sun.rays.setAttribute('transform', `rotate(${t * 12})`);
    }
  };
}
