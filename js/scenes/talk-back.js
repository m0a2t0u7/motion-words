// talk back（否定）：先生に注意されたまめが言い返そうとする→その口答えに「禁止」の印→まめは口を閉じ、うなずいて聞く（例文 Don't talk back to your teacher.）
import { seg, lerp, easeInOut, easeOut, hump, backOut } from '../ease.js';
import { say, faceAt } from './look-over.js';

export const meta = { duration: 4.4, beats: [[0, '先生の注意'], [1.4, '言い返すのは'], [2.8, 'だめ、聞こう']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 240, mood: 'indoor' });
  el('rect', { x: 0, y: FY - 6, width: 400, height: 6, fill: pal.line });
  el('rect', { x: 200, y: 40, width: 180, height: 100, rx: 5, fill: pal.woodDark }); el('rect', { x: 206, y: 46, width: 168, height: 88, rx: 3, fill: '#3C5A52' });
  el('path', { d: 'M 222 80 h 60 M 222 100 h 90', stroke: '#E9F3EF', 'stroke-width': 3, 'stroke-linecap': 'round', opacity: 0.8 });
  const tc = k.buddy({ x: 300, y: FY, scale: 0.95, facing: -1, color: pal.coral, dark: pal.coralDark });
  const b = k.buddy({ x: 120, y: FY, scale: 0.85 });
  const st = say(k, 40, 32, 1); [-5, 5].forEach((y) => el('line', { x1: -12, x2: 12, y1: y, y2: y, stroke: pal.sub, 'stroke-width': 3, 'stroke-linecap': 'round' }, st.g));
  const back = say(k, 52, 38, -1);
  el('path', { d: 'M -16 4 l 6 -10 l 6 10 l 6 -10 l 6 10 l 6 -10', fill: 'none', stroke: pal.red, 'stroke-width': 3, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, back.g);
  const ban = g({});
  el('circle', { r: 30, fill: 'none', stroke: pal.red, 'stroke-width': 7 }, ban);
  el('line', { x1: -21, y1: -21, x2: 21, y2: 21, stroke: pal.red, 'stroke-width': 7, 'stroke-linecap': 'round' }, ban);
  return {
    update(t) {
      const tt = t > 0.2 && t < 1.2;
      tc.pose({ armR: tt ? 60 + 20 * Math.sin(t * 7) : 10, mood: tt && Math.sin(t * 13) > 0 ? 'open' : 'flat', look: 0.5, lean: 3 });
      st.show(seg(t, 0.2, 0.4) * (1 - seg(t, 1.2, 1.4)), 262, 134);
      const ret = easeOut(seg(t, 1.3, 1.6)) * (1 - easeInOut(seg(t, 2.3, 2.7)));
      const nod = t > 3.0 ? Math.max(0, Math.sin((t - 3.0) * 5)) : 0;
      b.pose({ armR: 8 + 60 * ret, armL: 8 + 40 * ret, lean: 8 * ret - 3 * hump(seg(t, 2.2, 2.6)) + 6 * nod, lift: 3 * ret, mood: ret > 0.3 && t < 2.2 ? (Math.sin(t * 15) > 0 ? 'open' : 'flat') : t > 2.6 ? 'flat' : 'smile', look: 0.6 });
      faceAt(b, 4, 4 * nod);
      back.show(seg(t, 1.4, 1.6) * (1 - seg(t, 3.2, 3.5)), 178, 134);
      const bp = seg(t, 2.0, 2.3);
      tf(ban, 178, 134, 0, bp <= 0 ? 0.001 : backOut(bp));
      ban.setAttribute('opacity', bp * (1 - seg(t, 3.3, 3.5)));
    }
  };
}
