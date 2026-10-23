// analyze：チームが販売データ（棒グラフ）を一つずつ調べて傾向を分かる（例文 The team analyzed the sales data.）
import { seg, lerp, easeInOut, easeOut, backOut, hump, clamp } from '../ease.js';
import { P, blinkAt } from './run-after.js';
import { roomBg, cloud, say, desk, hp } from './look-over.js';

const EF = '"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif';
export const meta = { duration: 4.2, beats: [[0, 'データ'], [1.2, '1つずつ調べる'], [3.0, '分かった']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 0.95;
  const FY = roomBg(k, 'office', 240);
  const em = (ch, sz, parent) => { const q = g({}, parent); k.text(0, 0, ch, { 'font-size': sz, 'font-family': EF, 'text-anchor': 'middle', 'dominant-baseline': 'central' }, q); return q; };
  const tx = (s, sz = 14, fill) => k.text(0, 0, s, { 'font-size': sz, 'font-weight': 700, fill: fill || pal.ink, 'text-anchor': 'middle', 'dominant-baseline': 'central' });
  const bd = g({});
  el('rect', { x: 190, y: 56, width: 190, height: 140, rx: 8, fill: '#fff', stroke: pal.line, 'stroke-width': 3 }, bd);
  el('line', { x1: 206, y1: 178, x2: 366, y2: 178, stroke: pal.sub, 'stroke-width': 2 }, bd);
  const hs = [40, 62, 52, 92], bars = hs.map((h, i) => el('rect', { x: 214 + i * 38, y: 178, width: 24, height: 0, rx: 3, fill: pal.blue }, bd));
  const hl = el('rect', { x: 0, y: 70, width: 34, height: 112, rx: 6, fill: pal.yellow, opacity: 0 }, bd);
  const trend = el('path', { d: 'M 226 138 L 264 116 L 302 126 L 340 86', fill: 'none', stroke: pal.coral, 'stroke-width': 4, 'stroke-linecap': 'round', 'stroke-dasharray': 140, 'stroke-dashoffset': 140 }, bd);
  const bulb = em('💡', 34);
  const b = k.buddy({ x: 110, y: FY, scale: S });
  return { update(t) {
    bars.forEach((r, i) => { const h = hs[i] * easeOut(seg(t, 0.2 + i * 0.15, 0.9 + i * 0.15)); k.set(r, { y: 178 - h, height: h }); });
    const sc = seg(t, 1.2, 3.0), i = Math.min(3, Math.floor(sc * 4));
    k.set(hl, { x: 209 + i * 38, opacity: sc > 0 && sc < 1 ? 0.5 : 0 });
    const aim = [42, 55, 50, 68][i];
    P(b, { armR: sc > 0 ? lerp(60, aim + 30, sc > 0 && sc < 1 ? 1 : 0.5) + 6 * Math.sin(t * 5) * (sc < 1) : 25, lean: 4, look: 0.7, mood: t > 3.0 ? 'grin' : 'flat', blink: blinkAt(t) });
    k.set(trend, { 'stroke-dashoffset': 140 * (1 - easeInOut(seg(t, 2.8, 3.6))) });
    tf(bulb, 112, 56, 0, backOut(seg(t, 3.3, 3.8)));
  } };
}
