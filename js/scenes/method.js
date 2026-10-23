// method：単語を覚える簡単な方法。見る→書く→言える、の3ステップをまめが順に指す（例文 This is a simple method for learning words.）
import { seg, lerp, easeInOut, backOut, hump } from '../ease.js';
import { blinkAt } from './run-after.js';
import { roomBg } from './look-over.js';
import { reach } from './dig.js';

export const meta = { duration: 4.2, beats: [[0, '3つの手順'], [1.0, '順に進む'], [3.2, '簡単にできる']] };
const EF = '"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif';

export function create(k) {
  const { el, g, tf, pal } = k, S = 0.95;
  const FY = roomBg(k, 'home', 240);
  const b = k.buddy({ x: 62, y: FY, scale: S });
  const E = ['👀', '✏️', '🗣️'], C = [pal.blue, pal.yellow, pal.mint];
  const X = [160, 255, 350];
  const cards = X.map((x, i) => {
    const c = g({}); el('rect', { x: -38, y: -50, width: 76, height: 100, rx: 12, fill: '#fff', stroke: C[i], 'stroke-width': 4 }, c);
    el('circle', { cx: 0, cy: -34, r: 11, fill: C[i] }, c);
    k.text(0, -29, String(i + 1), { 'font-size': 14, 'font-weight': 800, fill: '#fff', 'text-anchor': 'middle' }, c);
    k.text(0, 12, E[i], { 'font-size': 34, 'font-family': EF, 'text-anchor': 'middle', 'dominant-baseline': 'central' }, c);
    return c;
  });
  const arrows = [0, 1].map((i) => el('path', { d: `M ${X[i] + 42} 120 l 10 0 m -5 -5 l 5 5 l -5 5`, fill: 'none', stroke: pal.sub, 'stroke-width': 3, 'stroke-linecap': 'round' }));
  const ck = el('path', { d: 'M 330 84 l 8 9 l 16 -18', fill: 'none', stroke: pal.green, 'stroke-width': 5, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', opacity: 0 });
  return {
    update(t) {
      const idx = t < 1.6 ? 0 : t < 2.4 ? 1 : 2;
      cards.forEach((c, i) => tf(c, X[i], 120, 0, backOut(seg(t, 0.2 + i * 0.25, 0.8 + i * 0.25)) * (1 + 0.08 * (i === idx && t > 1 ? 1 : 0))));
      arrows.forEach((a, i) => a.setAttribute('opacity', seg(t, 0.8 + i * 0.25, 1.1 + i * 0.25)));
      ck.setAttribute('opacity', seg(t, 3.2, 3.5));
      const o = { armL: 8, armR: 10, lean: 3, mood: t > 3.2 ? 'grin' : 'smile', blink: blinkAt(t), look: 0.7, squash: 1, walk: 0, lift: 0 };
      b.pose(o);
      const pt = t > 1.0 ? 1 : seg(t, 0.4, 1.0);
      b.pose({ ...o, armR: lerp(10, reach(b, S, 'R', X[idx] - 30, 78), pt) });
    }
  };
}
