// step down：社長が演壇で一礼し、記章を外して壇から降りる（例文 The president will step down next month.）
import { seg, lerp, easeInOut, easeOut, hump, wobble } from '../ease.js';
import { path } from './queue-up.js';
import { gait } from './weigh.js';

export const meta = { duration: 4.6, beats: [[0, '壇上の社長'], [1.8, '記章を外す'], [4.0, '壇から降りた']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  el('rect', { x: 30, y: 30, width: 340, height: 120, rx: 4, fill: '#F3E3E0' });
  [40, 330].forEach((x) => el('rect', { x, y: 30, width: 30, height: 140, fill: pal.coralDark, opacity: 0.7 }));
  // カレンダー：来月に印
  const cal = g({}); tf(cal, 200, 74);
  [[-30, '#fff', 0.6], [10, '#fff', 1]].forEach(([x, c, o]) => { el('rect', { x: x - 16, y: -18, width: 36, height: 38, rx: 3, fill: c, stroke: pal.line, 'stroke-width': 2, opacity: o }, cal); el('rect', { x: x - 16, y: -18, width: 36, height: 9, rx: 3, fill: pal.blue, opacity: o }, cal); });
  el('circle', { cx: 12, cy: 6, r: 9, fill: 'none', stroke: pal.red, 'stroke-width': 2.5 }, cal);
  el('path', { d: 'M -10 6 L 0 6 M -4 2 L 0 6 L -4 10', stroke: pal.ink, 'stroke-width': 2, fill: 'none', 'stroke-linecap': 'round' }, cal);
  // 壇と階段（右）
  const TOP = FY - 44;
  el('rect', { x: 70, y: TOP, width: 190, height: 44, fill: pal.wood });
  el('rect', { x: 70, y: TOP, width: 190, height: 5, fill: pal.woodDark });
  [[260, 30], [290, 15]].forEach(([x, h], i) => el('rect', { x, y: FY - h, width: 30, height: h, fill: i ? pal.wood : '#DDBB8E' }));
  const b = k.buddy({ x: 150, y: TOP, scale: 0.85 });
  const badge = g({});
  el('circle', { r: 8, fill: pal.yellow, stroke: pal.yellowDark, 'stroke-width': 2 }, badge);
  el('path', { d: 'M -5 6 L -8 16 L -2 12 L 0 18 M 5 6 L 8 16 L 2 12', fill: pal.red }, badge);
  // 演壇（手前）
  el('path', { d: `M 92 ${TOP} L 98 ${TOP - 52} L 136 ${TOP - 52} L 142 ${TOP} Z`, fill: pal.woodDark });
  el('rect', { x: 92, y: TOP - 58, width: 50, height: 8, rx: 3, fill: '#A88A60' });
  // 足場の高さ：x に応じた段
  const ground = (x) => (x < 262 ? TOP : x < 292 ? FY - 30 : x < 320 ? FY - 15 : FY);
  const xf = path([[2.4, 150], [4.0, 350]]);
  return {
    update(t) {
      const bow = hump(seg(t, 0.4, 1.3));
      const p = gait(xf, t, 150);
      // 段を降りるたびに体を下へ：高さはなめらかにつなぐ
      const gy = [ground(p.x - 6), ground(p.x + 6)].reduce((a, c) => a + c) / 2;
      const take = easeOut(seg(t, 1.6, 2.0)), put = easeInOut(seg(t, 2.0, 2.4));
      b.pose({ x: p.x, y: gy, walk: p.walk, armL: p.armL, lean: 20 * bow + p.lean, armR: t < 1.6 ? p.armR : t < 2.4 ? lerp(10, 70, take) * (1 - put) + 70 * put : p.armR, look: t < 2.4 ? -0.2 : 0.4, mood: t > 3.8 ? 'smile' : 'flat' });
      // 記章：胸 → 手 → 演壇の上
      const chest = { x: p.x + 8 * 0.85, y: gy - 36 };
      const lect = { x: 117, y: TOP - 62 };
      const hand = { x: p.x + 50 * 0.85 * Math.sin(b.state.armR * Math.PI / 180), y: gy - (56 - 26 * Math.cos(b.state.armR * Math.PI / 180)) * 0.85 };
      let bx = chest.x, by = chest.y;
      if (t > 1.6) { bx = lerp(chest.x, hand.x, take); by = lerp(chest.y, hand.y, take); }
      if (t > 2.0) { bx = lerp(hand.x, lect.x, put); by = lerp(hand.y, lect.y, put) - 14 * hump(put); }
      tf(badge, bx, by + 2 * wobble(seg(t, 2.4, 2.9), 2, 6), 0, 0.8);
    }
  };
}
