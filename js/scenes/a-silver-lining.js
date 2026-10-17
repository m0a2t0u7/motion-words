// a silver lining：雨雲の縁が銀色に光り、太陽がのぞく。落ち込んでいたまめが空を見上げて微笑む（There's a silver lining to every problem.）
import { seg, lerp, easeInOut, easeOut, easeIn, backOut, smooth, wobble, hump, clamp } from '../ease.js';

export const meta = { duration: 4.2, beats: [[0, '雨雲と雨'], [1.8, '縁が光る'], [3.3, '明るい面']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236 });
  const dim = el('rect', { x: 0, y: 0, width: 400, height: FY, fill: '#5A6678' });
  const sun = g({});
  for (let i = 0; i < 10; i++) el('line', { x1: 0, y1: -38, x2: 0, y2: -50, stroke: pal.yellow, 'stroke-width': 5, 'stroke-linecap': 'round', transform: 'rotate(' + i * 36 + ')' }, sun);
  el('circle', { r: 30, fill: pal.yellow }, sun);
  const cloud = g({});
  const parts = [[-64, 6, 30], [-26, -12, 38], [26, -14, 40], [66, 6, 30], [0, 8, 40]];
  const rim = g({}, cloud);
  parts.forEach(([x, y, r]) => el('circle', { cx: x, cy: y, r: r + 4, fill: '#F4F7FB' }, rim));
  const bodyG = g({}, cloud);
  parts.forEach(([x, y, r]) => el('circle', { cx: x, cy: y, r, fill: '#6F7A8E' }, bodyG));
  el('rect', { x: -70, y: 10, width: 140, height: 38, rx: 18, fill: '#6F7A8E' }, bodyG);
  const drops = [...Array(14)].map(() => el('line', { stroke: pal.blue, 'stroke-width': 2.5, 'stroke-linecap': 'round' }));
  const b = k.buddy({ x: 130, y: FY, scale: 0.95 });
  const sparkles = [0, 1, 2].map(() => el('path', { d: 'M 0 -7 L 2 -2 L 7 0 L 2 2 L 0 7 L -2 2 L -7 0 L -2 -2 Z', fill: '#fff' }));
  return {
    update(t) {
      const rain = 1 - smooth(seg(t, 1.6, 2.2));
      const shine = smooth(seg(t, 1.7, 2.6));
      k.set(dim, { opacity: 0.4 * (1 - shine * 0.9) });
      const sp = smooth(seg(t, 2.0, 3.2));
      tf(sun, 292, lerp(110, 86, sp), t * 8, 0.3 + 0.7 * sp, 0.3 + 0.7 * sp);
      sun.setAttribute('opacity', sp);
      cloud.setAttribute('transform', 'translate(' + (236 + 6 * Math.sin(t)).toFixed(1) + ' 76)');
      rim.setAttribute('opacity', 0.15 + 0.85 * shine);
      bodyG.setAttribute('transform', 'translate(0 ' + (3 - 4 * shine) + ')');
      drops.forEach((d, i) => {
        const x = 150 + i * 14 + (i % 3) * 3, y = 100 + ((i * 41 + t * 330) % 140);
        k.set(d, { x1: x, y1: y, x2: x - 4, y2: y + 12, opacity: rain * 0.9 });
      });
      const up = easeOut(seg(t, 2.0, 2.8));
      b.pose({
        look: lerp(0, 0.9, up), lean: lerp(4, -6, up), armL: 8, armR: lerp(8, 8, up),
        squash: lerp(0.96, 1, up), mood: t < 2.4 ? 'sad' : 'smile', lift: 5 * hump(seg(t, 3.0, 3.5))
      });
      sparkles.forEach((s, i) => {
        const p = seg(t, 2.2 + i * 0.18, 3.0 + i * 0.18);
        const sc = hump(p);
        tf(s, 190 + i * 38 + 56 * 0, 56 + i * 12 - (i % 2) * 22, 0, sc * 1.3, sc * 1.3);
      });
    }
  };
}
