// arm：サッカー中にボールをけって転ぶ。その後、腕にギプスをして三角巾でつる（例文 He broke his arm playing soccer.）
import { seg, lerp, easeInOut, easeOut, easeIn, hump, clamp, wobble } from '../ease.js';
import { hp, reach, P, blinkAt, bp, gait, legs } from './body.js';
import { parkBg } from './bench.js';

export const meta = { duration: 4.4, beats: [[0, 'サッカー中'], [1.3, '転んだ'], [2.6, '腕にギプス']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 1.1, FY = 236;
  parkBg(k, FY);
  // ゴール（動かない）
  el('path', { d: `M 340 ${FY} V ${FY - 80} H 400`, stroke: '#fff', 'stroke-width': 6, fill: 'none' });
  for (let x = 348; x < 400; x += 10) el('line', { x1: x, y1: FY - 76, x2: x, y2: FY, stroke: '#fff', 'stroke-width': 1, opacity: 0.6 });
  const b = k.buddy({ x: 60, y: FY, scale: S });
  // ギプス（右腕に重ねる）と三角巾
  const cast = el('rect', { x: -7, y: 4, width: 14, height: 26, rx: 6, fill: '#fff', stroke: '#D5DCE5', 'stroke-width': 1.5 }, b.armR.a);
  const sling = el('path', { d: 'M -26 -30 L 24 -8 L 24 4 L -26 -18 Z', fill: pal.blue, opacity: 0.9 }, b.body);
  const ball = g({}); el('circle', { r: 10, fill: '#fff', stroke: pal.ink, 'stroke-width': 1.5 }, ball); el('path', { d: 'M 0 -4 l 4 3 l -1.5 5 h -5 l -1.5 -5 Z', fill: pal.ink }, ball);
  const flash = el('rect', { x: 0, y: 0, width: 400, height: 300, fill: '#fff', opacity: 0 });
  const xf = (t) => lerp(60, 180, easeInOut(seg(t, 0, 1.1)));
  return {
    update(t) {
      const after = t > 2.0;
      const fl = hump(seg(t, 1.75, 2.25));
      flash.setAttribute('opacity', fl.toFixed(2));
      if (!after) {
        const gt = gait(xf, t, 60, 26);
        const kick = hump(seg(t, 0.9, 1.2)), fall = easeIn(seg(t, 1.2, 1.5));
        P(b, { x: gt.x + 16 * fall, walk: gt.walk, lean: gt.lean * 2 + 80 * fall, lift: -8 * fall, armL: gt.armL + 80 * fall, armR: gt.armR + 80 * fall, mood: fall > 0.3 ? 'open' : 'grin', blink: fall > 0.8 ? 1 : 0, squash: t > 1.5 ? 0.9 : 1 });
        if (kick > 0) legs(b, 0, -60 * kick);
        const bx = t < 1.05 ? gt.x + 36 : lerp(gt.x + 36, 370, easeOut(seg(t, 1.05, 1.6)));
        tf(ball, bx, FY - 10 - 30 * hump(seg(t, 1.05, 1.6)), t * 400);
        cast.setAttribute('opacity', 0); sling.setAttribute('opacity', 0);
      } else {
        P(b, { x: 200, armR: 34, armL: 10, mood: t > 3.4 ? 'smile' : 'sad', blink: blinkAt(t), look: 0.2 });
        cast.setAttribute('opacity', 1); sling.setAttribute('opacity', 0.9);
        tf(ball, 252, FY - 10, 0);
      }
    }
  };
}
