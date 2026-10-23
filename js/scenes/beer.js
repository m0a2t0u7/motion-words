// beer：仕事帰りの夕方、冷えたビールのジョッキを持ち上げて飲み、ひと息つく（例文 He had a cold beer after work.）
import { seg, lerp, easeInOut, easeOut, clamp, hump } from '../ease.js';
import { kitchen, TOP, arms, vessel, sip, tie, P, blinkAt } from './jam.js';
import { clock } from './run-after.js';
import { bagProp } from './bag.js';

export const meta = { duration: 4.4, beats: [[0, '仕事のあと'], [1.4, '冷えたビール'], [3.2, 'ぷはー']] };

export function create(k) {
  const { el, pal } = k, S = 1.2;
  const kit = kitchen(k, { mood: 'evening' });
  const ck = clock(k, 200, 56, 20); ck.set(6, 30);
  const b = k.buddy({ x: 170, y: kit.FY, scale: S });
  tie(k, b);
  kit.front();
  const bag = bagProp(k); k.tf(bag, 100, TOP - 36, 0, 1.1);
  const mug = vessel(k, null, { w: 26, h: 36, taper: 0.95, glass: true, handle: 9, liquid: '#F2B233', foam: true });
  const drops = [0, 1, 2, 3].map((i) => el('ellipse', { rx: 1.4, ry: 2.2, fill: '#fff', opacity: 0.9 }));
  const cold = [0, 1, 2].map(() => el('path', { d: 'M 0 0 l 3 -6 l 3 6', stroke: '#8FD3F4', 'stroke-width': 2.4, fill: 'none', 'stroke-linecap': 'round' }));
  const ahh = el('path', { d: 'M 0 0 q 8 -6 16 0 q 8 6 16 0', stroke: '#A9B4C4', 'stroke-width': 3.5, fill: 'none', 'stroke-linecap': 'round' });
  const A = arms(k, b, S);
  const MX = 236, MY = TOP + 2;
  return {
    update(t) {
      const q = easeInOut(seg(t, 1.6, 2.2)) * (1 - easeInOut(seg(t, 3.0, 3.5)));
      const rel = easeOut(seg(t, 3.3, 3.8));
      P(b, { lean: 2 - 4 * rel, squash: 1 + 0.03 * hump(seg(t, 3.3, 3.9)), look: 0.4, blink: q > 0.6 ? 1 : t > 3.4 ? 0.85 : blinkAt(t), mood: t > 3.3 ? 'grin' : q > 0.6 ? 'flat' : 'smile' });
      const lv = 0.82 - 0.5 * easeInOut(seg(t, 2.2, 3.0));
      mug.set(lv, 1);
      if (t < 1.2) { k.tf(mug.g, MX, MY, 0, 1.2); A.to('R', lerp(205, MX + 22, easeInOut(seg(t, 0.6, 1.2))), lerp(214, MY - 18, easeInOut(seg(t, 0.6, 1.2)))); }
      else sip(k, A, b, S, mug.g, 'R', { x: MX, y: MY }, q, { sc: 1.2, w: 26, h: 36, tilt: 45 });
      A.to('L', 150, 214);
      drops.forEach((d, i) => d.setAttribute('opacity', t < 1.6 ? 0.9 : 0));
      drops.forEach((d, i) => k.set(d, { cx: MX - 8 + i * 5, cy: MY - 10 - (i % 2) * 12 }));
      cold.forEach((c, i) => { k.tf(c, MX - 14 + i * 12, MY - 52 - 4 * Math.sin(t * 6 + i)); c.setAttribute('opacity', (seg(t, 0.4, 0.8) * (1 - seg(t, 1.4, 1.6))).toFixed(2)); });
      k.tf(ahh, 196, 120 - 6 * rel); ahh.setAttribute('opacity', (rel * (1 - seg(t, 4.2, 4.4) * 0.5)).toFixed(2));
    }
  };
}
