// silent：ざわざわしていた教室で、先生のまめが一言話すと、声がぴたりとやみ、しーんと静まる（例文 The room was silent after the teacher spoke.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';
import { P, blinkAt, aim, person, cue, sym, talk } from './confused.js';

export const meta = { duration: 4.4, beats: [[0, 'ざわざわ'], [1.4, '先生が話す'], [2.6, 'しーん']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 1;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  el('rect', { x: 20, y: 26, width: 200, height: 76, rx: 4, fill: '#3E6B5A', stroke: pal.woodDark, 'stroke-width': 6 });
  el('rect', { x: 0, y: FY - 12, width: 400, height: 12, fill: '#ECE6DC' });
  // 壁の時計
  el('circle', { cx: 330, cy: 56, r: 20, fill: '#fff', stroke: pal.ink, 'stroke-width': 3 });
  const sec = el('line', { x1: 0, y1: 0, x2: 0, y2: -15, stroke: pal.red, 'stroke-width': 2 });
  const X = [150, 220, 290, 360];
  const kids = X.map((x, i) => person(k, ['coral', 'blue', 'yellow', 'violet'][i], { x, y: FY - 20, scale: 0.6, facing: i % 2 ? -1 : 1 }));
  X.forEach((x) => { el('rect', { x: x - 26, y: FY - 34, width: 52, height: 6, rx: 2, fill: pal.wood }); el('rect', { x: x - 22, y: FY - 28, width: 44, height: 28, fill: '#EAD3B0' }); });
  // 話し声のギザギザ吹き出し
  const noise = X.map(() => { const n = g({}); el('path', { d: 'M -16 -10 L -8 -14 L -2 -8 L 6 -14 L 12 -8 L 18 -12 L 16 0 L 20 6 L 10 8 L 6 14 L -2 8 L -10 12 L -14 4 L -20 2 Z', fill: '#fff', stroke: pal.sub, 'stroke-width': 1.6 }, n); el('path', { d: 'M -8 -1 q 3 -5 6 0 t 6 0', stroke: pal.sub, 'stroke-width': 1.6, fill: 'none' }, n); return n; });
  const b = k.buddy({ x: 70, y: FY, scale: S, facing: 1 });
  const say = cue(k, 'Listen.', 70, 30, -1, 13);
  const dots = sym(k, '. . .', pal.sub, 20);
  return {
    update(t) {
      const hush = seg(t, 2.1, 2.4);
      tf(sec, 330, 56, Math.floor(t * 2) * 30);
      P(b, { x: 70, facing: 1, armR: t > 1.3 && t < 2.3 ? 60 : 14, armL: 10, lean: 2, look: 0.8, mood: talk(t, 1.4, 2.1) || 'flat', blink: blinkAt(t) });
      say.show(seg(t, 1.3, 1.6) * (1 - seg(t, 2.6, 2.8)), 104, FY - 120);
      kids.forEach((p, i) => {
        const chat = (1 - hush) * (Math.sin(t * 18 + i * 2) > 0 ? 1 : 0);
        P(p, { y: FY - 20, facing: hush > 0.5 ? -1 : (i % 2 ? -1 : 1), look: hush > 0.5 ? 0.9 : 0.5, mood: chat ? 'open' : hush > 0.5 ? 'flat' : 'grin', blink: blinkAt(t, i),
          armL: 8 + (1 - hush) * 30 * hump(((t * 1.5) + i * 0.3) % 1), squash: 1 + 0.03 * hump(seg(t, 2.1, 2.35)) });
        const n = noise[i], q = ((t * 1.3) + i * 0.27) % 1;
        tf(n, X[i] + (i % 2 ? -14 : 14), FY - 78 - 10 * q + 2 * Math.sin(t * 20 + i), 0, (1 - hush) > 0.01 ? 0.9 + 0.1 * Math.sin(t * 30 + i) : 0.001);
      });
      dots(seg(t, 2.8, 3.2), 250, FY - 110);
    }
  };
}
