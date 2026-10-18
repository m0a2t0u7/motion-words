// think back：大人のまめが窓辺で昔を思い返す→考え雲に、教室のすみで恥ずかしそうに隠れている小さいころの自分が浮かぶ（例文 When I think back, I was too shy.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';
import { roomBg, cloud, faceAt } from './look-over.js';

export const meta = { duration: 4.4, beats: [[0, '昔を思う'], [1.6, '小さいころ'], [3.2, '恥ずかしがり']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = roomBg(k, 'home', 240, 'evening');
  const b = k.buddy({ x: 90, y: FY, scale: 0.95 });
  const cl = cloud(k, 220, 128, -1);
  // 回想：みんなが話す輪と、柱のかげの小さいまめ
  const kids = [[30, pal.blue, pal.blueDark, -1], [70, pal.yellow, pal.yellowDark, -1]].map(([x, c, d, f]) => k.buddy({ parent: cl.g, x, y: 40, scale: 0.36, color: c, dark: d, facing: f }));
  const kid0 = k.buddy({ parent: cl.g, x: -10, y: 40, scale: 0.36, color: pal.coral, dark: pal.coralDark });
  const me = k.buddy({ parent: cl.g, x: -60, y: 40, scale: 0.36 });
  const blush = [-1, 1].map((d) => el('ellipse', { cx: d * 18, cy: -44, rx: 7, ry: 4, fill: pal.red, opacity: 0 }, me.body));
  el('rect', { x: -52, y: -36, width: 14, height: 78, rx: 3, fill: '#D9C8B4' }, cl.g);
  el('line', { x1: -100, x2: 100, y1: 41, y2: 41, stroke: pal.line, 'stroke-width': 2 }, cl.g);
  return {
    update(t) {
      const gaze = easeInOut(seg(t, 0.3, 0.9));
      b.pose({ armR: 8 + 30 * gaze, armL: 8 + 30 * gaze, mood: t > 3.2 ? 'flat' : 'smile', look: 0.6, blink: t > 1.2 && t < 3.6 ? 0.5 : 0, lean: -3 * gaze });
      faceAt(b, 5, -6 * gaze);
      cl.show(easeOut(seg(t, 1.1, 1.6)), 250, 100);
      const talk = Math.sin(t * 8);
      [kid0, ...kids].forEach((c, i) => c.pose({ mood: Math.sin(t * 9 + i * 2) > 0 ? 'open' : 'grin', armR: 8 + 30 * Math.max(0, Math.sin(t * 4 + i)), look: 0.4 }));
      kid0.pose({ facing: 1 });
      const peek = Math.max(0, Math.sin((t - 1.8) * 2.4)) * seg(t, 1.8, 2.0), hide = seg(t, 2.6, 2.9);
      me.pose({ x: -60 + 10 * peek * (1 - hide) - 4 * hide, lean: -8 * hide, armL: 8 + 120 * hide, armR: 8 + 120 * hide, mood: 'flat', look: 0.6, squash: 1 - 0.05 * hide, blink: hide * 0.6 });
      faceAt(me, 3, 4 * hide);
      blush.forEach((e) => e.setAttribute('opacity', 0.7 * seg(t, 2.4, 2.8)));
    }
  };
}
