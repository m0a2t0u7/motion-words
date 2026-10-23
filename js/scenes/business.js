// business：まめが自分の小さなパン屋の屋台に看板をかけて開店し、最初のお客さんにパンを売って代金を受け取る（例文 He started his own business.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';
import { P, blinkAt, hp, hold, aim, walkTo, path, person, streetBg, coin, sparkle } from './confused.js';

export const meta = { duration: 4.4, beats: [[0.0, '看板をかける'], [1.53, '開店！'], [3.06, '初めてのお客']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 1;
  const FY = streetBg(k);
  // 屋台（日よけ・台）
  const SX = 80, SW = 170, TOP = FY - 56;
  el('rect', { x: SX, y: FY - 160, width: 8, height: 160, fill: pal.woodDark });
  el('rect', { x: SX + SW - 8, y: FY - 160, width: 8, height: 160, fill: pal.woodDark });
  for (let i = 0; i < 6; i++) el('path', { d: `M ${SX - 6 + i * 30.3} ${FY - 166} h 30.3 v 22 q -15 12 -30.3 0 Z`, fill: i % 2 ? '#fff' : '#5FB8A6' });
  const b = k.buddy({ x: 170, y: FY, scale: S });
  el('rect', { x: SX - 4, y: TOP, width: SW + 8, height: 10, rx: 3, fill: pal.wood });
  el('rect', { x: SX + 4, y: TOP + 10, width: SW - 8, height: FY - TOP - 10, fill: '#E9C99E' });
  // パン
  const breads = [100, 128, 222].map((x) => { el('ellipse', { cx: x, cy: TOP - 6, rx: 12, ry: 7, fill: '#E3A857' }); el('path', { d: `M ${x - 6} ${TOP - 9} l 3 4 M ${x} ${TOP - 10} l 3 4 M ${x + 6} ${TOP - 9} l 3 4`, stroke: '#C98A3A', 'stroke-width': 1.5 }); });
  void breads;
  // 看板（屋根の上に持ち上げてかける）
  const sign = g({});
  el('rect', { x: -44, y: -16, width: 88, height: 30, rx: 6, fill: '#fff', stroke: pal.ink, 'stroke-width': 2.5 }, sign);
  el('ellipse', { cx: -22, cy: -1, rx: 11, ry: 7, fill: '#E3A857' }, sign);
  k.text(14, 0, 'OPEN', { 'font-size': 14, fill: pal.mintDark }, sign);
  const cust = person(k, 'coral', { x: 460, y: FY, scale: 0.95, facing: -1 });
  const bread = g({}); el('ellipse', { cx: 0, cy: 0, rx: 11, ry: 6.5, fill: '#E3A857' }, bread);
  const cn = coin(k, undefined, 6.5), sp = [0, 1, 2].map(() => sparkle(k));
  const cx = path([[1.8, 460], [3.0, 300]]);
  return {
    update(t) {
      t *= 4.6 / 4.4; // 4.4 秒に収める
      const lift = easeInOut(seg(t, 0.3, 1.3)), hang = seg(t, 1.3, 1.5);
      const sx = 165, sy = lerp(FY - 70, FY - 196, lift) + 3 * hump(hang);
      tf(sign, sx, sy, -4 * (1 - lift), 1);
      P(b, { x: 170, look: 0.5, lean: -4 * lift, mood: t > 1.4 ? 'grin' : 'smile', blink: blinkAt(t), armL: 10, armR: 10 });
      if (t < 1.5) { aim(b, S, 'R', sx + 30, sy + 16); aim(b, S, 'L', sx - 30, sy + 16); }
      else if (t < 2.0) b.pose({ armL: lerp(150, 10, seg(t, 1.5, 2.0)), armR: lerp(150, 10, seg(t, 1.5, 2.0)) });
      // 客：来て、パンを受け取り、硬貨を払う
      const w = walkTo(cx, t, 460, -1);
      P(cust, { x: w.x, walk: w.walk, facing: -1, armL: w.armL, armR: w.armR, lean: w.lean, mood: 'grin', look: 0.5, blink: blinkAt(t, 1) });
      const give = seg(t, 3.0, 3.5), pay = seg(t, 3.5, 4.0);
      if (t > 2.9) { aim(b, S, 'R', 254, TOP - 30); aim(cust, 0.95, 'R', 268, TOP - 30); }
      const bh = give < 1 ? hp(b, S, 'R') : hp(cust, 0.95, 'R');
      tf(bread, bh.x, bh.y - 6, 0, t > 2.9 ? 1 : 0.001);
      const ch = pay < 0.5 ? hp(cust, 0.95, 'R') : hp(b, S, 'R');
      tf(cn, ch.x, ch.y - 12, 0, pay > 0 ? 1 : 0.001);
      if (t > 4.0) b.pose({ armR: lerp(60, 150, easeOut(seg(t, 4.0, 4.3))) });
      sp.forEach((s, i) => { const q = seg(t, 1.4 + i * 0.12, 2.2 + i * 0.12); tf(s, sx - 60 + i * 60, sy - 30, 0, q > 0 ? hump(q) * 1.5 : 0.001); });
    }
  };
}
