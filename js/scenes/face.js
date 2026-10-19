// face：寝る前、洗面台で水をすくって顔を洗い、さっぱりする（例文 Wash your face before bed.）
import { seg, lerp, easeInOut, easeOut, hump, clamp, wobble } from '../ease.js';
import { hp, reach, P, blinkAt, bp, twinkle, pop } from './body.js';
import { drop } from './in-common.js';

export const meta = { duration: 4.4, beats: [[0, '寝る前'], [1.0, '顔を洗う'], [3.2, 'さっぱり']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 1.1, FY = 240;
  k.backdrop({ floorY: FY, mood: 'indoor' });
  el('rect', { x: 0, y: 0, width: 400, height: FY, fill: '#E3EEF2' });
  for (let x = 0; x < 400; x += 24) for (let y = 120; y < FY; y += 24) el('rect', { x: x + 1, y: y + 1, width: 22, height: 22, fill: '#EEF5F7' });
  // 夜の窓（月）
  el('rect', { x: 30, y: 36, width: 70, height: 60, rx: 5, fill: '#2E3A5C', stroke: '#fff', 'stroke-width': 5 });
  el('circle', { cx: 78, cy: 56, r: 10, fill: '#FFF3C4' }); el('circle', { cx: 84, cy: 52, r: 9, fill: '#2E3A5C' });
  // 鏡と洗面台（動かない）
  el('rect', { x: 236, y: 40, width: 80, height: 74, rx: 10, fill: '#CFE6F0', stroke: '#B8C2CE', 'stroke-width': 4 });
  el('rect', { x: 210, y: 160, width: 130, height: 14, rx: 5, fill: '#fff', stroke: '#C9D2DE', 'stroke-width': 2 });
  el('path', { d: 'M 222 174 H 328 L 318 196 H 232 Z', fill: '#fff', stroke: '#C9D2DE', 'stroke-width': 2 });
  el('rect', { x: 268, y: 196, width: 14, height: FY - 196, fill: '#DCE3EA' });
  el('path', { d: 'M 296 160 V 142 H 270', stroke: '#9AA6B6', 'stroke-width': 5, fill: 'none' });
  const stream = el('rect', { x: 268, y: 144, width: 4, height: 18, fill: pal.water });
  // タオル掛け
  el('rect', { x: 352, y: 120, width: 40, height: 4, fill: '#9AA6B6' });
  el('rect', { x: 356, y: 122, width: 32, height: 46, rx: 3, fill: '#F7A9B4' });
  const b = k.buddy({ x: 196, y: FY, scale: S });
  const drops = [0, 1, 2, 3, 4].map(() => drop(k));
  const sp = [0, 1, 2].map(() => twinkle(k));
  return {
    update(t) {
      // 3回すくって顔にかける（0.9-3.0）
      const cyc = seg(t, 0.9, 3.0) * 3, ph = cyc % 1, on = t > 0.9 && t < 3.0;
      const up = on ? (ph < 0.5 ? easeInOut(ph / 0.5) : 1 - easeInOut((ph - 0.5) / 0.5)) : 0;
      const bend = easeInOut(seg(t, 0.5, 0.9)) * (1 - easeInOut(seg(t, 3.0, 3.4)));
      P(b, { lean: 14 * bend - 4 * up, look: 0.5, blink: up > 0.5 || (on && ph > 0.4) ? 1 : blinkAt(t), mood: t > 3.3 ? 'grin' : up > 0.6 ? 'flat' : 'smile', squash: 1 - 0.03 * up });
      const face = bp(b, S, 20, -52), basin = { x: 262, y: 168 };
      const tgt = { x: lerp(basin.x, face.x + 4, up), y: lerp(basin.y, face.y, up) };
      b.pose({ armR: bend > 0.02 ? lerp(8, reach(b, S, 'R', tgt.x, tgt.y), bend) : 8, armL: bend > 0.02 ? lerp(8, reach(b, S, 'L', tgt.x - 6, tgt.y + 4), bend) : 8 });
      stream.setAttribute('opacity', on ? 1 : 0);
      drops.forEach((d, i) => { const q = on ? ((ph - 0.45 + i * 0.07 + 1) % 1) : 1; const vis = on && ph > 0.45 && ph < 0.95; tf(d, face.x - 4 + (i - 2) * 6, face.y + 4 + 60 * q * q, 0, vis ? 0.8 : 0.001); });
      sp.forEach((s, i) => { const q = seg(t, 3.4 + i * 0.15, 4.4); tf(s, face.x - 26 + i * 22, face.y - 34 - (i % 2) * 10, 45 * q, pop(easeOut(seg(q, 0, 0.3)))); });
    }
  };
}
