// bring out：棚の奥から古いアルバムを取り出して見せる（例文 He brought out an old photo album.）
import { seg, lerp, easeInOut, easeOut, backOut, wobble, hump } from '../ease.js';

export const meta = { duration: 4.0, beats: [[0, '棚の中にある'], [1.2, '取り出す'], [2.6, '見せる']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 252, mood: 'indoor' });
  // 棚（内側が暗い）
  el('rect', { x: 262, y: 70, width: 120, height: 182, rx: 6, fill: pal.woodDark });
  el('rect', { x: 270, y: 78, width: 104, height: 166, rx: 3, fill: '#8F7455' });
  el('rect', { x: 270, y: 150, width: 104, height: 6, fill: pal.woodDark });
  // 他の本
  [[278, pal.green], [292, pal.coral], [304, pal.blue]].forEach(([x, c], i) => el('rect', { x, y: 112 - i * 2, width: 12, height: 38 + i * 2, rx: 2, fill: c }));
  const b = k.buddy({ x: 150, y: FY, scale: 1.1 });
  const album = g({});
  el('rect', { x: -24, y: -32, width: 48, height: 64, rx: 5, fill: pal.coral, stroke: pal.coralDark, 'stroke-width': 3 }, album);
  el('rect', { x: -16, y: -22, width: 32, height: 26, rx: 3, fill: '#fff' }, album);
  el('path', { d: 'M -14 2 L -6 -10 L 0 -2 L 6 -12 L 14 2 Z', fill: pal.green }, album);
  el('circle', { cx: 8, cy: -14, r: 3, fill: pal.yellow }, album);
  el('rect', { x: -16, y: 10, width: 32, height: 5, rx: 2, fill: '#fff', opacity: 0.8 }, album);
  const dust = [0, 1, 2].map((i) => el('circle', { r: 3 + i, fill: '#fff', opacity: 0 }));
  const sp = [0, 1, 2].map(() => el('path', { d: 'M 0 -8 L 2 -2 L 8 0 L 2 2 L 0 8 L -2 2 L -8 0 L -2 -2 Z', fill: pal.yellow }));
  return {
    update(t) {
      const reach = easeOut(seg(t, 0.4, 1.1));
      const pull = easeInOut(seg(t, 1.1, 2.1));
      const show = easeOut(seg(t, 2.2, 2.9));
      const bx = lerp(150, 168, pull) ;
      // アルバム位置：棚 → まめの前
      let ax = lerp(300, 232, pull), ay = lerp(130, 160, pull);
      b.pose({ x: bx, armR: lerp(8, 82, reach) , armL: 8, look: 0.9, lean: lerp(0, 6, pull) * (1 - show), mood: t > 2.4 ? 'grin' : 'smile' });
      const h = b.handPos('R');
      if (t > 1.1) { ax = lerp(ax, h.x + 22, seg(t, 1.1, 1.2)); ay = lerp(ay, h.y - 4, seg(t, 1.1, 1.2)); }
      if (t > 2.2) { ax = lerp(h.x + 22, 218, show); ay = lerp(h.y - 4, 118, show); }
      const arm = t < 1.1 ? 0 : 1;
      b.pose({ armR: t < 1.1 ? lerp(8, 82, reach) : t < 2.2 ? 82 : lerp(82, 110, show), armL: t > 2.2 ? lerp(8, 100, show) : 8 });
      const h2 = b.handPos('R');
      ax = t < 1.1 ? 300 : t < 2.2 ? h2.x + 22 : lerp(h2.x + 22, 232, show) ;
      ay = t < 1.1 ? 128 : t < 2.2 ? h2.y - 4 : lerp(h2.y - 4, 130, show);
      if (t >= 1.1 && t < 2.2) { ax = lerp(300, h2.x + 22, pull); ay = lerp(128, h2.y - 4, pull); }
      tf(album, ax, ay, lerp(0, 0, show), 1 + 0.2 * show, 1 + 0.2 * show);
      dust.forEach((d, i) => { const p = seg(t, 1.2 + i * 0.08, 1.9 + i * 0.08); tf(d, 270 - 14 * p - i * 8, 120 + 20 * p, 0, 1, 1); d.setAttribute('opacity', 0.9 * hump(p)); });
      sp.forEach((s, i) => { const p = seg(t, 2.8 + i * 0.1, 3.4 + i * 0.1); tf(s, ax - 42 + i * 42, ay - 52 - 6 * p, 0, hump(p), hump(p)); });
    }
  };
}
