// system：学校に給食注文の新しい仕組み（タブレットで選ぶと給食が出てくる）ができた（例文 The school has a new system for lunch orders.）
import { seg, lerp, easeInOut, easeOut, backOut, hump, clamp } from '../ease.js';
import { P, blinkAt } from './run-after.js';
import { roomBg, cloud, say, desk, hp } from './look-over.js';

const EF = '"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif';
export const meta = { duration: 4.4, beats: [[0, '注文する'], [1.4, '仕組みが動く'], [3.0, '給食が出てくる']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 0.95;
  const FY = roomBg(k, 'office', 240);
  const em = (ch, sz, parent) => { const q = g({}, parent); k.text(0, 0, ch, { 'font-size': sz, 'font-family': EF, 'text-anchor': 'middle', 'dominant-baseline': 'central' }, q); return q; };
  const tx = (s, sz = 14, fill) => k.text(0, 0, s, { 'font-size': sz, 'font-weight': 700, fill: fill || pal.ink, 'text-anchor': 'middle', 'dominant-baseline': 'central' });
  const kx = 250;
  el('rect', { x: kx - 50, y: 80, width: 100, height: FY - 80, rx: 10, fill: '#DDE5EC', stroke: pal.line, 'stroke-width': 3 });
  el('rect', { x: kx - 38, y: 92, width: 76, height: 56, rx: 6, fill: '#fff', stroke: pal.line, 'stroke-width': 2 });
  const bA = el('rect', { x: kx - 32, y: 104, width: 28, height: 30, rx: 5, fill: '#EAF0F6' }), bB = el('rect', { x: kx + 4, y: 104, width: 28, height: 30, rx: 5, fill: '#EAF0F6' });
  const a1 = tx('A', 18); tf(a1, kx - 18, 119); const a2 = tx('B', 18); tf(a2, kx + 18, 119);
  el('rect', { x: kx - 36, y: 180, width: 72, height: 12, rx: 4, fill: '#8A97A6' });
  const gr = em('⚙️', 22), gr2 = em('⚙️', 16); 
  const tr = em('🍱', 36);
  const b = k.buddy({ x: 120, y: FY, scale: S });
  const ok = em('✨', 22);
  return { update(t) {
    const tp = seg(t, 0.8, 1.4), on = t > 1.2;
    k.set(bA, { fill: on ? pal.mint : '#EAF0F6' });
    P(b, { look: 0.7, armR: 40 + 55 * seg(t, 0.5, 1.1) - 25 * seg(t, 1.4, 1.8) + 6 * hump(tp), lean: 5 * seg(t, 0.5, 1.1), mood: t > 3.3 ? 'grin' : 'smile', blink: blinkAt(t) });
    tf(gr, kx - 20, 162, t * 180 * seg(t, 1.3, 3.0), seg(t, 1.3, 1.5) * (1 - seg(t, 3.0, 3.2))); tf(gr2, kx + 6, 166, -t * 270, seg(t, 1.3, 1.5) * (1 - seg(t, 3.0, 3.2)));
    const o = easeOut(seg(t, 3.0, 3.8));
    tf(tr, kx, lerp(190, 214, o) - 10 * 0, 0, o);
    tf(ok, kx + 40, 190, 0, backOut(seg(t, 3.6, 4.1)));
  } };
}
