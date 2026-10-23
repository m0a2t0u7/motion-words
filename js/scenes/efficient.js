// efficient：新しい機械は古い機械と同じ時間で箱を3倍つくる（例文 This machine is more efficient than the old one.）
import { seg, lerp, easeInOut, easeOut, backOut, hump, clamp } from '../ease.js';
import { P, blinkAt } from './run-after.js';
import { roomBg, cloud, say, desk, hp } from './look-over.js';

const EF = '"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif';
export const meta = { duration: 4.4, beats: [[0, '同時にスタート'], [1.6, '作りつづける'], [3.6, '新しい方が多い']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 0.95;
  const FY = roomBg(k, 'office', 240);
  const em = (ch, sz, parent) => { const q = g({}, parent); k.text(0, 0, ch, { 'font-size': sz, 'font-family': EF, 'text-anchor': 'middle', 'dominant-baseline': 'central' }, q); return q; };
  const tx = (s, sz = 14, fill) => k.text(0, 0, s, { 'font-size': sz, 'font-weight': 700, fill: fill || pal.ink, 'text-anchor': 'middle', 'dominant-baseline': 'central' });
  const belt = (x0) => { el('rect', { x: x0, y: 190, width: 150, height: 14, rx: 7, fill: '#8A97A6' }); el('rect', { x: x0 + 8, y: 204, width: 8, height: FY - 204, fill: pal.woodDark }); el('rect', { x: x0 + 134, y: 204, width: 8, height: FY - 204, fill: pal.woodDark }); };
  belt(20); belt(230);
  el('rect', { x: 20, y: 120, width: 44, height: 70, rx: 6, fill: '#B7BFC8' }); el('rect', { x: 230, y: 112, width: 48, height: 78, rx: 6, fill: pal.mint });
  const o = em('🐢', 22), n = em('⚡', 24); tf(o, 42, 100); tf(n, 254, 92);
  const mk = (n0) => Array.from({ length: n0 }, () => el('rect', { width: 20, height: 18, rx: 3, fill: pal.yellow, stroke: pal.yellowDark, 'stroke-width': 2 }));
  const ob = mk(2), nb = mk(6);
  const co = tx('0', 20), cn = tx('0', 20); tf(co, 95, 232 + 0); tf(cn, 305, 232);
  const b = k.buddy({ x: 200, y: FY, scale: 0.8 });
  return { update(t) {
    const u = seg(t, 0.2, 3.8);
    ob.forEach((r, i) => { const p = (u * 1.2 + i * 0.5) ; k.set(r, { x: 70 + clamp(p) * 90, y: 172, opacity: p > 0 && p < 1.001 ? 1 : 0 }); });
    nb.forEach((r, i) => { const p = u * 3.6 - i * 0.6; k.set(r, { x: 280 + clamp(p) * 90, y: 172, opacity: p > 0 && p < 1.001 ? 1 : 0 }); });
    co.textContent = Math.min(1, Math.floor(u * 1.2 + 0.0)) ; cn.textContent = Math.min(3, Math.floor(u * 3.6 / 1.2));
    P(b, { facing: 1, look: 0.8, armR: 8 + 80 * easeOut(seg(t, 3.4, 3.9)), mood: t > 3.4 ? 'grin' : 'smile', blink: blinkAt(t) });
  } };
}
