// in public：大勢の観客の前でマイクの前に立つと、体が震え汗が出る。人前で話すのに緊張している（She is nervous about speaking in public.）
import { seg, lerp, easeInOut, easeOut, hump, clamp } from '../ease.js';
import { gait } from './dig.js';
import { COL } from './queue-up.js';
import { P, drop } from './so-far-so-good.js';

export const meta = { duration: 4.2, beats: [[0, '舞台へ出る'], [1.4, '大勢の前'], [2.6, '緊張で震える']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  k.backdrop({ floorY: 236, mood: 'indoor' });
  el('rect', { x: 0, y: 0, width: 400, height: 300, fill: '#3E4660' });
  el('path', { d: 'M 0 0 H 70 Q 50 100 70 200 H 0 Z M 400 0 H 330 Q 350 100 330 200 H 400 Z', fill: '#B4485A' });
  el('path', { d: 'M 120 0 L 200 0 L 260 200 L 140 200 Z', fill: '#FFF3C4', opacity: 0.16 });
  const SY = 200;
  el('rect', { x: 0, y: SY, width: 400, height: 16, fill: pal.wood });
  el('rect', { x: 0, y: SY + 16, width: 400, height: 84, fill: '#2C3348' });
  // マイク
  el('line', { x1: 230, y1: SY, x2: 230, y2: SY - 70, stroke: pal.sub, 'stroke-width': 3 });
  el('rect', { x: 222, y: SY - 2, width: 16, height: 3, fill: pal.sub });
  el('rect', { x: 226, y: SY - 86, width: 8, height: 16, rx: 4, fill: pal.ink });
  const G = k.buddy({ x: 120, y: SY, scale: 0.85 });
  const sw = [0, 1].map(() => drop(k));
  // 観客（後ろ頭）
  const heads = [[30, 'blue'], [92, 'yellow'], [154, 'violet'], [216, 'coral'], [278, 'blue'], [340, 'yellow'], [392, 'violet']].map(([x, c], i) => {
    const h = g({}); el('ellipse', { cx: 0, cy: 0, rx: 30, ry: 34, fill: COL[c][0] }, h); el('ellipse', { cx: 0, cy: 6, rx: 30, ry: 28, fill: COL[c][1], opacity: 0.25 }, h);
    return [h, x, i];
  });
  const xf = (t) => lerp(110, 188, easeInOut(seg(t, 0.1, 1.2)));
  return {
    update(t) {
      const p = gait(xf, t, 110);
      const nerv = seg(t, 1.6, 2.2);
      const sh = Math.sin(t * 70) * 1.6 * nerv;
      P(G, { x: p.x + sh, walk: p.walk, lean: p.lean - 4 * nerv, armL: p.armL * (1 - nerv) + 20 * nerv, armR: p.armR * (1 - nerv) + 40 * nerv,
        squash: 1 - 0.05 * nerv + 0.01 * Math.sin(t * 50) * nerv, look: t < 1.4 ? 0.5 : Math.sin(t * 6) * 0.6,
        mood: t < 1.4 ? 'smile' : t < 2 ? 'flat' : 'sad', blink: t > 2.4 ? hump(seg(t % 0.9, 0.7, 0.85)) : 0 });
      sw.forEach((d, i) => {
        const q = ((t - 2.0 - i * 0.6) % 1.2) / 1.2;
        tf(d, p.x + (i ? 28 : -28) * 0.85, SY - 82 + q * 30, 0, 0.9);
        d.setAttribute('opacity', t > 2.0 + i * 0.6 && q < 0.85 ? 1 : 0);
      });
      heads.forEach(([h, x, i]) => tf(h, x, 290 - 2 * Math.sin(t * 2 + i), Math.sin(t * 1.5 + i) * 3));
    }
  };
}
