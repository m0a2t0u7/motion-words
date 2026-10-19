// see：まめが丘の上の展望スポットに着き、手をかざして遠くの山を見る（例文 I can see the mountain from here.）
import { seg, lerp, easeInOut, easeOut } from '../ease.js';
import { gait } from './dig.js';
import { frontL } from './dig.js';

export const meta = { duration: 4.0, beats: [[0, '展望台へ'], [1.5, '手をかざす'], [2.6, '山が見える']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 0.78;
  k.backdrop({ floorY: 300, mood: 'outdoor' });
  // 遠くの山（雪をかぶった峰）と手前の野原
  el('path', { d: 'M 170 212 L 268 92 L 300 120 L 322 104 L 400 190 L 400 230 L 170 230 Z', fill: '#9DB4D3' });
  el('path', { d: 'M 248 116 L 268 92 L 290 112 L 280 118 L 268 110 L 258 120 Z', fill: '#fff' });
  el('path', { d: 'M 200 220 Q 300 196 400 214 L 400 240 L 200 240 Z', fill: '#BFE3C6' });
  [[60, 40], [120, 56], [340, 52]].forEach(([x, y]) => el('ellipse', { cx: x, cy: y, rx: 24, ry: 9, fill: '#fff', opacity: 0.9 }));
  // 手前の丘（まめが立つ所）と柵
  const HY = 210;
  el('path', { d: `M 0 ${HY} L 190 ${HY} Q 230 ${HY + 4} 240 300 L 0 300 Z`, fill: '#8FD19A' });
  el('path', { d: `M 0 ${HY} L 190 ${HY}`, stroke: '#77BE84', 'stroke-width': 3 });
  [176, 206].forEach((x) => el('rect', { x: x - 3, y: HY - 32, width: 6, height: 34, rx: 2, fill: pal.woodDark }));
  el('rect', { x: 168, y: HY - 30, width: 46, height: 5, rx: 2, fill: pal.wood });
  el('rect', { x: 168, y: HY - 16, width: 46, height: 5, rx: 2, fill: pal.wood });
  const sight = el('line', { stroke: pal.blueDark, 'stroke-width': 2.5, 'stroke-dasharray': '3 7', 'stroke-linecap': 'round' });
  const b = k.buddy({ x: 40, y: HY, scale: S });
  const fl = frontL(b, S, 20, -44);
  const spark = el('path', { d: 'M 0 -8 L 2.5 -2.5 L 8 0 L 2.5 2.5 L 0 8 L -2.5 2.5 L -8 0 L -2.5 -2.5 Z', fill: pal.yellow });
  const bx = (t) => lerp(40, 140, easeInOut(seg(t, 0.2, 1.4)));
  return {
    update(t) {
      const gg = gait(bx, t, 40), up = easeOut(seg(t, 1.5, 2.0)), pt = easeInOut(seg(t, 2.4, 2.9));
      b.pose({ x: gg.x, walk: gg.walk, armL: gg.armL, armR: lerp(gg.armR, 96, pt), lean: gg.lean - 4 * up, look: lerp(0.3, 1, up), mood: t > 2.4 ? 'grin' : 'smile' });
      fl.set(lerp(-6, -148, up));
      const eye = { x: gg.x + 12 * S, y: HY - 66 * S }, tgt = { x: 266, y: 104 };
      const q = easeInOut(seg(t, 2.2, 3.0));
      k.set(sight, { x1: eye.x + 20, y1: eye.y - 2, x2: lerp(eye.x + 20, tgt.x - 6, q), y2: lerp(eye.y - 2, tgt.y + 6, q), opacity: q > 0 ? 0.8 : 0 });
      const sp = seg(t, 3.0, 3.6);
      tf(spark, 272, 98, sp * 90, sp > 0 ? 0.4 + 0.8 * Math.sin(sp * Math.PI) + 0.4 * (sp >= 1) : 0.001);
    }
  };
}
