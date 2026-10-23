// passenger：ホームで乗客たちが電車を待つ。まめは時計を見て線路の先をのぞき、最後に電車が入ってくる（例文 The passengers waited for the train.）
import { seg, lerp, easeInOut, easeOut, hump, clamp } from '../ease.js';
import { CO, BL, hp, P, blinkAt, wear } from './member.js';
import { bagProp } from './bag.js';
import { suitcase } from './vehicle.js';

export const meta = { duration: 4.4, beats: [[0, 'ホームで待つ'], [1.2, 'まだかな'], [3.2, '電車が来た']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 0.9, FY = 246;
  k.backdrop({ floorY: FY });
  el('rect', { x: 0, y: 0, width: 400, height: 26, fill: '#9AA7B8' });
  [70, 330].forEach((x) => el('rect', { x: x - 4, y: 26, width: 8, height: 160, fill: '#B5C0CE' }));
  // 線路（奥）
  el('rect', { x: 0, y: 178, width: 400, height: 20, fill: '#B8AFA4' });
  el('rect', { x: 0, y: 186, width: 400, height: 3, fill: '#8C8378' });
  // 電車（右から入る）
  const tr = g({});
  el('path', { d: 'M 0 -78 Q 0 -96 22 -96 L 420 -96 L 420 0 L 0 0 Z', fill: '#F3F5F8', stroke: '#C9D1DC', 'stroke-width': 2 }, tr);
  el('rect', { x: 0, y: -34, width: 420, height: 8, fill: pal.green }, tr);
  el('path', { d: 'M 4 -74 Q 6 -86 22 -86 L 30 -86 L 30 -54 L 4 -54 Z', fill: '#2B3446' }, tr);
  for (let i = 0; i < 6; i++) el('rect', { x: 50 + i * 60, y: -82, width: 38, height: 30, rx: 4, fill: '#BFDDF2' }, tr);
  el('circle', { cx: 10, cy: -18, r: 4, fill: pal.yellow }, tr);
  // ホーム（手前）
  el('rect', { x: 0, y: 196, width: 400, height: 104, fill: '#D7DCE3' });
  el('rect', { x: 0, y: 196, width: 400, height: 6, fill: '#C3C9D2' });
  for (let x = 6; x < 400; x += 22) el('rect', { x, y: 206, width: 16, height: 6, rx: 1, fill: pal.yellow });
  el('rect', { x: 150, y: 34, width: 100, height: 26, rx: 4, fill: '#2B3446' });
  k.text(200, 47, 'TRAIN  2', { 'font-size': 12, fill: '#fff' });
  el('line', { x1: 170, y1: 26, x2: 170, y2: 34, stroke: pal.sub, 'stroke-width': 2 }); el('line', { x1: 230, y1: 26, x2: 230, y2: 34, stroke: pal.sub, 'stroke-width': 2 });
  const p1 = k.buddy({ x: 70, y: FY, scale: 0.85, facing: 1, ...CO(k) });
  const cs = suitcase(k, pal.violet, '#7F63D6'); 
  const p2 = k.buddy({ x: 300, y: FY, scale: 0.8, facing: 1, ...BL(k) });
  const b = k.buddy({ x: 190, y: FY, scale: S });
  const bag = bagProp(k, k.root, '#E86F57', '#C9553F', 26, 24);
  const watch = g({}); el('circle', { r: 9, fill: '#fff', stroke: pal.ink, 'stroke-width': 2.5 }, watch); const hand = el('line', { x1: 0, y1: 0, x2: 0, y2: -6, stroke: pal.ink, 'stroke-width': 2 }, watch);
  return {
    update(t) {
      const chk = hump(seg(t, 0.6, 1.9)), peek = easeInOut(seg(t, 2.0, 2.5));
      P(b, { armL: 16, armR: 8 + 92 * chk, lean: 6 * peek - 3 * chk, look: chk > 0.3 ? 0.2 : lerp(0, 1, peek), blink: blinkAt(t), mood: t > 3.4 ? 'open' : 'flat', squash: 1 + 0.03 * Math.sin(t * 2.4) * (1 - peek) });
      const hr = hp(b, S, 'R', 22); tf(watch, hr.x, hr.y - 6, 0, sc(chk));
      k.set(hand, { transform: `rotate(${t * 60})` });
      const hl = hp(b, S, 'L', 28); tf(bag, hl.x, hl.y - 2, 0, S);
      P(p1, { armR: 30, blink: blinkAt(t, 1), look: lerp(0.3, 1, peek), mood: 'flat', lean: 4 * peek });
      const h1 = hp(p1, 0.85, 'R', 28); tf(cs, h1.x, h1.y, 0, 0.85);
      P(p2, { armR: 8, armL: 8 + 8 * Math.sin(t * 3), blink: blinkAt(t, 1.7), look: lerp(-0.2, 1, peek), mood: t > 3.4 ? 'open' : 'flat' });
      const q = easeOut(seg(t, 2.6, 4.2));
      tf(tr, lerp(440, 10, q), 196);
    }
  };
}
const sc = (p) => Math.max(0.001, p);
