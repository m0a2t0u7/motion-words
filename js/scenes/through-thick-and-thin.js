// through thick and thin：雨も雷も、晴れた後も、ふたりで並んで歩き続ける（They stayed friends through thick and thin.）
import { seg, lerp, easeInOut, easeOut, easeIn, backOut, smooth, wobble, hump, clamp } from '../ease.js';

export const meta = { duration: 4.2, beats: [[0, '雨の中を歩く'], [1.8, '歩き続ける'], [3.6, '晴れても一緒']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236 });
  const M = (v, m) => ((v % m) + m) % m;
  const trees = [0, 1, 2].map(() => {
    const t = g({});
    el('rect', { x: -3, y: -26, width: 6, height: 26, fill: pal.woodDark }, t);
    el('circle', { cx: 0, cy: -38, r: 20, fill: '#BFE6CF' }, t);
    return t;
  });
  const marks = [0, 1, 2, 3, 4].map((i) => el('rect', { width: 34, height: 5, rx: 2.5, fill: pal.floorEdge, y: FY + 18 + (i % 2) * 22 }));
  const sun = g({});
  for (let i = 0; i < 8; i++) el('line', { x1: 0, y1: -32, x2: 0, y2: -42, stroke: pal.yellow, 'stroke-width': 5, 'stroke-linecap': 'round', transform: 'rotate(' + i * 45 + ')' }, sun);
  el('circle', { r: 24, fill: pal.yellow }, sun);
  const cloud = g({});
  [[-40, 0, 28], [-6, -12, 34], [34, 0, 28], [0, 8, 30]].forEach(([x, y, r]) => el('circle', { cx: x, cy: y, r, fill: '#8E99AB' }, cloud));
  const bolt = el('path', { d: 'M 10 14 L -4 40 L 6 40 L -6 66 L 18 34 L 8 34 L 18 14 Z', fill: pal.yellow }, cloud);
  const dim = el('rect', { x: 0, y: 0, width: 400, height: 300, fill: '#4A5568' });
  const drops = [...Array(16)].map((_, i) => el('line', { stroke: pal.blue, 'stroke-width': 2.5, 'stroke-linecap': 'round' }));
  const b1 = k.buddy({ x: 150, y: FY, scale: 0.85 });
  const b2 = k.buddy({ x: 250, y: FY, scale: 0.85, color: pal.coral, dark: pal.coralDark });

  return {
    update(t) {
      const sunP = smooth(seg(t, 2.5, 3.4));
      const rain = 1 - sunP;
      const sp = 55;
      trees.forEach((tr, i) => tf(tr, M(i * 190 + 60 - t * sp, 570) - 80, FY - 4, 0, 1, 1));
      marks.forEach((m, i) => k.set(m, { x: M(i * 100 - t * 150, 500) - 60 }));
      tf(sun, 330, 70, t * 12, sunP, sunP);
      cloud.setAttribute('opacity', rain);
      tf(cloud, 170 + 8 * Math.sin(t * 2), 62, 0, 1.05, 1.05);
      const flash = t > 0.7 && t < 1.4 ? Math.max(0, Math.sin((t - 0.7) * 22)) : 0;
      k.set(bolt, { opacity: flash > 0.3 ? 1 : 0 });
      k.set(dim, { opacity: 0.16 * rain + 0.3 * flash * rain });
      drops.forEach((d, i) => {
        const x = M(i * 29 + 10 - t * 40, 420) - 10, y = M(i * 53 + t * 380, 300);
        k.set(d, { x1: x, y1: y, x2: x - 6, y2: y + 14, opacity: rain * 0.85 });
      });
      const ph = t * 8;
      const stormy = rain > 0.5;
      [b1, b2].forEach((b, i) => {
        const s = Math.sin(ph + i * 0.7) * 18;
        b.pose({ walk: ph + i * 0.7, armL: 8 + s, armR: 8 - s, lean: stormy ? 9 : 3, look: 0.8, mood: stormy ? 'flat' : 'grin', y: FY });
      });
    }
  };
}
