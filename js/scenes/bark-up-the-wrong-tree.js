// bark up the wrong tree：犬は空の木に吠えるが、猫は別の木にいる（例文 You're barking up the wrong tree.）
import { seg, lerp, easeOut, easeInOut, wobble, hump, backOut } from '../ease.js';

export const meta = { duration: 3.8, beats: [[0, '犬が走る'], [1.5, '空の木に吠える'], [3.1, '猫は別の木']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'outdoor' });
  const tree = (x, s) => {
    const t = g({});
    tf(t, x, FY, 0, s, s);
    k.shadow(0, 2, 34, 6, t);
    el('rect', { x: -9, y: -72, width: 18, height: 72, rx: 5, fill: pal.woodDark }, t);
    [[-26, -92, 28], [26, -90, 27], [0, -116, 34], [-4, -88, 30]].forEach(([cx, cy, r]) => el('circle', { cx, cy, r, fill: pal.green }, t));
    el('circle', { cx: -14, cy: -124, r: 10, fill: '#7BD698', opacity: 0.6 }, t);
    return t;
  };
  tree(70, 1);
  tree(235, 1);

  // 猫（左の木の上）
  const cat = g({});
  tf(cat, 76, FY - 108);
  const tail = g({}, cat);
  el('path', { d: 'M 14 8 Q 34 6 30 -10', fill: 'none', stroke: '#8A8F9C', 'stroke-width': 6, 'stroke-linecap': 'round' }, tail);
  el('ellipse', { cx: 0, cy: 8, rx: 16, ry: 13, fill: '#9AA0AD' }, cat);
  el('circle', { cx: 0, cy: -10, r: 12, fill: '#9AA0AD' }, cat);
  el('path', { d: 'M -11 -16 L -10 -29 L -2 -21 Z M 11 -16 L 10 -29 L 2 -21 Z', fill: '#9AA0AD' }, cat);
  const eyes = el('path', { d: 'M -7 -11 Q -4 -14 -1 -11 M 1 -11 Q 4 -14 7 -11', fill: 'none', stroke: pal.ink, 'stroke-width': 2, 'stroke-linecap': 'round' }, cat);
  el('path', { d: 'M -3 -5 Q 0 -2 3 -5', fill: 'none', stroke: pal.ink, 'stroke-width': 1.8, 'stroke-linecap': 'round' }, cat);

  // 犬
  const dog = g({});
  const dsh = k.shadow(0, 0, 28, 5, dog);
  const legs = [-14, -6, 8, 16].map((x) => {
    const lg = g({}, dog);
    el('line', { x1: 0, y1: 0, x2: 0, y2: 14, stroke: '#B8855A', 'stroke-width': 6, 'stroke-linecap': 'round' }, lg);
    return [lg, x];
  });
  const dtail = g({}, dog);
  el('line', { x1: 0, y1: 0, x2: -14, y2: -14, stroke: '#B8855A', 'stroke-width': 6, 'stroke-linecap': 'round' }, dtail);
  el('ellipse', { cx: 0, cy: -22, rx: 24, ry: 13, fill: '#C99A6B' }, dog);
  const head = g({}, dog);
  el('ellipse', { cx: 0, cy: 0, rx: 13, ry: 12, fill: '#C99A6B' }, head);
  el('ellipse', { cx: -7, cy: -2, rx: 5, ry: 10, fill: '#8F5F3B', transform: 'rotate(20 -7 -2)' }, head);
  el('ellipse', { cx: 11, cy: 4, rx: 8, ry: 6, fill: '#E3C3A0' }, head);
  el('circle', { cx: 17, cy: 1, r: 3, fill: pal.ink }, head);
  el('circle', { cx: 5, cy: -4, r: 2.4, fill: pal.ink }, head);
  const mouth = el('path', { d: 'M 8 8 Q 13 10 18 8', fill: 'none', stroke: pal.ink, 'stroke-width': 2, 'stroke-linecap': 'round' }, head);
  const rays = g({});
  [[-14, -4], [0, 0], [14, 4]].forEach(([dy, r]) => el('line', { x1: 0, y1: dy, x2: 14, y2: dy + r, stroke: pal.sub, 'stroke-width': 3, 'stroke-linecap': 'round' }, rays));
  const q = k.text(0, 0, '?', { 'font-size': 38, fill: pal.red });

  return {
    update(t) {
      const run = easeOut(seg(t, 0, 1.4));
      const dx = lerp(450, 282, run);
      const barking = t > 1.5 && t < 3.0;
      const bp = Math.sin((t - 1.5) * 9);
      const hop = barking ? Math.max(0, bp) * 12 : 0;
      tf(dog, dx, FY - hop, 0, -1, 1);
      tf(dsh, 0, hop, 0, 1 - hop / 40, 1);
      const running = t < 1.4;
      legs.forEach(([lg, x], i) => tf(lg, x, -14, running ? Math.sin(t * 16 + (i % 2) * Math.PI) * 32 : 0));
      tf(dtail, -24, -26, Math.sin(t * 14) * 18 * (barking ? 1 : 0.4));
      tf(head, 24, -36, barking ? -14 : 4);
      mouth.setAttribute('d', barking && bp > 0 ? 'M 8 7 Q 13 17 18 7 Z' : 'M 8 8 Q 13 10 18 8');
      mouth.setAttribute('fill', barking && bp > 0 ? pal.red : 'none');
      tf(rays, dx - 50, FY - 62 - hop, 0, 1, 1);
      rays.setAttribute('opacity', barking && bp > 0 ? 0.85 : 0);
      rays.setAttribute('transform', `translate(${dx - 52} ${FY - 66 - hop}) scale(-1 1)`);
      // ?マーク（空の木）
      const qp = backOut(seg(t, 2.1, 2.5), 2);
      tf(q, 235, FY - 170, 8 * Math.sin(t * 5), qp, qp);
      // 猫：後半にこちらを見てにっこり
      const cp = seg(t, 2.7, 3.1);
      tf(tail, 0, 0, Math.sin(t * 4) * 14 * cp);
      eyes.setAttribute('opacity', cp > 0.3 ? 1 : 0.9);
      tf(cat, 76, FY - 108 - 2 * hump(cp), 0, 1 + 0.06 * hump(cp), 1 + 0.06 * hump(cp));
    }
  };
}
