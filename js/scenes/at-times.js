// at times：仕事から帰る毎日。たいていは元気だが、ときどき（3日目）ぐったり疲れて肩を落とす（At times, I feel tired after work.）
import { seg, lerp, easeInOut, easeOut, hump, clamp } from '../ease.js';
import { roomBg } from './look-over.js';
import { gait } from './dig.js';
import { P, calendar, drop } from './so-far-so-good.js';

export const meta = { duration: 4.4, beats: [[0, '帰宅（元気）'], [2.2, 'ときどき疲れる'], [3.3, 'また元気']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = roomBg(k, 'home', 240, 'evening');
  el('rect', { x: 330, y: FY - 130, width: 64, height: 130, fill: pal.woodDark });
  el('circle', { cx: 342, cy: FY - 64, r: 4, fill: pal.yellow });
  const cal = calendar(k, 200, 40, 46);
  const G = k.buddy({ x: 330, y: FY, facing: -1 });
  const bag = g({}); el('rect', { x: -12, y: 0, width: 24, height: 18, rx: 3, fill: pal.ink }, bag); el('path', { d: 'M -6 0 Q 0 -8 6 0', stroke: pal.ink, 'stroke-width': 2.5, fill: 'none' }, bag);
  const sw = drop(k);
  const zz = k.text(0, 0, 'z', { 'font-size': 16, fill: pal.sub });
  const D = 1.1, TIRED = [false, false, true, false];
  return {
    update(t) {
      const i = Math.min(3, Math.floor(t / D)), u = t - i * D, tired = TIRED[i];
      cal.set(['M', 'T', 'W', 'T'][i], hump(seg(u, 0, 0.12)) * (i > 0 ? 1 : 0));
      const xf = (tt) => lerp(330, 200, easeInOut(seg(tt - i * D, 0.05, tired ? 0.75 : 0.55)));
      const p = gait(xf, t, 330);
      const re = seg(u, tired ? 0.75 : 0.55, D);
      const joy = hump(re);
      P(G, { x: p.x, walk: p.walk, facing: -1, lean: tired ? 10 + 8 * easeOut(re) : p.lean, armL: tired ? 4 : p.armL, armR: tired ? 2 : 8 + 150 * joy,
        squash: tired ? 1 - 0.08 * easeOut(re) : 1, lift: tired ? 0 : 10 * joy, mood: tired ? 'sad' : 'grin', blink: tired ? 0.6 : 0, look: tired ? -0.2 : 0.4 });
      const h = G.handPos('L');
      tf(bag, h.x, h.y - 2 + (tired ? 4 : 0));
      tf(sw, p.x + 26, FY - 96 + 12 * u, 0, 0.9); sw.setAttribute('opacity', tired && u > 0.3 ? 1 : 0);
      tf(zz, p.x - 34 - 6 * u, FY - 100 - 14 * u, -10); zz.setAttribute('opacity', tired && u > 0.6 ? 1 : 0);
    }
  };
}
