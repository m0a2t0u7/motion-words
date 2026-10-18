// breathe：目を閉じ、鼻からゆっくり息を吸い込んで胸が持ち上がる（例文 Breathe in slowly through your nose.）
import { seg, lerp, easeInOut, easeOut } from '../ease.js';

export const meta = { duration: 4.4, beats: [[0, '立って準備'], [1.4, '鼻から吸う'], [3.8, '吸い終え']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 240, mood: 'outdoor' });
  el('rect', { x: 0, y: FY - 4, width: 400, height: 4, fill: pal.floorEdge });
  // 木と草
  [[60, 1], [340, 0.85]].forEach(([x, s]) => {
    const tr = g({}); tf(tr, x, FY - 4, 0, s);
    k.shadow(0, 0, 28, 5, tr);
    el('rect', { x: -6, y: -80, width: 12, height: 80, rx: 5, fill: pal.woodDark }, tr);
    el('circle', { cx: 0, cy: -104, r: 36, fill: '#7FD3A0' }, tr);
    el('circle', { cx: -22, cy: -86, r: 24, fill: '#6BC48F' }, tr);
    el('circle', { cx: 22, cy: -88, r: 25, fill: '#6BC48F' }, tr);
  });
  const b = k.buddy({ x: 200, y: FY, facing: 1, scale: 1.1 });
  // 鼻
  el('ellipse', { cx: 0, cy: -48.5, rx: 2.6, ry: 1.8, fill: pal.mintDark }, b.body.children[3]);
  // 空気の流れ（鼻へ向かう）
  const air = [0, 1, 2, 3].map((i) => el('path', { d: 'M 0 0 Q 12 -5 24 0', fill: 'none', stroke: '#9BD6F2', 'stroke-width': 3, 'stroke-linecap': 'round', opacity: 0 }));
  return {
    update(t) {
      const inh = easeInOut(seg(t, 1.2, 3.8));
      const rise = inh;
      b.pose({ armR: lerp(8, 70, inh), armL: lerp(8, 70, inh), lift: 0, squash: 1 + 0.05 * rise, lean: -3 * rise, blink: seg(t, 0.6, 1.0), mood: 'flat', look: 0.3 });
      // 体を少し伸ばす（息で胸が上がる）に合わせ、顔の位置は squash で自然に動く
      const nx = b.state.x + 6 * 1.1, ny = FY - (10 + 48.5 * (1 + 0.05 * rise)) * 1.1;
      air.forEach((a, i) => {
        const q = ((t - 1.2) * 0.45 + i / 4) % 1, on = t > 1.2 && t < 3.9 ? 1 : 0;
        const d = (1 - q) * 70, y = (i - 1.5) * 16 * (1 - q) - 2;
        tf(a, nx + 6 + d, ny + y, 0, 1);
        k.set(a, { opacity: on * Math.sin(q * Math.PI) * 0.9, transform: `translate(${(nx + 6 + d).toFixed(1)} ${(ny + y).toFixed(1)}) rotate(${(180 + (i - 1.5) * -6)}) scale(${(0.6 + 0.6 * q).toFixed(2)})` });
      });
    }
  };
}
