// drink up：まめがコップの牛乳を傾け、ごくごく飲んで空にする（例文 Drink up your milk before it gets warm.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';

export const meta = { duration: 4.4, beats: [[0, '牛乳入りコップ'], [1.53, 'ごくごく飲む'], [3.54, '飲み干した']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  el('rect', { x: 36, y: 44, width: 70, height: 60, rx: 6, fill: '#DDEFFA' });
  el('line', { x1: 71, y1: 44, x2: 71, y2: 104, stroke: '#fff', 'stroke-width': 4 });
  k.shadow(282, FY, 110, 7);
  el('rect', { x: 172, y: 188, width: 210, height: 9, rx: 3, fill: pal.wood });
  [[184, 197], [366, 197]].forEach(([x, y]) => el('rect', { x, y, width: 9, height: 39, rx: 2, fill: pal.woodDark }));
  // 牛乳パックとパン（食卓の小物）
  el('rect', { x: 322, y: 152, width: 24, height: 36, rx: 3, fill: '#fff', stroke: pal.blue, 'stroke-width': 2.5 });
  el('polygon', { points: '322,152 334,142 346,152', fill: '#E6EEF7', stroke: pal.blue, 'stroke-width': 2.5, 'stroke-linejoin': 'round' });
  el('rect', { x: 322, y: 166, width: 24, height: 10, fill: pal.blue });
  el('ellipse', { cx: 262, cy: 183, rx: 20, ry: 6, fill: '#F2C98B' });
  el('ellipse', { cx: 262, cy: 180, rx: 15, ry: 4, fill: '#F8DDB0' });

  const S = 1.2;
  const b = k.buddy({ x: 118, y: FY, scale: S });
  // 口のまわりの牛乳ひげ（体の座標系で顔に重ねる）
  const stache = el('path', { d: 'M -11 -45 Q -6 -50 0 -46 Q 6 -50 11 -45 Q 6 -43 0 -43.5 Q -6 -43 -11 -45 Z', fill: '#fff', stroke: '#DCE6F0', 'stroke-width': 1, opacity: 0 }, b.body);

  const glass = g({});
  const gp = 'M -10 -20 L 10 -20 L 8 20 Q 8 22 6 22 L -6 22 Q -8 22 -8 20 Z';
  el('path', { d: gp, fill: '#D3DFEB' }, glass);
  const gc = k.clip((c) => el('path', { d: gp }, c));
  const lg = g({ 'clip-path': gc }, glass);
  const lgi = g({}, lg);
  const milk = el('rect', { x: -30, y: 0, width: 60, height: 80, fill: '#fff' }, lgi);
  const milkTop = el('rect', { x: -30, y: 0, width: 60, height: 2, fill: '#DCE6F0' }, lgi);
  el('path', { d: gp, fill: 'none', stroke: '#9FB4C8', 'stroke-width': 2.4, 'stroke-linejoin': 'round' }, glass);
  el('rect', { x: -6, y: -14, width: 3, height: 22, rx: 1.5, fill: '#fff', opacity: 0.7 }, glass);

  return {
    update(t0) {
      const t = t0 * 1.0455;
      const grab = easeOut(seg(t, 0.3, 0.7));
      const toM = easeInOut(seg(t, 0.8, 1.45));
      const toT = easeInOut(seg(t, 3.0, 3.7));
      const rel = easeOut(seg(t, 3.7, 4.2));
      let a = lerp(12, 75, grab);
      a = lerp(a, -82, toM);
      a = lerp(a, 75, toT);
      a = lerp(a, 12, rel);
      const drinkP = seg(t, 1.45, 2.7);
      const tilt = 78 * easeInOut(seg(t, 1.2, 1.7)) * (1 - easeInOut(seg(t, 2.75, 3.1))) + 6 * Math.sin(Math.max(0, t - 1.7) * 9) * (t > 1.7 && t < 2.7 ? 1 : 0);
      const gulp = t > 1.6 && t < 2.75 ? Math.abs(Math.sin((t - 1.6) * 8)) : 0;
      b.pose({
        armR: a, armL: 8, lean: lerp(0, -3, toM) * (1 - toT), squash: 1 - 0.03 * gulp, look: 0.4,
        mood: t > 1.5 && t < 2.8 ? 'flat' : t > 3.5 ? 'grin' : 'smile', blink: t > 0.1 && t < 0.2 ? 1 : (t > 1.8 && t < 2.6 ? 1 : 0)
      });
      const h = b.handPos('R');
      // コップ：卓上 → 手に持つ → 卓上へ戻す
      const held = t > 0.5 && t < 3.9;
      const onTable = { x: 196, y: 168 };
      const hand = { x: h.x + lerp(8, 11, toM), y: h.y - 5 + 6 * toM };
      let pos = hand;
      if (t < 0.5) pos = onTable;
      else if (t > 3.7) pos = { x: lerp(hand.x, 196, easeOut(seg(t, 3.7, 3.95))), y: lerp(hand.y, 168, easeOut(seg(t, 3.7, 3.95))) };
      else if (t < 0.7) pos = { x: lerp(onTable.x, hand.x, easeOut(seg(t, 0.5, 0.7))), y: lerp(onTable.y, hand.y, easeOut(seg(t, 0.5, 0.7))) };
      tf(glass, pos.x, pos.y, -tilt);
      lgi.setAttribute('transform', `rotate(${tilt} 0 0)`);
      const f = lerp(0.85, 0, easeInOut(drinkP)) ;
      const top = 22 - 42 * f;
      k.set(milk, { y: top }); k.set(milkTop, { y: top });
      stache.setAttribute('opacity', t > 2.8 ? easeOut(seg(t, 2.8, 3.2)) : 0);
    }
  };
}
