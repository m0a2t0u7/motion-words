// neck：一日中パソコンで下を向いて仕事。終わって顔を上げると首が痛く、首をさすって回す（例文 My neck hurts after work.）
import { seg, lerp, easeInOut, easeOut, hump, clamp } from '../ease.js';
import { hp, reach, P, blinkAt, bp, faceOf, ache, spot } from './body.js';
import { officeBg, desk, monitor } from './get-on-with.js';
import { clock } from './run-after.js';

export const meta = { duration: 4.4, beats: [[0, '仕事中'], [1.6, '仕事が終わる'], [2.4, '首が痛い']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 1.15, FY = 236;
  officeBg(k, FY, 40);
  const ck = clock(k, 300, 58, 18);
  el('rect', { x: 100, y: FY - 30, width: 56, height: 8, rx: 3, fill: pal.sub }); el('rect', { x: 124, y: FY - 22, width: 7, height: 22, fill: pal.sub });
  const b = k.buddy({ x: 128, y: FY - 26, scale: S });
  const top = desk(k, 170, 150, FY);
  monitor(k, 262, top);
  el('rect', { x: 196, y: top - 6, width: 46, height: 6, rx: 2, fill: '#C9D2DE' });
  const hurt = ache(k), ring = spot(k, pal.red);
  return {
    update(t) {
      ck.set(lerp(9, 18, easeInOut(seg(t, 0, 1.6))), lerp(0, 0, 1) + (lerp(9, 18, easeInOut(seg(t, 0, 1.6))) % 1) * 60);
      const work = t < 1.6, typing = work ? Math.sin(t * 22) : 0;
      const sit = easeInOut(seg(t, 1.6, 2.0)), rub = easeInOut(seg(t, 2.4, 2.8));
      const roll = t > 2.9 ? Math.sin((t - 2.9) * 5) * 10 : 0;
      P(b, { y: FY - 26, lean: lerp(16, -2, sit) + roll * 0.4, look: work ? 0.6 : 0.2, mood: t > 2.2 ? 'sad' : 'flat', blink: t > 2.4 ? 0.5 : blinkAt(t), armL: 10 });
      faceOf(b).setAttribute('transform', `translate(${(work ? 4 : roll * 0.3).toFixed(2)} ${(work ? 6 : 0).toFixed(2)})`);
      const kb = { x: 214 + 4 * typing, y: top - 8 };
      const nk = bp(b, S, 20, -36);
      const tg = work ? kb : t < 2.4 ? { x: lerp(kb.x, b.state.x + 34, sit), y: lerp(kb.y, FY - 40, sit) } : { x: lerp(b.state.x + 34, nk.x + 4, rub), y: lerp(FY - 40, nk.y + 3 * Math.sin(t * 14) * rub, rub) };
      b.pose({ armR: reach(b, S, 'R', tg.x, tg.y) });
      const ap = easeOut(seg(t, 2.1, 2.4));
      hurt.set(ap, nk.x + 22, nk.y - 8, t, 60);
      ring.set(seg(t, 2.1, 2.4), nk.x, nk.y, 16, t);
    }
  };
}
