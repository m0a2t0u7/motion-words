// show up：待ち合わせの時計の下で待つ相手。30分たってから、まめが走って現れる（例文 He showed up thirty minutes late.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';
import { P, blinkAt, run, walkTo, clock, tree } from './run-after.js';
import { streetBg } from './weigh.js';

export const meta = { duration: 4.6, beats: [[0, '待っている'], [1.8, '30分たつ'], [3.4, 'やっと来た']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = streetBg(k, 236);
  // 時計台
  el('rect', { x: 236, y: 64, width: 8, height: 172, fill: '#8F9BB0' });
  k.shadow(240, 237, 16, 3);
  const ck = clock(k, 240, 64, 26);
  const tag = k.text(284, 64, '+30', { 'font-size': 16, fill: pal.coralDark, opacity: 0 });
  const S = 0.82;
  const w8 = k.buddy({ x: 290, y: FY + 4, scale: S, facing: -1, color: pal.coral, dark: pal.coralDark });
  const b = k.buddy({ x: -40, y: FY + 4, scale: S });
  const sweat = el('path', { d: 'M 0 -6 Q 4 0 0 4 Q -4 0 0 -6 Z', fill: pal.water });
  const xf = (t) => lerp(-40, 192, easeOut(seg(t, 2.6, 3.6)));
  return {
    update(t) {
      const m = 30 * easeInOut(seg(t, 0.4, 2.6));
      ck.set(10, m);
      const tq = seg(t, 2.5, 2.8); tag.setAttribute('opacity', tq); tf(tag, 0, 4 * (1 - tq));
      // 待つ人：足ぶみ・腕組み・時計を見上げる
      const tap = t < 2.8 ? Math.max(0, Math.sin(t * 9)) : 0;
      const seen = easeInOut(seg(t, 2.9, 3.3));
      P(w8, { x: 290, facing: -1, armL: 40, armR: 40, look: lerp(-0.3 + 0.2 * Math.sin(t * 1.5), 0.7, seen), lean: -2, squash: 1 - 0.02 * tap, mood: t > 3.6 ? 'flat' : 'flat', blink: blinkAt(t, 1) });
      // まめ：走ってきて、止まってぺこり
      const r = run(xf, t, -40);
      const bow = hump(seg(t, 3.7, 4.4));
      P(b, { ...r, facing: 1, lean: r.lean + 30 * bow, squash: 1 - 0.06 * bow, armL: r.m > 0.1 ? r.armL : 8, armR: r.m > 0.1 ? r.armR : 8, mood: t > 3.6 ? 'sad' : 'open', look: 0.6, blink: blinkAt(t) });
      const sq = seg(t, 3.5, 4.4);
      tf(sweat, b.state.x - 18, FY - 76 + 10 * sq); sweat.setAttribute('opacity', sq > 0 && sq < 1 ? 1 : 0);
    }
  };
}
