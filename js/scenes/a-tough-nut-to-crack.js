// a tough nut to crack：固い木の実をハンマーで何度叩いても割れない（This problem is a tough nut to crack.）
import { seg, lerp, easeInOut, easeOut, easeIn, backOut, smooth, wobble, hump, clamp } from '../ease.js';

export const meta = { duration: 4.2, beats: [[0, '叩く'], [1.6, '割れない'], [3.2, '手ごわい']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 244 });
  const S = 1.0, BX = 105;
  // 切り株
  el('rect', { x: 215, y: FY - 30, width: 80, height: 32, rx: 6, fill: pal.wood });
  el('ellipse', { cx: 255, cy: FY - 30, rx: 40, ry: 8, fill: '#EBD2AE' });
  el('ellipse', { cx: 255, cy: FY - 30, rx: 22, ry: 4, fill: 'none', stroke: pal.woodDark, 'stroke-width': 1.5 });
  k.shadow(255, FY + 3, 50, 5);
  const nut = g({});
  const ns = g({}, nut);
  el('ellipse', { rx: 28, ry: 24, fill: '#B07B4F' }, ns);
  el('path', { d: 'M 0 -24 Q -8 0 0 24', fill: 'none', stroke: '#8A5B35', 'stroke-width': 3 }, ns);
  el('path', { d: 'M -14 -18 Q -22 0 -14 18 M 14 -18 Q 22 0 14 18', fill: 'none', stroke: '#8A5B35', 'stroke-width': 2, opacity: 0.7 }, ns);
  el('ellipse', { cx: -10, cy: -12, rx: 8, ry: 5, fill: '#fff', opacity: 0.25, transform: 'rotate(-30 -10 -12)' }, ns);
  const hammer = g({});
  el('line', { x1: 0, y1: -4, x2: 0, y2: 30, stroke: pal.woodDark, 'stroke-width': 5, 'stroke-linecap': 'round' }, hammer);
  el('rect', { x: -10, y: 26, width: 20, height: 24, rx: 4, fill: '#8A93A3', stroke: '#6B7485', 'stroke-width': 2 }, hammer);
  const spark = g({});
  for (let i = 0; i < 6; i++) el('line', { x1: 0, y1: -10, x2: 0, y2: -20, stroke: pal.yellow, 'stroke-width': 3, 'stroke-linecap': 'round', transform: 'rotate(' + (i * 60 + 15) + ')' }, spark);
  const sweat = el('path', { d: 'M 0 -7 Q 5 0 0 5 Q -5 0 0 -7 Z', fill: pal.water });
  const b = k.buddy({ x: BX, y: FY, scale: S });
  const NX = 255, NY = FY - 56;
  return {
    update(t) {
      let armR = 8, hit = -1;
      const T0 = 0.3, CY = 0.95;
      if (t >= T0 && t < T0 + 3 * CY) {
        const u = (t - T0) % CY;
        const n = Math.floor((t - T0) / CY);
        const rais = easeOut(seg(u, 0, 0.5));
        const str = easeIn(seg(u, 0.5, 0.66));
        const reb = easeOut(seg(u, 0.66, 0.9));
        armR = u < 0.5 ? lerp(60, 165, rais) : u < 0.66 ? lerp(165, 84, str) : lerp(84, 112, reb);
        if (u > 0.66) hit = n * CY + T0 + 0.66;
      } else if (t >= T0 + 3 * CY) {
        armR = lerp(112, 8, easeOut(seg(t, T0 + 3 * CY, T0 + 3 * CY + 0.5)));
        hit = T0 + 2 * CY + 0.66;
      }
      const fin = easeOut(seg(t, 3.0, 3.5));
      b.pose({
        armR, armL: 8, lean: lerp(armR > 120 ? -8 : 7, 2, fin), look: 0.9, squash: t > 3 ? 1 - 0.04 * fin : 1,
        mood: t < 1.6 ? 'grin' : t < 3.0 ? 'flat' : 'sad', blink: 0
      });
      const h = b.handPos('R');
      tf(hammer, h.x + 1, h.y + 2, -armR + 180 + 180, 1, 1);
      const lastHit = hit >= 0 ? hit : -9;
      const q = seg(t, lastHit, lastHit + 0.5);
      const sh = hit >= 0 ? wobble(q, 3, 6) * 9 : 0;
      tf(nut, NX, NY);
      tf(ns, 0, 0, sh, 1 - 0.06 * hump(seg(t, lastHit, lastHit + 0.15)), 1 + 0.06 * hump(seg(t, lastHit, lastHit + 0.15)));
      const sp = seg(t, lastHit, lastHit + 0.25);
      tf(spark, NX - 20, NY - 14, 0, hit >= 0 && sp < 1 ? 0.5 + sp : 0, hit >= 0 && sp < 1 ? 0.5 + sp : 0);
      tf(sweat, BX - 32, FY - 100 + 20 * seg(t, 3.1, 4.0), 0, 1, 1);
      sweat.setAttribute('opacity', t > 3.1 ? 1 : 0);
    }
  };
}
