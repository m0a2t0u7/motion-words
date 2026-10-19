// coin：ソファの下に手を入れて、光る硬貨を見つけて取り出す（例文 I found a coin under the sofa.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';
import { hp, reach, P, blinkAt, face, homeBg } from './bag.js';
import { sofaProp } from './furniture.js';
import { coin as coinProp, star } from './run-after.js';

export const meta = { duration: 4.4, beats: [[0, 'ソファの下に何か'], [1.2, '手を入れる'], [2.6, '硬貨を見つけた']] };

export function create(k) {
  const { el, tf, pal } = k, S = 1.15, FY = 236, X = 175;
  homeBg(k, { FY, winX: 240, winW: 90 });
  const cn = coinProp(k);
  const b = k.buddy({ x: X, y: FY, scale: S });
  const sf = sofaProp(k, k.root, 130); tf(sf, 290, FY);
  el('rect', { x: 225, y: FY - 10, width: 130, height: 10, fill: '#000', opacity: 0.12 });
  const gl = star(k, pal.yellow);
  const sp = star(k, pal.yellow);
  return {
    update(t) {
      const bend = easeInOut(seg(t, 0.8, 1.3)) * (1 - easeInOut(seg(t, 2.2, 2.7)));
      const inn = easeInOut(seg(t, 1.3, 1.7)) * (1 - easeInOut(seg(t, 1.9, 2.3)));
      P(b, { x: X, lean: 42 * bend, squash: 1 - 0.12 * bend, look: 0.8, blink: blinkAt(t), mood: t > 2.4 ? 'grin' : t > 0.4 ? 'open' : 'smile' });
      face(b, 5, 2 * bend);
      const raise = easeInOut(seg(t, 2.6, 3.1));
      const tgt = { x: lerp(232, 262, inn), y: FY - 6 };
      if (t < 2.4) b.pose({ armR: lerp(10, reach(b, S, 'R', tgt.x, tgt.y), Math.min(1, bend * 1.4)) });
      else b.pose({ armR: lerp(reach(b, S, 'R', tgt.x, tgt.y) * (1 - raise) + 0, reach(b, S, 'R', X + 50, FY - 104), raise) });
      const h = hp(b, S, 'R');
      if (t < 1.85) tf(cn, 266, FY - 5, 0, 1); else tf(cn, h.x, h.y - 2, 0, 1 + 0.3 * raise);
      gl.set(268, FY - 2, seg(t, 0.2, 0.8));
      sp.set(h.x, h.y - 10, seg(t, 3.1, 3.8));
    }
  };
}
