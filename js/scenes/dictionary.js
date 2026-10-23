// dictionary：辞書を指でたどって単語を探し、見つける（例文 I looked up the word in a dictionary.）
import { seg, lerp, easeInOut, easeOut, backOut, hump } from '../ease.js';
import { P, blinkAt, star } from './run-after.js';
import { roomBg, desk, hp, reach, faceAt } from './look-over.js';

export const meta = { duration: 4.2, beats: [[0, '辞書を開く'], [1.0, '指でたどる'], [3.0, '単語を見つけた']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 1.3;
  const FY = roomBg(k, 'home', 240);
  desk(k, 195, 215, 200);
  // 辞書（見開き、机に立てて置く）
  const d = g({}); tf(d, 285, 200);
  el('rect', { x: -66, y: -78, width: 132, height: 80, rx: 5, fill: pal.coralDark }, d);
  el('path', { d: 'M -62 -74 L 0 -70 L 62 -74 L 62 -4 L 0 -2 L -62 -4 Z', fill: '#fff' }, d);
  el('line', { x1: 0, y1: -70, x2: 0, y2: -2, stroke: '#D5DBE5', 'stroke-width': 2 }, d);
  const ys = [-62, -52, -42, -32, -22, -12];
  [-54, 8].forEach((x0) => ys.forEach((y, i) => el('rect', { x: x0, y, width: i % 2 ? 30 : 42, height: 3, rx: 1.5, fill: '#9AA6B8' }, d)));
  const hl = el('rect', { x: -57, y: -34, width: 36, height: 8, rx: 2, fill: pal.yellow }, d);
  const sp = star(k); d.appendChild(sp.g);
  const b = k.buddy({ x: 140, y: FY, scale: S });
  return {
    update(t) {
      const p = easeInOut(seg(t, 1.0, 2.8)), found = seg(t, 2.8, 3.1);
      const ty = t < 1.0 ? lerp(150, 156, seg(t, 0, 1)) : lerp(156, 178, p);
      const tx = 234 + Math.sin(t * 12) * 2 * (1 - found);
      const o = { lean: 12, armL: 10, look: 0.7, blink: blinkAt(t), mood: t < 2.8 ? 'flat' : 'open' };
      P(b, o);
      P(b, { ...o, armR: reach(b, S, 'R', tx, ty), mood: t < 2.8 ? 'flat' : t < 3.6 ? 'open' : 'smile' });
      faceAt(b, 4, 6 * p);
      const row = Math.round((ty - 158) / 10) + 2;
      k.set(hl, { y: ys[Math.max(2, Math.min(5, row))] - 2, opacity: t > 1.2 ? 0.55 + 0.4 * found : 0, width: lerp(30, 40, backOut(found)) });
      sp.set(-20, -62, seg(t, 3.0, 3.8));
    }
  };
}
