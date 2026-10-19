// ice：カフェで飲み物を差し出し「氷を入れてもらえる？」。店員が氷を1つずつグラスへ入れる（例文 Can I have some ice in my drink?）
import { seg, lerp, easeInOut, easeOut, easeIn, clamp, hump, wobble } from '../ease.js';
import { hp, reach, P, blinkAt, popIn } from './nature.js';
import { room } from './dig.js';
import { say } from './look-over.js';

export function cube(k, parent, s = 1) {
  const g = k.g({}, parent);
  k.el('rect', { x: -6 * s, y: -6 * s, width: 12 * s, height: 12 * s, rx: 2.5 * s, fill: '#E3F5FD', stroke: '#9ED4EE', 'stroke-width': 1.5 }, g);
  k.el('path', { d: `M ${-3 * s} ${-3 * s} h ${4 * s}`, stroke: '#fff', 'stroke-width': 2, 'stroke-linecap': 'round' }, g);
  return g;
}

export const meta = { duration: 4.4, beats: [[0, '氷ください？'], [1.3, '氷を入れる'], [3.4, '氷入りの飲み物']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 1;
  const r = room(k, 'indoor');
  el('rect', { x: 250, y: 60, width: 110, height: 50, rx: 6, fill: '#3F4A5C' });
  [0, 1, 2].forEach((i) => el('rect', { x: 262 + i * 32, y: 72, width: 22, height: 6, rx: 3, fill: '#fff', opacity: 0.7 }));
  const clerk = k.buddy({ x: 214, y: 222, scale: S, color: pal.coral, dark: pal.coralDark, facing: -1 });
  // 店員の氷入れ（カウンター上）
  el('rect', { x: 268, y: 150, width: 34, height: 46, rx: 4, fill: '#E9EEF4', stroke: '#C9D6E3', 'stroke-width': 2 });
  el('rect', { x: 274, y: 140, width: 22, height: 10, rx: 3, fill: '#C9D6E3' });
  r.front();
  const b = k.buddy({ x: 104, y: 236, scale: S });
  // グラス（原点＝持ち手の位置）
  const gl = g({});
  const ices = [0, 1, 2].map(() => cube(k, undefined, 0.9));
  const glass = g({}, gl);
  el('path', { d: 'M -13 -40 L -11 4 Q -11 8 -7 8 L 7 8 Q 11 8 11 4 L 13 -40 Z', fill: '#FFB547', opacity: 0.85 }, glass);
  el('path', { d: 'M -13 -40 L -11 4 Q -11 8 -7 8 L 7 8 Q 11 8 11 4 L 13 -40', fill: 'none', stroke: '#C9D6E3', 'stroke-width': 2 }, glass);
  const q = say(k, 64, 40, -1);
  const qi = cube(k, q.g, 1.2); tf(qi, -10, 0); k.text(14, 1, '?', { 'font-size': 20 }, q.g);
  const T = [1.4, 2.1, 2.8];
  return {
    update(t) {
      const off = easeOut(seg(t, 0.3, 0.9));
      P(b, { armR: lerp(8, 70, off), lean: 4 * off, look: 0.5, mood: t < 1.3 ? 'open' : 'grin', blink: blinkAt(t) });
      const h = hp(b, S, 'R', 28);
      tf(gl, h.x + 4, h.y);
      q.show(seg(t, 0.4, 0.8) * (1 - seg(t, 1.3, 1.5)), 150, 92);
      // 店員：箱から氷をつまみ、グラスの上で放す
      // 手を台の下（氷の箱）へ下ろし、つまんでグラスの上へ
      const RX = 196, RY = 214, GX = h.x + 4, GY = h.y - 54;
      let tx = RX, ty = RY;
      const k3 = clamp(Math.floor((t - 1.0) / 0.7), 0, 2), lp = seg(t - 1.0 - k3 * 0.7, 0, 0.7);
      if (t > 1.0 && t < 3.1) {
        const go = easeInOut(seg(lp, 0, 0.45)), back = k3 < 2 ? easeInOut(seg(lp, 0.6, 1)) : 0;
        const m = go * (1 - back); tx = lerp(RX, GX, m); ty = lerp(RY, GY, m);
      }
      if (t >= 3.1) { const m = 1 - easeInOut(seg(t, 3.1, 3.6)); tx = lerp(RX, GX, m); ty = lerp(RY - 30, GY, m); }
      P(clerk, { facing: -1, look: -0.5, lean: 6, mood: 'smile', blink: blinkAt(t, 1) });
      clerk.pose({ armR: reach(clerk, S, 'R', tx, ty) });
      const ch = hp(clerk, S, 'R', 28);
      ices.forEach((n, i) => {
        const drop = T[i] - 0.05, f = seg(t, drop, drop + 0.3);
        if (t < drop - 0.4) tf(n, 0, 0, 0, 0.001);
        else if (t < drop) tf(n, ch.x, ch.y + 4, 0, ch.y + 4 < 190 ? 1 : 0.001);
        else tf(n, h.x + 4 + (i - 1) * 5, lerp(ch.y + 4, h.y - 10 - i * 9, easeIn(f)) + 2 * wobble(seg(t, drop + 0.3, drop + 0.8), 2, 5), i * 15 * f);
      });
    }
  };
}
