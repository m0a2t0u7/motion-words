// flexible：上司が「始業を1時間ずらしたい」というまめの希望にOKを出す（例文 My boss is flexible about work hours.）
import { seg, lerp, easeInOut, easeOut, backOut, hump, clamp } from '../ease.js';
import { P, blinkAt } from './run-after.js';
import { roomBg, cloud, say, desk, hp } from './look-over.js';

const EF = '"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif';
export const meta = { duration: 4.2, beats: [[0, '9時始業'], [1.4, 'ずらしたい'], [2.8, 'いいよ']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 0.95;
  const FY = roomBg(k, 'office', 240);
  const em = (ch, sz, parent) => { const q = g({}, parent); k.text(0, 0, ch, { 'font-size': sz, 'font-family': EF, 'text-anchor': 'middle', 'dominant-baseline': 'central' }, q); return q; };
  const tx = (s, sz = 14, fill) => k.text(0, 0, s, { 'font-size': sz, 'font-weight': 700, fill: fill || pal.ink, 'text-anchor': 'middle', 'dominant-baseline': 'central' });
  const cx = 200, cy = 82;
  el('circle', { cx, cy, r: 34, fill: '#fff', stroke: pal.ink, 'stroke-width': 3 });
  for (let i = 0; i < 12; i++) el('line', { x1: cx, y1: cy - 29, x2: cx, y2: cy - 25, stroke: pal.sub, 'stroke-width': 2, transform: `rotate(${i * 30} ${cx} ${cy})` });
  const hh = g({}); tf(hh, cx, cy); el('line', { x1: 0, y1: 0, x2: 0, y2: -19, stroke: pal.ink, 'stroke-width': 4, 'stroke-linecap': 'round' }, hh);
  el('line', { x1: cx, y1: cy, x2: cx, y2: cy - 27, stroke: pal.sub, 'stroke-width': 2.5, 'stroke-linecap': 'round' });
  const lab = k.text(cx, 142, '9:00', { 'font-size': 18, 'font-weight': 700, fill: pal.ink, 'text-anchor': 'middle' });
  const b = k.buddy({ x: 90, y: FY, scale: S });
  const bs = k.buddy({ x: 310, y: FY, scale: S, facing: -1, color: pal.coral, dark: pal.coralDark });
  const sy = say(k, 60, 36, 1), ok = say(k, 60, 36, -1);
  const tk = k.text(0, 6, '+1h', { 'font-size': 16, 'font-weight': 700, fill: pal.blue, 'text-anchor': 'middle' }, sy.g), ck = k.text(0, 8, 'OK', { 'font-size': 18, 'font-weight': 700, fill: '#2FA36B', 'text-anchor': 'middle' }, ok.g);
  return { update(t) {
    const sl = easeInOut(seg(t, 2.2, 3.4));
    tf(hh, cx, cy, (9 + sl) * 30);
    lab.textContent = sl > 0.5 ? '10:00' : '9:00';
    P(b, { look: 0.6, armR: 8 + 60 * seg(t, 1.4, 1.9) * (1 - seg(t, 2.6, 3.0)), mood: t > 2.9 ? 'grin' : 'smile', blink: blinkAt(t) });
    bs.pose({ x: 310, y: FY, facing: -1, armL: 8, armR: 8 + 120 * seg(t, 2.6, 3.1), lean: 0, squash: 1, walk: 0, look: -0.5, mood: t > 2.4 ? 'grin' : 'smile', blink: blinkAt(t, 1), lift: 0 });
    sy.show(seg(t, 1.3, 1.8) * (1 - seg(t, 2.2, 2.4)), 130, 130);
    ok.show(seg(t, 2.5, 2.9), 270, 130);
  } };
}
