// a win-win situation：りんごが余るまめと、魚が余る相手。握手して交換すると、2人とも欲しい物が手に入り大喜び（例文 This deal is a win-win situation for both of us.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';
import { P, reach, held, say, icon, popIn } from './in-common.js';

export const meta = { duration: 4.4, beats: [[0, '欲しい物が逆'], [1.6, '握手して交換'], [3.4, '2人とも得']] };

function crate(k, x, y, kind, n) {
  const g = k.g({});
  const items = [];
  for (let i = 0; i < n; i++) { const it = icon(k, kind, g); k.tf(it, x - 24 + (i % 4) * 16, y - 18 - Math.floor(i / 4) * 12, 0, 0.75); items.push(it); }
  k.el('rect', { x: x - 36, y: y - 16, width: 72, height: 22, rx: 3, fill: k.pal.wood, stroke: k.pal.woodDark, 'stroke-width': 2 }, g);
  return items;
}

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 240, mood: 'outdoor' });
  el('rect', { x: 0, y: FY - 6, width: 400, height: 6, fill: '#E3E8EE' });
  // 市場の屋台
  [[20, pal.coral], [270, pal.blue]].forEach(([x, c]) => { el('rect', { x, y: 60, width: 110, height: 16, rx: 4, fill: c }); el('rect', { x: x + 6, y: 76, width: 6, height: FY - 76, fill: pal.woodDark }); el('rect', { x: x + 98, y: 76, width: 6, height: FY - 76, fill: pal.woodDark }); });
  crate(k, 75, FY, 'apple', 8); crate(k, 325, FY, 'fish', 8);
  const A = k.buddy({ x: 140, y: FY, scale: 0.88 });
  const C = k.buddy({ x: 260, y: FY, scale: 0.88, facing: -1, color: pal.coral, dark: pal.coralDark });
  const wa = say(k, 40, 32, 1); icon(k, 'fish', wa.g);
  const wc = say(k, 40, 32, -1); icon(k, 'apple', wc.g);
  const ap = icon(k, 'apple'), fi = icon(k, 'fish');
  const ups = [0, 1].map(() => { const u = g({}); el('circle', { r: 12, fill: pal.green }, u); el('path', { d: 'M 0 6 L 0 -6 M -5 -1 L 0 -6 L 5 -1', stroke: '#fff', 'stroke-width': 3, fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, u); return u; });
  return {
    update(t) {
      // 欲しい物の吹き出し
      wa.show(seg(t, 0.2, 0.5) * (1 - seg(t, 1.4, 1.6)), 150, 108);
      wc.show(seg(t, 0.5, 0.8) * (1 - seg(t, 1.4, 1.6)), 250, 108);
      // 握手（1.6〜2.3）→交換（2.5〜3.2）
      const sh = t > 1.7 && t < 2.3 ? 4 * Math.sin((t - 1.7) * 18) : 0;
      const hs = easeInOut(seg(t, 1.5, 1.8)) * (1 - easeInOut(seg(t, 2.2, 2.5)));
      const ex = easeInOut(seg(t, 2.6, 3.1));
      const off = easeOut(seg(t, 2.4, 2.6)) * (1 - easeOut(seg(t, 3.1, 3.4)));
      const joy = easeOut(seg(t, 3.3, 3.7));
      const handY = 196 + sh;
      P(A, { look: 0.6, mood: t > 3.2 ? 'grin' : 'smile', lift: 6 * hump(seg(t, 3.4, 3.9)) });
      P(C, { look: 0.6, mood: t > 3.2 ? 'grin' : 'smile', lift: 6 * hump(seg(t, 3.5, 4.0)) });
      A.pose({ armR: hs > 0.01 ? lerp(8, reach(A, 0.88, 'R', 200, handY), hs) : lerp(8, 78, off), armL: lerp(8, 140, joy) });
      C.pose({ armR: hs > 0.01 ? lerp(8, reach(C, 0.88, 'R', 200, handY), hs) : lerp(8, 78, off), armL: lerp(8, 140, joy) });
      if (t > 3.3) { A.pose({ armR: lerp(78, 30, joy) }); C.pose({ armR: lerp(78, 30, joy) }); }
      const ha = held(k, A, 0.88, k.g({}), 'R'), hc = held(k, C, 0.88, k.g({}), 'R');
      // りんご：まめの手→相手の手、魚：相手の手→まめの手
      const vis = t > 2.4;
      tf(ap, lerp(ha.x, hc.x, ex), lerp(ha.y, hc.y, ex) - 8 - 14 * hump(ex), 0, vis ? 0.9 : 0.001);
      tf(fi, lerp(hc.x, ha.x, ex), lerp(hc.y, ha.y, ex) - 8 + 4 * hump(ex), 0, vis ? 0.9 : 0.001);
      tf(ups[0], 140, 116, 0, popIn(seg(t, 3.4, 3.7))); tf(ups[1], 260, 116, 0, popIn(seg(t, 3.5, 3.8)));
    }
  };
}
