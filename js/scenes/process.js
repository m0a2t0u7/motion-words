// process：言語を学ぶのは階段をゆっくり一段ずつ上る過程（例文 Learning a language is a slow process.）
import { seg, lerp, easeInOut, easeOut, backOut, hump, clamp } from '../ease.js';
import { P, blinkAt } from './run-after.js';
import { roomBg, cloud, say, desk, hp } from './look-over.js';

const EF = '"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif';
export const meta = { duration: 4.4, beats: [[0, '1段目'], [1.6, 'ゆっくり上る'], [3.4, 'まだ途中']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 0.95;
  const FY = roomBg(k, 'office', 240);
  const em = (ch, sz, parent) => { const q = g({}, parent); k.text(0, 0, ch, { 'font-size': sz, 'font-family': EF, 'text-anchor': 'middle', 'dominant-baseline': 'central' }, q); return q; };
  const tx = (s, sz = 14, fill) => k.text(0, 0, s, { 'font-size': sz, 'font-weight': 700, fill: fill || pal.ink, 'text-anchor': 'middle', 'dominant-baseline': 'central' });
  const sx = [90, 150, 210, 270, 330], sh = 22;
  sx.forEach((x, i) => { el('rect', { x: x - 30, y: FY - sh * (i + 1), width: 60, height: sh * (i + 1), fill: i % 2 ? '#E9DDC7' : '#F2DDBB' }); });
  const fl = el('path', { d: `M 330 ${FY - sh * 5} v -34 l 22 8 l -22 8`, fill: pal.coral, stroke: pal.ink, 'stroke-width': 3, 'stroke-linejoin': 'round' });
  const bk = em('📖', 26);
  const b = k.buddy({ x: 90, y: FY - sh, scale: 0.8 });
  const bar = el('rect', { x: 120, y: 24, width: 0, height: 10, rx: 5, fill: pal.mint }); el('rect', { x: 120, y: 24, width: 160, height: 10, rx: 5, fill: 'none', stroke: pal.line, 'stroke-width': 2 });
  const stepAt = (t) => { const u = seg(t, 0.6, 3.6) * 2.4; const n = Math.floor(u), f = u - n; return n + easeInOut(clamp(f * 1.6)); };
  return { update(t) {
    const s = stepAt(t), n = Math.floor(s + 1e-6), f = s - n;
    const x = 90 + s * 60, y = FY - sh * (1 + s) - 18 * Math.sin(Math.PI * Math.min(1, f > 0.001 ? f : 0));
    const moving = t > 0.6 && t < 3.6 && f > 0.01 && f < 0.99;
    P(b, { x, y, walk: moving ? t * 8 : 0, armR: moving ? 8 + 20 * Math.sin(t * 8) : 8, armL: 70, lean: 6, look: 0.6, mood: t > 3.4 ? 'smile' : 'flat', blink: blinkAt(t) });
    tf(bk, x - 36, y - 56, 0, 1);
    k.set(bar, { width: 160 * (s / 5) });
  } };
}
