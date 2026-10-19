// love：家族（父・母・小さな妹）のもとへまめが駆け寄り、両腕を広げてみんなを抱きしめる。大きなハートが家族を包む（例文 I love my family.）
import { seg, lerp, easeInOut, easeOut, hump, wobble, clamp } from '../ease.js';
import { reach } from './dig.js';
import { P, blinkAt, run } from './run-after.js';
import { roomBg } from './look-over.js';
import { path } from './queue-up.js';
import { heart } from './weigh.js';

export const meta = { duration: 4.2, beats: [[0, '家族'], [1.4, '抱きしめる'], [2.8, 'みんな大好き']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = roomBg(k, 'home', 240);
  el('ellipse', { cx: 220, cy: 262, rx: 160, ry: 14, fill: '#F1D9CF' });
  const big = heart(k, k.root, '#FFD3CB');
  const dad = k.buddy({ x: 300, y: FY, scale: 1.0, facing: -1, color: pal.blue, dark: pal.blueDark });
  const mom = k.buddy({ x: 238, y: FY, scale: 0.92, facing: -1, color: pal.coral, dark: pal.coralDark });
  const sis = k.buddy({ x: 350, y: FY, scale: 0.6, facing: -1, color: pal.yellow, dark: pal.yellowDark });
  const me = k.buddy({ x: -40, y: FY, scale: 0.8 });
  const hs = [0, 1, 2].map(() => heart(k, k.root, pal.red));
  const xf = path([[0.2, -40], [1.5, 186]]);
  return {
    update(t) {
      const r = run(xf, t, -40, 1);
      const open = easeOut(seg(t, 0.2, 0.9)), wrap = easeInOut(seg(t, 1.5, 2.0));
      P(dad, { armR: lerp(8, 120, open) - 50 * wrap, armL: 10, lean: 6 * wrap, look: 0.5, mood: 'grin', blink: wrap > 0.5 ? 1 : blinkAt(t, 0.3) });
      P(mom, { armR: lerp(8, 110, open) - 40 * wrap, armL: lerp(8, 60, open), lean: 10 * wrap, look: 0.5, mood: 'grin', blink: wrap > 0.5 ? 1 : blinkAt(t, 1.1) });
      P(sis, { armR: 8 + 140 * hump(seg(t, 0.3, 1.3)) + 60 * wrap, lift: 8 * hump(seg(t, 0.4, 0.8)), look: 0.4, mood: 'grin', blink: blinkAt(t, 0.8) });
      P(me, { x: r.x, walk: r.walk, armL: r.armL, lean: r.lean + 8 * wrap, lift: r.lift, look: 0.5, mood: 'grin', blink: wrap > 0.5 ? 1 : 0, squash: 1 - 0.04 * hump(seg(t, 1.5, 1.8)) });
      me.pose({ armR: lerp(lerp(r.armR, 120, seg(t, 1.0, 1.5)), reach(me, 0.8, 'R', 250, FY - 66), wrap) });
      // 抱き合うリズム（小さく揺れる）
      const sway = Math.sin((t - 2) * 4) * 2 * seg(t, 2.0, 2.4);
      [dad, mom, me].forEach((b) => b.pose({ lean: b.state.lean + sway }));
      const hq = seg(t, 2.2, 2.9);
      tf(big, 250, 150, 0, Math.max(0.001, easeOut(hq) * 9 * (1 + 0.03 * Math.sin(t * 6))));
      big.setAttribute('opacity', 0.8 * hq);
      hs.forEach((h, i) => { const q = seg(t, 2.6 + i * 0.25, 3.6 + i * 0.2); tf(h, 200 + i * 50, 92 - 24 * q + (i % 2) * 10, 0, Math.max(0.001, hump(q) * 1.4)); });
    }
  };
}
