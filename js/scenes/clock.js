// clock：壁の時計の針が10時を指す。まめが時計を指さし、友だちに「そろそろ出よう」と伝える（例文 The clock on the wall says ten, so we should leave soon.）
import { seg, lerp, easeInOut, easeOut, hump, clamp, wobble } from '../ease.js';
import { hp, reach, P, blinkAt, walkTo, face, homeBg } from './bag.js';
import { clock as wallClock } from './run-after.js';
import { door } from './queue-up.js';
import { cue } from './in-common.js';
import { bagProp } from './bag.js';

export const meta = { duration: 4.2, beats: [[0, '時計が10時'], [1.2, '時計を指す'], [2.4, 'そろそろ出よう']] };

export function create(k) {
  const { el, tf, pal } = k, S = 1.1, FY = 236;
  homeBg(k, { FY, winX: 30, winW: 80 });
  el('rect', { x: 330, y: FY - 136, width: 66, height: 136, fill: '#E8DCCB' });
  door(k, { x: 334, y: FY - 130, w: 58, h: 130, hinge: 'R', color: '#E0A872' });
  const ck = wallClock(k, 200, 66, 32);
  el('rect', { x: 196, y: 30, width: 8, height: 6, rx: 2, fill: pal.sub });
  const bagHook = bagProp(k, k.root, '#F2A65A', '#D9873B', 26, 20); tf(bagHook, 318, 120);
  el('circle', { cx: 318, cy: 116, r: 3, fill: pal.sub });
  const fr = k.buddy({ x: 265, y: FY, scale: 1.0, facing: -1, color: pal.coral, dark: pal.coralDark });
  const b = k.buddy({ x: 120, y: FY, scale: S });
  const bub = cue(k, "Let's go", 82, 30, -1, 14);
  const rings = [0, 1].map(() => el('path', { d: 'M -6 -12 Q 2 0 -6 12', stroke: pal.coralDark, 'stroke-width': 3, fill: 'none', 'stroke-linecap': 'round' }));
  return {
    update(t) {
      // 9:58 → 10:00 で止まり、ちょっと揺れる
      const m = lerp(-2, 0, easeOut(seg(t, 0, 0.8)));
      ck.set(10 + m / 60, m < 0 ? 60 + m : 0);
      tf(ck.g, 200, 66, wobble(seg(t, 0.8, 1.6), 3, 5) * 6);
      rings.forEach((r, i) => { tf(r, 200 + (i ? 42 : -42), 66, 0, i ? 1 : -1, 1); r.setAttribute('opacity', t > 0.8 && t < 1.6 ? 1 - seg(t, 0.8, 1.6) : 0); });
      const point = easeInOut(seg(t, 1.0, 1.5)) * (1 - easeInOut(seg(t, 2.2, 2.6)));
      const turn = t > 2.1;
      const toDoor = easeInOut(seg(t, 2.6, 3.1)) * (1 - easeInOut(seg(t, 3.8, 4.2)));
      P(b, { x: 120, look: 0.8, blink: blinkAt(t), mood: t > 2.2 ? 'grin' : t > 0.9 ? 'open' : 'smile', facing: 1 });
      face(b, turn ? 5 : 3 + 2 * point, -5 * point);
      b.pose({ armR: lerp(10, reach(b, S, 'R', 186, 74), point) });
      if (turn) b.pose({ armR: lerp(10, reach(b, S, 'R', 330, FY - 80), toDoor), mood: talkM(t) });
      bub.show(seg(t, 2.3, 2.6), 160, FY - 140);
      // 友だち：時計を見上げ、うなずいて扉のほうへ向く
      const nod = hump(seg(t, 3.0, 3.5));
      P(fr, { x: 265, facing: t > 3.5 ? 1 : -1, look: t > 1.0 && t < 2.2 ? -0.4 : 0.6, blink: blinkAt(t, 1), mood: t > 3.0 ? 'grin' : 'smile', squash: 1 - 0.06 * nod, lean: 8 * nod });
      face(fr, 0, t > 1.0 && t < 2.2 ? -4 : 0);
    }
  };
}
const talkM = (t) => (t > 2.3 && t < 2.9 && Math.sin(t * 22) > -0.2 ? 'open' : 'grin');
