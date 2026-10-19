// miss：まめが遠くの部屋で、大阪の友だちとの写真を見つめ、思い出して胸に抱く（例文 I miss my friends in Osaka.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';
import { hp, reach } from './dig.js';
import { P, blinkAt } from './run-after.js';
import { roomBg, cloud } from './look-over.js';
import { heart } from './weigh.js';

// 大阪の城のシルエット（原点＝石垣の下中央）
export function castle(k, parent, c = '#7F8CA3') {
  const g = k.g({}, parent), el = k.el;
  el('path', { d: 'M -26 0 L -20 -14 L 20 -14 L 26 0 Z', fill: '#A9B2C2' }, g);
  el('rect', { x: -14, y: -26, width: 28, height: 12, fill: '#fff', stroke: c, 'stroke-width': 1 }, g);
  el('path', { d: 'M -22 -24 Q 0 -32 22 -24 L 16 -30 L -16 -30 Z', fill: c }, g);
  el('rect', { x: -10, y: -38, width: 20, height: 9, fill: '#fff', stroke: c, 'stroke-width': 1 }, g);
  el('path', { d: 'M -17 -36 Q 0 -44 17 -36 L 11 -42 L -11 -42 Z', fill: c }, g);
  el('rect', { x: -6, y: -50, width: 12, height: 8, fill: '#fff', stroke: c, 'stroke-width': 1 }, g);
  el('path', { d: 'M -12 -48 Q 0 -56 12 -48 L 6 -56 L -6 -56 Z', fill: c }, g);
  return g;
}
// 小さな友だち3人（写真・思い出用）
function friends(k, parent, s = 1) {
  const g = k.g({}, parent);
  [[-16, k.pal.coral], [0, k.pal.blue], [16, k.pal.yellow]].forEach(([x, c]) => {
    k.el('rect', { x: x - 7 * s, y: -18 * s, width: 14 * s, height: 18 * s, rx: 7 * s, fill: c }, g);
    k.el('circle', { cx: x - 2.5 * s, cy: -12 * s, r: 1.2 * s, fill: k.pal.ink }, g);
    k.el('circle', { cx: x + 2.5 * s, cy: -12 * s, r: 1.2 * s, fill: k.pal.ink }, g);
  });
  return g;
}

export const meta = { duration: 4.4, beats: [[0, '写真を見る'], [1.5, '大阪の友だち'], [3.0, '会いたいな']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = roomBg(k, 'home', 240, 'evening');
  el('rect', { x: 0, y: 0, width: 400, height: 234, fill: '#F2E4D8', opacity: 0.4 });
  const S = 1.0;
  const me = k.buddy({ x: 250, y: FY, scale: S });
  // 写真立て
  const photo = g({});
  el('rect', { x: -22, y: -34, width: 44, height: 34, rx: 3, fill: pal.wood, stroke: pal.woodDark, 'stroke-width': 2 }, photo);
  el('rect', { x: -18, y: -30, width: 36, height: 26, fill: '#DDEFFA' }, photo);
  tf(castle(k, photo), 8, -4, 0, 0.42);
  tf(friends(k, photo, 0.55), -6, -4);
  // 思い出の雲（友だちが手を振る）
  const th = cloud(k, 120, 80, 1);
  tf(castle(k, th.g), 30, 18, 0, 0.75);
  const fg = friends(k, th.g, 1.3); tf(fg, -16, 22);
  const hearts = [0, 1].map(() => heart(k, k.root, pal.red));
  return {
    update(t) {
      const lift = easeInOut(seg(t, 0.2, 0.9)), hug = easeInOut(seg(t, 3.0, 3.6));
      P(me, { x: 250, lean: 6 * lift * (1 - hug), look: lerp(0.4, -0.2, hug), mood: t < 1.4 ? 'smile' : 'flat', blink: t > 3.4 ? 0.7 : blinkAt(t), squash: 1 - 0.03 * hug });
      // 両手で写真を持って見る → 胸に抱く
      const px = lerp(lerp(258, 296, lift), 266, hug), py = lerp(lerp(FY - 22, FY - 66, lift), FY - 30, hug);
      me.pose({ armR: reach(me, S, 'R', px + 6, py - 16), armL: reach(me, S, 'L', px - 14, py - 16) });
      tf(photo, px, py, 0, lerp(1, 0.9, hug), 1);
      th.show(seg(t, 1.3, 1.8), 110, 88);
      fg.setAttribute('transform', `translate(-16 ${(22 - 3 * Math.abs(Math.sin(t * 6))).toFixed(1)})`);
      hearts.forEach((h, i) => {
        const p = seg(t, 3.4 + i * 0.35, 4.3 + i * 0.35);
        tf(h, 290 + i * 14, FY - 100 - 34 * p, 0, Math.max(0.001, hump(p) * 1.1));
        h.setAttribute('opacity', p > 0 && p < 1 ? 1 : 0);
      });
    }
  };
}
