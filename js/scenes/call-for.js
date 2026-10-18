// call for：星形の鍵穴の箱。ふつうの鍵は入らない→まめが星形の特別な鍵を持ってきて差すと、ふたが開く（例文 This problem calls for a special solution.）
import { seg, lerp, easeInOut, easeOut, hump, backOut, wobble } from '../ease.js';
import { roomBg, faceAt, held, desk } from './look-over.js';
import { STAR } from './agree.js';

export const meta = { duration: 4.6, beats: [[0, '星形の鍵穴'], [1.4, 'ふつうの鍵は×'], [3.4, '特別な鍵で開く']] };

function key(k, star, color) {
  const n = k.g({});
  k.el('rect', { x: -2.5, y: 8, width: 5, height: 26, rx: 2, fill: color }, n);
  if (star) k.el('path', { d: STAR, fill: color, transform: 'scale(0.8)' }, n); else k.el('circle', { r: 8, fill: 'none', stroke: color, 'stroke-width': 4 }, n);
  k.el('rect', { x: 2, y: 26, width: 6, height: 4, fill: color }, n);
  return n;
}

export function create(k) {
  const { el, g, tf, pal } = k, S = 0.9;
  const FY = roomBg(k, 'home', 240);
  desk(k, 220, 170, 200);
  const lid = g({}); tf(lid, 254, 158);
  el('rect', { x: 0, y: -10, width: 104, height: 12, rx: 4, fill: pal.woodDark }, lid);
  el('rect', { x: 254, y: 158, width: 104, height: 42, rx: 4, fill: pal.wood, stroke: pal.woodDark, 'stroke-width': 2 });
  el('path', { d: STAR, fill: pal.ink, transform: 'translate(306 178) scale(0.6)' });
  const glow = el('path', { d: STAR, fill: pal.yellow, transform: 'translate(306 128) scale(1.4)', opacity: 0 });
  const b = k.buddy({ x: 150, y: FY, scale: S });
  const k1 = key(k, false, pal.sub), k2 = key(k, true, pal.yellowDark);
  const no = el('path', { d: 'M 284 150 l 12 12 m 0 -12 l -12 12', stroke: pal.red, 'stroke-width': 4, 'stroke-linecap': 'round' });
  return {
    update(t) {
      const try1 = easeInOut(seg(t, 0.3, 1.0)), bounce = wobble(seg(t, 1.0, 1.6), 2, 4), back1 = easeInOut(seg(t, 1.5, 1.9));
      const swap = t > 1.9, try2 = easeInOut(seg(t, 2.3, 3.0));
      const reachA = swap ? try2 : try1 * (1 - back1);
      b.pose({ x: 150 + 78 * reachA, walk: reachA * 6.28, armR: lerp(30, 88, reachA) - 6 * bounce, lean: 6 * reachA, mood: t > 1.1 && t < 2.2 ? 'sad' : t > 3.3 ? 'grin' : 'flat', look: 0.6, lift: 4 * hump(seg(t, 3.3, 3.6)) });
      faceAt(b, 5, 2);
      held(k, b, S, k1, 'R', -90); held(k, b, S, k2, 'R', -90);
      k1.setAttribute('opacity', swap ? 0 : 1); k2.setAttribute('opacity', swap ? 1 : 0);
      no.setAttribute('opacity', seg(t, 1.0, 1.1) * (1 - seg(t, 1.8, 2.0)));
      const open = easeOut(seg(t, 3.1, 3.6));
      tf(lid, 254, 158, -70 * open + 4 * wobble(seg(t, 3.6, 4.2)));
      k.set(glow, { opacity: open * 0.9, transform: `translate(306 ${140 - 14 * open}) scale(${1.4 * open})` });
    }
  };
}
