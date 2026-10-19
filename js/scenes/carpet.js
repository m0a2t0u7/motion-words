// carpet：リビングのふかふかのカーペットにまめが乗り、足が沈んで、あお向けに寝ころがる（例文 The carpet in the living room is soft.）
import { seg, lerp, easeInOut, easeOut, easeIn, wobble, hump } from '../ease.js';
import { gait } from './dig.js';
import { P, blinkAt, sofa } from './run-after.js';

export const meta = { duration: 4.4, beats: [[0, 'リビング'], [1.3, '足が沈む'], [2.6, 'ふかふか']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 214, mood: 'indoor' });
  el('rect', { x: 0, y: 214, width: 400, height: 86, fill: '#D9C3A0' });
  for (let x = -40; x < 440; x += 44) el('line', { x1: x, y1: 214, x2: x - 30, y2: 300, stroke: '#CBB28B', 'stroke-width': 2 });
  el('rect', { x: 270, y: 40, width: 90, height: 66, rx: 6, fill: '#DDEFFA', stroke: '#fff', 'stroke-width': 5 });
  const so = sofa(k, 110, 214, 150); so.front();
  el('rect', { x: 300, y: 150, width: 6, height: 64, fill: pal.woodDark });
  el('path', { d: 'M 284 150 L 322 150 L 314 126 L 292 126 Z', fill: pal.yellow });
  // カーペット（厚み・ふさ・模様）
  el('path', { d: 'M 48 290 L 352 290 L 330 232 L 70 232 Z', fill: '#B8566A' });
  el('path', { d: 'M 48 290 L 352 290 L 352 296 L 48 296 Z', fill: '#933E52' });
  const top = el('path', { d: 'M 48 286 L 352 286 L 330 228 L 70 228 Z', fill: '#E07A8E' });
  el('path', { d: 'M 80 276 L 320 276 L 304 238 L 96 238 Z', fill: 'none', stroke: '#F5C26B', 'stroke-width': 3, 'stroke-dasharray': '6 4' });
  el('ellipse', { cx: 200, cy: 257, rx: 46, ry: 11, fill: '#F2A3B2' });
  for (let x = 52; x < 350; x += 7) el('line', { x1: x, y1: 296, x2: x, y2: 300, stroke: '#F3E1C0', 'stroke-width': 2 });
  // 沈むくぼみ
  const dent = el('ellipse', { cx: 0, cy: 0, rx: 30, ry: 6, fill: '#B8566A', opacity: 0 });
  const fluff = [0, 1, 2, 3, 4].map(() => el('circle', { r: 3, fill: '#F7C3CD' }));
  const wrap = g({});
  const S = 0.9;
  const me = k.buddy({ x: 0, y: 0, scale: S, parent: wrap });
  const xf = (t) => lerp(-40, 206, easeInOut(seg(t, 0, 1.4)));
  return {
    update(t) {
      const w = gait(xf, t, -40);
      const onC = w.x > 70;
      const sink = onC ? 4 + 2 * Math.abs(Math.sin(w.walk)) : 0;
      const fall = easeIn(seg(t, 2.1, 2.55));
      const land = seg(t, 2.55, 3.4);
      const bounce = wobble(land, 2, 4);
      const Y = 254;
      P(me, { x: 0, y: 0, walk: w.walk, armL: w.armL + 60 * fall, armR: w.armR + 60 * fall, lean: w.lean, squash: 1 - 0.08 * hump(seg(t, 1.5, 1.9)) - 0.04 * hump(seg(t, 1.9, 2.1)),
        look: t > 1.4 ? 0 : 0.5, mood: t > 1.5 ? 'grin' : 'smile', blink: t > 3.2 ? 0.85 : blinkAt(t), lift: 0 });
      // 寝ころがる：足もとを中心に後ろへ倒れる
      const rot = -88 * fall;
      const yy = Y + sink + (t > 1.5 ? 4 * easeOut(seg(t, 1.5, 1.8)) : 0) + 3 * Math.abs(bounce) - 8 * fall;
      tf(wrap, w.x - 30 * fall, yy, rot);
      // カーペットのくぼみ
      const dx = t > 2.3 ? w.x - 70 * fall : w.x;
      tf(dent, dx, Y + 4 - 6 * fall, 0, onC ? 1 + 1.6 * fall + 0.2 * Math.abs(bounce) : 0.001, 1 + 0.8 * fall);
      dent.setAttribute('opacity', onC ? 0.45 + 0.25 * fall : 0);
      fluff.forEach((f, i) => {
        const p = seg(t, 2.55 + i * 0.05, 3.3 + i * 0.05), a = -0.4 - i * 0.55;
        tf(f, dx + Math.cos(a) * 50 * p, Y - 4 + Math.sin(a) * 20 * p - 20 * hump(p));
        f.setAttribute('opacity', p > 0 && p < 1 ? 1 - p : 0);
      });
    }
  };
}
