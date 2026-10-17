// keep going：上り坂を息を切らしながらも歩き続け、頂上の旗が近づく（例文 Keep going. We're almost at the top.）
import { seg, lerp, easeInOut, easeOut, wobble } from '../ease.js';

export const meta = { duration: 4.0, beats: [[0, '坂を登る'], [1.5, '息が上がる'], [3.0, '頂上が近い']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  k.backdrop({ floorY: 300, mood: 'outdoor' });
  const X0 = 10, Y0 = 258, X1 = 300, Y1 = 118;
  const ang = Math.atan2(Y1 - Y0, X1 - X0);
  el('path', { d: `M 0 ${Y0 + 3} L ${X1} ${Y1} L 400 ${Y1} L 400 300 L 0 300 Z`, fill: '#DDEFE3' });
  el('path', { d: `M 0 ${Y0 + 3} L ${X1} ${Y1} L 400 ${Y1}`, fill: 'none', stroke: '#B9DCC5', 'stroke-width': 4, 'stroke-linejoin': 'round' });
  // 旗
  el('line', { x1: 352, y1: Y1, x2: 352, y2: Y1 - 62, stroke: pal.ink, 'stroke-width': 4, 'stroke-linecap': 'round' });
  const flag = el('path', { d: '', fill: pal.coral });
  const grp = g({});
  const b = k.buddy({ parent: grp, x: 0, y: 0, scale: 0.85 });
  const sweat = el('path', { d: 'M 0 -8 Q 5 0 0 5 Q -5 0 0 -8', fill: pal.water });
  const puff = g({});
  [0, 1].forEach((i) => el('circle', { cx: -i * 10, cy: 0, r: 4 + i * 2, fill: '#fff', opacity: 0.8 }, puff));
  return {
    update(t) {
      const p = easeOut(seg(t, 0, 4.0)) * 0.3 + seg(t, 0, 4.0) * 0.7;
      const d = lerp(30, 255, p * 0.9);
      const x = X0 + d, y = Y0 + (Y1 - Y0) * ((x - X0) / (X1 - X0));
      const yy = x > X1 ? Y1 : y;
      tf(grp, x, yy + 1, x > X1 ? 0 : (ang * 180) / Math.PI * 0.9);
      const ph = t * 8;
      const tired = seg(t, 0.8, 2.0);
      b.pose({ walk: ph, armL: 8 + Math.sin(ph) * 22, armR: 8 - Math.sin(ph) * 22, lean: 12 + 4 * tired, mood: tired > 0.5 ? 'sad' : 'flat', look: 0.8, squash: 1 - 0.03 * tired * Math.abs(Math.sin(ph)) });
      tf(sweat, x - 20, yy - 78 + ((t * 40) % 24) * tired, 0, tired, tired);
      sweat.setAttribute('opacity', tired > 0.2 ? 0.9 : 0);
      tf(puff, x - 40, yy - 20, 0, 1, 1);
      puff.setAttribute('opacity', tired * (Math.sin(t * 8) > 0 ? 1 : 0.4));
      const w = Math.sin(t * 5);
      flag.setAttribute('d', `M 352 ${Y1 - 62} q 18 ${6 + w * 3} 36 0 l 0 26 q -18 ${6 - w * 3} -36 0 Z`);
    }
  };
}
