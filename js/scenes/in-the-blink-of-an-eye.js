// in the blink of an eye：夏の日差しの中でアイスを食べる→まばたき1回→目を開けると秋（葉が色づき散る）。夏はあっという間（The summer was over in the blink of an eye.）
import { seg, lerp, easeInOut, easeOut, hump, clamp } from '../ease.js';
import { hp } from './dig.js';
import { P } from './so-far-so-good.js';

export const meta = { duration: 4.2, beats: [[0, '夏の日'], [1.9, 'まばたき'], [2.6, 'もう秋']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = 236;
  const sum = g({}), aut = g({});
  const scene = (p, sky, ground, leaf, leaf2) => {
    el('rect', { x: 0, y: 0, width: 400, height: 300, fill: sky }, p);
    el('rect', { x: 0, y: FY, width: 400, height: 64, fill: ground }, p);
    el('rect', { x: 0, y: FY, width: 400, height: 2, fill: '#00000010' }, p);
    k.shadow(310, FY, 40, 6, p);
    el('rect', { x: 304, y: FY - 70, width: 12, height: 70, rx: 4, fill: pal.woodDark }, p);
    [[310, FY - 96, 40], [284, FY - 80, 26], [338, FY - 82, 27]].forEach(([x, y, r], i) => el('circle', { cx: x, cy: y, r, fill: i ? leaf2 : leaf }, p));
  };
  scene(sum, '#BFE6FA', '#CDEBB8', '#5FBF7A', '#4FAE6A');
  el('circle', { cx: 70, cy: 56, r: 24, fill: '#FFD45C' }, sum);
  for (let i = 0; i < 8; i++) { const a = (i * Math.PI) / 4; el('line', { x1: 70 + Math.cos(a) * 32, y1: 56 + Math.sin(a) * 32, x2: 70 + Math.cos(a) * 42, y2: 56 + Math.sin(a) * 42, stroke: '#FFD45C', 'stroke-width': 4, 'stroke-linecap': 'round' }, sum); }
  [[200, 0], [228, 1]].forEach(([x, j]) => { el('line', { x1: x, y1: FY, x2: x, y2: FY - 70 - j * 12, stroke: '#4FAE6A', 'stroke-width': 4 }, sum); el('circle', { cx: x, cy: FY - 76 - j * 12, r: 12, fill: pal.yellow, stroke: '#E9A93A', 'stroke-width': 5 }, sum); el('circle', { cx: x, cy: FY - 76 - j * 12, r: 5, fill: pal.coffee }, sum); });
  scene(aut, '#F6E6D2', '#E9D7B8', '#E8914A', '#D9703A');
  el('circle', { cx: 70, cy: 70, r: 18, fill: '#FBE7B5' }, aut);
  [[200, 0], [228, 1]].forEach(([x, j]) => { el('path', { d: `M ${x} ${FY} Q ${x + 2} ${FY - 50} ${x + 14} ${FY - 56 - j * 8}`, stroke: '#9A8A5A', 'stroke-width': 4, fill: 'none' }, aut); el('circle', { cx: x + 16, cy: FY - 50 - j * 8, r: 7, fill: '#9A7A4A' }, aut); });
  const leaves = [0, 1, 2, 3, 4].map((i) => el('ellipse', { rx: 6, ry: 3.5, fill: i % 2 ? '#E8914A' : '#D9703A' }, aut));
  const G = k.buddy({ x: 120, y: FY });
  const ice = g({});
  el('path', { d: 'M -6 0 L 6 0 L 0 18 Z', fill: '#E3B47A' }, ice);
  el('circle', { cx: 0, cy: -4, r: 8, fill: '#FFC2D1' }, ice);
  const scarf = el('path', { d: 'M -28 -26 Q 0 -18 28 -26 L 28 -18 Q 0 -10 -28 -18 Z M 14 -20 L 22 -20 L 24 0 L 16 0 Z', fill: pal.red }, G.body);
  return {
    update(t) {
      const SW = 2.05, isA = t >= SW;
      sum.setAttribute('opacity', isA ? 0 : 1); aut.setAttribute('opacity', isA ? 1 : 0);
      scarf.setAttribute('opacity', isA ? 1 : 0);
      const bl = hump(seg(t, 1.85, 2.25));
      const lick = Math.max(0, Math.sin(t * 6)) * (t < 1.8 ? 1 : 0);
      const sur = easeOut(seg(t, 2.3, 2.6));
      P(G, { armR: isA ? lerp(8, 30, sur) : 120 + 10 * lick, armL: isA ? 8 + 60 * hump(seg(t, 2.4, 3.4)) : 8, lean: isA ? -6 * sur : 4 * lick,
        look: isA ? Math.sin(t * 3) * 0.8 : 0.5, mood: isA ? 'open' : 'grin', blink: bl, lift: 8 * hump(seg(t, 2.3, 2.7)), squash: 1 - 0.04 * hump(seg(t, 2.3, 2.7)) });
      const h = hp(G, 1, 'R');
      tf(ice, h.x, h.y - 10); ice.setAttribute('opacity', isA ? 0 : 1);
      leaves.forEach((l, i) => {
        const p = ((t - SW) * 0.45 + i * 0.21) % 1;
        tf(l, 250 + i * 26 + Math.sin(p * 9 + i) * 14 - 60 * p, 120 + p * 120, p * 400 + i * 40);
        l.setAttribute('opacity', isA ? 1 : 0);
      });
    }
  };
}
