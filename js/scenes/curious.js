// curious：小さなまめが虫めがねを持って、カタツムリ・花・石と次々にのぞきこみ、「？」と目を輝かせる（例文 Children are curious about everything.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';
import { P, blinkAt, hp, hold, walkTo, path, scene, flowerG, sym, sparkle } from './confused.js';

export const meta = { duration: 4.4, beats: [[0, 'なんだろう？'], [1.6, '次はこれ！'], [3.2, '何でも知りたい']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 0.72;
  const { FY } = scene(k);
  // カタツムリ・花・石
  const snail = g({}); tf(snail, 110, FY);
  el('ellipse', { cx: 0, cy: -3, rx: 16, ry: 4, fill: '#C9B48A' }, snail);
  el('circle', { cx: -2, cy: -12, r: 10, fill: '#D99A5A', stroke: '#B87A40', 'stroke-width': 2 }, snail);
  el('path', { d: 'M -2 -12 m -5 0 a 5 5 0 1 1 5 5', stroke: '#B87A40', 'stroke-width': 1.6, fill: 'none' }, snail);
  el('path', { d: 'M 12 -5 l 4 -10 M 14 -5 l 7 -8', stroke: '#C9B48A', 'stroke-width': 2 }, snail);
  const fl = flowerG(k, '#FF8FB1', undefined, 34); tf(fl.g, 220, FY); fl.set(1);
  const rock = g({}); tf(rock, 330, FY);
  el('path', { d: 'M -18 0 Q -16 -18 0 -18 Q 16 -16 18 0 Z', fill: '#A9B2BF' }, rock);
  el('path', { d: 'M -4 -12 l 6 4 l -3 5', stroke: '#fff', 'stroke-width': 1.5, fill: 'none', opacity: 0.6 }, rock);
  const b = k.buddy({ x: 60, y: FY, scale: S });
  // 虫めがね（原点＝持ち手の端、上にレンズ）
  const mg = g({});
  el('rect', { x: -2.5, y: -18, width: 5, height: 18, rx: 2, fill: pal.coffee }, mg);
  el('circle', { cx: 0, cy: -30, r: 12, fill: '#DFF3FC', 'fill-opacity': 0.6, stroke: pal.ink, 'stroke-width': 3 }, mg);
  const qs = [0, 1, 2].map(() => sym(k, '?', pal.blueDark, 22));
  const sp = [0, 1, 2].map(() => sparkle(k));
  const X = [150, 254, 300];
  const xf = path([[0.1, 60], [0.7, X[0]], [1.6, X[0]], [2.1, X[1]], [2.9, X[1]], [3.3, X[2] - 6]]);
  return {
    update(t) {
      const w = walkTo(xf, t, 60, 1);
      const stop = 1 - w.m;
      const tgt = t < 1.8 ? 0 : t < 3.1 ? 1 : 2;
      const peek = stop * [1, 0.5, 1][tgt];
      P(b, { x: w.x, walk: w.walk, facing: tgt === 2 ? 1 : -1, lean: w.lean + 22 * peek, armR: lerp(30, 70, peek), armL: w.armL, mood: 'open', look: 0.8, blink: blinkAt(t) });
      if (tgt === 1) b.pose({ facing: -1, lean: 6, armR: 110 });
      hold(k, b, S, mg, 'R', lerp(20, 60, peek) * b.state.facing * -1);
      qs.forEach((q, i) => q(seg(t, [0.8, 2.2, 3.4][i], [1.1, 2.5, 3.7][i]), X[i] - 30 + i * 6, FY - 96 - (i % 2) * 10));
      sp.forEach((s, i) => { const q = ((t * 1.2) + i / 3) % 1; tf(s, w.x + (i - 1) * 26, FY - 82 - 16 * q, t * 80, t > 3.4 ? Math.max(0.001, hump(q) * 0.9) : 0.001); });
    }
  };
}
