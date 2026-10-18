// for instance：「果物が好き」— 考え雲にいろいろな果物→その中からりんごと梨を例として取り出して見せる（I like fruit, for instance, apples and pears.）
import { seg, lerp, easeInOut, easeOut, hump, clamp, backOut } from '../ease.js';
import { roomBg, cloud } from './look-over.js';
import { hp } from './dig.js';
import { P, blinkAt } from './so-far-so-good.js';

export function fruit(k, kind, parent) {
  const g = k.g({}, parent), pal = k.pal;
  const leaf = () => k.el('path', { d: 'M 1 -12 Q 8 -18 12 -13 Q 6 -9 1 -12 Z', fill: pal.green }, g);
  if (kind === 'apple') { k.el('path', { d: 'M 0 -8 Q -12 -14 -12 0 Q -11 12 0 11 Q 11 12 12 0 Q 12 -14 0 -8 Z', fill: pal.red }, g); leaf(); }
  if (kind === 'pear') { k.el('path', { d: 'M 0 -14 Q -6 -14 -6 -4 Q -12 2 -10 8 Q -6 13 0 13 Q 6 13 10 8 Q 12 2 6 -4 Q 6 -14 0 -14 Z', fill: '#D8E27A' }, g); leaf(); }
  if (kind === 'banana') k.el('path', { d: 'M -12 -6 Q 0 14 14 -8 Q 2 6 -12 -6 Z', fill: pal.yellow, stroke: pal.yellowDark, 'stroke-width': 1.5 }, g);
  if (kind === 'grape') [[0, -6], [-5, 0], [5, 0], [0, 6], [-5, -12], [5, -12]].forEach(([x, y]) => k.el('circle', { cx: x, cy: y, r: 4, fill: pal.violet }, g));
  if (kind === 'orange') k.el('circle', { r: 10, fill: '#FFA94D' }, g);
  return g;
}

export const meta = { duration: 4.4, beats: [[0, '果物が好き'], [1.6, '例えば'], [2.8, 'りんごと梨']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = roomBg(k, 'home', 240);
  const G = k.buddy({ x: 120, y: FY });
  const th = cloud(k, 170, 92, -1);
  const kinds = [['banana', -50, -6], ['grape', -20, 10], ['orange', 40, 4], ['banana', 60, -18], ['grape', 10, -22]];
  kinds.forEach(([kd, x, y]) => tf(fruit(k, kd, th.g), x, y));
  const ap = fruit(k, 'apple'), pr = fruit(k, 'pear');
  const home = { ap: [-20, -4], pr: [24, -10] };
  return {
    update(t) {
      const CX = 240, CY = 92;
      th.show(seg(t, 0.2, 0.6), CX, CY);
      const out = easeInOut(seg(t, 1.6, 2.4));
      const up = easeOut(seg(t, 1.6, 2.2));
      P(G, { facing: 1, armR: lerp(8, 150, up), armL: lerp(8, 150, up), look: t < 1.6 ? 0.8 : 0.4, mood: t > 1.6 ? 'grin' : 'smile',
        lift: 6 * hump(seg(t, 2.6, 3.0)), blink: blinkAt(t) });
      const hR = hp(G, 1, 'R'), hL = hp(G, 1, 'L');
      const pin = seg(t, 0.4, 0.7);
      const sc = Math.max(0.001, pin) * lerp(1, 1.5, out);
      tf(ap, lerp(CX + home.ap[0], hL.x, out), lerp(CY + home.ap[1], hL.y - 14, out), 0, sc);
      tf(pr, lerp(CX + home.pr[0], hR.x, out), lerp(CY + home.pr[1], hR.y - 14, out), 0, sc);
    }
  };
}
