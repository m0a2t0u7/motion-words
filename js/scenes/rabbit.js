// rabbit：ウサギが庭の芝生をぴょん、ぴょんと横切っていく。まめが目で追う（例文 The rabbit hopped across the yard.）
// このファイルはウサギのヘルパーも書き出す（bunny）
import { seg, lerp, easeInOut, easeOut, hump, clamp } from '../ease.js';
import { P, blinkAt } from './run-after.js';
import { cloudG, treeG, flowerG } from './nature.js';
import { pickets } from './yard.js';
import { house } from './street.js';

// ウサギ（右向き、原点＝足元）。set(x, y, はね 0..1, 向き, 拡大)
export function bunny(k, parent, col = '#F4F1EC', dark = '#D9D2C7') {
  const { el, g, tf } = k;
  const o = g({}, parent), sh = k.shadow(0, 0, 16, 3, o), f = g({}, o);
  const leg = g({}, f); el('ellipse', { cx: 4, cy: -2, rx: 9, ry: 4, fill: dark }, leg);
  el('circle', { cx: -14, cy: -16, r: 6, fill: '#fff' }, f);
  el('ellipse', { cx: -2, cy: -14, rx: 14, ry: 12, fill: col }, f);
  el('ellipse', { cx: 8, cy: -4, rx: 4, ry: 3, fill: dark }, f);
  const hd = g({}, f); tf(hd, 10, -24);
  const ears = g({}, hd);
  [[-4, 0], [2, 1]].forEach(([x, i]) => { el('ellipse', { cx: x, cy: -14, rx: 4, ry: 12, fill: i ? col : dark }, ears); el('ellipse', { cx: x, cy: -13, rx: 1.8, ry: 8, fill: '#F7B5C0' }, ears); });
  el('circle', { cx: 0, cy: 0, r: 9, fill: col }, hd);
  el('circle', { cx: 4, cy: -2, r: 1.8, fill: k.pal.ink }, hd);
  el('circle', { cx: 9, cy: 2, r: 1.6, fill: '#F07F92' }, hd);
  return { g: o, set(x, y, hop = 0, face = 1, s = 1, lift = 0) {
    tf(o, x, y, 0, s); tf(f, 0, -lift, 0, face, 1); tf(sh, 0, 0, 0, Math.max(0.3, 1 - lift / 60), 1);
    tf(leg, 0, 0, hop * 30, 1 + hop * 0.4, 1); tf(f, 0, -lift, -12 * hop * face, face, 1); tf(ears, 0, 0, -20 * hop);
  } };
}

export const meta = { duration: 4.2, beats: [[0, '庭'], [0.8, 'ぴょんぴょん'], [3.4, '横切った']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 200, mood: 'outdoor' });
  tf(cloudG(k, 70, 26), 300, 40);
  house(k, 80, 200, '#F7EBDD', pal.coral, 110, 80);
  tf(treeG(k, 0.8).g, 340, 200);
  el('rect', { x: 0, y: 200, width: 400, height: 100, fill: '#BFE3A4' });
  el('rect', { x: 0, y: 200, width: 400, height: 2, fill: '#A9D690' });
  pickets(k, 140, 400, 202, 28);
  el('path', { d: 'M 130 300 Q 150 250 170 210', stroke: '#E9DCC8', 'stroke-width': 18, fill: 'none' });
  [[40, 262, '#FF8FB1'], [60, 270, '#FFCF5C'], [360, 286, '#A58BF3']].forEach(([x, y, c]) => tf(flowerG(k, c, undefined, 20).g, x, y));
  const r = bunny(k);
  const me = k.buddy({ x: 230, y: 214, scale: 0.75 });
  const N = 5, T0 = 0.6, T1 = 3.6, X0 = 20, X1 = 380;
  return {
    update(t) {
      const p = seg(t, T0, T1), n = p * N, i = Math.min(N - 1, Math.floor(n)), q = p >= 1 ? 1 : n - i;
      const x = lerp(X0, X1, (i + easeInOut(q)) / N), on = p > 0 && p < 1;
      const lift = on ? 26 * hump(q) : 0, hop = on ? hump(q) : 0;
      r.set(x, 262 + 4 * Math.sin(x / 90), hop, 1, 1.1, lift);
      P(me, { x: 230, y: 214, look: clamp((x - 230) / 120, -1, 1), facing: x > 250 ? 1 : x < 210 ? -1 : 1, mood: t > 1.0 ? 'open' : 'smile', blink: blinkAt(t), armR: t > 3.6 ? 150 + Math.sin(t * 10) * 16 : 8 });
      if (t > 3.6) me.pose({ mood: 'grin' });
    }
  };
}
