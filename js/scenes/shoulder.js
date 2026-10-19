// shoulder：落ちこんでいると、友だちがそっと近づき、肩に手をのせてくれる（例文 She put her hand on my shoulder.）
import { seg, lerp, easeInOut, easeOut, hump, clamp } from '../ease.js';
import { hp, reach, P, blinkAt, bp, gait, spot } from './body.js';
import { parkBg, parkBench } from './bench.js';

export const meta = { duration: 4.4, beats: [[0, '落ちこむ'], [1.4, '近づく'], [2.6, '肩に手を']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 1.05, FY = 236;
  parkBg(k, FY);
  const me = k.buddy({ x: 250, y: FY, scale: S, facing: -1 });
  const her = k.buddy({ x: 40, y: FY, scale: 1.1, facing: 1, color: pal.coral, dark: pal.coralDark });
  const hand = el('circle', { r: 7, fill: pal.coral, stroke: pal.coralDark, 'stroke-width': 2.5 });
  const ring = spot(k);
  const xf = (t) => lerp(40, 178, easeInOut(seg(t, 0.8, 2.3)));
  return {
    update(t) {
      const gt = gait(xf, t, 40);
      const put = easeInOut(seg(t, 2.4, 2.9)), cheer = easeInOut(seg(t, 3.2, 3.7));
      P(me, { x: 250, lean: lerp(14, 0, cheer), squash: lerp(0.94, 1, cheer), mood: cheer > 0.5 ? 'smile' : 'sad', look: lerp(0.4, 0.8, cheer), blink: blinkAt(t), armL: 4, armR: 4, facing: -1 });
      faceOf2(me, lerp(5, 0, cheer));
      const sh = bp(me, S, 22, -66);
      P(her, { x: gt.x, walk: gt.walk, lean: gt.lean, armL: gt.armL, armR: gt.armR, mood: 'smile', look: 0.6, blink: blinkAt(t, 1) });
      if (put > 0) her.pose({ armR: lerp(gt.armR, reach(her, 1.1, 'R', sh.x, sh.y + 4), put) });
      const h = hp(her, 1.1, 'R', 26);
      k.set(hand, { cx: h.x, cy: h.y, opacity: put > 0 ? 1 : 0 });
      ring.set(seg(t, 2.9, 3.2) * (1 - seg(t, 3.9, 4.3)), sh.x, sh.y + 4, 22, t);
    }
  };
}
const faceOf2 = (b, dy) => b.body.children[3].setAttribute('transform', `translate(0 ${dy.toFixed(2)})`);
