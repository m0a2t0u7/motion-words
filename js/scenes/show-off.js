// show off：まめが新しい車の横で胸を張り、手を広げて見せびらかす。友だちが見に来る（例文 He loves to show off his new car.）
import { seg, lerp, easeInOut, easeOut, backOut, hump } from '../ease.js';
import { P, blinkAt, walkTo, car, star } from './run-after.js';
import { streetBg } from './weigh.js';

export const meta = { duration: 4.4, beats: [[0, '新しい車'], [1.4, '見せびらかす'], [3.4, '自慢げ']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = streetBg(k, 236);
  const cr = car(k, pal.red, '#C9473C', true); cr.set(236, 0, FY);
  const S = 0.82;
  const b = k.buddy({ x: 150, y: FY + 8, scale: S });
  const f = k.buddy({ x: 440, y: FY + 10, scale: S * 0.92, facing: -1, color: pal.coral, dark: pal.coralDark });
  const sp = [0, 1, 2, 3].map(() => star(k));
  const xf = (t) => lerp(440, 352, easeInOut(seg(t, 0.8, 2.0)));
  return {
    update(t) {
      // 布で車体をこする→くるっと向き、両手を広げて胸を張る
      const rub = t < 1.4 ? Math.sin(t * 12) * 12 : 0;
      const pres = easeOut(seg(t, 1.5, 1.9));
      const proud = 0.04 * hump(seg(t, 2.0, 2.6)) + 0.03 * Math.sin(t * 4) * seg(t, 2.6, 3.0);
      P(b, { x: 150, facing: t < 1.5 ? 1 : -1 + 2 * (t > 1.5 ? 1 : 0), armR: t < 1.4 ? 70 + rub : lerp(70, 120, pres), armL: t < 1.4 ? 10 : lerp(10, 120, pres), lean: t < 1.4 ? 8 : -8 * pres, squash: 1 + proud, lift: 0, mood: t > 1.6 ? 'grin' : 'smile', look: t > 1.5 ? 1 : 0.6, blink: t > 2 ? 0.5 : blinkAt(t) });
      const wk = walkTo(xf, t, 440, -1);
      P(f, { ...wk, facing: -1, look: -0.2, mood: t > 2.0 ? 'open' : 'smile', armL: wk.armL, armR: wk.armR, blink: blinkAt(t, 1) });
      sp.forEach((s, i) => s.set([186, 230, 270, 296][i], [FY - 70, FY - 80, FY - 50, FY - 34][i], seg((t - 1.6 - i * 0.2) % 1.4 + (t > 1.6 ? 0 : -1), 0, 0.9)));
    }
  };
}
