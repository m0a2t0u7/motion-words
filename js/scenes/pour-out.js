// pour out：まめが水差しを傾け、中の水を外へ注ぎ出して下の洗面器にためる（例文 She poured out water from the jug.）
import { seg, lerp, easeInOut, easeOut, wobble } from '../ease.js';

export const meta = { duration: 4.0, beats: [[0, '水差しを持つ'], [1.3, '傾けて注ぐ'], [3.2, '水が出た']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  el('rect', { x: 36, y: 44, width: 70, height: 60, rx: 6, fill: '#DDEFFA' });
  el('line', { x1: 71, y1: 44, x2: 71, y2: 104, stroke: '#fff', 'stroke-width': 4 });
  // 洗面器（透けて水位が見える）
  k.shadow(268, FY, 52, 6);
  const basinPath = 'M 230 206 L 306 206 L 296 234 Q 294 237 290 237 L 246 237 Q 242 237 240 234 Z';
  el('path', { d: basinPath, fill: '#F0F3F8' });
  const wClip = k.clip((c) => el('path', { d: basinPath }, c));
  const bw = el('rect', { x: 228, y: 232, width: 80, height: 10, fill: pal.water, 'clip-path': wClip });
  const bs = el('rect', { x: 228, y: 232, width: 80, height: 2.5, fill: '#B8E4F8', 'clip-path': wClip });
  el('path', { d: basinPath, fill: 'none', stroke: pal.blue, 'stroke-width': 4, 'stroke-linejoin': 'round' });
  el('rect', { x: 226, y: 203, width: 84, height: 6, rx: 3, fill: pal.blueDark });

  const stream = el('path', { d: '', fill: 'none', stroke: pal.water, 'stroke-width': 4.5, 'stroke-linecap': 'round', pathLength: 1 });
  const ripple = el('ellipse', { cx: 268, cy: 220, rx: 6, ry: 1.8, fill: 'none', stroke: '#fff', 'stroke-width': 1.5, opacity: 0 });

  const S = 1;
  const b = k.buddy({ x: 160, y: FY, scale: S });
  const jug = g({});
  const body = 'M 12 -36 L 36 -36 Q 44 -36 44 -28 L 44 8 Q 44 16 36 16 L 12 16 Q 4 16 4 8 L 4 -28 Q 4 -36 12 -36 Z';
  el('path', { d: body, fill: '#E4F2FB' }, jug);
  const jc = k.clip((c) => el('path', { d: body }, c));
  const wg = g({ 'clip-path': jc }, jug);
  const wgi = g({}, wg);
  const jw = el('rect', { x: -60, y: -14, width: 160, height: 120, fill: pal.water }, wgi);
  el('rect', { x: -60, y: -14, width: 160, height: 3, fill: '#B8E4F8' }, wgi);
  el('path', { d: body, fill: 'none', stroke: pal.blue, 'stroke-width': 3, 'stroke-linejoin': 'round' }, jug);
  el('path', { d: 'M 38 -37 L 52 -43 L 46 -28 Z', fill: '#E4F2FB', stroke: pal.blue, 'stroke-width': 3, 'stroke-linejoin': 'round' }, jug);
  el('path', { d: 'M 4 -26 Q -14 -26 -14 -8 Q -14 8 4 6', fill: 'none', stroke: pal.blueDark, 'stroke-width': 4.5, 'stroke-linecap': 'round' }, jug);
  el('rect', { x: 9, y: -30, width: 5, height: 28, rx: 2.5, fill: '#fff', opacity: 0.6 }, jug);

  return {
    update(t) {
      const tilt = easeInOut(seg(t, 0.5, 1.4)) * (1 - easeInOut(seg(t, 2.7, 3.4)) * 0.62);
      const r = 58 * tilt;
      const a = lerp(100, 125, easeInOut(seg(t, 0.5, 1.4))) - 12 * easeInOut(seg(t, 2.7, 3.4));
      b.pose({ armR: a, armL: 8, lean: 3 * tilt, look: 0.7, mood: 'smile', blink: t > 0.2 && t < 0.3 ? 1 : 0, squash: 1 + 0.015 * wobble(seg(t, 1.3, 2.0), 2, 5) });
      const h = b.handPos('R');
      tf(jug, h.x, h.y, r);
      // 水位は世界の水平を保つ（ジャグの回転を打ち消す）
      wgi.setAttribute('transform', `rotate(${-r} 24 -10)`);
      const lvl = lerp(-18, 6, easeInOut(seg(t, 1.1, 2.7)));
      k.set(jw, { y: lvl - 0 });
      jw.nextSibling && jw.nextSibling.setAttribute('y', lvl);
      // 注ぎ口の位置と水の流れ
      const rad = (r * Math.PI) / 180;
      const sx = h.x + 50 * Math.cos(rad) + 40 * Math.sin(rad), sy = h.y + 50 * Math.sin(rad) - 40 * Math.cos(rad);
      const pa = seg(t, 1.05, 1.3), pb = 1 - seg(t, 2.75, 3.0);
      const wl = lerp(230, 218, easeInOut(seg(t, 1.2, 3.0)));
      const lx = sx + 8, ly = wl;
      stream.setAttribute('d', `M ${sx} ${sy} Q ${sx + 9} ${sy + 2} ${lx} ${ly}`);
      const from = 1 - pb, to = easeOut(pa);
      stream.setAttribute('stroke-dasharray', `0 ${from} ${Math.max(0, to - from)} 2`);
      stream.setAttribute('opacity', pa > 0 && pb > 0 ? 1 : 0);
      stream.setAttribute('stroke-width', 4.5 * (0.5 + 0.5 * pb));
      // 洗面器
      const fill = lerp(232, wl, easeInOut(seg(t, 1.2, 3.0)));
      k.set(bw, { y: fill }); k.set(bs, { y: fill });
      const rp = (t * 2) % 1;
      ripple.setAttribute('cx', lx); ripple.setAttribute('cy', wl + 1);
      ripple.setAttribute('rx', 4 + 12 * rp);
      ripple.setAttribute('opacity', pa > 0.9 && pb > 0.2 ? 0.8 * (1 - rp) : 0);
    }
  };
}
