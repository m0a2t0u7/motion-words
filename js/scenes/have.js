// have：弟たち2人が駆け寄り、まめが両手で2人の頭をなでる。1・2と数えて「兄弟が2人いる」（例文 I have two brothers.）
import { seg, lerp, easeInOut, easeOut, hump, clamp } from '../ease.js';
import { reach } from './dig.js';
import { P, blinkAt, run } from './run-after.js';
import { roomBg } from './look-over.js';
import { popS } from './be.js';
import { path } from './queue-up.js';

export const meta = { duration: 4.0, beats: [[0, '兄弟が来る'], [1.6, '2人をなでる'], [2.6, '兄弟が2人']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = roomBg(k, 'home', 240);
  // 壁の家族写真（3人）
  const fr = g({}); tf(fr, 300, 78);
  el('rect', { x: -36, y: -26, width: 72, height: 52, rx: 4, fill: '#fff', stroke: pal.woodDark, 'stroke-width': 4 }, fr);
  [[-18, pal.blue, 8], [0, pal.mint, 10], [18, pal.blue, 8]].forEach(([x, c, r]) => el('rect', { x: x - r, y: 18 - r * 3, width: r * 2, height: r * 3, rx: r, fill: c }, fr));
  el('ellipse', { cx: 200, cy: 262, rx: 150, ry: 14, fill: '#F1E2D2' });
  const S = 0.95, s2 = 0.64;
  const me = k.buddy({ x: 200, y: FY, scale: S });
  const L = k.buddy({ x: -40, y: FY, scale: s2, color: pal.blue, dark: pal.blueDark });
  const R = k.buddy({ x: 440, y: FY, scale: s2, facing: -1, color: pal.blue, dark: pal.blueDark });
  const xL = path([[0.1, -40], [1.3, 128]]), xR = path([[0.3, 440], [1.5, 272]]);
  const nums = ['1', '2'].map((n) => {
    const c = g({});
    el('circle', { r: 15, fill: '#fff', stroke: pal.blue, 'stroke-width': 3 }, c);
    k.text(0, 1, n, { 'font-size': 18, fill: pal.blueDark }, c);
    return c;
  });
  return {
    update(t) {
      const a = run(xL, t, -40, 1), b = run(xR, t, 440, -1);
      const pat = (tt) => 3 * Math.max(0, Math.sin((t - tt) * 9)) * seg(t, tt, tt + 0.2);
      P(L, { x: a.x, walk: a.walk, armL: a.armL, armR: a.armR, lean: a.lean, lift: a.lift, facing: 1, look: 0.6, mood: 'grin', squash: 1 - 0.03 * hump(seg(t, 1.7, 2.1)), blink: blinkAt(t, 0.4) });
      P(R, { x: b.x, walk: b.walk, armL: b.armL, armR: b.armR, lean: b.lean, lift: b.lift, facing: -1, look: 0.6, mood: 'grin', squash: 1 - 0.03 * hump(seg(t, 1.8, 2.2)), blink: blinkAt(t, 1.2) });
      P(me, { look: lerp(-0.5, 0.5, easeInOut(seg(t, 0.4, 1.2))) * (1 - seg(t, 2.4, 2.8)), mood: 'grin', blink: blinkAt(t, 0.9) });
      const up = easeInOut(seg(t, 1.5, 2.0));
      const yL = FY - 90 * s2 - 2 + pat(2.0), yR = FY - 90 * s2 - 2 + pat(2.1);
      me.pose({ armL: lerp(8, reach(me, S, 'L', a.x, yL), up), armR: lerp(8, reach(me, S, 'R', b.x, yR), up), squash: 1 + 0.02 * Math.sin(t * 5) * up });
      nums.forEach((c, i) => {
        const q = seg(t, 2.5 + i * 0.4, 2.85 + i * 0.4);
        tf(c, i ? 272 : 128, FY - 90 * s2 - 30 - 4 * easeOut(q), 0, popS(q));
        c.setAttribute('opacity', q > 0 ? 1 : 0);
      });
    }
  };
}
