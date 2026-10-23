import { seg, lerp, easeInOut, easeOut, backOut, hump, clamp } from '../ease.js';
import { P, blinkAt, walkTo } from './run-after.js';
import { hp } from './dig.js';
import { grip } from './hand-over.js';
import { roomBg, say, desk } from './look-over.js';
// purpose：受付で係の人に聞かれ、まめは行き先の的（めあて）を指して答える（例文 What is the purpose of your visit?）
export const meta = { duration: 4.2, beats: [[0, '受付に来る'], [1.4, 'ときかれる'], [2.8, '目的を答える']] };
export function create(k) {
  const { el, g, tf, pal, text } = k, S = 0.9;
  const FY = roomBg(k, 'office', 240);
  const me = k.buddy({ x: -40, y: FY, scale: S });
  const clerk = k.buddy({ x: 320, y: FY, scale: S, facing: -1, color: pal.coral, dark: pal.coralDark });
  desk(k, 250, 130, 198);
  const q = say(k, 46, 36, 1); text(0, 8, '?', { 'font-size': 24, 'font-weight': 700, fill: pal.coral, 'text-anchor': 'middle' }, q.g);
  const a = say(k, 64, 50, -1);
  [26, 17, 8].forEach((r, i) => el('circle', { cx: 0, cy: -2, r, fill: i === 1 ? '#fff' : pal.red }, a.g));
  const arrow = el('path', { d: 'M -14 14 L 0 -2', stroke: pal.ink, 'stroke-width': 3, 'stroke-linecap': 'round' }, a.g);
  return {
    update(t) {
      const xf = (u) => lerp(-40, 150, easeOut(seg(u, 0, 1.4)));
      const w = walkTo(xf, t, -40);
      const ans = seg(t, 2.7, 3.2);
      P(me, { x: w.x, walk: w.walk, armL: w.armL, armR: ans > 0 ? 95 : w.armR, lean: w.lean, facing: 1, look: 0.6, mood: ans > 0 ? 'smile' : 'flat', blink: blinkAt(t) });
      P(clerk, { x: 320, facing: -1, armR: t > 1.3 && t < 2.5 ? 95 : 8, look: -0.5, mood: 'smile', blink: blinkAt(t, 1) });
      q.show(t > 1.4 && t < 2.8 ? seg(t, 1.4, 1.8) : 0, 290, 100);
      a.show(ans, 190, 100);
    }
  };
}
