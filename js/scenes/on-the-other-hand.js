// on the other hand：都会で、片方の手には「楽しい」（観覧車・音楽）、もう片方の手には「お金がかかる」（値札・小銭）を載せて比べる（例文 The city is fun. On the other hand, it's expensive.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';
import { P, blinkAt } from './run-after.js';
import { hp } from './dig.js';
import { coin, star } from './get-on-with.js';
import { popS } from './from-scratch.js';

export const meta = { duration: 4.4, beats: [[0, '都会は楽しい'], [1.9, '一方で'], [3.0, 'お金がかかる']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'evening' });
  // ビル街と観覧車
  [[10, 120, '#C9B8E8'], [60, 160, '#B9CBEA'], [300, 140, '#C9B8E8'], [350, 100, '#B9CBEA']].forEach(([x, h, c]) => {
    el('rect', { x, y: FY - h, width: 46, height: h, rx: 3, fill: c });
    for (let y = FY - h + 12; y < FY - 16; y += 20) el('rect', { x: x + 10, y, width: 26, height: 8, rx: 2, fill: '#FFF3C4', opacity: 0.8 });
  });
  const wheel = g({}); tf(wheel, 200, 92);
  el('circle', { r: 46, fill: 'none', stroke: '#E6D9F7', 'stroke-width': 4 }, wheel);
  const spokes = g({}, wheel);
  for (let i = 0; i < 8; i++) { const a = (i * Math.PI) / 4; el('line', { x1: 0, y1: 0, x2: Math.cos(a) * 46, y2: Math.sin(a) * 46, stroke: '#E6D9F7', 'stroke-width': 2 }, spokes); el('circle', { cx: Math.cos(a) * 46, cy: Math.sin(a) * 46, r: 6, fill: [pal.coral, pal.yellow, pal.blue, pal.green][i % 4] }, spokes); }
  el('path', { d: `M 200 92 L 176 ${FY} M 200 92 L 224 ${FY}`, stroke: '#D8CCEE', 'stroke-width': 5 });
  const b = k.buddy({ x: 200, y: FY, facing: 1 });
  // 左手の上：楽しい（星・音符）　右手の上：値札と小銭
  const fun = g({});
  star(k, fun, 10, pal.yellow); const s2 = g({}, fun); tf(s2, 18, -10); star(k, s2, 6, pal.coral);
  el('path', { d: 'M -18 -8 L -18 -26 L -8 -28 L -8 -12', stroke: pal.violet, 'stroke-width': 3, fill: 'none' }, fun);
  el('circle', { cx: -21, cy: -8, r: 4, fill: pal.violet }, fun); el('circle', { cx: -11, cy: -12, r: 4, fill: pal.violet }, fun);
  const cost = g({});
  el('path', { d: 'M -16 -12 L 10 -12 L 18 0 L 10 12 L -16 12 Z', fill: '#fff', stroke: pal.red, 'stroke-width': 2.5 }, cost);
  el('circle', { cx: 10, cy: 0, r: 2.5, fill: pal.red }, cost);
  k.text(-4, 1, '¥', { 'font-size': 15, fill: pal.red }, cost);
  const coins = [0, 1, 2].map(() => coin(k, null, 7));
  return {
    update(t) {
      tf(spokes, 0, 0, t * 20);
      const L = easeOut(seg(t, 0.3, 0.7)), R = easeOut(seg(t, 1.9, 2.3));
      const tilt = lerp(0, 1, easeInOut(seg(t, 2.3, 3.0)));
      P(b, { x: 200, facing: 1, armL: lerp(8, 95, L) + 10 * tilt, armR: lerp(8, 95, R) - 14 * tilt, look: t < 1.9 ? -0.8 : 0.8, mood: t < 1.9 ? 'grin' : t < 2.6 ? 'flat' : 'sad', lean: lerp(0, 0, 0), blink: blinkAt(t) });
      b.body.children[3].setAttribute('transform', `translate(${(t < 1.9 ? -5 : 5).toFixed(2)} -2)`);
      const hl = hp(b, 1, 'L'), hr = hp(b, 1, 'R');
      tf(fun, hl.x, hl.y - 22, 0, popS(seg(t, 0.6, 1.0)));
      tf(cost, hr.x, hr.y - 24, 8 * Math.sin(t * 3) * R, popS(seg(t, 2.2, 2.6)));
      coins.forEach((c, i) => { const q = easeOut(seg(t, 2.7 + i * 0.25, 3.0 + i * 0.25)); tf(c, hr.x + 22, hr.y - 2 - i * 5, 0, popS(q)); c.setAttribute('opacity', q > 0 ? 1 : 0); });
    }
  };
}
