// sun：東（E）の地平線から太陽がのぼり、空が明るくなる。まめが東を向いて見守る（例文 The sun rises in the east.）
import { seg, lerp, easeInOut, easeOut, clamp } from '../ease.js';
import { scene, sunG, P, blinkAt, point } from './nature.js';

export const meta = { duration: 4.4, beats: [[0, '夜明け前'], [1.2, '東からのぼる'], [3.4, '朝になった']] };

export function create(k) {
  const { el, tf, pal } = k, S = 0.95, FY = 236;
  scene(k, { FY, top: '#9CCBF2', bot: '#FFE9C7', ground: '#B9DDB8', edge: '#A4CFA3' });
  const dark = el('rect', { x: 0, y: 0, width: 400, height: FY, fill: k.gradient([[0, '#1E2A4A'], [1, '#C77F78']]) });
  const sun = sunG(k, 26);
  el('path', { d: `M 0 ${FY - 20} Q 80 ${FY - 48} 170 ${FY - 22} T 400 ${FY - 26} V ${FY + 2} H 0 Z`, fill: '#A9D4AE' });
  el('rect', { x: 0, y: FY, width: 400, height: 64, fill: '#B9DDB8' });
  // 方角の標識
  el('rect', { x: 196, y: FY - 70, width: 6, height: 72, fill: pal.woodDark });
  el('path', { d: `M 204 ${FY - 70} h 40 l 10 10 l -10 10 h -40 Z`, fill: '#FFF6E5', stroke: pal.woodDark, 'stroke-width': 2 });
  el('path', { d: `M 194 ${FY - 46} h -40 l -10 10 l 10 10 h 40 Z`, fill: '#FFF6E5', stroke: pal.woodDark, 'stroke-width': 2 });
  k.text(226, FY - 60, 'E', { 'font-size': 15 }); k.text(172, FY - 36, 'W', { 'font-size': 15, fill: pal.sub });
  const b = k.buddy({ x: 110, y: FY, scale: S });
  const shadeG = el('rect', { x: 0, y: 0, width: 400, height: 300, fill: '#0E1530', opacity: 0 });
  return {
    update(t) {
      const r = easeInOut(seg(t, 0.2, 3.4)), sx = 330, sy = lerp(FY + 6, FY - 120, r);
      tf(sun.g, sx, sy);
      sun.rays.setAttribute('transform', `rotate(${t * 12}) scale(${(0.6 + 0.4 * r).toFixed(2)})`);
      dark.setAttribute('opacity', 1 - easeOut(seg(t, 0.8, 3.6)));
      shadeG.setAttribute('opacity', 0.28 * (1 - easeOut(seg(t, 0.6, 2.6))));
      const pt = easeInOut(seg(t, 1.4, 2.0)) * (1 - easeInOut(seg(t, 3.3, 3.8)));
      P(b, { look: 0.8, lean: -4 * r, mood: t > 3.4 ? 'grin' : 'open', blink: blinkAt(t), armL: lerp(8, 140, easeOut(seg(t, 3.5, 4.0))), armR: 8 });
      b.pose({ armR: lerp(8, point(b, S, 'R', sx, sy), pt) + 130 * easeOut(seg(t, 3.5, 4.0)) * (1 - pt) });
    }
  };
}
