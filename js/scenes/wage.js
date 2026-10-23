// wage：給料袋の中のコインが積み上がり、賃金が上がる（例文 The minimum wage went up this year.）
import { seg, lerp, easeInOut, easeOut, backOut, hump, clamp } from '../ease.js';
import { P, blinkAt } from './run-after.js';
import { roomBg, cloud, say, desk, hp } from './look-over.js';

const EF = '"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif';
export const meta = { duration: 4.2, beats: [[0, '今の賃金'], [1.4, '上がっていく'], [3.0, '上がった']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 0.95;
  const FY = roomBg(k, 'office', 240);
  const em = (ch, sz, parent) => { const q = g({}, parent); k.text(0, 0, ch, { 'font-size': sz, 'font-family': EF, 'text-anchor': 'middle', 'dominant-baseline': 'central' }, q); return q; };
  const tx = (s, sz = 14, fill) => k.text(0, 0, s, { 'font-size': sz, 'font-weight': 700, fill: fill || pal.ink, 'text-anchor': 'middle', 'dominant-baseline': 'central' });
  const base = FY - 4, N = 7;
  const coins = Array.from({ length: N }, (_, i) => { const q = g({}); el('ellipse', { cx: 0, cy: 0, rx: 30, ry: 9, fill: pal.yellow, stroke: pal.yellowDark, 'stroke-width': 2 }, q); return q; });
  const sg = tx('¥', 14, pal.yellowDark);
  const ar = g({}); el('path', { d: 'M 0 -26 L 18 -4 H 7 V 26 H -7 V -4 H -18 Z', fill: pal.green }, ar);
  const b = k.buddy({ x: 110, y: FY, scale: S });
  const yen = em('💴', 30);
  return { update(t) {
    coins.forEach((q, i) => { const cnt = i < 3 ? 1 : easeOut(seg(t, 1.2 + (i - 3) * 0.35, 1.6 + (i - 3) * 0.35)); const dropY = i < 3 ? 0 : -60 * (1 - cnt); tf(q, 270, base - 12 - i * 11 + dropY, 0, 1, cnt > 0 ? 1 : 0); q.setAttribute('opacity', cnt > 0.05 ? 1 : 0); });
    const top = Math.min(N - 1, 3 + Math.floor(seg(t, 1.2, 2.9) * 4));
    tf(sg, 270, base - 12 - 2 * 11 - 6);
    tf(ar, 345, 150 - 18 * seg(t, 1.6, 3.0), 0, backOut(seg(t, 1.5, 2.0)));
    P(b, { look: 0.7, armR: 8 + 130 * seg(t, 3.0, 3.5), armL: 8 + 130 * seg(t, 3.0, 3.5), lift: Math.abs(Math.sin(seg(t, 3.0, 4.0) * 6)) * 8 * seg(t, 3.0, 3.1), mood: t > 2.9 ? 'grin' : 'smile', blink: blinkAt(t) });
    tf(yen, 180, 70, 0, backOut(seg(t, 3.0, 3.5)));
  } };
}
