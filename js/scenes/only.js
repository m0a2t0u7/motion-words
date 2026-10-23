// only：チケットを探したが、持っているのは1枚だけ（例文 I only have one ticket.）
import { seg, lerp, easeInOut, easeOut, backOut, hump, clamp } from '../ease.js';
import { P, blinkAt } from './run-after.js';
import { roomBg, cloud, say, desk, hp } from './look-over.js';

const EF = '"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif';
export const meta = { duration: 4.0, beats: [[0, '財布を見る'], [1.4, '探す'], [2.8, '1枚だけ']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 0.95;
  const FY = roomBg(k, 'office', 240);
  const em = (ch, sz, parent) => { const q = g({}, parent); k.text(0, 0, ch, { 'font-size': sz, 'font-family': EF, 'text-anchor': 'middle', 'dominant-baseline': 'central' }, q); return q; };
  const tx = (s, sz = 14, fill) => k.text(0, 0, s, { 'font-size': sz, 'font-weight': 700, fill: fill || pal.ink, 'text-anchor': 'middle', 'dominant-baseline': 'central' });
  const b = k.buddy({ x: 150, y: FY, scale: S });
  const tk = g({});
  el('rect', { x: -16, y: -10, width: 32, height: 20, rx: 3, fill: pal.yellow, stroke: pal.yellowDark, 'stroke-width': 2 }, tk);
  el('line', { x1: 5, y1: -9, x2: 5, y2: 9, stroke: pal.yellowDark, 'stroke-width': 2, 'stroke-dasharray': '3 2' }, tk);
  const bub = g({}); el('circle', { r: 26, fill: '#fff', stroke: pal.line, 'stroke-width': 2 }, bub); k.text(0, 8, '1', { 'font-size': 30, 'font-weight': 700, fill: pal.coral, 'text-anchor': 'middle' }, bub);
  const dust = [0, 1, 2].map(() => em('💨', 14));
  return { update(t) {
    const search = seg(t, 0.4, 1.8), show = easeOut(seg(t, 2.0, 2.8));
    P(b, { armL: 8 + 40 * Math.sin(t * 9) * search * (1 - seg(t, 1.8, 2)), armR: lerp(30, 120, show), lean: 5 * (1 - show), look: 0.4, mood: t > 2.0 ? 'smile' : 'flat', blink: blinkAt(t) });
    const h = hp(b, S, 'R');
    tf(tk, h.x + 12 * show, h.y - 6 - 8 * show, 0, 0.6 + 0.4 * show);
    tk.setAttribute('opacity', seg(t, 0.0, 0.2));
    tf(bub, 250, 100, 0, backOut(seg(t, 2.6, 3.1)));
    dust.forEach((d, i) => { const u = (t * 1.2 + i * 0.4) % 1; tf(d, 110 + i * 30, 130 - 10 * u, 0, search * (1 - seg(t, 1.8, 2)) * (1 - u)); });
  } };
}
