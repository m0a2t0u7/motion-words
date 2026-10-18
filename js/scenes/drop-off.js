// drop off：運転する相手の車が駅前に止まり、まめが降りる。車はまめを置いて走り去る（例文 Can you drop me off at the station?）
import { seg, lerp, easeInOut, easeOut, easeIn, hump } from '../ease.js';
import { P, blinkAt, walkTo, car } from './run-after.js';

export const meta = { duration: 4.6, beats: [[0, '車で駅へ'], [1.7, '降ろしてもらう'], [3.6, '車は去る']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236 });
  // 駅舎
  el('rect', { x: 40, y: 84, width: 200, height: 140, rx: 4, fill: '#F3E6DC' });
  el('path', { d: 'M 28 90 L 140 52 L 252 90 Z', fill: pal.blueDark });
  el('rect', { x: 92, y: 98, width: 96, height: 22, rx: 4, fill: '#fff' });
  k.text(140, 109.5, 'STATION', { 'font-size': 13, fill: pal.blueDark });
  clockless(k, el, pal);
  el('rect', { x: 0, y: FY - 12, width: 400, height: 12, fill: '#E3E8EE' });
  el('rect', { x: 0, y: FY, width: 400, height: 64, fill: '#C9CED6' });
  for (let x = 10; x < 400; x += 50) el('rect', { x, y: FY + 34, width: 26, height: 5, rx: 2, fill: '#fff' });
  const S = 0.78;
  const me = k.buddy({ x: 0, y: FY - 10, scale: S, facing: -1 });
  const cr = car(k, pal.coral, pal.coralDark);
  // 車の窓の中の顔（運転手＝相手、助手席＝まめ）
  const drv = el('circle', { cx: 24, cy: -48, r: 8, fill: pal.coral, stroke: pal.coralDark, 'stroke-width': 2 }, null);
  const pas = el('circle', { cx: -8, cy: -48, r: 8, fill: pal.mint, stroke: pal.mintDark, 'stroke-width': 2 }, null);
  cr.body.insertBefore(pas, cr.body.children[1]); cr.body.insertBefore(drv, cr.body.children[1]);
  const door = el('path', { d: 'M -28 -44 L 8 -44 L 8 -14 L -28 -14 Z', fill: pal.coral, stroke: pal.coralDark, 'stroke-width': 2 });
  const cx = (t) => t < 2.8 ? lerp(-90, 200, easeOut(seg(t, 0, 1.6))) : lerp(200, 520, easeIn(seg(t, 2.9, 4.2)));
  const mx = (t) => lerp(196, 120, easeInOut(seg(t, 2.6, 3.6)));
  return {
    update(t) {
      const x = cx(t), v = cx(t + 0.02) - cx(t - 0.02);
      cr.set(x, x * 1.8, FY + 22, (Math.abs(v) < 0.2 && t > 1.5 && t < 1.9) ? 1.5 * hump(seg(t, 1.5, 1.9)) : 0);
      // ドアを開けて降りる（車内にいる間は窓の顔だけ）
      const open = hump(seg(t, 1.8, 2.7));
      door.setAttribute('transform', `translate(${x} ${FY + 22}) translate(-28 0) scale(${(1 - 0.85 * open).toFixed(3)} 1) translate(28 0)`);
      door.setAttribute('opacity', t > 1.7 && t < 2.8 ? 1 : 0);
      const out = t > 2.15;
      pas.setAttribute('opacity', out ? 0 : 1);
      me.g.setAttribute('visibility', out ? 'visible' : 'hidden');
      const wk = walkTo(mx, t, 196, 1);
      const wave = easeInOut(seg(t, 3.0, 3.3));
      P(me, { ...wk, y: lerp(FY + 16, FY - 8, easeOut(seg(t, 2.15, 2.6))), facing: t > 2.9 ? 1 : -1, armR: t > 3.0 ? 150 + 18 * Math.sin(t * 12) * wave : wk.armR, look: 0.6, mood: 'grin', blink: blinkAt(t) });
      drv.setAttribute('cx', 24);
    }
  };
}
function clockless(k, el, pal) {
  el('rect', { x: 64, y: 140, width: 50, height: 84, rx: 3, fill: '#CFE9F7' });
  el('rect', { x: 166, y: 140, width: 50, height: 84, rx: 3, fill: '#CFE9F7' });
  el('rect', { x: 120, y: 132, width: 40, height: 92, rx: 3, fill: '#8F9BB0' });
}
