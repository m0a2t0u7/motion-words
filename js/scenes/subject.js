// subject：科目の本が並び、好きな科目（理科）を選ぶ（例文 What's your favorite subject?）
import { seg, lerp, easeInOut, easeOut, backOut, hump, clamp } from '../ease.js';
import { P, blinkAt } from './run-after.js';
import { roomBg, cloud, say, desk, hp } from './look-over.js';

const EF = '"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif';
export const meta = { duration: 4.0, beats: [[0, '科目が並ぶ'], [1.4, '見くらべる'], [2.8, 'これが好き']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 0.95;
  const FY = roomBg(k, 'office', 240);
  const em = (ch, sz, parent) => { const q = g({}, parent); k.text(0, 0, ch, { 'font-size': sz, 'font-family': EF, 'text-anchor': 'middle', 'dominant-baseline': 'central' }, q); return q; };
  const tx = (s, sz = 14, fill) => k.text(0, 0, s, { 'font-size': sz, 'font-weight': 700, fill: fill || pal.ink, 'text-anchor': 'middle', 'dominant-baseline': 'central' });
  desk(k, 90, 250, 196);
  const cols = [pal.blue, pal.green, pal.coral], ic = ['🔢', '🔬', '🎨'];
  const bk = cols.map((c, i) => { const q = g({}); tf(q, 150 + i * 90, 170); el('rect', { x: -28, y: -26, width: 56, height: 52, rx: 5, fill: c }, q); em(ic[i], 30, q); return q; });
  const hr = em('❤️', 30);
  const b = k.buddy({ x: 60, y: FY, scale: S });
  return { update(t) {
    const sc = seg(t, 0.8, 2.6), pick = 1;
    const tgt = sc < 0.33 ? 0 : sc < 0.66 ? 2 : 1;
    const fin = easeInOut(seg(t, 2.3, 2.9));
    const aimI = t < 2.3 ? tgt : pick;
    bk.forEach((q, i) => tf(q, 150 + i * 90, 170 - 10 * (t > 2.5 && i === pick ? easeOut(seg(t, 2.5, 2.9)) : 0), 0, 1 + (t > 0.8 && t < 2.3 && i === aimI ? 0.12 : 0) + (i === pick ? 0.15 * fin : 0)));
    P(b, { look: 0.7, armR: 20 + 40 * seg(t, 0.6, 1.0) + 8 * aimI * (t > 0.8 ? 1 : 0), lean: 4 * seg(t, 0.8, 1.2), mood: t > 2.6 ? 'grin' : 'smile', blink: blinkAt(t) });
    tf(hr, 240, 118, 0, backOut(seg(t, 2.6, 3.2)));
  } };
}
