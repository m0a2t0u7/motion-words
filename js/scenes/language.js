// language：彼女は3つの言語であいさつを話す（例文 She can speak three languages.）
import { seg, lerp, easeInOut, easeOut, backOut, hump, clamp } from '../ease.js';
import { P, blinkAt, walkTo } from './run-after.js';
import { roomBg, desk, say, cloud } from './look-over.js';
import { hp, held, reach } from './dig.js';
function pz(b, S, o, R, L) { P(b, o); const a = {}; if (R) a.armR = reach(b, S, 'R', R[0], R[1]); if (L) a.armL = reach(b, S, 'L', L[0], L[1]); P(b, { ...o, ...a }); }

export const meta = { duration: 3.8, beats: [[0, '話し始める'], [1.2, '別の言語'], [2.6, '3つ話せた']] };

export function create(k) {
  const { el, g, pal } = k;
  const FY = roomBg(k, 'home');
  const S = 1.15;
  const b = k.buddy({ x: 130, y: FY, scale: S });
  const defs = [['Hello', 232, 112, pal.blueDark, 0.5], ['Hola', 310, 76, pal.coralDark, 1.5], ['Bonjour', 330, 150, pal.violet, 2.5]];
  const bub = defs.map(([s, , , c]) => {
    const sy = say(k, s.length > 5 ? 84 : 66, 36, -1);
    k.text(0, 5, s, { 'font-size': 15, fill: c }, sy.g);
    return sy;
  });
  return {
    update(t) {
      let talk = 0;
      defs.forEach(([, x, y, , t0], i) => {
        bub[i].show(seg(t, t0, t0 + 0.4), x, y);
        talk = Math.max(talk, hump(seg(t, t0 - 0.1, t0 + 0.8)));
      });
      const sw = Math.sin(t * 6) * 6 * talk;
      P(b, { x: 130, facing: 1, look: 0.6, blink: blinkAt(t), mood: talk > 0.2 ? 'open' : 'smile', armR: 20 + sw, armL: 12 + 10 * talk, lean: 3 + 2 * talk, squash: 1 - 0.015 * talk * Math.sin(t * 12) });
    }
  };
}
