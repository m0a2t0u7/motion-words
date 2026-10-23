// consumer：買い物客のまめが値札を見て、もっと安い値段を望む（例文 Consumers want lower prices.）
import { seg, lerp, easeInOut, easeOut, backOut, hump, clamp } from '../ease.js';
import { P, blinkAt } from './run-after.js';
import { roomBg, cloud, say, desk, hp } from './look-over.js';

const EF = '"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif';
export const meta = { duration: 4.2, beats: [[0, '高い値札'], [1.4, '安くしてほしい'], [3.0, '安くなった']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 0.95;
  const FY = roomBg(k, 'office', 240);
  const em = (ch, sz, parent) => { const q = g({}, parent); k.text(0, 0, ch, { 'font-size': sz, 'font-family': EF, 'text-anchor': 'middle', 'dominant-baseline': 'central' }, q); return q; };
  const tx = (s, sz = 14, fill) => k.text(0, 0, s, { 'font-size': sz, 'font-weight': 700, fill: fill || pal.ink, 'text-anchor': 'middle', 'dominant-baseline': 'central' });
  desk(k, 230, 150, 190);
  const ap = em('🍎', 38); tf(ap, 270, 170);
  const ap2 = em('🍎', 38); tf(ap2, 330, 170);
  const tag = g({}); tf(tag, 300, 150);
  el('rect', { x: -26, y: -22, width: 52, height: 30, rx: 6, fill: '#fff', stroke: pal.line, 'stroke-width': 2 }, tag);
  const p1 = k.text(0, -3, '¥500', { 'font-size': 16, 'font-weight': 700, fill: pal.red, 'text-anchor': 'middle' }, tag);
  const b = k.buddy({ x: 120, y: FY, scale: S });
  const cl = cloud(k, 96, 62, 1), cc = em('¥ ↓', 26, cl.g);
  const ok = em('🛒', 30);
  return { update(t) {
    const low = t > 3.0;
    p1.textContent = low ? '¥300' : '¥500'; p1.setAttribute('fill', low ? '#2FA36B' : pal.red);
    tf(tag, 300, 150 + 4 * Math.sin(t * 3) * 0, 0, 1 + 0.25 * hump(seg(t, 2.9, 3.4)));
    P(b, { look: 0.6, armR: 8 + 130 * seg(t, 1.6, 2.2) * (1 - seg(t, 2.6, 3.0)), mood: low ? 'grin' : t > 1.2 ? 'sad' : 'flat', blink: blinkAt(t) });
    cl.show(seg(t, 1.0, 1.6) * (1 - seg(t, 2.8, 3.1)), 150, 70);
    tf(ok, 160, 120, 0, backOut(seg(t, 3.3, 3.9)));
  } };
}
