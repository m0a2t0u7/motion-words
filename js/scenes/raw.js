// raw：生の魚の切り身をしょうゆにつけて、箸で口へ運ぶ（例文 Some people eat raw fish with soy sauce.）
import { seg, lerp, easeInOut, easeOut, hump, wobble, clamp } from '../ease.js';
import { P, blinkAt, walkTo } from './run-after.js';
import { kitchenBg } from './weigh.js';
import { hp, reach } from './dig.js';

export const meta = { duration: 4.4, beats: [[0, '生の切り身'], [1.8, 'しょうゆ'], [3.2, '食べる']] };

const kf = (t, pts) => {
  for (let i = 1; i < pts.length; i++) if (t < pts[i][0]) return lerp(pts[i - 1][1], pts[i][1], easeInOut(seg(t, pts[i - 1][0], pts[i][0])));
  return pts[pts.length - 1][1];
};
const star = 'M 0 -6 L 1.6 -1.6 L 6 0 L 1.6 1.6 L 0 6 L -1.6 1.6 L -6 0 L -1.6 -1.6 Z';

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = kitchenBg(k);
  const S = 1.2;
  k.shadow(290, FY, 110, 7);
  el('rect', { x: 176, y: 198, width: 214, height: 9, rx: 3, fill: pal.wood });
  [[190, 207], [368, 207]].forEach(([x, y]) => el('rect', { x, y, width: 9, height: 29, rx: 2, fill: pal.woodDark }));
  // 皿（刺身3切れ・わさび）としょうゆ皿
  el('ellipse', { cx: 250, cy: 198, rx: 34, ry: 5, fill: '#EEF1F5', stroke: pal.line, 'stroke-width': 1.5 });
  el('ellipse', { cx: 250, cy: 197, rx: 26, ry: 3.5, fill: '#fff' });
  const slice = (parent, x, y) => { const n = g({}, parent); k.tf(n, x, y); el('rect', { x: -9, y: -6, width: 18, height: 8, rx: 3, fill: '#FF8F84' }, n); el('rect', { x: -7, y: -4, width: 14, height: 1.8, rx: 1, fill: '#FFD2CC' }, n); return n; };
  const slices = [[232, 195], [248, 194], [264, 195]].map(([x, y]) => slice(undefined, x, y));
  el('circle', { cx: 272, cy: 191, r: 4, fill: pal.green });
  el('ellipse', { cx: 206, cy: 198, rx: 13, ry: 3.5, fill: '#EEF1F5', stroke: pal.line, 'stroke-width': 1.2 });
  el('path', { d: 'M 194 192 H 218 Q 217 198 206 198 Q 195 198 194 192 Z', fill: '#fff', stroke: pal.line, 'stroke-width': 1.2 });
  el('ellipse', { cx: 206, cy: 192, rx: 11, ry: 2.4, fill: '#4A2E1E' });
  const b = k.buddy({ x: 130, y: FY, scale: S });
  P(b, {});
  const A = { rest: 8, plate: reach(b, S, 'R', 215, 184), soy: reach(b, S, 'R', 200, 184), mouth: 128 };
  const SPOT = { plate: { x: 228, y: 191 }, soy: { x: 206, y: 192 } };
  const tipOf = (n, h) => (n === 'rest' ? { x: h.x + 6, y: h.y + 16 } : n === 'mouth' ? { x: h.x - 15, y: h.y - 7 } : SPOT[n]);
  const ST = [[0, 'rest'], [0.7, 'rest'], [1.3, 'plate'], [1.6, 'plate'], [2.1, 'soy'], [2.5, 'soy'], [3.1, 'mouth'], [3.7, 'mouth'], [4.2, 'rest']];
  const sticks = [0, 1].map(() => el('line', { stroke: pal.woodDark, 'stroke-width': 2.4, 'stroke-linecap': 'round' }));
  const mine = slice(undefined, 0, 0);
  const tint = el('rect', { x: -9, y: -6, width: 18, height: 8, rx: 3, fill: '#7A4A33', opacity: 0 }, mine);
  const sp = el('path', { d: star, fill: pal.yellow });
  return {
    update(t) {
      let i = 1; while (i < ST.length - 1 && t >= ST[i][0]) i++;
      const [t0, n0] = ST[i - 1], [t1, n1] = ST[i], e = easeInOut(seg(t, t0, t1));
      const ang = lerp(A[n0], A[n1], e);
      const eat = seg(t, 3.2, 3.5);
      P(b, { armR: ang, lean: 3 * seg(t, 2.7, 3.1), look: 0.4, squash: 1 - 0.04 * (t > 3.3 && t < 4.0 ? Math.abs(Math.sin((t - 3.3) * 12)) : 0), mood: t > 3.4 ? 'grin' : 'smile', blink: blinkAt(t) });
      const h = hp(b, S, 'R'), p0 = tipOf(n0, h), p1 = tipOf(n1, h);
      const tip = { x: lerp(p0.x, p1.x, e), y: lerp(p0.y, p1.y, e) };
      const dx = tip.x - h.x, dy = tip.y - h.y, L = Math.hypot(dx, dy) || 1, nx = -dy / L * 1.5, ny = dx / L * 1.5;
      sticks.forEach((s, j) => k.set(s, { x1: h.x - nx * (j ? -1 : 1), y1: h.y - ny * (j ? -1 : 1), x2: tip.x + nx * (j ? -1 : 1) * 0.5, y2: tip.y + ny * (j ? -1 : 1) * 0.5 }));
      slices[0].setAttribute('opacity', t < 1.35 ? 1 : 0);
      const has = t >= 1.35 && t < 3.3;
      mine.setAttribute('opacity', has ? 1 : 0);
      tf(mine, tip.x, tip.y - 3, Math.atan2(dy, dx) * 180 / Math.PI * 0.4, 1);
      tint.setAttribute('opacity', 0.75 * seg(t, 2.1, 2.5));
      const hx = 130, hy = FY - 84 * S;
      tf(sp, hx + 26, hy - 14 - 8 * hump(seg(t, 3.4, 4.2)), 0, 0.9 * seg(t, 3.4, 3.6) * (1 - seg(t, 4.0, 4.3)));
    }
  };
}
