// at once：遊んでいると「今すぐこっちへ！」と呼ばれ、ボールを放り出して即座に駆けつける（Come here at once!）
import { seg, lerp, easeInOut, easeOut, easeIn, hump, clamp, backOut, wobble } from '../ease.js';
import { roomBg } from './look-over.js';
import { run } from './run-after.js';
import { ball } from './call-off.js';
import { hp } from './dig.js';
import { P, blinkAt, talk, mark } from './so-far-so-good.js';

export const meta = { duration: 4.0, beats: [[0, '遊んでいる'], [1.3, '今すぐ！'], [2.2, 'すぐ来た']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = roomBg(k, 'home', 240);
  const C = k.buddy({ x: 80, y: FY, facing: 1, color: pal.coral, dark: pal.coralDark });
  const G = k.buddy({ x: 300, y: FY, facing: -1, scale: 0.8 });
  const b = ball(k);
  const bsh = k.shadow(0, FY + 1, 10, 2.5);
  const bub = talk(k, 'Now!', 56, 32, -1, 16);
  const xf = (t) => lerp(300, 150, easeInOut(seg(t, 1.45, 2.05)));
  return {
    update(t) {
      const call = t > 1.0;
      const pt = easeOut(seg(t, 1.0, 1.2));
      P(C, { facing: 1, armR: call ? lerp(8, 60, pt) + 30 * Math.max(0, Math.sin((t - 1.0) * 14)) * (t < 2.2 ? 1 : 0) : 8, armL: 8,
        lean: call ? 4 : 0, look: 0.6, mood: call && t < 2.4 ? 'open' : call ? 'flat' : 'smile', blink: blinkAt(t, 1) });
      const r = run(xf, t, 300, -1);
      const startle = hump(seg(t, 1.15, 1.45));
      const play = t < 1.15;
      P(G, { x: r.x, walk: r.walk, facing: play ? 1 : -1, lean: r.lean, lift: r.lift + 10 * startle, armL: r.armL,
        armR: play ? 30 + 40 * Math.max(0, Math.sin(t * 7)) : r.armR, look: play ? 0.5 : 0.6, mood: play ? 'grin' : t < 2.1 ? 'open' : 'smile',
        squash: 1 - 0.06 * hump(seg(t, 2.05, 2.3)), blink: blinkAt(t) });
      // ボール：手でつく→手を離れて転がっていく
      let bx, by;
      if (play) { const h = hp(G, 0.8, 'R'); const q = Math.abs(Math.sin(t * 3.5)); bx = h.x + 6; by = lerp(FY - 12, h.y + 12, q); }
      else { const q = seg(t, 1.15, 3.2); bx = lerp(334, 392, easeOut(q)); by = FY - 12 - 30 * Math.abs(wobble(q, 1.5, 3)); }
      tf(b, bx, by, play ? 0 : (bx - 334) * 6); tf(bsh, bx, FY + 1);
      bub.show(seg(t, 1.05, 1.3) * (t < 2.6 ? 1 : 0), 120, 112);
    }
  };
}
