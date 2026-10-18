// come on：夕暮れになって空が暗くなると、街灯が順にぱっとつく（例文 The street lights come on at dusk.）
import { seg, lerp, easeInOut, easeOut, hump, wobble } from '../ease.js';
import { path, walk } from './queue-up.js';

export const meta = { duration: 4.2, beats: [[0, '夕方'], [1.8, '暗くなる'], [3.6, '街灯がついた']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'evening' });
  const sun = el('circle', { cx: 200, cy: 150, r: 26, fill: '#FFB37A' });
  [[0, 80, 90], [100, 110, 70], [180, 70, 100], [290, 100, 110]].forEach(([x, h, w]) => el('rect', { x, y: FY - h, width: w, height: h, fill: '#E9D6CB' }));
  el('rect', { x: 0, y: FY - 6, width: 400, height: 6, fill: '#D9CFC8' });
  const dusk = el('rect', { x: 0, y: 0, width: 400, height: 300, fill: '#2E3656', opacity: 0 });
  const wins = [];
  [[16, 170], [50, 186], [124, 150], [200, 190], [236, 176], [316, 160], [352, 182]].forEach(([x, y]) => wins.push(el('rect', { x, y, width: 16, height: 14, rx: 2, fill: '#FFE7A8', opacity: 0 })));
  const lamps = [70, 200, 330].map((x) => {
    const glow = el('circle', { cx: x + 14, cy: FY - 116, r: 40, fill: '#FFE7A8', opacity: 0 });
    const pool = el('ellipse', { cx: x + 14, cy: FY + 4, rx: 50, ry: 8, fill: '#FFE7A8', opacity: 0 });
    el('rect', { x: x - 3, y: FY - 120, width: 6, height: 120, fill: '#56607A' });
    el('path', { d: `M ${x} ${FY - 120} q 0 -8 14 -8`, stroke: '#56607A', 'stroke-width': 5, fill: 'none' });
    const bulb = el('ellipse', { cx: x + 14, cy: FY - 116, rx: 9, ry: 6, fill: '#8C96AE' });
    return { glow, pool, bulb };
  });
  const b = k.buddy({ x: -40, y: FY + 8, scale: 0.8 });
  const xf = path([[0.2, -40], [3.4, 300]]);
  return {
    update(t) {
      const d = easeInOut(seg(t, 0.2, 2.0));
      dusk.setAttribute('opacity', 0.55 * d);
      k.set(sun, { cy: lerp(150, 200, d), opacity: 1 - d });
      lamps.forEach((l, i) => {
        const on = seg(t, 2.0 + i * 0.4, 2.15 + i * 0.4);
        const fl = on > 0 && on < 1 ? (Math.sin(t * 90) > 0 ? 1 : 0.3) : on;
        l.bulb.setAttribute('fill', on > 0 ? '#FFF3C4' : '#8C96AE');
        l.glow.setAttribute('opacity', 0.55 * fl);
        l.pool.setAttribute('opacity', 0.6 * fl);
      });
      wins.forEach((w, i) => w.setAttribute('opacity', seg(t, 2.2 + i * 0.12, 2.5 + i * 0.12) * 0.9));
      walk(b, xf, t, { y: FY + 8, look: t > 2.0 ? 0.3 : 0.5, mood: t > 2.4 ? 'grin' : 'smile' });
      void easeOut; void hump; void wobble; void tf; void g;
    }
  };
}
