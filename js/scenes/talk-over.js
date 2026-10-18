// talk over：夜、テーブルに計画表を広げ、二人が交互に話しながら指さしてじっくり話し合う（例文 Let's talk over the plan tonight.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';
import { roomBg, say, faceAt } from './look-over.js';

export const meta = { duration: 4.6, beats: [[0, '計画表を広げる'], [1.6, '交互に話す'], [3.8, 'まとまった']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  roomBg(k, 'home', 240, 'evening');
  const A = k.buddy({ x: 120, y: 240, scale: 0.9 });
  const B = k.buddy({ x: 290, y: 240, scale: 0.9, color: pal.coral, dark: pal.coralDark, facing: -1 });
  el('rect', { x: 150, y: 190, width: 110, height: 8, rx: 3, fill: pal.wood });
  el('rect', { x: 196, y: 198, width: 10, height: 40, fill: pal.woodDark }); k.shadow(201, 239, 40, 4);
  const plan = g({}); tf(plan, 204, 186);
  el('path', { d: 'M -34 0 L 34 0 L 30 -8 L -30 -8 Z', fill: '#fff', stroke: pal.line, 'stroke-width': 1.5 }, plan);
  const marks = [[-20, pal.blue], [0, pal.yellow], [20, pal.green]].map(([x, c]) => el('ellipse', { cx: x, cy: -4, rx: 6, ry: 2.2, fill: c }, plan));
  const chk = el('path', { d: 'M 14 -18 l 5 5 l 10 -12', fill: 'none', stroke: pal.green, 'stroke-width': 4, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, plan);
  const sa = say(k, 40, 30, 1), sb = say(k, 40, 30, -1);
  [[sa, pal.blue], [sb, pal.yellow]].forEach(([s, c]) => { el('circle', { cx: -8, cy: 0, r: 6, fill: c }, s.g); el('path', { d: 'M 2 -5 L 14 0 L 2 5', fill: 'none', stroke: pal.sub, 'stroke-width': 2.5, 'stroke-linecap': 'round' }, s.g); });
  return {
    update(t) {
      const turn = Math.floor(Math.max(0, t - 0.6) / 0.8) % 2, act = t > 0.6 && t < 3.8;
      const ia = act && turn === 0, ib = act && turn === 1;
      A.pose({ armR: ia ? 70 + 8 * Math.sin(t * 6) : 40, lean: 10, mood: ia && Math.sin(t * 13) > 0 ? 'open' : t > 3.8 ? 'grin' : 'smile', look: 0.5 });
      B.pose({ armR: ib ? 70 + 8 * Math.sin(t * 6) : 40, lean: 10, mood: ib && Math.sin(t * 13) > 0 ? 'open' : t > 3.8 ? 'grin' : 'smile', look: 0.5 });
      faceAt(A, 4, ia ? 0 : 4); faceAt(B, 4, ib ? 0 : 4);
      sa.show(ia ? 1 : 0, 150, 120); sb.show(ib ? 1 : 0, 262, 120);
      marks.forEach((m, i) => m.setAttribute('opacity', 0.4 + 0.6 * seg(t, 0.8 + i * 0.9, 1.0 + i * 0.9)));
      chk.setAttribute('opacity', seg(t, 3.8, 4.0));
      const nod = t > 3.8 ? Math.max(0, Math.sin((t - 3.8) * 6)) : 0;
      A.pose({ squash: 1 - 0.03 * nod }); B.pose({ squash: 1 - 0.03 * nod });
    }
  };
}
