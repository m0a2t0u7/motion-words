// regret：まめがきつい言葉を言ってしまい、友だちが悲しんで背を向ける。まめは口を押さえて悔やむ（例文 I regret saying those words.）
import { seg, lerp, easeInOut, easeOut, wobble, hump } from '../ease.js';
import { reach } from './dig.js';
import { P, blinkAt } from './run-after.js';
import { roomBg, say, cloud } from './look-over.js';

// とげとげの言葉の吹き出し（中身は記号）
export function spiky(k, parent) {
  const g = k.g({}, parent), pal = k.pal;
  let d = '';
  for (let i = 0; i < 20; i++) { const a = (i / 20) * Math.PI * 2, r = i % 2 ? 22 : 31; d += `${i ? 'L' : 'M'} ${(Math.cos(a) * r * 1.35).toFixed(1)} ${(Math.sin(a) * r).toFixed(1)} `; }
  k.el('path', { d: d + 'Z', fill: '#fff', stroke: pal.red, 'stroke-width': 2.5, 'stroke-linejoin': 'round' }, g);
  k.text(0, 1, '#!*%', { 'font-size': 15, fill: pal.red }, g);
  return g;
}

export const meta = { duration: 4.4, beats: [[0, 'きつい言葉'], [1.4, '友だちが悲しむ'], [2.6, '言わなければ…']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = roomBg(k, 'home', 240);
  const S = 0.95;
  const me = k.buddy({ x: 140, y: FY, scale: S });
  const fr = k.buddy({ x: 262, y: FY, scale: S, facing: -1, color: pal.coral, dark: pal.coralDark });
  const sp = g({}); spiky(k, sp);
  const tear = el('path', { d: 'M 0 -6 Q 4 0 0 4 Q -4 0 0 -6 Z', fill: pal.water });
  const th = cloud(k, 84, 54, -1);
  const mini = spiky(k, th.g); tf(mini, 0, -4, 0, 0.62);
  const x = el('path', { d: 'M -16 -16 L 16 16 M 16 -16 L -16 16', stroke: pal.ink, 'stroke-width': 4, 'stroke-linecap': 'round', opacity: 0.7 }, th.g);
  return {
    update(t) {
      // 言う（前のめりで腕を振る）
      const yell = hump(seg(t, 0.2, 1.3));
      const talking = t > 0.2 && t < 1.2 && Math.sin(t * 22) > -0.2;
      const real = easeOut(seg(t, 1.9, 2.3));
      P(me, { x: 140, lean: 10 * yell - 6 * real, armR: 8 + 60 * yell, armL: 8 + 20 * yell, mood: talking ? 'open' : t < 1.9 ? 'flat' : 'sad', look: t < 2.6 ? 0.7 : 0.1, blink: blinkAt(t), squash: 1 - 0.06 * real });
      if (real > 0) {
        const mx = 140 + 6, my = FY - 54 * S;
        me.pose({ armR: lerp(68, reach(me, S, 'R', mx + 8, my), real), armL: lerp(28, reach(me, S, 'L', mx - 8, my), real) });
      }
      // とげとげが相手に飛ぶ
      const fly = easeOut(seg(t, 0.5, 1.2));
      tf(sp, lerp(176, 218, fly), FY - 112 - 10 * hump(fly), 0, Math.max(0.001, easeOut(seg(t, 0.4, 0.7))));
      sp.setAttribute('opacity', 1 - seg(t, 1.3, 1.6));
      // 相手：びくっ → 悲しい → 背を向けて離れる
      const hurt = seg(t, 1.1, 1.3), turn = t > 2.2;
      const fx = lerp(262, 330, easeInOut(seg(t, 2.4, 3.6)));
      P(fr, { x: fx, facing: turn ? 1 : -1, lean: -8 * hump(seg(t, 1.1, 1.6)) + (turn ? 6 : 0), walk: (fx - 262) * 0.11, armL: 8, armR: 8,
        mood: hurt > 0 ? 'sad' : 'smile', look: turn ? 0 : 0.6, blink: blinkAt(t, 1), squash: 1 - 0.05 * hurt });
      tf(tear, fx - 12, FY - 62 + 24 * seg(t, 1.5, 2.3));
      tear.setAttribute('opacity', t > 1.4 && t < 2.3 ? 1 : 0);
      th.show(seg(t, 2.9, 3.3), 82, 70);
      x.setAttribute('opacity', 0.75 * seg(t, 3.4, 3.7));
    }
  };
}
