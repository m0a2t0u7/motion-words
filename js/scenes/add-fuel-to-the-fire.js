// add fuel to the fire：小さな焚き火に薪を投げ入れると炎が大きく燃え上がり、仲間があわてる（Don't add fuel to the fire.）
import { seg, lerp, easeInOut, easeOut, easeIn, backOut, smooth, wobble, hump, clamp } from '../ease.js';

export const meta = { duration: 4.2, beats: [[0, '小さな火'], [1.4, '薪をくべる'], [2.8, '燃え上がる']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'evening' });
  const FX = 235;
  const glow = el('circle', { cx: FX, cy: FY - 20, r: 90, fill: '#FFB86B', opacity: 0 });
  const fire = g({});
  const f1 = g({}, fire), f2 = g({}, fire), f3 = g({}, fire);
  el('path', { d: 'M 0 0 C -30 0 -32 -30 -4 -68 C -2 -50 10 -44 12 -34 C 28 -44 30 0 0 0 Z', fill: '#F2685B' }, f1);
  el('path', { d: 'M 0 0 C -20 0 -22 -22 -2 -48 C 0 -36 8 -32 9 -24 C 20 -30 20 0 0 0 Z', fill: '#FFA94D' }, f2);
  el('path', { d: 'M 0 0 C -11 0 -12 -12 0 -26 C 8 -18 11 -8 0 0 Z', fill: '#FFE08A' }, f3);
  // 薪（焚き火の台）
  el('rect', { x: FX - 32, y: FY - 8, width: 64, height: 10, rx: 5, fill: pal.woodDark, transform: 'rotate(-8 ' + FX + ' ' + FY + ')' });
  el('rect', { x: FX - 32, y: FY - 8, width: 64, height: 10, rx: 5, fill: pal.coffee, transform: 'rotate(8 ' + FX + ' ' + FY + ')' });
  const sparks = [0, 1, 2, 3, 4].map(() => el('circle', { r: 2.5, fill: pal.yellow }));
  const log = g({});
  el('rect', { x: -22, y: -6, width: 44, height: 12, rx: 6, fill: pal.wood, stroke: pal.woodDark, 'stroke-width': 2 }, log);
  el('ellipse', { cx: 22, cy: 0, rx: 4, ry: 6, fill: '#EBD2AE' }, log);
  const me = k.buddy({ x: 115, y: FY, scale: 0.9 });
  const fr = k.buddy({ x: 345, y: FY, scale: 0.85, facing: -1, color: pal.coral, dark: pal.coralDark });
  const bang = k.text(0, 0, '!', { 'font-size': 30, fill: pal.red });
  return {
    update(t) {
      const grow = easeOut(seg(t, 1.8, 2.7));
      const sz = 0.55 + 1.35 * grow;
      const fl = 1 + 0.07 * Math.sin(t * 13);
      tf(fire, FX, FY - 4, 0, 1, 1);
      tf(f1, 0, 0, 3 * Math.sin(t * 9), sz * fl, sz * (2 - fl));
      tf(f2, 0, 0, -4 * Math.sin(t * 11), sz * (2 - fl), sz * fl);
      tf(f3, 0, 0, 3 * Math.sin(t * 8 + 1), sz * fl, sz);
      k.set(glow, { opacity: 0.12 + 0.22 * grow, r: 60 + 70 * grow });
      sparks.forEach((s, i) => {
        const p = ((t * 1.1 + i * 0.2) % 1);
        k.set(s, { cx: FX + (i - 2) * 12 * (1 + grow) + Math.sin(t * 5 + i) * 6, cy: FY - 40 - p * (40 + 90 * grow), opacity: (1 - p) * (0.3 + 0.7 * grow) });
      });
      // まめ：薪を持ち上げて投げ入れる
      const up = easeOut(seg(t, 0.4, 1.1));
      const thr = seg(t, 1.1, 1.3);
      me.pose({
        armR: t < 1.1 ? lerp(8, 160, up) : lerp(160, 80, easeOut(thr)), armL: t < 1.1 ? lerp(8, 100, up) : lerp(100, 60, thr),
        lean: t < 1.1 ? lerp(0, -8, up) : lerp(-8, 8, easeOut(thr)), look: 0.7, mood: t < 2.0 ? 'grin' : 'open', squash: 1 - 0.04 * up * (1 - thr)
      });
      if (t < 1.1) {
        const h = me.handPos('R');
        tf(log, h.x + 8, h.y - 10, -70 + 0 * up);
      } else {
        const p = seg(t, 1.1, 1.8);
        tf(log, lerp(me.handPos('R').x + 30, FX - 4, p), lerp(FY - 120, FY - 14, p) - 70 * 4 * p * (1 - p), p * 300);
        log.setAttribute('opacity', p >= 1 ? 0 : 1);
      }
      // 仲間：あわてる
      const al = easeOut(seg(t, 2.0, 2.4));
      fr.pose({ armL: lerp(8, 150, al), armR: lerp(8, 150, al), look: -0.6, lean: lerp(0, -6, al), mood: t < 1.9 ? 'smile' : 'open', lift: 8 * hump(seg(t, 2.0, 2.5)) });
      const bp = backOut(seg(t, 2.3, 2.7), 2);
      tf(bang, 345, FY - 110 + 3 * Math.sin(t * 20), 0, bp, bp);
    }
  };
}
