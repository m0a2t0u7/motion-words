// wear：教室で眼鏡を手に取り、顔にかけて黒板の方を見る＝かけたまま過ごす（例文 She wears glasses at school.）
import { seg, lerp, easeInOut, easeOut, smooth } from '../ease.js';
import { hp, held, room } from './dig.js';

export const meta = { duration: 3.8, beats: [[0, '手に持つ'], [1.3, 'かける'], [3.1, 'かけている']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  k.backdrop({ floorY: 236, mood: 'indoor' });
  // 黒板
  el('rect', { x: 36, y: 40, width: 190, height: 100, rx: 5, fill: '#4F7A68', stroke: pal.woodDark, 'stroke-width': 6 });
  el('path', { d: 'M 56 70 q 14 -14 28 0 t 28 0', fill: 'none', stroke: '#fff', 'stroke-width': 3, opacity: 0.8, 'stroke-linecap': 'round' });
  el('line', { x1: 56, y1: 96, x2: 150, y2: 96, stroke: '#fff', 'stroke-width': 3, opacity: 0.7 });
  el('circle', { cx: 180, cy: 92, r: 14, fill: 'none', stroke: pal.yellow, 'stroke-width': 3 });
  el('rect', { x: 36, y: 142, width: 190, height: 5, fill: pal.woodDark });
  // 時計（学校らしさ）
  el('circle', { cx: 300, cy: 62, r: 20, fill: '#fff', stroke: pal.ink, 'stroke-width': 3 });
  el('line', { x1: 300, y1: 62, x2: 300, y2: 50, stroke: pal.ink, 'stroke-width': 2.4, 'stroke-linecap': 'round' });
  el('line', { x1: 300, y1: 62, x2: 308, y2: 66, stroke: pal.ink, 'stroke-width': 2.4, 'stroke-linecap': 'round' });
  // 机と本
  const b = k.buddy({ x: 130, y: 236 });
  const face = b.body.children[3];
  const gl = g({}, face);
  [-10, 10].forEach((x) => el('circle', { cx: x, cy: -54, r: 7.2, fill: 'rgba(255,255,255,0.25)', stroke: pal.ink, 'stroke-width': 2 }, gl));
  el('line', { x1: -3, y1: -54, x2: 3, y2: -54, stroke: pal.ink, 'stroke-width': 2 }, gl);
  [-17, 17].forEach((x) => el('line', { x1: x, y1: -54, x2: x * 1.35, y2: -56, stroke: pal.ink, 'stroke-width': 2 }, gl));
  gl.setAttribute('opacity', 0);
  // 机
  el('rect', { x: 215, y: 190, width: 120, height: 8, rx: 3, fill: pal.wood });
  [222, 322].forEach((x) => el('rect', { x: x - 3, y: 198, width: 6, height: 38, fill: pal.woodDark }));
  el('rect', { x: 260, y: 176, width: 36, height: 14, rx: 2, fill: pal.red });
  el('rect', { x: 262, y: 172, width: 32, height: 6, rx: 2, fill: '#fff' });
  const hand = g({});
  el('circle', { cx: -7, cy: 0, r: 5.5, fill: 'rgba(255,255,255,0.3)', stroke: pal.ink, 'stroke-width': 1.8 }, hand);
  el('circle', { cx: 7, cy: 0, r: 5.5, fill: 'rgba(255,255,255,0.3)', stroke: pal.ink, 'stroke-width': 1.8 }, hand);
  el('line', { x1: -1.5, y1: 0, x2: 1.5, y2: 0, stroke: pal.ink, 'stroke-width': 1.8 }, hand);
  el('line', { x1: -12, y1: 0, x2: -17, y2: 3, stroke: pal.ink, 'stroke-width': 1.8 }, hand);
  el('line', { x1: 12, y1: 0, x2: 17, y2: 3, stroke: pal.ink, 'stroke-width': 1.8 }, hand);
  return {
    update(t) {
      const up = easeInOut(seg(t, 0.5, 1.5)), on = smooth(seg(t, 1.5, 1.7)), dn = easeInOut(seg(t, 1.9, 2.6));
      const push = Math.sin(Math.PI * seg(t, 1.9, 2.3));
      b.pose({
        armR: t < 1.9 ? lerp(40, 128, up) : lerp(128, 10, dn) + push * 8, armL: 8,
        look: lerp(0.2, 0.9, seg(t, 2.4, 3.0)), mood: t > 1.6 ? 'grin' : 'smile', lean: 3 * up * (1 - dn),
        blink: t > 1.5 && t < 1.6 ? 1 : 0, squash: 1 + 0.015 * Math.sin(t * 2)
      });
      const h = hp(b, 1, 'R', 24);
      tf(hand, h.x, h.y - 4 * up, 0, 1 - 0.0 * on);
      hand.setAttribute('opacity', 1 - on);
      gl.setAttribute('opacity', on);
      tf(gl, 0, 0, 0, 1 + 0.04 * Math.sin(Math.PI * seg(t, 1.5, 1.9)));
    }
  };
}
