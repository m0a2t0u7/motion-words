// meeting：10時になる直前にまめが会議室へ入り、同僚と席で話し合う（例文 I have a meeting at ten.）
import { seg, lerp, easeOut, easeInOut, hump } from '../ease.js';
import { P, blinkAt, walkTo, clock } from './run-after.js';
import { roomBg, desk, say } from './look-over.js';
import { held } from './dig.js';

export const meta = { duration: 4.2, beats: [[0, '9時50分'], [1.6, '会議室へ'], [3.0, '10時に話す']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 0.9;
  const FY = roomBg(k, 'office', 240);
  const ck = clock(k, 200, 62, 24);
  const mates = [[250, pal.coral, pal.coralDark], [330, pal.yellow, pal.yellowDark]].map(([x, c, d]) => k.buddy({ x, y: FY, scale: 0.8, facing: -1, color: c, dark: d }));
  desk(k, 205, 175, 200);
  el('rect', { x: 238, y: 192, width: 22, height: 8, rx: 2, fill: '#fff', stroke: pal.line, 'stroke-width': 1.5 });
  const b = k.buddy({ x: 0, y: FY, scale: S });
  const note = g({});
  el('rect', { x: -9, y: -4, width: 18, height: 24, rx: 2, fill: pal.blue }, note);
  el('rect', { x: -6, y: -1, width: 12, height: 3, fill: '#fff' }, note);
  const s1 = say(k, 44, 28, -1), s2 = say(k, 44, 28, 1);
  [s1, s2].forEach((s, i) => { for (let j = 0; j < 2; j++) el('line', { x1: -10 + j * 4, x2: 10 - j * 4, y1: -3 + j * 7, y2: -3 + j * 7, stroke: pal.sub, 'stroke-width': 3, 'stroke-linecap': 'round' }, s.g); });
  return {
    update(t) {
      const xf = (u) => lerp(-30, 135, easeInOut(seg(u, 0.2, 2.2)));
      const w = walkTo(xf, t, -30), at = t > 2.3;
      P(b, { x: w.x, walk: w.walk, armL: w.armL, armR: at ? 70 : 30, lean: w.lean, facing: 1, look: 0.4, mood: at ? 'open' : 'smile', blink: blinkAt(t) });
      held(k, b, S, note, 'R', 0, 8);
      ck.set(9, lerp(50, 60, easeInOut(seg(t, 0.3, 2.4))) + (t > 2.4 ? 0 : 0));
      const tk = t > 2.6;
      mates.forEach((m, i) => P(m, { facing: -1, look: 0.7, mood: tk ? 'open' : 'smile', blink: blinkAt(t, i), squash: 1 - 0.03 * (tk ? hump(seg((t + i) % 1, 0, 1)) : 0) }));
      s1.show(seg(t, 2.6, 2.9) * (1 - seg(t, 3.5, 3.6)), 255, FY - 112);
      s2.show(seg(t, 3.5, 3.8), 335, FY - 112);
    }
  };
}
