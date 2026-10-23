// careful：包丁を持つまめに「気をつけて！」と声がかかる。まめは指を丸めて人参を押さえ、ゆっくり慎重に切る（例文 Be careful with that knife.）
import { seg, lerp, easeInOut, easeOut, hump, clamp } from '../ease.js';
import { CO, hp, reach, P, blinkAt, wear, deskFront, sc } from './member.js';
import { kitchenBg } from './weigh.js';
import { cue, talk } from './in-common.js';

export const meta = { duration: 4.4, beats: [[0, '包丁を持つ'], [0.8, '気をつけて'], [1.8, 'ゆっくり切る']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 1.05, FY = 236;
  kitchenBg(k, FY);
  const mom = k.buddy({ x: 330, y: FY, scale: 0.95, facing: -1, ...CO(k) }); wear(k, mom, 'apron', '#fff');
  const b = k.buddy({ x: 130, y: FY, scale: S, facing: 1 }); wear(k, b, 'apron', '#F7B6C8');
  const TOP = FY - 40;
  deskFront(k, 100, 160, TOP, FY);
  // まな板と人参
  el('rect', { x: 150, y: TOP - 6, width: 100, height: 6, rx: 2, fill: '#E9D4AE' });
  const car = el('rect', { y: TOP - 14, height: 9, rx: 4, fill: '#F2994A' });
  el('path', { d: `M 232 ${TOP - 10} l 10 -6 M 232 ${TOP - 10} l 10 2`, stroke: pal.green, 'stroke-width': 3, 'stroke-linecap': 'round' });
  const slices = [0, 1, 2].map(() => el('ellipse', { rx: 2.5, ry: 4.5, fill: '#F2994A', stroke: '#E07B2A', 'stroke-width': 1 }));
  // 左手（丸めた指）で押さえる：手前に描く
  const fist = el('circle', { r: 7, fill: pal.mint, stroke: pal.mintDark, 'stroke-width': 2.5 });
  // 包丁（原点＝握り、刃は右へ）
  const knife = g({});
  el('rect', { x: -12, y: -3, width: 14, height: 6, rx: 3, fill: pal.woodDark }, knife);
  el('path', { d: 'M 2 -4 L 32 -4 Q 36 4 30 6 L 2 6 Z', fill: '#DCE3EB', stroke: '#9AA6B6', 'stroke-width': 1.2 }, knife);
  const warn = cue(k, 'Careful!', 82, 30, 1, 13);
  return {
    update(t) {
      P(mom, { look: 0.6, blink: blinkAt(t, 1), mood: talk(t, 0.7, 1.4) || (t > 3.4 ? 'grin' : 'flat'), armR: 8 + 90 * hump(seg(t, 0.6, 1.6)), lean: 6 * hump(seg(t, 0.6, 1.6)) });
      warn.show(seg(t, 0.7, 1.0) - seg(t, 1.9, 2.1), 290, 110);
      // 1回ずつ：上げて → ゆっくり下ろす
      const n = clamp(Math.floor((t - 1.8) / 0.75), -1, 2), q = t > 1.8 ? ((t - 1.8) % 0.75) / 0.75 : 0;
      const cutX = 214 - Math.max(0, n) * 12;
      const down = t > 1.8 && t < 4.05 ? easeInOut(seg(q, 0.25, 0.85)) : 0;
      const kx = cutX - 16, ky = lerp(TOP - 30, TOP - 10, down);
      P(b, { lean: 10, look: 0.9, blink: t > 1.6 ? 0 : blinkAt(t), mood: t > 1.0 ? 'flat' : 'smile', squash: 1 });
      b.pose({ armR: reach(b, S, 'R', t < 1.6 ? 180 : kx, t < 1.6 ? TOP - 40 - 6 * Math.sin(t * 4) * (t < 0.8 ? 1 : 0) : ky) });
      const h = hp(b, S, 'R', 30);
      tf(knife, h.x, h.y, t < 1.6 ? -10 + 20 * Math.sin(t * 4) * (t < 0.8 ? 1 : 0) : 8 * (1 - down), S);
      // 人参は切った分だけ短くなる
      const cuts = t < 1.8 ? 0 : clamp(n + (q > 0.85 ? 1 : 0), 0, 3);
      const left = 214 - cuts * 12 + 0;
      k.set(car, { x: 168, width: Math.max(10, left - 168) });
      slices.forEach((s, i) => tf(s, 222 + i * 7, TOP - 10, 0, i < cuts ? 1 : 0.001));
      tf(fist, lerp(172, 176, seg(t, 1.6, 1.8)), TOP - 14, 0, S);
    }
  };
}
