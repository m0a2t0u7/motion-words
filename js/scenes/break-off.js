// break off：嵐で木が大きく揺れ、枝が根元で折れて地面に落ちる（例文 A branch broke off in the storm.）
import { seg, lerp, easeIn, easeOut, wobble, clamp } from '../ease.js';

export const meta = { duration: 4.0, beats: [[0, '嵐の木'], [1.6, '枝が折れる'], [3.0, '地面に落ちた']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = 240;
  el('rect', { x: 0, y: 0, width: 400, height: 300, fill: k.gradient([[0, '#8E99AE'], [1, '#C5CCD8']]) });
  el('rect', { x: 0, y: FY, width: 400, height: 60, fill: '#A9C59A' });
  el('rect', { x: 0, y: FY, width: 400, height: 3, fill: '#8EAE80' });
  [[60, 40], [250, 30]].forEach(([x, y]) => { el('ellipse', { cx: x, cy: y, rx: 70, ry: 22, fill: '#6F7A90' }); el('ellipse', { cx: x + 40, cy: y + 8, rx: 50, ry: 18, fill: '#7C879C' }); });
  const rain = Array.from({ length: 24 }, (_, i) => el('line', { stroke: '#E8EEF6', 'stroke-width': 2, 'stroke-linecap': 'round', opacity: 0.7 }));
  k.shadow(170, FY + 1, 50, 6);
  const T = g({}); tf(T, 170, FY);
  el('path', { d: 'M -14 0 L -8 -120 L 8 -120 L 14 0 Z', fill: pal.woodDark }, T);
  el('circle', { cx: 0, cy: -150, r: 50, fill: '#5FA87A' }, T);
  el('circle', { cx: -34, cy: -126, r: 30, fill: '#549A6E' }, T);
  // 折れる枝（原点＝付け根）
  const Bp = g({}, T);
  const Br = g({}, Bp);
  el('path', { d: 'M 0 -4 L 80 -18 L 82 -10 L 0 5 Z', fill: pal.woodDark }, Br);
  el('circle', { cx: 86, cy: -22, r: 20, fill: '#5FA87A' }, Br);
  el('circle', { cx: 62, cy: -30, r: 14, fill: '#549A6E' }, Br);
  const snap = el('path', { d: 'M -4 -10 L 4 -2 L -2 4 L 6 10', stroke: '#fff', 'stroke-width': 3, fill: 'none', 'stroke-linecap': 'round' }, Bp);
  tf(Bp, 8, -96);
  const bs = k.shadow(0, FY + 2, 50, 6);
  return {
    update(t) {
      const gust = Math.sin(t * 3.2) * 0.5 + 0.5;
      const sway = 3 + 4 * gust;
      tf(T, 170, FY, sway * 0.6);
      rain.forEach((r, i) => {
        const x = (i * 37) % 420, y = ((t * 420 + i * 53) % 320) - 20;
        k.set(r, { x1: x + y * 0.35, y1: y, x2: x + y * 0.35 + 7, y2: y + 18 });
      });
      const crack = seg(t, 1.3, 1.6);
      snap.setAttribute('opacity', crack > 0 && t < 1.8 ? 1 : 0);
      const f = seg(t, 1.6, 2.3);
      if (f <= 0) { tf(Br, 0, 0, sway * 1.5 + crack * 8 + wobble(crack, 3, 3) * 4); bs.setAttribute('opacity', 0); }
      else {
        // 付け根を離れ、回転しながら風下へ落ちる→着地で弾む
        const ang = (sway * 0.6) * Math.PI / 180;
        const x0 = 170 + 8 + 96 * Math.sin(ang), y0 = FY - 96 * Math.cos(ang);
        const fe = easeIn(f);
        const land = seg(t, 2.3, 3.0);
        const x = lerp(x0, 270, easeOut(f)), y = lerp(y0, FY - 6, fe) - 10 * Math.abs(wobble(land, 1.5, 5));
        const rot = lerp(10, 22, f) + 3 * wobble(land, 2, 5);
        tf(Bp, 0, 0); T.parentNode.appendChild(Bp); tf(Bp, x - 40, y, rot);
        tf(Br, 0, 0);
        bs.setAttribute('opacity', clamp(f * 1.5)); tf(bs, x, 0, 0, 0.5 + 0.5 * f, 1);
      }
      if (f <= 0 && Bp.parentNode !== T) { T.appendChild(Bp); tf(Bp, 8, -96); }
    }
  };
}
