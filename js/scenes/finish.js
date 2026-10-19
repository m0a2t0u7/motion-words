// finish：8時50分から最後の行を書き、9時ちょうどにチェックを付けて鉛筆を置き、両手を上げる（例文 I finished my homework at nine.）
import { seg, lerp, easeInOut, easeOut, hump, wobble, clamp } from '../ease.js';
import { hp, reach } from './dig.js';
import { P, blinkAt, clock } from './run-after.js';
import { roomBg } from './look-over.js';
import { desk } from './get-on-with.js';
import { check } from './work-on.js';
import { notebook, pencil } from './be.js';

export const meta = { duration: 4.2, beats: [[0, '最後の問題'], [1.9, '書き終える'], [2.8, '9時に終わった']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = roomBg(k, 'home', 240, 'evening');
  const ck = clock(k, 250, 72, 30);
  const S = 1.2;
  const me = k.buddy({ x: 176, y: FY, scale: S });
  const top = desk(k, 100, 280, FY);
  const nb = notebook(k, 230, top - 4); tf(nb.g, 230, top - 4, 0, 0.85);
  nb.write(0.66);
  const ck2 = check(k, 262, top - 8, 0.8);
  const pen = pencil(k);
  const flash = el('circle', { cx: 250, cy: 72, r: 30, fill: 'none', stroke: pal.yellow, 'stroke-width': 4 });
  return {
    update(t) {
      const m = lerp(50, 60, easeInOut(seg(t, 0, 2.2)));
      ck.set(m >= 60 ? 9 : 8, m % 60);
      const fq = seg(t, 2.2, 2.9);
      k.set(flash, { r: 30 + 14 * fq, opacity: (1 - fq) * (fq > 0) });
      const wr = seg(t, 0.2, 1.8);
      nb.write(0.66 + 0.34 * wr);
      ck2(easeOut(seg(t, 1.9, 2.2)));
      const done = easeInOut(seg(t, 2.4, 2.8)), cheer = easeOut(seg(t, 2.8, 3.2));
      const jig = t > 0.2 && t < 1.8 ? Math.sin(t * 14) * 3 : 0;
      let tx = t < 1.85 ? lerp(240, 262, wr) + jig : lerp(256, 268, seg(t, 1.9, 2.2));
      let ty = t < 1.85 ? top - 2 : top - 4;
      if (t > 2.3) { tx = lerp(tx, 210, done); ty = lerp(ty, top - 2, done); }
      P(me, { lean: 8 - 10 * cheer, look: 0.5 - 0.3 * cheer, mood: t > 2.3 ? 'grin' : 'flat', blink: blinkAt(t, 0.8), armL: 12 + 150 * cheer, squash: 1 + 0.04 * hump(seg(t, 2.8, 3.1)), lift: 4 * hump(seg(t, 2.85, 3.2)) });
      me.pose({ armR: lerp(reach(me, S, 'R', tx, ty), 165, cheer) });
      const h = hp(me, S, 'R', 30);
      if (t < 2.75) tf(pen, h.x + 2, h.y - 4, 18); else tf(pen, 212, top - 6, 80);
    }
  };
}
