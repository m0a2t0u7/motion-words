// come along：出かける2人が「一緒に来る？」と誘い、まめが加わって3人で歩いていく（例文 Do you want to come along with us?）
import { seg, lerp, easeInOut, easeOut, hump, wobble } from '../ease.js';
import { person, path, walk } from './queue-up.js';
import { streetBg, bubble } from './weigh.js';

export const meta = { duration: 4.4, beats: [[0, '誘われる'], [1.8, '付いていく'], [3.8, '一緒に歩く']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = streetBg(k, 236);
  const S = 0.8;
  const me = k.buddy({ x: 80, y: FY + 4, scale: S });
  const A = person(k, 'coral', { x: 230, y: FY + 4, scale: S, facing: -1 });
  const B = person(k, 'blue', { x: 290, y: FY + 4, scale: S, facing: -1 });
  const bb = bubble(k, 46, 34);
  const q = k.text(0, 1, '?', { 'font-size': 20, fill: pal.coralDark }, bb);
  const arrow = el('path', { d: 'M -14 0 h 18 m -6 -6 l 6 6 l -6 6', stroke: pal.coralDark, 'stroke-width': 3, fill: 'none', 'stroke-linecap': 'round', transform: 'translate(-2 0)' }, bb);
  const go = 2.0;
  const mxf = path([[0.9, 80], [1.9, 172], [go, 172], [4.4, 250]]);
  const axf = path([[go, 230], [4.4, 306]]);
  const bxf = path([[go, 290], [4.4, 362]]);
  return {
    update(t) {
      const invite = t < go;
      const wave = invite ? 120 + 25 * Math.sin(t * 8) : 0;
      const pa = walk(A, axf, t, { facing: t < go ? -1 : 1, look: invite ? -0.5 : 0.3, mood: 'grin' });
      if (invite) A.pose({ armR: wave });
      walk(B, bxf, t, { facing: t < go ? -1 : 1, look: invite ? -0.5 : 0.3, mood: 'smile' });
      const nod = hump(seg(t, 1.0, 1.4));
      walk(me, mxf, t, { y: FY + 4, look: 0.4, mood: t > 1.0 ? 'grin' : 'smile', lift: 6 * nod });
      const s = easeOut(seg(t, 0.2, 0.5)) * (1 - seg(t, 1.6, 1.9));
      bb.setAttribute('opacity', s > 0 ? 1 : 0);
      tf(bb, 220, FY - 104, 0, Math.max(0.001, s));
      q.setAttribute('x', 12);
      void pa; void wobble; void easeInOut; void g; void arrow;
    }
  };
}
