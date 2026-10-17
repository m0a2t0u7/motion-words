// stretch out：ソファに座っていたまめが、体を長くのばして横になる（例文 He stretched out on the sofa.）
import { seg, lerp, easeInOut, easeOut, wobble } from '../ease.js';

export const meta = { duration: 3.8, beats: [[0, '座っている'], [1.4, '体をのばす'], [2.8, 'のびきる']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 252, mood: 'indoor' });
  // ソファ（奥）
  el('rect', { x: 60, y: 160, width: 290, height: 62, rx: 18, fill: pal.violet });
  el('rect', { x: 66, y: 204, width: 8, height: 48, fill: pal.woodDark });
  el('rect', { x: 336, y: 204, width: 8, height: 48, fill: pal.woodDark });
  k.shadow(205, 253, 150, 6);
  const grp = g({});
  const b = k.buddy({ parent: grp, x: 0, y: 0 });
  b.g.firstChild.setAttribute('display', 'none');
  // ソファ（手前の座面とひじ掛け）
  el('rect', { x: 52, y: 216, width: 306, height: 18, rx: 8, fill: '#8C72E0' });
  el('rect', { x: 44, y: 172, width: 30, height: 62, rx: 12, fill: '#8C72E0' });
  el('rect', { x: 336, y: 172, width: 30, height: 62, rx: 12, fill: '#8C72E0' });
  const lines = g({});
  [-1, 1].forEach((s) => { el('path', { d: 'M 0 0 l 14 0', stroke: pal.sub, 'stroke-width': 3, 'stroke-linecap': 'round' }, lines); });
  const L = [el('line', { x1: 0, y1: 0, x2: 16, y2: 0, stroke: pal.sub, 'stroke-width': 3, 'stroke-linecap': 'round' }), el('line', { x1: 0, y1: 0, x2: 16, y2: 0, stroke: pal.sub, 'stroke-width': 3, 'stroke-linecap': 'round' })];

  return {
    update(t) {
      const sit = 1 - easeInOut(seg(t, 1.3, 2.3));
      const ext = easeOut(seg(t, 2.2, 3.0));
      const rot = lerp(90, 8, sit);
      tf(grp, lerp(100, 100, sit), lerp(186, 208, sit), rot);
      const arms = lerp(180, 8, sit * 0.0 + (t < 2.2 ? sit : 0));
      b.pose({
        squash: lerp(1.08, 0.94, sit) + 0.03 * wobble(seg(t, 2.3, 3.4), 2, 4) ,
        armL: t < 1.3 ? 8 : t < 2.2 ? lerp(8, 170, easeOut(seg(t, 1.3, 2.0))) : 175,
        armR: t < 1.3 ? 8 : t < 2.2 ? lerp(8, 170, easeOut(seg(t, 1.3, 2.0))) : 175,
        mood: t < 1.3 ? 'smile' : 'grin',
        blink: t > 1.5 ? 0.5 : 0,
        look: 0.3
      });
      // のびの線
      L.forEach((l, i) => {
        tf(l, 290, 168 + i * 22 - (i ? 0 : 0), 0, 1, 1);
        l.setAttribute('opacity', ext * (t < 3.4 ? 1 : 0.6));
      });
      b.g.setAttribute('opacity', 1);
    }
  };
}
