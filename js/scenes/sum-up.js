// sum up：板に並んだ3つの要点を、かっこでまとめ、矢印の先に1つの箱（まとめ）を書く（例文 Let me sum up the main points.）
import { seg, lerp, easeInOut, easeOut, backOut, hump } from '../ease.js';
import { reach, held } from './dig.js';
import { drawOn, standFor, pen } from './work-on.js';

export const meta = { duration: 4.4, beats: [[0, '要点が3つ'], [1.4, 'まとめる'], [3.6, '1つになった']] };

export function create(k) {
  const { el, g, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  el('rect', { x: 330, y: 56, width: 50, height: 60, rx: 6, fill: '#DDEFFA', stroke: '#fff', 'stroke-width': 5 });
  el('rect', { x: 18, y: 96, width: 232, height: 118, rx: 6, fill: '#fff', stroke: '#B9C3D0', 'stroke-width': 5 });
  el('rect', { x: 50, y: 214, width: 6, height: 22, fill: '#B9C3D0' }); el('rect', { x: 212, y: 214, width: 6, height: 22, fill: '#B9C3D0' });
  k.shadow(134, FY, 110, 4);
  const cols = [pal.coral, pal.blue, pal.green], ys = [122, 155, 188];
  ys.forEach((y, i) => { el('circle', { cx: 42, cy: y, r: 9, fill: cols[i] }); k.text(42, y + 1, String(i + 1), { 'font-size': 12, fill: '#fff' }); el('rect', { x: 58, y: y - 4, width: 58 - i * 8, height: 8, rx: 4, fill: '#D9DFE7' }); });
  const P = [
    el('path', { d: 'M 126 112 Q 138 112 138 124 L 138 146 Q 138 155 148 155 Q 138 155 138 164 L 138 186 Q 138 198 126 198', stroke: pal.ink, 'stroke-width': 3.5, fill: 'none', 'stroke-linecap': 'round' }),
    el('path', { d: 'M 154 155 L 178 155 M 170 148 L 178 155 L 170 162', stroke: pal.ink, 'stroke-width': 3.5, fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }),
    el('path', { d: 'M 186 136 L 236 136 L 236 174 L 186 174 Z', stroke: pal.violet, 'stroke-width': 4, fill: 'none', 'stroke-linejoin': 'round' })
  ];
  const ons = P.map(drawOn);
  const fillBox = el('rect', { x: 188, y: 138, width: 46, height: 34, fill: pal.violet, opacity: 0 });
  const star = el('path', { d: 'M 0 -9 L 2.6 -2.8 L 9 -2.5 L 4.2 1.9 L 5.8 8.5 L 0 5 L -5.8 8.5 L -4.2 1.9 L -9 -2.5 L -2.6 -2.8 Z', fill: '#fff', transform: 'translate(211 155)' });
  const S = 1.4;
  const b = k.buddy({ x: 320, y: FY, scale: S, facing: -1 });
  const mk = pen(k, pal.ink);
  const T = [[0.6, 1.5], [1.7, 2.2], [2.4, 3.3]];
  return {
    update(t) {
      let pt = { x: 160, y: 205 };
      T.forEach(([a, z], i) => {
        const q = easeInOut(seg(t, a, z));
        ons[i](q);
        if (t > a - 0.25) { const L = P[i].getTotalLength(); const p = P[i].getPointAtLength(L * q); const m = easeInOut(seg(t, a - 0.25, a)); pt = { x: lerp(pt.x, p.x, m), y: lerp(pt.y, p.y, m) }; }
      });
      const f = seg(t, 3.4, 3.7);
      fillBox.setAttribute('opacity', 0.9 * f); star.setAttribute('opacity', f);
      if (t > 3.4) { const r = easeInOut(seg(t, 3.4, 3.9)); pt = { x: lerp(pt.x, 230, r), y: lerp(pt.y, 228, r) }; }
      b.pose({ x: Math.max(262, standFor(S, pt.x, pt.y, FY)), lean: 5, look: 0.6, mood: t > 3.6 ? 'grin' : 'flat', armL: 10 + 30 * hump(seg(t, 3.6, 4.3)) });
      b.pose({ armR: reach(b, S, 'R', pt.x, pt.y) });
      held(k, b, S, mk, 'R', 0, 26);
    }
  };
}
