// hip：女の人が腰に両手をあてて、胸をはって立つ（例文 She put her hands on her hips.）
import { seg, lerp, easeInOut, easeOut, backOut, hump, clamp } from '../ease.js';
import { P, blinkAt, bp, limb, spot } from './body.js';
import { parkBg } from './bench.js';

export const meta = { duration: 4.0, beats: [[0, '立っている'], [1.0, '手を腰へ'], [2.2, '腰に手をあてた']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 1.5, FY = 246;
  parkBg(k, 236);
  const b = k.buddy({ x: 200, y: FY, scale: S, color: pal.coral, dark: pal.coralDark });
  b.armL.a.setAttribute('display', 'none'); b.armR.a.setAttribute('display', 'none');
  const aL = limb(k, pal.coral, pal.coralDark, S), aR = limb(k, pal.coral, pal.coralDark, S);
  const rL = spot(k), rR = spot(k);
  return {
    update(t) {
      const p = easeInOut(seg(t, 0.8, 1.6)), pr = easeOut(seg(t, 1.6, 2.0));
      P(b, { lean: -4 * pr, squash: 1 + 0.03 * pr, mood: t > 1.8 ? 'grin' : 'smile', blink: blinkAt(t), look: 0 });
      ['L', 'R'].forEach((s, i) => {
        const d = s === 'R' ? 1 : -1;
        const sh = bp(b, S, 27 * d, -46);
        const down = { x: sh.x + 4 * d * S, y: sh.y + 25 * S };
        const hipP = bp(b, S, 29 * d, -20);
        const hd = { x: lerp(down.x, hipP.x, p), y: lerp(down.y, hipP.y, p) };
        (i ? aR : aL).set(sh, hd, s === 'R' ? 1 : -1);
        (i ? rR : rL).set(seg(t, 2.0, 2.4), hipP.x, hipP.y, 16, t);
      });
    }
  };
}
