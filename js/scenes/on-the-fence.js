// on the fence：まめが柵の上に座り、古いスマホと新しいスマホを見比べて、まだ決められない（例文 I'm still on the fence about buying a new phone.）
import { seg, lerp, easeInOut, easeOut, backOut, hump } from '../ease.js';

export const meta = { duration: 4.4, beats: [[0, '柵の上'], [1.0, '見比べる'], [3.1, 'まだ迷っている']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'outdoor' });
  el('ellipse', { cx: 60, cy: 238, rx: 70, ry: 24, fill: '#E3E8EE' });
  el('ellipse', { cx: 350, cy: 240, rx: 80, ry: 26, fill: '#D6EFE0' });
  el('rect', { x: 0, y: FY, width: 400, height: 64, fill: pal.floor });
  el('rect', { x: 0, y: FY, width: 400, height: 2, fill: pal.floorEdge });

  // 柵（下側の板）
  const RT = 176;
  for (let i = 0; i < 8; i++) {
    const x = 118 + i * 23;
    el('path', { d: `M ${x} ${RT} L ${x + 17} ${RT} L ${x + 17} ${FY} L ${x} ${FY} Z`, fill: '#F2E3C8', stroke: pal.woodDark, 'stroke-width': 1.5, 'stroke-linejoin': 'round' });
  }
  el('rect', { x: 110, y: 206, width: 190, height: 9, rx: 3, fill: pal.wood, stroke: pal.woodDark, 'stroke-width': 1.5 });
  k.shadow(206, FY + 3, 100, 6);

  // 左：古いスマホ
  const old = g({});
  tf(old, 52, FY);
  el('ellipse', { cx: 0, cy: 2, rx: 30, ry: 6, fill: pal.shadow }, old);
  el('rect', { x: -19, y: -70, width: 38, height: 68, rx: 7, fill: '#8E99AB' }, old);
  el('rect', { x: -14, y: -62, width: 28, height: 48, rx: 3, fill: '#C9D0DA' }, old);
  el('path', { d: 'M -14 -62 L -4 -46 L -10 -34 L 2 -20 L 0 -14', fill: 'none', stroke: '#7A8597', 'stroke-width': 1.8, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, old);
  el('line', { x1: 6, y1: -58, x2: 14, y2: -50, stroke: '#B3BCCA', 'stroke-width': 2 }, old);
  el('circle', { cx: 0, cy: -8, r: 3.2, fill: '#6F7B8E' }, old);
  // 右：新しいスマホ（光っている）
  const nw = g({});
  tf(nw, 350, FY);
  const rays = g({ transform: 'translate(0 -36)' }, nw);
  for (let i = 0; i < 10; i++) el('line', { x1: 0, y1: -44, x2: 0, y2: -54, stroke: pal.yellow, 'stroke-width': 4, 'stroke-linecap': 'round', transform: `rotate(${i * 36})` }, rays);
  el('ellipse', { cx: 0, cy: 2, rx: 30, ry: 6, fill: pal.shadow }, nw);
  el('rect', { x: -18, y: -72, width: 36, height: 70, rx: 9, fill: '#FFFFFF', stroke: '#E1E6EE', 'stroke-width': 2 }, nw);
  el('rect', { x: -15, y: -68, width: 30, height: 62, rx: 6, fill: k.gradient([[0, pal.violet], [1, pal.blue]]) }, nw);
  el('ellipse', { cx: -6, cy: -48, rx: 4, ry: 12, fill: '#FFFFFF', opacity: 0.4 }, nw);
  el('rect', { x: -4, y: -66, width: 8, height: 3, rx: 1.5, fill: 'rgba(255,255,255,0.7)' }, nw);
  const sp = [[-30, -80], [28, -92]].map(([x, y]) => { const s = g({}, nw); tf(s, x, y); el('path', { d: 'M 0 -7 Q 1.3 -1.3 7 0 Q 1.3 1.3 0 7 Q -1.3 1.3 -7 0 Q -1.3 -1.3 0 -7 Z', fill: pal.yellow }, s); return s; });

  // まめ（柵の上に座る）
  const MX = 206, BY = 192;
  const b = k.buddy({ x: MX, y: BY, scale: 0.92 });
  // 柵の天板（まめの座面。体の下端と脚の付け根をおおう）
  el('rect', { x: 108, y: RT, width: 196, height: 6, rx: 3, fill: pal.wood, stroke: pal.woodDark, 'stroke-width': 1.5 });
  [112, 292].forEach((x) => el('rect', { x: x - 4, y: RT - 8, width: 12, height: FY - RT + 8, rx: 3, fill: pal.woodDark }));

  // 「?」
  const q = g({});
  el('circle', { cx: 16, cy: 38, r: 4, fill: '#FFFFFF', stroke: '#CBD3DE', 'stroke-width': 2 }, q);
  el('circle', { cx: 8, cy: 24, r: 6, fill: '#FFFFFF', stroke: '#CBD3DE', 'stroke-width': 2 }, q);
  el('ellipse', { cx: 0, cy: -2, rx: 30, ry: 24, fill: '#FFFFFF', stroke: '#CBD3DE', 'stroke-width': 2.5 }, q);
  k.text(0, -1, '?', { 'font-size': 30, fill: pal.coralDark }, q);

  // 傾き：左→戻る→右→戻る→小さく左→戻る
  const swing = (t) => {
    const f = (a, c, b2, d) => hump(seg(t, a, b2)) * d;
    return -f(0, 0, 1.0, 0) + (-1) * hump(seg(t, 0.9, 1.7)) + hump(seg(t, 1.7, 2.5)) + (-0.6) * hump(seg(t, 2.5, 3.2)) + 0.5 * hump(seg(t, 3.2, 3.8));
  };
  return {
    update(t) {
      const s = swing(t);
      const shrug = easeInOut(seg(t, 3.35, 3.8));
      b.pose({
        walk: 0.5 * Math.sin(t * 3),
        lean: 13 * s,
        look: s === 0 ? (t < 0.9 ? -0.6 : 0) : Math.max(-1, Math.min(1, s * 1.2)),
        armL: lerp(8, 70, shrug) , armR: lerp(8, 70, shrug),
        mood: 'flat', squash: 0.93, blink: 0
      });
      // 光る新しいスマホ
      tf(rays, 0, -36, t * 20, 1 + 0.06 * Math.sin(t * 4), 1 + 0.06 * Math.sin(t * 4));
      sp.forEach((o, i) => { const sc = 0.6 + 0.4 * Math.sin(t * 5 + i * 2); tf(o, i ? 28 : -30, i ? -92 : -80, t * 40, sc, sc); });
      // 古いスマホはときどきうなだれる
      tf(old, 52, FY, -2 * hump(seg(t, 0.9, 1.7)), 1, 1);
      tf(nw, 350, FY - 3 * hump(seg(t, 1.7, 2.5)), 0, 1, 1);
      // ？の吹き出し
      const qp = t < 3.35 ? 0 : backOut(seg(t, 3.35, 3.75), 2);
      tf(q, MX + 34, 96 + 2 * Math.sin(t * 3), 0, qp, qp);
    }
  };
}
