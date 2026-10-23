// attention：よそ見をしていたまめが、先生の話に注意を向ける（例文 Please pay attention to the teacher.）
import { seg, lerp, easeInOut, easeOut, backOut, hump, clamp } from '../ease.js';
import { P, blinkAt } from './run-after.js';
import { roomBg, cloud, say, desk, hp } from './look-over.js';

const EF = '"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif';
export const meta = { duration: 4.0, beats: [[0, 'よそ見'], [1.4, '気づく'], [2.8, '先生に注目']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 0.95;
  const FY = roomBg(k, 'office', 240);
  const em = (ch, sz, parent) => { const q = g({}, parent); k.text(0, 0, ch, { 'font-size': sz, 'font-family': EF, 'text-anchor': 'middle', 'dominant-baseline': 'central' }, q); return q; };
  const tx = (s, sz = 14, fill) => k.text(0, 0, s, { 'font-size': sz, 'font-weight': 700, fill: fill || pal.ink, 'text-anchor': 'middle', 'dominant-baseline': 'central' });
  el('rect', { x: 230, y: 50, width: 150, height: 96, rx: 6, fill: '#3E7C64', stroke: pal.wood, 'stroke-width': 5 });
  const abc = tx('A B C', 22, '#fff'); tf(abc, 305, 98);
  const tc = k.buddy({ x: 225, y: FY, scale: S, facing: -1, color: pal.coral, dark: pal.coralDark });
  const b = k.buddy({ x: 90, y: FY, scale: S });
  const bf = em('🦋', 26), eye = em('👀', 22);
  const wv = [0, 1, 2].map(() => el('path', { d: 'M 0 -8 Q -6 0 0 8', fill: 'none', stroke: pal.blue, 'stroke-width': 3, 'stroke-linecap': 'round' }));
  return { update(t) {
    const turn = easeInOut(seg(t, 1.2, 1.9));
    tc.pose({ x: 225, y: FY, facing: -1, armL: 8, armR: 100 + 12 * Math.sin(t * 5), lean: 0, squash: 1, walk: 0, look: 0, mood: 'open', blink: blinkAt(t, 1) , lift: 0 });
    P(b, { look: lerp(-0.9, 0.9, turn), armR: 8 + 40 * seg(t, 2.2, 2.8), mood: t > 1.9 ? 'smile' : 'flat', blink: blinkAt(t) });
    tf(bf, 60 + 40 * seg(t, 0, 1.8) + 8 * Math.sin(t * 6), 90 - 30 * seg(t, 1.2, 2.2) - 10 * Math.sin(t * 4), 0, 1 - seg(t, 1.8, 2.2));
    tf(eye, 120, 98, 0, backOut(seg(t, 2.0, 2.5)));
    wv.forEach((w, i) => { const u = (t * 0.8 + i / 3) % 1; tf(w, 205 - u * 40, 128, 0, 0.7 + u * 0.6); w.setAttribute('opacity', (1 - u) * seg(t, 0.2, 0.5)); });
  } };
}
