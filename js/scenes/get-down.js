// get down（否定）：木の枝の上の猫が下を見て降りようとするが、こわくて足を引っこめ、降りられない（例文 The cat can't get down from the tree.）
import { seg, lerp, easeInOut, hump, wobble } from '../ease.js';
import { pop } from './queue-up.js';

export const meta = { duration: 4.2, beats: [[0, '木の上の猫'], [1.8, '降りかける'], [3.6, '降りられない']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'outdoor' });
  el('rect', { x: 236, y: 60, width: 26, height: 176, rx: 6, fill: pal.woodDark });
  el('path', { d: 'M 250 120 L 150 104 L 150 112 L 248 132 Z', fill: pal.woodDark });
  [[250, 56, 60], [190, 70, 40], [310, 80, 44]].forEach(([x, y, r]) => el('circle', { cx: x, cy: y, r, fill: '#7FD3A0' }));
  k.shadow(250, 237, 40, 5);
  const cat = g({});
  const tail = el('path', { d: 'M 18 -10 Q 34 -16 30 -34', stroke: '#9AA4B5', 'stroke-width': 6, fill: 'none', 'stroke-linecap': 'round' }, cat);
  el('ellipse', { cx: 4, cy: -12, rx: 18, ry: 11, fill: '#B9C2CF' }, cat);
  const head = g({}, cat);
  el('circle', { r: 11, fill: '#B9C2CF' }, head);
  el('path', { d: 'M -10 -4 L -8 -16 L -2 -9 Z M 10 -4 L 8 -16 L 2 -9 Z', fill: '#B9C2CF' }, head);
  el('circle', { cx: -4, cy: -1, r: 1.8, fill: pal.ink }, head); el('circle', { cx: 4, cy: -1, r: 1.8, fill: pal.ink }, head);
  const mouth = el('ellipse', { cx: 0, cy: 5, rx: 2, ry: 1, fill: pal.ink }, head);
  const paw = el('ellipse', { cx: -12, cy: 0, rx: 4, ry: 3, fill: '#9AA4B5' }, cat);
  const b = k.buddy({ x: 120, y: FY + 6, scale: 0.85 });
  const meow = g({});
  [-20, 0, 20].forEach((a) => el('line', { x1: 0, y1: -6, x2: 0, y2: -14, stroke: pal.ink, 'stroke-width': 2.2, 'stroke-linecap': 'round', transform: `rotate(${a})` }, meow));
  return {
    update(t) {
      const peek = easeInOut(seg(t, 0.6, 1.6)) * (1 - easeInOut(seg(t, 2.2, 2.8)));
      const scare = hump(seg(t, 2.0, 2.5));
      tf(cat, 170 - 10 * peek, 104 + 4 * peek, -18 * peek + 4 * scare);
      tf(head, -14, -16 + 6 * peek, 20 * peek);
      k.set(paw, { cx: -14 - 10 * peek, cy: 2 + 10 * peek });
      tf(tail, 0, 0, 10 * Math.sin(t * 5));
      const m = seg(t, 2.8, 3.4);
      k.set(mouth, { ry: t > 2.8 && t < 3.6 ? 3 : 1 });
      meow.setAttribute('opacity', m > 0 && m < 1 ? 1 : 0); tf(meow, 152, 70, 0, pop(m));
      b.pose({ armR: lerp(20, 160, easeInOut(seg(t, 1.2, 1.8))) + 6 * wobble(seg(t, 1.8, 3), 2, 3), armL: 20, look: 0.7, mood: t > 2.4 ? 'sad' : 'open' });
    }
  };
}
