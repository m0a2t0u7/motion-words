// knee：走っていて石につまずき転ぶ。ひざをかかえて、ばんそうこうをはる（例文 He fell and hurt his knee.）
import { seg, lerp, easeInOut, easeOut, easeIn, hump, clamp } from '../ease.js';
import { hp, reach, P, blinkAt, bp, gait, legs, legG, ache } from './body.js';
import { parkBg } from './bench.js';
import { bandage } from './finger.js';

export const meta = { duration: 4.4, beats: [[0, '走る'], [1.0, 'つまずいて転ぶ'], [2.4, 'ひざが痛い']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 1.3, FY = 236;
  parkBg(k, FY);
  el('ellipse', { cx: 196, cy: FY - 2, rx: 12, ry: 7, fill: '#9AA6B6' });
  const b = k.buddy({ x: 40, y: FY, scale: S });
  const band = bandage(k, legG(b, 1)); tf(band, 0, 8, 0, 0.001);
  const hurt = ache(k);
  const xf = (t) => lerp(40, 200, easeIn(seg(t, 0, 1.1)) * 0.4 + seg(t, 0, 1.1) * 0.6);
  return {
    update(t) {
      const gt = gait(xf, t, 40, 30), fall = easeIn(seg(t, 1.1, 1.4)), sit = easeOut(seg(t, 1.8, 2.3));
      if (t < 1.8) {
        P(b, { x: gt.x + 30 * fall, walk: gt.walk, lean: 10 + 75 * fall, lift: -10 * fall, armL: gt.armL + 90 * fall, armR: gt.armR + 90 * fall, mood: fall > 0.2 ? 'open' : 'grin', blink: t > 1.4 ? 1 : 0, squash: t > 1.4 ? 0.92 : 1 });
      } else {
        P(b, { x: 236, lift: 0, lean: lerp(85, 14, sit), mood: 'sad', blink: t < 2.6 ? 0.7 : blinkAt(t), squash: lerp(0.92, 0.88, sit), look: 0.6 });
        legs(b, -10, -70 * sit);
        const kn = hp(b, S, 'R', 0);
        const lg = legG(b, 1).getCTM ? null : null; void lg;
        const knee = { x: 236 + (12 + 8) * S, y: FY - 14 * S };
        b.pose({ armR: reach(b, S, 'R', knee.x, knee.y), armL: reach(b, S, 'L', knee.x - 6, knee.y + 4) });
        legs(b, -10, -70 * sit);
        hurt.set(easeOut(seg(t, 2.2, 2.5)) * (1 - 0.5 * seg(t, 3.2, 3.6)), knee.x + 18, knee.y - 10, t, 60);
        void kn;
      }
      tf(band, 0, 8, 0, Math.max(0.001, easeOut(seg(t, 3.2, 3.5))) * 0.9);
    }
  };
}
