// a blessing in disguise：電車に乗り遅れて落ち込むが、その電車は止まってしまい、実は幸運だった（Missing the train was a blessing in disguise.）
import { seg, lerp, easeInOut, easeOut, easeIn, backOut, smooth, wobble, hump, clamp } from '../ease.js';

export const meta = { duration: 4.4, beats: [[0, '乗り遅れた'], [1.9, '電車が止まる'], [3.4, '実は幸運']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236 });
  el('rect', { x: 0, y: FY + 4, width: 400, height: 6, fill: '#C9D1DC' });
  el('rect', { x: 0, y: FY + 22, width: 400, height: 4, fill: '#DCE2EB' });
  const train = g({});
  el('rect', { x: -78, y: -70, width: 156, height: 62, rx: 12, fill: pal.blue }, train);
  el('rect', { x: -78, y: -26, width: 156, height: 8, fill: pal.blueDark }, train);
  [-56, -22, 12, 46].forEach((x) => el('rect', { x, y: -60, width: 24, height: 22, rx: 5, fill: '#EAF6FF' }, train));
  el('circle', { cx: -50, cy: -6, r: 8, fill: '#56607A' }, train);
  el('circle', { cx: 50, cy: -6, r: 8, fill: '#56607A' }, train);
  const smoke = [0, 1, 2].map(() => el('circle', { fill: '#9AA4B2' }));
  const warn = g({});
  el('path', { d: 'M 0 -20 L 17 8 L -17 8 Z', fill: pal.red, stroke: '#fff', 'stroke-width': 3, 'stroke-linejoin': 'round' }, warn);
  k.text(0, -2, '!', { 'font-size': 15, fill: '#fff' }, warn);
  const star = g({});
  el('path', { d: 'M 0 -16 L 4.5 -5 L 16 -4 L 7 4 L 10 15 L 0 9 L -10 15 L -7 4 L -16 -4 L -4.5 -5 Z', fill: pal.yellow, stroke: pal.yellowDark, 'stroke-width': 2, 'stroke-linejoin': 'round' }, star);
  const b = k.buddy({ x: 40, y: FY, scale: 0.9 });
  return {
    update(t) {
      const dep = easeIn(seg(t, 0.35, 1.5)) * 0.55 + easeInOut(seg(t, 0.35, 1.9)) * 0.45;
      const stop = Math.max(0, wobble(seg(t, 1.9, 2.5), 3, 6));
      tf(train, lerp(215, 310, dep) + stop * 5, FY + 2);
      // まめ：走って来て、止まって落ち込む
      const run = seg(t, 0, 0.5);
      const bx = lerp(30, 118, easeOut(run));
      const sad = easeOut(seg(t, 0.55, 0.9));
      const happy = easeOut(seg(t, 3.0, 3.5));
      b.pose({
        x: bx, walk: t < 0.5 ? t * 18 : 0,
        armL: t < 0.5 ? 40 : lerp(40, 8, sad), armR: t < 0.5 ? 40 : lerp(40, 8, sad),
        lean: t < 0.5 ? 14 : lerp(14, lerp(-6, 0, happy), seg(t, 0.5, 0.9)),
        squash: 1 - 0.07 * sad * (1 - happy), look: 0.9,
        mood: t < 0.55 ? 'open' : t < 3.0 ? 'sad' : 'grin',
        lift: 10 * hump(seg(t, 3.0, 3.6))
      });
      // 煙と注意マーク
      smoke.forEach((s, i) => {
        const p = seg(t, 2.0 + i * 0.2, 3.8);
        k.set(s, { cx: 310 + stop * 5 + i * 14 + p * 20, cy: FY - 76 - p * 50, r: 6 + p * 14, fill: '#9AA4B2', opacity: p > 0 ? 0.7 * (1 - p) : 0 });
      });
      const wp = backOut(seg(t, 2.2, 2.6), 2);
      tf(warn, 310, FY - 100, 0, wp, wp);
      const sp = backOut(seg(t, 3.1, 3.5), 2);
      tf(star, bx, FY - 100, 12 * Math.sin(t * 4), sp, sp);
    }
  };
}
