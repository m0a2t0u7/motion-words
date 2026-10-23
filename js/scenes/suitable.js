import { seg, lerp, easeInOut, easeOut, backOut, hump, clamp } from '../ease.js';
import { P, blinkAt, walkTo } from './run-after.js';
import { hp } from './dig.js';
import { grip } from './hand-over.js';
import { roomBg, say, desk } from './look-over.js';
// suitable：小さな会議室。まめたち3人が机を囲んでちょうど座れて、OKの印が出る（例文 This room is suitable for a small meeting.）
export const meta = { duration: 4.0, beats: [[0, '部屋に入る'], [1.4, '3人で座る'], [3.0, 'ぴったり']] };
export function create(k) {
  const { el, g, tf, pal } = k, S = 0.8;
  const FY = roomBg(k, 'office', 240);
  const cs = [[pal.mint, pal.mintDark, 110], [pal.coral, pal.coralDark, 200], [pal.blue, pal.blueDark, 290]];
  const bs = cs.map(([c, d, x]) => k.buddy({ x: -100, y: FY, scale: S, color: c, dark: d }));
  desk(k, 80, 250, 196);
  const sign = g({}); el('circle', { r: 28, fill: '#fff', stroke: pal.green, 'stroke-width': 6 }, sign);
  el('path', { d: 'M -13 1 l 9 10 l 19 -22', fill: 'none', stroke: pal.green, 'stroke-width': 7, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, sign);
  return {
    update(t) {
      bs.forEach((b, i) => {
        const tx = cs[i][2], xf = (u) => lerp(-40, tx, easeOut(seg(u, i * 0.3, 1.5 + i * 0.3)));
        const w = walkTo(xf, t, -40);
        P(b, { x: w.x, walk: w.walk, armL: w.armL, armR: w.armR, lean: w.lean, facing: 1, squash: 1 - 0.08 * seg(t, 1.6 + i * 0.15, 2.0 + i * 0.15), look: 0.3, mood: t > 3 ? 'grin' : 'smile', blink: blinkAt(t, i) });
      });
      tf(sign, 210, 100, 0, backOut(seg(t, 3.0, 3.5)));
    }
  };
}
