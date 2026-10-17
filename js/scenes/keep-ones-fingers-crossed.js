// keep one's fingers crossed：試験に向かう友だちのうしろで、指をクロスして幸運を祈る（例文 I'll keep my fingers crossed for you.）
import { seg, lerp, easeInOut, easeOut, backOut, wobble, hump } from '../ease.js';

export const meta = { duration: 4.2, beats: [[0, '友だちが緊張'], [1.2, '指を交差'], [2.6, '幸運を祈る']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 244, mood: 'indoor' });
  // 机と答案
  el('rect', { x: 240, y: 184, width: 130, height: 12, rx: 5, fill: pal.wood });
  el('rect', { x: 250, y: 194, width: 10, height: 50, fill: pal.woodDark });
  el('rect', { x: 350, y: 194, width: 10, height: 50, fill: pal.woodDark });
  k.shadow(305, 246, 66, 4);
  el('rect', { x: 276, y: 172, width: 50, height: 14, rx: 2, fill: '#fff', stroke: '#CBD3DE', 'stroke-width': 2, transform: 'skewX(-20) translate(60 0)' });
  const F = k.buddy({ x: 300, y: FY, scale: 1.0, color: pal.coral, dark: pal.coralDark, facing: -1 });
  const A = k.buddy({ x: 120, y: FY, scale: 1.05 });
  // 交差した指（拡大アイコン）
  const ic = g({});
  el('circle', { r: 36, fill: '#fff', stroke: '#CBD3DE', 'stroke-width': 3 }, ic);
  el('circle', { cx: 0, cy: 20, r: 11, fill: '#F9D7BD', stroke: '#D9A47F', 'stroke-width': 2 }, ic);
  el('rect', { x: -7, y: -22, width: 14, height: 44, rx: 7, fill: '#F6CDB0', stroke: '#D9A47F', 'stroke-width': 2, transform: 'rotate(-24)' }, ic);
  el('rect', { x: -7, y: -24, width: 14, height: 46, rx: 7, fill: '#F9D7BD', stroke: '#D9A47F', 'stroke-width': 2, transform: 'rotate(26)' }, ic);
  const stars = g({});
  [[-30, -20, 1], [26, -26, 0.8], [34, 8, 0.6], [-22, 22, 0.7]].forEach(([x, y, s]) => {
    el('path', { d: 'M 0 -9 L 2.6 -2.8 L 9 -2.8 L 3.8 1.4 L 5.8 8 L 0 4 L -5.8 8 L -3.8 1.4 L -9 -2.8 L -2.6 -2.8 Z', fill: pal.yellow, stroke: pal.yellowDark, 'stroke-width': 1.5, transform: `translate(${x} ${y}) scale(${s})` }, stars);
  });
  const sweat = el('path', { d: 'M 0 -6 Q 5 2 0 7 Q -5 2 0 -6 Z', fill: pal.water });
  return {
    update(t) {
      F.pose({ x: 300, armR: 70 + 12 * Math.sin(t * 5), armL: 8, lean: 6, mood: t < 2.8 ? 'sad' : 'smile', look: 0.2, walk: 0 });
      const cross = easeOut(seg(t, 0.9, 1.5));
      const hold = t > 1.5 ? wobble(seg(t, 1.5, 4.2), 3, 0.4) * 0.7 : 0;
      A.pose({
        armR: lerp(8, 140, cross) + 4 * hold, armL: lerp(8, 140, cross) - 4 * hold,
        mood: t < 1.0 ? 'smile' : 'grin', look: 0.9, lean: -4 * cross, lift: t > 2.6 ? 3 * Math.abs(Math.sin(t * 6)) : 0
      });
      const ip = backOut(seg(t, 1.3, 1.9), 1.8);
      tf(ic, 120, 78, 4 * Math.sin(t * 4), ip, ip);
      ic.setAttribute('opacity', t < 1.3 ? 0 : 1);
      const sp = seg(t, 2.2, 2.8);
      tf(stars, 120, 78, 0, 1 + 0.1 * Math.sin(t * 8));
      stars.setAttribute('opacity', sp > 0 ? 1 : 0);
      tf(sweat, 314, lerp(FY - 112, FY - 92, seg(t, 0.3, 1.6)));
      sweat.setAttribute('opacity', t < 2.6 ? 1 : 0);
    }
  };
}
