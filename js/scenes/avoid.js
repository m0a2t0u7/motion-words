// avoid：甘いドーナツに手を伸ばしかけて止め、皿を押しやってりんごを取る（例文 I try to avoid eating too much sugar.）
import { seg, lerp, easeInOut, easeOut, wobble, hump } from '../ease.js';
import { room, reach, hp } from './dig.js';
import { P, blinkAt } from './run-after.js';
import { food } from './diet.js';

// ドーナツ（原点＝中心）
export function donut(k, parent, icing = '#F7A1C4') {
  const g = k.g({}, parent);
  k.el('circle', { r: 13, fill: '#E3B77E' }, g);
  k.el('path', { d: 'M -12 -2 Q -12 -12 0 -12 Q 12 -12 12 -2 Q 6 2 0 -1 Q -6 3 -12 -2 Z', fill: icing }, g);
  k.el('circle', { r: 4, fill: '#F1EBE2' }, g);
  [[-6, -7, '#fff'], [3, -9, k.pal.yellow], [8, -5, k.pal.blue]].forEach(([x, y, c]) => k.el('rect', { x, y, width: 3.5, height: 1.6, rx: 0.8, fill: c }, g));
  return g;
}

export const meta = { duration: 4.4, beats: [[0, '甘い物'], [1.3, '手を止める'], [2.6, 'りんごにする']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const R = room(k, 'indoor');
  el('rect', { x: 250, y: 40, width: 90, height: 66, rx: 6, fill: '#DDEFFA', stroke: '#fff', 'stroke-width': 5 });
  const S = 1.05;
  const me = k.buddy({ x: 130, y: 236, scale: S });
  R.front();
  // ドーナツの皿（まめの手で押されて奥へ）
  const plate = g({});
  k.shadow(0, 2, 40, 4, plate);
  el('ellipse', { cx: 0, cy: 0, rx: 40, ry: 7, fill: '#fff', stroke: pal.line, 'stroke-width': 2 }, plate);
  tf(donut(k, plate), -18, -12); tf(donut(k, plate, '#8A5A3C'), 16, -12); tf(donut(k, plate, '#F7A1C4'), 0, -30);
  // 角砂糖
  [[-40, 0], [-34, 0], [-37, -6]].forEach(([x, y]) => el('rect', { x: x - 3, y: y - 8, width: 7, height: 7, rx: 1, fill: '#fff', stroke: pal.line, 'stroke-width': 1.2 }, plate));
  const ap = g({}); const apple = food(k, 'apple', ap);
  const bite = el('circle', { cx: 9, cy: -2, r: 0, fill: '#F1EBE2' }, ap);
  const AP = { x: 196, y: 190 };
  return {
    update(t) {
      const toward = easeInOut(seg(t, 0.2, 0.9));
      const shake = seg(t, 1.2, 2.0);
      const push = easeInOut(seg(t, 2.0, 2.6));
      const px = 255 + 85 * push;
      tf(plate, px, 196);
      let armR = 8, armL = 8, look = 0.6 * Math.sin(shake * Math.PI * 4) * (shake > 0 && shake < 1 ? 1 : 0) + 0.4;
      P(me, { x: 130, lean: 8 * toward - 6 * hump(seg(t, 1.0, 1.4)) + 6 * push * (1 - seg(t, 2.6, 3.0)), look, mood: t < 1.0 ? 'grin' : t < 2.6 ? 'flat' : 'smile', blink: blinkAt(t) });
      // 手を伸ばす → 止める → 皿を押す → りんごを取る
      const near = reach(me, S, 'R', 238, 172), stop = reach(me, S, 'R', 210, 150);
      if (t < 1.0) armR = lerp(8, near, toward);
      else if (t < 2.0) armR = lerp(near, stop, easeOut(seg(t, 1.0, 1.3))) + Math.sin(t * 40) * 1.5 * (1 - seg(t, 1.3, 1.6));
      else if (t < 2.7) armR = lerp(stop, reach(me, S, 'R', px - 40, 186), easeOut(seg(t, 2.0, 2.2)));
      else armR = lerp(reach(me, S, 'R', px - 40, 186), reach(me, S, 'R', AP.x, AP.y - 6), easeInOut(seg(t, 2.7, 3.1)));
      const lift = easeInOut(seg(t, 3.2, 3.7));
      if (t > 3.1) armR = lerp(armR, 150, lift);
      me.pose({ armR, armL });
      if (t > 3.1) { const h = hp(me, S, 'R'); tf(ap, lerp(AP.x, h.x + 4, lift), lerp(AP.y, h.y - 6, lift)); }
      else tf(ap, AP.x, AP.y);
      const b = seg(t, 3.85, 4.0);
      bite.setAttribute('r', 5 * b);
      if (t > 3.85) me.pose({ mood: Math.sin(t * 24) > 0 ? 'open' : 'smile' });
    }
  };
}
