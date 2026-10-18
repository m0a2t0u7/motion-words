// take away from（否定）：美しい花びんに小さな傷を見つけて顔を近づけるが、離れて見るとやはり輝いたまま。星5つの評価も減らない（例文 One small scratch doesn't take away from its beauty.）
import { seg, lerp, easeInOut, easeOut, hump, wobble } from '../ease.js';
import { star } from './get-on-with.js';
import { hp, reach } from './dig.js';

export const meta = { duration: 4.4, beats: [[0, '美しい花びん'], [1.6, '小さな傷'], [3.4, '美しさは同じ']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  el('rect', { x: 0, y: 30, width: 400, height: 6, fill: pal.line });
  // 台座と花びん
  const VX = 270;
  k.shadow(VX, 237, 40, 5);
  el('rect', { x: VX - 34, y: 170, width: 68, height: 66, rx: 4, fill: '#fff', stroke: pal.line, 'stroke-width': 2 });
  el('rect', { x: VX - 40, y: 164, width: 80, height: 10, rx: 3, fill: '#F1F3F6' });
  const vase = `M ${VX - 12} 164 Q ${VX - 40} 140 ${VX - 26} 110 Q ${VX - 14} 92 ${VX - 10} 80 L ${VX + 10} 80 Q ${VX + 14} 92 ${VX + 26} 110 Q ${VX + 40} 140 ${VX + 12} 164 Z`;
  el('path', { d: vase, fill: k.gradient([[0, '#7FB8F9'], [1, '#4A6FE0']], false) });
  el('path', { d: `M ${VX - 30} 128 Q ${VX} 140 ${VX + 30} 128`, stroke: pal.yellow, 'stroke-width': 4, fill: 'none' });
  el('ellipse', { cx: VX - 14, cy: 118, rx: 5, ry: 16, fill: '#fff', opacity: 0.35 });
  const scratch = el('path', { d: `M ${VX + 12} 147 l 10 -7 M ${VX + 16} 150 l 6 -4`, stroke: '#2C3F86', 'stroke-width': 1.6, 'stroke-linecap': 'round' });
  const sparks = [[-40, 90], [42, 100], [-30, 150], [36, 150]].map(([dx, dy]) => { const s = g({}); star(k, s, 7); return [s, VX + dx, dy]; });
  // 評価の星5つ（ずっと満点）
  const rate = g({}); tf(rate, VX, 54);
  for (let i = 0; i < 5; i++) { const s = g({}, rate); star(k, s, 8, pal.yellowDark); tf(s, (i - 2) * 20, 0); }
  // 虫めがね
  const lens = g({});
  el('line', { x1: -8, y1: 8, x2: -20, y2: 20, stroke: pal.woodDark, 'stroke-width': 5, 'stroke-linecap': 'round' }, lens);
  el('circle', { r: 11, fill: '#fff', 'fill-opacity': 0.4, stroke: pal.ink, 'stroke-width': 3 }, lens);
  const b = k.buddy({ x: 110, y: FY, scale: 0.95 });
  return {
    update(t) {
      sparks.forEach(([s, x, y], i) => tf(s, x, y, t * 40, 0.6 + 0.4 * Math.abs(Math.sin(t * 2.5 + i))));
      // 近づいて見る→傷を見つけて驚く→下がって全体を見て、にっこり
      const near = easeInOut(seg(t, 1.0, 1.6)) * (1 - easeInOut(seg(t, 2.6, 3.2)));
      const found = t > 1.8 && t < 2.6;
      b.pose({ x: lerp(110, 206, near), walk: (t > 1.0 && t < 1.6) || (t > 2.6 && t < 3.2) ? t * 9 : 0, lean: 14 * near, look: 0.8,
        armR: 20, armL: t > 3.3 ? 40 + 10 * Math.sin(t * 5) : 10, mood: found ? 'open' : t > 3.2 ? 'grin' : 'smile', blink: 0 });
      if (near > 0) b.pose({ armR: lerp(20, reach(b, 0.95, 'R', VX - 4, 166), near) });
      lens.setAttribute('opacity', near > 0.5 ? 1 : 0);
      const h = hp(b, 0.95);
      tf(lens, h.x + 18, h.y - 18, 0, 1 + 0.15 * hump(seg(t, 1.6, 2.0)));
      k.set(scratch, { 'stroke-width': found ? 2.4 : 1.4 });
      tf(rate, VX, 54, 0, 1 + 0.12 * hump(seg(t, 3.2, 3.7)));
    }
  };
}
