// collect：彼が古い硬貨を一枚ずつ山から取り、コレクションのアルバムの穴に集めていく（例文 He collects old coins.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';
import { hp, reach } from './dig.js';

export const meta = { duration: 5.4, beats: [[0, '硬貨の山'], [1.8, '一枚ずつ集める'], [4.6, '増えた']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  el('rect', { x: 250, y: 50, width: 110, height: 6, rx: 3, fill: pal.woodDark });
  [[262, pal.violet], [292, pal.coral], [322, pal.blue]].forEach(([x, c]) => el('rect', { x, y: 30, width: 20, height: 22, rx: 4, fill: c, opacity: 0.8 }));
  el('rect', { x: 40, y: 44, width: 70, height: 60, rx: 8, fill: '#DDEFFA' });
  el('line', { x1: 75, y1: 44, x2: 75, y2: 104, stroke: '#fff', 'stroke-width': 4 });
  el('rect', { x: 0, y: 200, width: 400, height: 14, fill: '#F2DDBB' });
  el('rect', { x: 0, y: 200, width: 400, height: 2, fill: '#fff', opacity: 0.6 });
  const xs = [206, 228, 250, 272, 294];
  // アルバム
  el('path', { d: 'M 190 200 L 198 184 L 306 184 L 314 200 Z', fill: '#8A5A3C' });
  el('path', { d: 'M 194 198 L 201 187 L 303 187 L 310 198 Z', fill: '#B5835A' });
  xs.forEach((x) => el('ellipse', { cx: x, cy: 192, rx: 9, ry: 4.4, fill: '#7A4C30' }));
  // 山
  const pile = g({});
  [[0, 0], [-10, 3], [10, 2]].forEach(([dx, dy]) => el('ellipse', { cx: dx, cy: dy, rx: 8, ry: 3.2, fill: '#B88A3E' }, pile));
  [[-4, -3], [6, -4]].forEach(([dx, dy]) => el('ellipse', { cx: dx, cy: dy, rx: 8, ry: 3.2, fill: '#D4A94E' }, pile));
  tf(pile, 150, 197);
  const S = 1.0;
  const me = k.buddy({ x: 100, y: FY, scale: S });
  el('rect', { x: 0, y: 214, width: 400, height: 40, fill: pal.wood });
  el('rect', { x: 0, y: 214, width: 400, height: 3, fill: pal.woodDark, opacity: 0.4 });
  const mk = () => {
    const c = g({});
    el('circle', { r: 7.5, fill: '#D4A94E', stroke: '#9B7424', 'stroke-width': 1.8 }, c);
    el('circle', { r: 4, fill: 'none', stroke: '#9B7424', 'stroke-width': 1.3 }, c);
    el('circle', { cx: -2.2, cy: -2.4, r: 1.6, fill: '#fff', opacity: 0.5 }, c);
    return c;
  };
  const coins = xs.slice(0, 4).map(mk);
  const hand = el('circle', { r: 6.5 * S, fill: pal.mint, stroke: pal.mintDark, 'stroke-width': 2.4 });
  const P = { x: 152, y: 190 };

  return {
    update(t) {
      const T0 = 0.5, CY = 1.1;
      const c = Math.max(0, Math.min(3, Math.floor((t - T0) / CY)));
      const u = t < T0 ? 0 : Math.min(CY, t - T0 - CY * c);
      const prevX = c === 0 ? 100 : xs[c - 1] - 52;
      let bx = 100;
      if (t >= T0) bx = u < 0.3 ? lerp(prevX, 100, easeInOut(u / 0.3)) : lerp(100, xs[c] - 52, easeInOut(seg(u, 0.3, 0.8)));
      if (t > T0 + CY * 4 - 0.1) bx = xs[3] - 52 + 0;
      const toSlot = u >= 0.3 && t >= T0, carry = toSlot && u < 0.85 && t < T0 + CY * 4 - 0.25 + 0.1;
      const tgt = toSlot ? { x: xs[c], y: 186 - 8 * hump(seg(u, 0.3, 0.85)) } : { x: P.x, y: 190 - 8 * hump(seg(u, 0, 0.3)) };
      const fin = seg(t, T0 + CY * 4 - 0.1, T0 + CY * 4 + 0.4);
      me.pose({ x: bx, armL: 8, lean: 3, look: 0.6, mood: fin > 0.3 ? 'grin' : 'smile', squash: 1, armR: 60 });
      const a = reach(me, S, 'R', tgt.x, tgt.y);
      me.pose({ armR: lerp(a, 20, fin) });
      const h = hp(me, S, 'R', 26);
      k.set(hand, { cx: h.x, cy: h.y });
      coins.forEach((n, i) => {
        const placed = i < c || (i === c && (u >= 0.85 || t >= T0 + CY * 4 - 0.15));
        if (placed) { tf(n, xs[i], 191, 0, 1, 0.55); n.setAttribute('opacity', 1); return; }
        if (i === c && carry) { const q = hp(me, S, 'R', 32); tf(n, q.x, q.y - 2, 0, 1, 1); n.setAttribute('opacity', 1); return; }
        n.setAttribute('opacity', 0);
      });
    }
  };
}
