// tag：新しいシャツについた値札のひもを、はさみで切って外す（例文 I cut the price tag off my shirt.）
import { seg, lerp, easeInOut, easeOut, easeIn, wobble } from '../ease.js';
import { hp, held, reach, P, blinkAt, face, homeBg, backTable } from './bag.js';
import { scissorsProp } from './scissors.js';
import { priceTag } from './furniture.js';
import { flat } from './shirt.js';

export const meta = { duration: 4.2, beats: [[0, '値札つきのシャツ'], [1.2, 'ひもを切る'], [2.4, '値札が取れた']] };

export function create(k) {
  const { el, tf, pal } = k, S = 1.15, FY = 236, X = 150;
  homeBg(k, { FY, winX: 300, winW: 80 });
  const TY = backTable(k, 180, 360, 192, FY);
  const sh = flat(k, 'tee', pal.blue, pal.blueDark, k.root, false); tf(sh, 260, TY - 30, 0, 1.3);
  const string = el('path', { d: `M 286 ${TY - 32} q 4 8 8 14`, stroke: pal.sub, 'stroke-width': 1.3, fill: 'none' });
  const tg = priceTag(k); 
  const sc = scissorsProp(k);
  const b = k.buddy({ x: X, y: FY, scale: S });
  return {
    update(t) {
      const go = easeInOut(seg(t, 0.3, 1.0));
      P(b, { x: X + 40 * go, walk: 0, look: 0.8, blink: blinkAt(t), lean: 10 * go, mood: t > 2.4 ? 'grin' : 'flat' });
      face(b, 5, 2);
      const tgt = { x: lerp(X + 70, 300, go), y: lerp(FY - 60, TY - 22, go) };
      b.pose({ armR: reach(b, S, 'R', tgt.x, tgt.y + (t > 1.2 && t < 1.8 ? 2 * Math.sin(t * 30) : 0)) });
      held(k, b, S, sc.g, 'R', 0);
      const snip = t > 1.2 && t < 1.9 ? Math.abs(Math.sin((t - 1.2) * 9)) : t < 1.2 ? 0.7 : 0.1;
      sc.open(snip);
      const cut = t > 1.9;
      string.setAttribute('opacity', cut ? 0 : 1);
      // 切れた値札が床へ落ちる
      const f = seg(t, 1.9, 2.5);
      const fy = lerp(TY - 18, FY - 6, easeIn(f));
      tf(tg, lerp(288, 300, f), cut ? fy : TY - 34, cut ? lerp(0, 70, f) + wobble(seg(t, 2.5, 3.0), 2, 5) * 10 : 0);
    }
  };
}
