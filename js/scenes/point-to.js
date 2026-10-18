// point to：壁の3つの証拠（足あと・手袋・鍵）から矢印がのびて、すべて同じ1枚の答えを指す（例文 All the evidence points to one answer.）
import { seg, lerp, easeInOut, easeOut, backOut, hump } from '../ease.js';
import { held } from './dig.js';
import { drawOn } from './work-on.js';

export const meta = { duration: 4.4, beats: [[0, '証拠が3つ'], [1.4, '同じ所を指す'], [3.4, '答えは1つ']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  el('rect', { x: 20, y: 30, width: 300, height: 168, rx: 8, fill: '#E9CFA6', stroke: pal.woodDark, 'stroke-width': 5 });
  const card = (x, y, fn) => { const c = g({}); tf(c, x, y); el('rect', { x: -26, y: -22, width: 52, height: 44, rx: 3, fill: '#fff' }, c); el('circle', { cx: 0, cy: -22, r: 3.5, fill: pal.red }, c); fn(c); return c; };
  const clues = [
    card(70, 62, (c) => { [[-8, 2], [8, -6]].forEach(([x, y]) => { el('ellipse', { cx: x, cy: y, rx: 5, ry: 8, fill: pal.ink }, c); el('circle', { cx: x, cy: y + 11, r: 3.5, fill: pal.ink }, c); }); }),
    card(70, 166, (c) => { el('path', { d: 'M -10 12 L -10 -4 L -12 -12 L -8 -12 L -6 -6 L -6 -14 L -2 -14 L -2 -6 L 2 -14 L 6 -14 L 6 -4 L 12 -8 L 12 -2 L 8 4 L 8 12 Z', fill: pal.violet }, c); }),
    card(138, 114, (c) => { el('circle', { cx: -8, cy: 0, r: 7, fill: 'none', stroke: pal.yellowDark, 'stroke-width': 4 }, c); el('path', { d: 'M -1 -2 L 14 -2 L 14 5 M 9 -2 L 9 4', stroke: pal.yellowDark, 'stroke-width': 4, fill: 'none' }, c); })
  ];
  const AX = 262, AY = 112;
  const arrows = [[96, 66], [96, 160], [164, 114]].map(([x, y], i) => {
    const mx = (x + AX - 34) / 2, my = (y + AY) / 2 + (i === 2 ? 0 : (y < AY ? -14 : 14));
    const p = el('path', { d: `M ${x} ${y} Q ${mx} ${my} ${AX - 36} ${AY}`, stroke: pal.red, 'stroke-width': 3.5, fill: 'none', 'stroke-linecap': 'round', 'stroke-dasharray': '0' });
    const head = el('path', { d: 'M 0 0 L -10 -6 L -10 6 Z', fill: pal.red });
    tf(head, AX - 34, AY, Math.atan2(AY - my, AX - 36 - mx) * 57.3);
    const on = drawOn(p); return { on: (q) => { on(q); p.setAttribute('opacity', q > 0.01 ? 1 : 0); }, head };
  });
  const ans = g({}); tf(ans, AX, AY);
  el('rect', { x: -32, y: -30, width: 64, height: 60, rx: 4, fill: '#fff', stroke: pal.line, 'stroke-width': 2 }, ans);
  const glow = el('rect', { x: -32, y: -30, width: 64, height: 60, rx: 4, fill: 'none', stroke: pal.yellow, 'stroke-width': 6 }, ans);
  el('circle', { cx: 0, cy: -30, r: 4, fill: pal.red }, ans);
  const q = k.text(0, 2, '?', { 'font-size': 30, fill: pal.sub }, ans);
  const star = el('path', { d: 'M 0 -16 L 4.7 -5 L 16 -4.5 L 7.4 3.4 L 10.3 15 L 0 8.8 L -10.3 15 L -7.4 3.4 L -16 -4.5 L -4.7 -5 Z', fill: pal.yellow, stroke: pal.yellowDark, 'stroke-width': 2 }, ans);
  const S = 1;
  const b = k.buddy({ x: 352, y: FY, scale: S, facing: -1 });
  const lens = g({});
  el('rect', { x: -3, y: 0, width: 6, height: 16, rx: 3, fill: pal.woodDark }, lens);
  el('circle', { cx: 0, cy: 26, r: 11, fill: '#CFE9F7', stroke: pal.ink, 'stroke-width': 3.5 }, lens);
  return {
    update(t) {
      arrows.forEach((a, i) => { const p = easeInOut(seg(t, 1.0 + i * 0.6, 1.6 + i * 0.6)); a.on(p); a.head.setAttribute('opacity', p > 0.97 ? 1 : 0); });
      const r = seg(t, 3.0, 3.3);
      q.setAttribute('opacity', 1 - r); star.setAttribute('opacity', r); tf(star, 0, 0, 0, Math.max(0.01, backOut(r)));
      glow.setAttribute('opacity', r * (0.6 + 0.4 * Math.sin(t * 8)));
      const nod = hump(seg(t, 3.4, 3.7)) + hump(seg(t, 3.7, 4.0));
      const lk = t < 1.0 ? 0.3 : t < 2.8 ? 0.5 - 0.2 * Math.sin(t * 2) : 0.2;
      b.pose({ armR: lerp(20, 110, easeInOut(seg(t, 0.2, 0.7))), armL: 10, lean: 4 + 6 * nod, look: lk, mood: t > 3.2 ? 'grin' : 'flat' });
      held(k, b, S, lens, 'R', 140);
    }
  };
}
