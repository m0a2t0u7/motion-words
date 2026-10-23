// funny：友だちが変な顔で冗談を言うと、まめは吹き出しておなかを抱えて大笑いする（例文 That joke was really funny.）
import { seg, lerp, easeInOut, easeOut, hump, clamp } from '../ease.js';
import { CO, P, blinkAt, reach, sc } from './member.js';
import { cue, talk, drop } from './in-common.js';
import { homeBg, sofaProp } from './furniture.js';

export const meta = { duration: 4.4, beats: [[0, '冗談を言う'], [1.6, '吹き出す'], [2.6, '大笑い']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 1.05, FY = 236;
  homeBg(k, { FY, winX: 160, winW: 90 });
  const fr = k.buddy({ x: 290, y: FY, scale: 1, facing: -1, ...CO(k) });
  const b = k.buddy({ x: 130, y: FY, scale: S, facing: 1 });
  const joke = cue(k, '', 84, 40, 1);
  // 吹き出しの中：ダジャレの絵（バナナがすべる）
  const jg = g({}, joke.g);
  el('path', { d: 'M -22 4 Q -10 12 4 2 Q -8 6 -20 0 Z', fill: pal.yellow, stroke: pal.yellowDark, 'stroke-width': 1.5 }, jg);
  el('path', { d: 'M 8 10 q 6 -10 14 -2', stroke: pal.sub, 'stroke-width': 2, fill: 'none' }, jg);
  k.text(18, -8, '?!', { 'font-size': 14, fill: pal.coralDark }, jg);
  const ha = [0, 1, 2].map((i) => k.text(0, 0, 'HA', { 'font-size': 16 - i * 2, fill: pal.mintDark }));
  const tears = [0, 1].map(() => drop(k));
  return {
    update(t) {
      // 友だち：身ぶりつきで話す → 自分も笑う
      P(fr, { look: 0.6, blink: blinkAt(t, 1), mood: talk(t, 0.3, 1.5) || (t > 2.2 ? 'grin' : 'smile'), armR: 8 + 100 * hump(seg(t, 0.4, 1.4)), armL: 8 + 60 * hump(seg(t, 0.6, 1.5)), lean: -6 * hump(seg(t, 0.8, 1.4)) });
      joke.show(seg(t, 0.3, 0.6) - seg(t, 1.6, 1.8), 250, 110);
      // まめ：1.6 で吹き出し、体をゆすって大笑い・おなかを抱える
      const L = seg(t, 1.6, 1.9), shake = t > 1.7 ? Math.abs(Math.sin((t - 1.7) * 14)) : 0;
      const bend = easeInOut(seg(t, 2.4, 2.9));
      P(b, { look: 0.5, blink: t > 1.7 ? 1 : blinkAt(t), mood: t > 1.6 ? 'grin' : 'smile', lean: lerp(-12 * L, 22, bend) + 3 * shake, squash: 1 - 0.06 * shake * L, lift: 6 * shake * (1 - bend) * L });
      b.pose({ armR: lerp(lerp(8, 130, L), reach(b, S, 'R', 150, FY - 26), bend), armL: lerp(lerp(8, 130, L), 30, bend) });
      ha.forEach((h, i) => { const q = ((t - 1.7 - i * 0.3) % 1.2) / 1.2; const on = t > 1.7 + i * 0.3; tf(h, 160 + i * 34 + q * 10, FY - 120 - q * 40 - i * 8, -10 + i * 10, on ? sc(hump(q)) : 0.001); });
      tears.forEach((d, i) => { const q = ((t * 1.3 + i * 0.5) % 1); tf(d, 130 + (i ? -28 : 28), FY - 66 + 10 * q, 0, t > 2.0 ? sc(1 - q) * 0.8 : 0.001); });
    }
  };
}
