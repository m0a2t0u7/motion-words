// product：工場のベルトコンベアを台所用品（鍋・やかん・カップ）が流れ、まめが箱に詰める（例文 This company makes kitchen products.）
import { seg, lerp, easeOut, easeInOut, hump } from '../ease.js';
import { P, blinkAt } from './run-after.js';
import { roomBg } from './look-over.js';
import { reach } from './weigh.js';

export const meta = { duration: 4.4, beats: [[0, '台所用品が流れる'], [1.4, '箱に詰める'], [3.6, '箱がいっぱい']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 0.9;
  const FY = roomBg(k, 'office', 240);
  const by = 192;
  el('rect', { x: 10, y: by, width: 260, height: 14, rx: 7, fill: pal.sub });
  const stripes = [];
  for (let i = 0; i < 14; i++) stripes.push(el('rect', { y: by + 3, width: 8, height: 8, rx: 2, fill: pal.line }));
  [30, 120, 220].forEach((x) => el('rect', { x, y: by + 14, width: 8, height: FY - by - 14, fill: pal.sub }));
  const mk = (i) => {
    const o = g({});
    if (i === 0) { el('rect', { x: -16, y: -18, width: 32, height: 18, rx: 4, fill: pal.mint }, o); el('rect', { x: -22, y: -15, width: 8, height: 4, rx: 2, fill: pal.mintDark }, o); el('rect', { x: 14, y: -15, width: 8, height: 4, rx: 2, fill: pal.mintDark }, o); }
    if (i === 1) { el('path', { d: 'M -14 0 Q -16 -18 -4 -22 L 4 -22 Q 16 -18 14 0 Z', fill: pal.coral }, o); el('rect', { x: -4, y: -27, width: 8, height: 5, rx: 2, fill: pal.coralDark }, o); el('path', { d: 'M 14 -8 q 10 -2 8 -14', fill: 'none', stroke: pal.coralDark, 'stroke-width': 3 }, o); }
    if (i === 2) { el('path', { d: 'M -11 -20 H 11 L 8 0 H -8 Z', fill: pal.yellow }, o); el('path', { d: 'M 11 -15 q 9 0 7 8 q -2 4 -8 3', fill: 'none', stroke: pal.yellowDark, 'stroke-width': 3 }, o); }
    return o;
  };
  const items = [0, 1, 2].map(mk);
  const b = k.buddy({ x: 235, y: FY, scale: S });
  const bx = 300, bt = FY - 40;
  const box = g({});
  const boxIn = [0, 1, 2].map(() => g({}, box));
  const front = g({});
  el('rect', { x: bx - 28, y: bt, width: 56, height: 40, rx: 3, fill: '#D9B07A' }, front);
  el('rect', { x: bx - 28, y: bt, width: 56, height: 8, fill: '#C79A5E' }, front);
  const spark = k.text(bx + 4, bt - 34, '★', { 'font-size': 20, fill: pal.yellow });
  const pick = [250, by - 22], drop = [bx, bt - 6];
  return {
    update(t) {
      const off = (t * 40) % 24;
      stripes.forEach((s, i) => k.set(s, { x: 14 + i * 24 + off - 24 > 262 ? -50 : 14 + i * 24 + off - 24 + 0 }));
      let hand = null;
      const T = (i) => 1.0 + i * 0.95;
      items.forEach((o, i) => {
        const arrive = T(i) - 0.7 + 0, pk = seg(t, T(i), T(i) + 0.35), mv = seg(t, T(i) + 0.35, T(i) + 0.9);
        const belt = lerp(-30 - i * 60, pick[0], easeOut(seg(t, 0.0 + i * 0.1, T(i))));
        let x = belt, y = pick[1] + 22, rot = 0;
        if (t >= T(i)) { x = lerp(pick[0], drop[0], easeInOut(mv)); y = lerp(pick[1] + 22, drop[1] + 4, easeIn2(mv)) - 22 * hump(mv); }
        if (t > T(i) + 0.9) { x = drop[0]; y = drop[1] + 4; }
        tf(o, x, y, 0, 1, 1);
        o.setAttribute('opacity', 1);
        if (t >= T(i) - 0.1 && t < T(i) + 0.9) hand = [x + 2, y - 8];
        if (t > T(i) + 0.9) tf(o, bx - 18 + i * 18, bt + 2 - 0, 0, 0.8, 0.8);
      });
      P(b, { armL: 8, armR: 8, look: 0.2, mood: t > 3.6 ? 'grin' : 'smile', blink: blinkAt(t), lean: 3 });
      if (hand) b.pose({ armR: reach(b, S, 'R', hand[0] - 6, hand[1]) });
      spark.setAttribute('opacity', t > 3.7 ? 0.5 + 0.5 * Math.abs(Math.sin(t * 6)) : 0);
    }
  };
}
const easeIn2 = (u) => u * u;
