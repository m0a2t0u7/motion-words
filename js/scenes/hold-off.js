// hold off：決定の判を押そうとする相手に「待って」と手で止め、判を置いて、カレンダーの1週間後に印を付ける（例文 Let's hold off on the decision for a week.）
import { seg, lerp, easeInOut, easeOut, backOut, hump } from '../ease.js';
import { hp, reach, room } from './dig.js';
import { drawOn } from './work-on.js';

export const meta = { duration: 4.6, beats: [[0, '決めようとする'], [1.4, '待って'], [3.4, '1週間後に']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const R = room(k);
  // カレンダー（壁）
  el('rect', { x: 150, y: 34, width: 112, height: 96, rx: 5, fill: '#fff', stroke: pal.line, 'stroke-width': 2 });
  el('rect', { x: 150, y: 34, width: 112, height: 18, rx: 5, fill: pal.red });
  const cx = (c) => 160 + c * 15.5, cy = (r) => 64 + r * 20;
  for (let r = 0; r < 4; r++) for (let c = 0; c < 7; c++) el('rect', { x: cx(c) - 5, y: cy(r) - 5, width: 10, height: 10, rx: 2, fill: r === 1 && c === 2 ? pal.yellow : '#E3E8EE' });
  const ring = el('circle', { cx: cx(2), cy: cy(2), r: 9, stroke: pal.blue, 'stroke-width': 3, fill: 'none' });
  const rOn = drawOn(ring);
  const arr = el('path', { d: `M ${cx(2) + 8} ${cy(1)} Q ${cx(2) + 22} ${cy(1) + 10} ${cx(2) + 10} ${cy(2) - 4}`, stroke: pal.blue, 'stroke-width': 2.5, fill: 'none' });
  const aOn = drawOn(arr);
  const S = 1.15;
  const C = k.buddy({ x: 300, y: 230, scale: S, facing: -1, color: pal.coral, dark: pal.coralDark });
  const A = k.buddy({ x: 92, y: 230, scale: S });
  R.front();
  // 書類（カウンター上）と判
  const TY = 196;
  el('rect', { x: 176, y: TY - 3, width: 52, height: 3, fill: '#fff', stroke: pal.line, 'stroke-width': 1 });
  k.shadow(202, TY + 1, 28, 2);
  const stamp = g({});
  el('rect', { x: -6, y: -26, width: 12, height: 18, rx: 4, fill: pal.woodDark }, stamp);
  el('rect', { x: -10, y: -8, width: 20, height: 8, rx: 2, fill: pal.red }, stamp);
  const ssh = k.shadow(0, TY + 1, 10, 2);
  const palm = g({}); el('circle', { r: 8, fill: pal.mint, stroke: pal.mintDark, 'stroke-width': 2.5 }, palm);
  return {
    update(t) {
      // 相手：判を持ち上げ書類の上へ → 止められて → 横に置く
      const up = easeInOut(seg(t, 0.3, 1.0)), stop = easeOut(seg(t, 1.3, 1.6)), away = easeInOut(seg(t, 2.2, 2.9));
      let sx = lerp(lerp(264, 202, up), 270, away), sy = TY - lerp(0, 46, hump(seg(t, 0.3, 1.0)) * 0.6 + up * 0.4) - 18 * stop * (1 - away);
      if (away >= 1) sy = TY;
      sy = Math.min(TY, sy + (away > 0 ? lerp(0, TY - sy, away) : 0));
      C.pose({ lean: 8 * up - 6 * stop * (1 - away), look: t > 1.3 && t < 2.2 ? 0.8 : 0.6, mood: t > 1.4 && t < 2.3 ? 'open' : t > 3.4 ? 'grin' : 'flat', armL: 10 });
      C.pose({ armR: reach(C, S, 'R', sx, sy - 24) });
      const h = hp(C, S, 'R');
      tf(stamp, h.x, h.y + 24 - 2);
      k.set(ssh, { cx: h.x, opacity: 0.4 + 0.6 * (h.y + 22 > TY - 6 ? 1 : 0.4) });
      // まめ：手のひらを前に出して「待って」→ カレンダーを指す
      const hold = easeOut(seg(t, 1.1, 1.4)) * (1 - easeInOut(seg(t, 2.4, 2.8)));
      const cal = easeInOut(seg(t, 2.8, 3.2));
      A.pose({ lean: 6 * hold, look: cal > 0.5 ? -0.2 : 0.7, mood: hold > 0.5 ? 'flat' : 'smile', armL: 10, armR: lerp(lerp(15, 92, hold), 150, cal) });
      const ha = hp(A, S, 'R');
      tf(palm, ha.x, ha.y); palm.setAttribute('opacity', hold > 0.2 ? 1 : 0);
      aOn(easeInOut(seg(t, 3.2, 3.6))); rOn(easeOut(seg(t, 3.6, 4.1)));
    }
  };
}
