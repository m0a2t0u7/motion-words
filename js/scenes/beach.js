// beach：浜辺の波打ちぎわを、まめと友だちが並んで歩き、砂に足あとが残る（例文 We walked along the beach.）
import { seg, lerp, easeInOut, hump } from '../ease.js';
import { P, blinkAt, walkTo } from './run-after.js';
import { beachBg } from './sandal.js';
import { palm } from './climate.js';

export const meta = { duration: 4.2, beats: [[0, '浜辺'], [1.2, '並んで歩く'], [3.4, '足あとが続く']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 0.85, FY = 244;
  const waves = beachBg(k, FY - 14);
  tf(palm(k, undefined, 0.9).g, 360, FY - 14);
  el('path', { d: 'M 30 262 q 6 -8 12 0 Z', fill: '#F7A9B4' }); el('circle', { cx: 300, cy: 280, r: 4, fill: '#fff' });
  const prints = Array.from({ length: 24 }, (_, i) => el('ellipse', { rx: 4, ry: 2, fill: '#E3C892' }));
  const fr = k.buddy({ x: 30, y: FY - 10, scale: S * 0.95, color: pal.coral, dark: pal.coralDark });
  const me = k.buddy({ x: 70, y: FY + 8, scale: S });
  const xa = (t) => lerp(70, 300, easeInOut(seg(t, 0.2, 3.6))), xb = (t) => xa(t) - 72;
  return {
    update(t) {
      waves(t);
      const wa = walkTo(xa, t, 70), wb = walkTo(xb, t, -2);
      P(me, { x: wa.x, y: FY + 8, walk: wa.walk, armL: wa.armL, armR: wa.armR, lean: wa.lean, look: -0.4, mood: 'smile', blink: blinkAt(t) });
      P(fr, { x: wb.x, y: FY - 10, walk: wb.walk + 1, armL: wb.armL, armR: wb.armR, lean: wb.lean, look: 0.4, mood: 'grin', blink: blinkAt(t, 1) });
      prints.forEach((n, i) => {
        const row = i % 2, j = Math.floor(i / 2), x = 76 + j * 20 - (row ? 72 : 0), y = (row ? FY - 8 : FY + 10) + (j % 2) * 4;
        k.set(n, { cx: x, cy: y, opacity: (row ? wb.x : wa.x) > x + 18 ? 0.9 : 0 });
      });
    }
  };
}
