// actually：実は京都に行ったことがない。友だちが京都の話をすると、まめが首を振って「実は行ったことがない」と答える（例文 Actually, I've never been to Kyoto.）
import { seg, lerp, easeOut, backOut, hump } from '../ease.js';
import { P, blinkAt } from './run-after.js';
import { roomBg, say } from './look-over.js';

export const meta = { duration: 4.0, beats: [[0, '京都の話'], [1.4, '首を振る'], [2.6, '実は行ってない']] };
const EF = '"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif';

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = roomBg(k, 'home', 240);
  const b = k.buddy({ x: 110, y: FY, scale: 0.95 });
  const f = k.buddy({ x: 310, y: FY, scale: 0.95, facing: -1, color: pal.coral, dark: pal.coralDark });
  const s1 = say(k, 70, 48, 1), s2 = say(k, 70, 48, -1);
  const t1 = g({}, s1.g), t2 = g({}, s2.g);
  [t1, t2].forEach((o) => k.text(0, 0, '🏯', { 'font-size': 28, 'font-family': EF, 'text-anchor': 'middle', 'dominant-baseline': 'central' }, o));
  el('line', { x1: -22, y1: -18, x2: 22, y2: 18, stroke: pal.red, 'stroke-width': 6, 'stroke-linecap': 'round' }, s2.g);
  el('line', { x1: 22, y1: -18, x2: -22, y2: 18, stroke: pal.red, 'stroke-width': 6, 'stroke-linecap': 'round' }, s2.g);
  return {
    update(t) {
      s1.show(seg(t, 0.2, 0.6) * (1 - seg(t, 2.2, 2.5)), 270, 90);
      s2.show(seg(t, 2.4, 2.8), 150, 90);
      const sh = hump(seg(t, 1.4, 2.4));
      P(b, { look: 0.6 - 1.2 * (Math.sin(t * 12) > 0 ? 1 : 0) * sh * 0 + Math.sin(t * 12) * 0.8 * sh, armR: lerp(10, 40, seg(t, 2.4, 2.8)), mood: t < 1.4 ? 'smile' : t < 2.4 ? 'flat' : 'open', blink: blinkAt(t) });
      P(f, { facing: -1, look: -0.5, armR: lerp(10, 80, hump(seg(t, 0.2, 1.0))), mood: t > 2.8 ? 'open' : 'smile', blink: blinkAt(t, 1) });
    }
  };
}
