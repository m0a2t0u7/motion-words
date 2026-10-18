// come about：管のひびから水がぽたぽた落ち、床に水たまりができていく。来た人が「どうしてこうなった？」と首をかしげる（例文 How did this problem come about?）
import { seg, lerp, easeInOut, easeOut, easeIn, hump } from '../ease.js';
import { path, walk, pop } from './queue-up.js';

export const meta = { duration: 4.4, beats: [[0, 'ひびから水'], [1.8, '水たまりに'], [3.8, 'どうして？']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  // 流し台と管（動かない）
  el('rect', { x: 200, y: 120, width: 170, height: 12, rx: 3, fill: '#C9D3E0' });
  el('rect', { x: 210, y: 132, width: 66, height: 104, fill: '#F1E7D8' });
  el('rect', { x: 218, y: 142, width: 50, height: 84, rx: 3, fill: '#E9DCCB' });
  k.shadow(243, 237, 40, 4);
  el('path', { d: 'M 285 132 L 285 150 Q 285 164 300 164 L 400 164', stroke: '#9AA4B5', 'stroke-width': 10, fill: 'none' });
  el('path', { d: 'M 330 160 l 4 4 l -3 3 l 4 3', stroke: pal.ink, 'stroke-width': 1.6, fill: 'none' });
  const puddle = el('ellipse', { cx: 334, cy: FY + 6, rx: 4, ry: 1.5, fill: pal.water, opacity: 0.85 });
  const drops = [0, 1, 2, 3].map(() => el('path', { d: 'M 0 -6 Q 4 0 0 3 Q -4 0 0 -6 Z', fill: '#5FB4DD' }));
  const b = k.buddy({ x: -40, y: FY + 6, scale: 0.85 });
  const q = g({});
  el('circle', { r: 14, fill: '#fff', stroke: pal.line, 'stroke-width': 2 }, q);
  k.text(0, 1, '?', { 'font-size': 18, fill: pal.blueDark }, q);
  const xf = path([[1.6, -40], [2.8, 250]]);
  return {
    update(t) {
      drops.forEach((d, i) => {
        const ph = ((t + i * 0.35) % 1.4) / 0.6;
        const on = ph < 1;
        tf(d, 334, lerp(170, FY + 4, easeIn(Math.min(ph, 1))));
        d.setAttribute('opacity', on ? 1 : 0);
      });
      const grow = easeOut(seg(t, 0.2, 3.4));
      k.set(puddle, { rx: lerp(4, 46, grow), ry: lerp(1.5, 6, grow) });
      const p = walk(b, xf, t, { y: FY + 6, look: 0.6, mood: t > 2.8 ? 'open' : 'smile' });
      if (t > 2.8) {
        const tilt = easeInOut(seg(t, 2.9, 3.4));
        b.pose({ lean: -10 * tilt, armR: lerp(p.armR, 150, tilt), look: lerp(0.6, 0.9, tilt) });
      }
      const qp = pop(seg(t, 3.2, 3.6));
      q.setAttribute('opacity', t > 3.2 ? 1 : 0);
      tf(q, 236, FY - 116, 0, Math.max(0.001, qp));
      void hump;
    }
  };
}
