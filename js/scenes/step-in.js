// step in：けんかしている2人の間に先生が割って入り、両手で引き離す（例文 A teacher stepped in to stop the fight.）
import { seg, lerp, easeInOut, easeOut, hump, wobble } from '../ease.js';
import { person, path, walk } from './queue-up.js';

export const meta = { duration: 4.2, beats: [[0, 'けんか中'], [1.6, '間に入る'], [3.4, 'けんかが止まった']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  el('rect', { x: 110, y: 40, width: 180, height: 80, rx: 4, fill: '#5E8C6A', stroke: pal.woodDark, 'stroke-width': 5 });
  el('path', { d: 'M 130 70 q 20 -14 40 0 M 190 92 h 60', stroke: '#fff', 'stroke-width': 3, fill: 'none', opacity: 0.7 });
  const A = person(k, 'blue', { x: 176, y: FY, scale: 0.7 });
  const B = person(k, 'yellow', { x: 228, y: FY, scale: 0.7, facing: -1 });
  const T = k.buddy({ x: -40, y: FY + 10, scale: 0.95 });
  const anger = [g({}), g({})];
  anger.forEach((a) => { el('path', { d: 'M -6 -6 L -2 -2 M 6 -6 L 2 -2 M -6 6 L -2 2 M 6 6 L 2 2', stroke: pal.red, 'stroke-width': 2.6, 'stroke-linecap': 'round' }, a); });
  const xf = path([[0.2, -40], [1.7, 202]]);
  return {
    update(t) {
      const sep = easeOut(seg(t, 1.8, 2.6));
      const fight = 1 - seg(t, 1.6, 2.0);
      const sh = Math.sin(t * 14) * 4 * fight;
      A.pose({ x: lerp(176 + sh, 120, sep), armR: lerp(80 + 10 * Math.sin(t * 14), 10, sep), lean: lerp(8, -4, sep) * 1, mood: t < 2.4 ? 'open' : 'flat', look: 0.5, squash: 1 + 0.03 * Math.sin(t * 14) * fight });
      B.pose({ x: lerp(228 - sh, 286, sep), armR: lerp(80 - 10 * Math.sin(t * 14), 10, sep), lean: lerp(8, -4, sep), mood: t < 2.4 ? 'open' : 'flat', look: 0.5, squash: 1 - 0.03 * Math.sin(t * 14) * fight });
      const p = walk(T, xf, t, { y: FY + 10, look: 0, mood: t > 2.6 ? 'smile' : 'flat' });
      if (t > 1.6) { const o = easeOut(seg(t, 1.6, 2.1)); T.pose({ armR: lerp(p.armR, 92, o), armL: lerp(p.armL, 92, o), lean: 0, squash: 1 - 0.05 * hump(seg(t, 1.6, 1.9)) }); }
      anger.forEach((a, i) => { tf(a, i ? B.state.x + 4 : A.state.x - 4, FY - 72 + 2 * Math.sin(t * 10 + i), 0, 1 + 0.1 * Math.sin(t * 12)); a.setAttribute('opacity', 1 - seg(t, 2.0, 2.4)); });
      void wobble; void easeInOut;
    }
  };
}
