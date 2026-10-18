// join：二枚の木片の端に接着剤を塗り、まめが片方を押し寄せてぴたりとつなぐ（例文 Join the two pieces with glue.）
import { seg, lerp, easeInOut, easeOut, backOut, wobble, hump } from '../ease.js';
import { hp, reach } from './dig.js';

export const meta = { duration: 5.4, beats: [[0, '二つの木片'], [1.2, '接着剤を塗る'], [3.8, 'つながった']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  el('rect', { x: 40, y: 44, width: 70, height: 60, rx: 8, fill: '#DDEFFA' });
  el('line', { x1: 75, y1: 44, x2: 75, y2: 104, stroke: '#fff', 'stroke-width': 4 });
  el('rect', { x: 0, y: 200, width: 400, height: 14, fill: '#F2DDBB' });
  el('rect', { x: 0, y: 200, width: 400, height: 2, fill: '#fff', opacity: 0.6 });
  const S = 1.0;
  const me = k.buddy({ x: 206, y: FY, scale: S });
  el('rect', { x: 0, y: 214, width: 400, height: 40, fill: pal.wood });
  el('rect', { x: 0, y: 214, width: 400, height: 3, fill: pal.woodDark, opacity: 0.4 });
  const AX = 224, W = 42, H = 22, TOP = 200 - H, B0 = 306, B1 = AX + W;
  k.shadow(AX + W, 202, 50, 3.5);
  const mkBlock = (c1, c2) => {
    const n = g({});
    el('rect', { x: 0, y: -H, width: W, height: H, rx: 3, fill: c1 }, n);
    el('rect', { x: 0, y: -H, width: W, height: 4, rx: 2, fill: '#fff', opacity: 0.3 }, n);
    [-15, -8].forEach((y) => el('path', { d: `M 4 ${y} q ${W / 4} -3 ${W / 2} 0 t ${W / 2 - 8} 0`, fill: 'none', stroke: c2, 'stroke-width': 1.2, opacity: 0.6 }, n));
    return n;
  };
  const A = mkBlock('#D9A66A', '#B27C45'), B = mkBlock('#E3BE8A', '#B27C45');
  const bead = el('rect', { x: AX + W - 1, y: TOP, width: 3, height: 0, rx: 1.5, fill: '#FFFBEA', stroke: '#E6D79B', 'stroke-width': 0.8 });
  const blobT = el('ellipse', { rx: 4, ry: 2.4, fill: '#FFFBEA', stroke: '#E6D79B', 'stroke-width': 0.8, opacity: 0 });
  const blobB = el('ellipse', { rx: 3.4, ry: 2, fill: '#FFFBEA', stroke: '#E6D79B', 'stroke-width': 0.8, opacity: 0 });
  const hand = el('circle', { r: 6.5 * S, fill: pal.mint, stroke: pal.mintDark, 'stroke-width': 2.4 });
  const bottle = g({});
  el('rect', { x: -5, y: -4, width: 12, height: 18, rx: 4, fill: '#fff', stroke: pal.line, 'stroke-width': 1.5 }, bottle);
  el('rect', { x: -5, y: 3, width: 12, height: 7, fill: pal.blue }, bottle);
  el('path', { d: 'M -2.4 -4 L -1 -10 L 2.6 -10 L 4 -4 Z', fill: pal.yellow }, bottle);
  const spark = [0, 1, 2].map(() => el('path', { d: 'M 0 -6 L 1.6 -1.6 L 6 0 L 1.6 1.6 L 0 6 L -1.6 1.6 L -6 0 L -1.6 -1.6 Z', fill: pal.yellow, opacity: 0 }));
  const REST = { x: 176, y: 195 };

  return {
    update(t) {
      // 段階：0.4-1.0 ボトルを構える / 1.0-2.0 塗る / 2.0-2.5 置く / 2.5-3.0 木片をつかむ / 3.0-4.0 押し寄せる / 4.0- 完成
      const aim = easeInOut(seg(t, 0.4, 1.0)), draw = seg(t, 1.0, 2.0), put = easeInOut(seg(t, 2.0, 2.5)), grab = easeInOut(seg(t, 2.3, 3.0));
      const push = easeInOut(seg(t, 3.0, 4.0)), rel = easeInOut(seg(t, 4.2, 4.8));
      const bcx = lerp(B0, B1, push);
      const bx = lerp(lerp(206, 206, 0), bcx - 40, grab);
      me.pose({ x: bx, armL: 8, lean: 3 + 3 * grab * (1 - rel), look: 0.6, mood: t > 4.0 ? 'grin' : 'smile', squash: 1, armR: 30 });
      const holdBottle = t < 2.4;
      const gt = holdBottle ? { x: AX + W - 2, y: TOP - 16 + 18 * draw } : { x: bcx + 2, y: TOP - 10 };
      let a = lerp(30, reach(me, S, 'R', gt.x - 8, gt.y), holdBottle ? aim : 1);
      if (holdBottle) a = lerp(30, reach(me, S, 'R', gt.x - 8, gt.y), aim);
      else a = lerp(reach(me, S, 'R', AX + W - 10, TOP - 4), reach(me, S, 'R', bcx, TOP - 6), grab);
      me.pose({ armR: lerp(a, 24, rel) });
      const h = hp(me, S, 'R', 26);
      k.set(hand, { cx: h.x, cy: h.y });
      // ボトル
      const sq = 1 - 0.12 * hump(seg(t, 1.0, 1.15)) - 0.1 * Math.sin(draw * Math.PI * 6) * (draw > 0 && draw < 1 ? 1 : 0);
      if (t < 2.0) tf(bottle, h.x + 8, h.y - 2, 90 + 6 * draw, 1.1, sq * 1.1);
      else tf(bottle, lerp(h.x + 8, REST.x, put), lerp(h.y - 2, REST.y, put), lerp(90, 90, put), 1.1, 1.1);
      // 木片
      tf(A, AX, 200);
      const wob = wobble(seg(t, 4.0, 4.7), 4, 6) * 1.5;
      tf(B, bcx + wob + 0, 200, 0, 1 - 0.01 * hump(seg(t, 3.95, 4.15)), 1 + 0.02 * hump(seg(t, 3.95, 4.15)));
      // 接着剤：ビード→挟まれてにじむ
      k.set(bead, { y: TOP, height: H * easeOut(draw), opacity: 1 });
      bead.setAttribute('opacity', push > 0.98 ? 0.0 : 1);
      const sq2 = seg(t, 3.85, 4.2);
      blobT.setAttribute('opacity', sq2 > 0 ? 1 : 0); blobB.setAttribute('opacity', sq2 > 0 ? 1 : 0);
      k.set(blobT, { cx: B1 + 1, cy: TOP + 1 });
      k.set(blobB, { cx: B1 + 1, cy: 199 });
      spark.forEach((s, i) => {
        const q = seg(t, 4.3 + i * 0.12, 5.0 + i * 0.12);
        s.setAttribute('opacity', q > 0 && q < 1 ? 1 - q : 0);
        tf(s, B1 - 18 + i * 20, TOP - 12 - 8 * q - (i % 2) * 8, 0, 0.8 + 0.5 * hump(q));
      });
    }
  };
}
