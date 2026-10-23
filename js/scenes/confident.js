// confident：舞台のマイクの前に進み、胸を張ってこぶしを上げる。客席が見ていても落ち着いている（例文 She felt confident before the speech.）
import { seg, lerp, easeInOut, easeOut, hump, wobble } from '../ease.js';
import { P, blinkAt, hp, walkTo, path, person, sparkle, sym, faceOf } from './confused.js';

export const meta = { duration: 4.2, beats: [[0, '舞台に出る'], [1.6, '胸を張る'], [2.8, '自信たっぷり']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 1;
  k.backdrop({ floorY: 220, mood: 'indoor' });
  const FY = 220;
  el('rect', { x: 0, y: 0, width: 400, height: FY, fill: '#5B4A7A' });
  el('ellipse', { cx: 210, cy: FY, rx: 120, ry: 16, fill: '#FFF3C4', opacity: 0.5 });
  el('path', { d: `M 150 0 L 100 ${FY} L 320 ${FY} L 270 0 Z`, fill: '#FFF3C4', opacity: 0.12 });
  [[0, 1], [400, -1]].forEach(([x, d]) => el('path', { d: `M ${x} 0 L ${x + d * 70} 0 Q ${x + d * 50} 120 ${x + d * 30} ${FY} L ${x} ${FY} Z`, fill: '#C8475B' }));
  el('rect', { x: 0, y: FY, width: 400, height: 80, fill: '#C9A577' });
  el('rect', { x: 0, y: FY, width: 400, height: 4, fill: '#A88559' });
  // マイクスタンド
  el('line', { x1: 275, y1: FY, x2: 275, y2: FY - 76, stroke: pal.ink, 'stroke-width': 3 });
  el('ellipse', { cx: 275, cy: FY, rx: 14, ry: 3, fill: pal.ink });
  el('rect', { x: 270, y: FY - 92, width: 10, height: 18, rx: 5, fill: '#4B5566' });
  const b = k.buddy({ x: 60, y: FY, scale: S, color: pal.mint });
  // 客席（手前の頭）
  const aud = ['blue', 'yellow', 'violet', 'coral', 'blue'].map((c, i) => person(k, c, { x: 40 + i * 80, y: 340, scale: 0.9, facing: i % 2 ? -1 : 1 }));
  aud.forEach((a) => faceOf(a).setAttribute('opacity', 0));
  const sp = [0, 1, 2].map(() => sparkle(k));
  const xf = path([[0.2, 60], [1.5, 205]]);
  return {
    update(t) {
      const w = walkTo(xf, t, 60, 1), chest = easeOut(seg(t, 1.6, 2.1)), fist = easeOut(seg(t, 2.6, 3.0));
      P(b, { x: w.x, walk: w.walk, armL: w.armL + 30 * chest, armR: w.m > 0.1 ? w.armR : lerp(30, 160, fist) + 4 * wobble(seg(t, 3.0, 3.6)) * 3,
        lean: w.lean - 7 * chest, squash: 1 + 0.03 * chest, mood: t > 2.5 ? 'grin' : 'smile', look: lerp(0.3, 0, chest), blink: blinkAt(t) });
      sp.forEach((s, i) => { const q = seg(t, 2.9 + i * 0.15, 3.4 + i * 0.15); tf(s, w.x - 50 + i * 50, FY - 130 - (i % 2) * 18, t * 90, Math.max(0.001, hump(q * 0.5 + 0.25) * easeOut(q) * 1.4)); });
      aud.forEach((a, i) => a.pose({ y: 340 + 2 * Math.sin(t * 3 + i), look: 0.2 * (i < 2 ? 1 : -1), armL: 8, armR: 8 }));
    }
  };
}
