// wise：おこづかいをもらったまめが、お菓子屋の前で少し考え、硬貨を貯金箱に入れる。貯金箱がだんだん重くなる（例文 It was wise of you to save some money.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';
import { P, blinkAt, hp, hold, aim, coin, homeBg, thought, heart, mark, person } from './confused.js';

export const meta = { duration: 4.4, beats: [[0, '使う？貯める？'], [1.6, '貯金箱へ'], [3.4, '賢い選択']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 1;
  const FY = homeBg(k, { winX: 300 });
  // 低い棚の上の貯金箱（ぶた）
  const top = FY - 40;
  k.shadow(240, FY + 1, 50, 4);
  el('rect', { x: 196, y: top, width: 90, height: 40, rx: 4, fill: pal.wood });
  const pig = g({}); tf(pig, 244, top);
  const pb = g({}, pig);
  el('ellipse', { cx: 0, cy: -22, rx: 28, ry: 22, fill: '#F7A9B4' }, pb);
  el('ellipse', { cx: 26, cy: -24, rx: 7, ry: 8, fill: '#F28C9D' }, pb);
  el('path', { d: 'M -14 -40 L -8 -50 L -2 -42 Z', fill: '#F28C9D' }, pb);
  el('circle', { cx: 14, cy: -30, r: 2.4, fill: pal.ink }, pb);
  el('rect', { x: -8, y: -45, width: 16, height: 3.5, rx: 1.5, fill: pal.ink }, pb);
  [-14, 12].forEach((x) => el('rect', { x: x - 4, y: -6, width: 8, height: 6, fill: '#F28C9D' }, pb));
  const b = k.buddy({ x: 150, y: FY, scale: S });
  const coins = [0, 1, 2].map(() => coin(k, undefined, 7));
  const th = thought(k, 90, 54, -1);
  const candy = g({}, th.inner);
  el('circle', { cx: -18, cy: 0, r: 9, fill: pal.red }, candy); el('path', { d: 'M -27 0 l -6 -5 v 10 Z M -9 0 l 6 -5 v 10 Z', fill: pal.red }, candy);
  const pigI = g({}, th.inner); el('ellipse', { cx: 20, cy: 2, rx: 13, ry: 10, fill: '#F7A9B4' }, pigI);
  const xm = mark(k, 'x', th.inner, 0.8), ok = mark(k, 'check', th.inner, 0.8);
  const nod = person; void nod;
  const hs = [0, 1].map(() => heart(k));
  return {
    update(t) {
      const think = seg(t, 0.2, 0.5) * (1 - seg(t, 1.5, 1.7));
      tf(th.g, 120, FY - 150, 0, think > 0 ? easeOut(think) : 0.001);
      tf(xm, -18, 0, 0, t > 0.8 ? 1 : 0.001); tf(ok, 20, 0, 0, t > 1.1 ? 1 : 0.001);
      // 硬貨を1枚ずつ投入（つまむ→穴の上→落とす）
      const T = [1.7, 2.3, 2.9], slot = { x: 244, y: top - 50 };
      let tx = 186, ty = FY - 60;
      P(b, { x: 150, look: 0.8, lean: 4, armL: 30, mood: t > 3.3 ? 'grin' : 'smile', blink: blinkAt(t) });
      coins.forEach((c, i) => {
        const q = seg(t, T[i], T[i] + 0.4), d = seg(t, T[i] + 0.4, T[i] + 0.55);
        const hx = lerp(176, slot.x, easeInOut(q)), hy = lerp(FY - 50, slot.y - 14, easeInOut(q)) - 14 * hump(q);
        if (t > T[i] - 0.3 && t < T[i] + 0.55) { tx = hx; ty = hy + 4; }
        if (t < T[i]) tf(c, hp(b, S, 'L').x, hp(b, S, 'L').y - 4, 0, i === 0 || t > T[i] - 0.6 ? 1 : 0.001);
        else tf(c, hx, hy + 10 * d, 0, d >= 1 ? 0.001 : 1, 1 - 0.7 * d);
      });
      if (t > 1.4 && t < 3.5) aim(b, S, 'R', tx, ty); else b.pose({ armR: 20 });
      // 入るたびに貯金箱が少しはずむ
      const bump = [0, 1, 2].reduce((a, i) => a + hump(seg(t, T[i] + 0.5, T[i] + 0.75)), 0);
      tf(pb, 0, -3 * bump, 0, 1 + 0.03 * Math.min(3, Math.floor(Math.max(0, t - 2.15) / 0.6)), 1 - 0.04 * bump);
      hs.forEach((n, i) => { const q = seg(t, 3.5 + i * 0.25, 4.4); tf(n, 220 + i * 44, top - 80 - 20 * q, 0, q > 0 ? 1.2 * hump(q * 0.7 + 0.3) : 0.001); });
    }
  };
}
