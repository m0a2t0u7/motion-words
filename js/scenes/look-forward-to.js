// look forward to：カレンダーの来週に旅行の印。日に×が付いていき、まめはスーツケースのそばでわくわく待つ（例文 I'm looking forward to the trip next week.）
import { seg, lerp, easeInOut, easeOut, hump, backOut } from '../ease.js';
import { roomBg, faceAt } from './look-over.js';
import { heart } from './weigh.js';

export const meta = { duration: 4.4, beats: [[0, '来週は旅行'], [1.4, '一日ずつ待つ'], [3.4, 'わくわく']] };

export function plane(k, parent, c) {
  return k.el('path', { d: 'M -9 1 L 9 -1 Q 12 0 9 1 L -9 3 Z M -2 0 L -6 -7 L -3 -7 L 3 0 Z M -2 2 L -6 9 L -3 9 L 3 2 Z M -8 1 L -10 -4 L -8 -4 L -6 1 Z', fill: c, parent }, parent);
}

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = roomBg(k, 'home', 240);
  // カレンダー（2週分）
  el('rect', { x: 196, y: 40, width: 168, height: 108, rx: 6, fill: '#fff', stroke: pal.line, 'stroke-width': 2 });
  el('rect', { x: 196, y: 40, width: 168, height: 18, rx: 6, fill: pal.coral });
  const cells = [];
  for (let r = 0; r < 2; r++) for (let c = 0; c < 7; c++) { const x = 204 + c * 22.5, y = 66 + r * 38; el('rect', { x, y, width: 19, height: 32, rx: 3, fill: '#F6F7FA' }); cells.push([x + 9.5, y + 16]); }
  const tripCell = cells[11];
  el('circle', { cx: tripCell[0], cy: tripCell[1], r: 13, fill: 'none', stroke: pal.red, 'stroke-width': 2.5 });
  const pl = g({}); tf(pl, tripCell[0], tripCell[1], -20, 0.8); plane(k, pl, pal.blueDark);
  const xs = [0, 1, 2, 3, 4, 5].map((i) => el('path', { d: 'M -6 -6 L 6 6 M 6 -6 L -6 6', stroke: pal.sub, 'stroke-width': 2.5, 'stroke-linecap': 'round', transform: `translate(${cells[i][0]} ${cells[i][1]})` }));
  // スーツケース
  el('rect', { x: 120, y: 190, width: 46, height: 48, rx: 6, fill: pal.violet });
  el('rect', { x: 134, y: 182, width: 18, height: 8, rx: 3, fill: 'none', stroke: '#8A6FD8', 'stroke-width': 3 });
  el('line', { x1: 130, y1: 196, x2: 130, y2: 232, stroke: '#8A6FD8', 'stroke-width': 3 });
  k.shadow(143, 239, 26, 3);
  const b = k.buddy({ x: 80, y: FY, scale: 0.9 });
  const hs = [0, 1].map(() => { const n = g({}); heart(k, n, pal.coral); return n; });
  return {
    update(t) {
      xs.forEach((x, i) => x.setAttribute('opacity', seg(t, 0.6 + i * 0.35, 0.75 + i * 0.35)));
      const ex = seg(t, 2.9, 4.4), bounce = Math.abs(Math.sin((t - 2.9) * 6)) * ex;
      b.pose({ armR: lerp(8, 60, seg(t, 0.2, 0.5)) * (1 - ex) + 150 * easeOut(ex), armL: 8 + 140 * easeOut(ex), lift: 10 * bounce, squash: 1 - 0.05 * hump(seg(t, 2.8, 3.0)), mood: t > 2.8 ? 'grin' : 'smile', look: 0.8 });
      faceAt(b, 5, -6);
      hs.forEach((h, i) => { const p = ((t - 3.0) * 0.9 + i * 0.5) % 1; tf(h, 70 + i * 26, 130 - p * 30, 0, 0.9); h.setAttribute('opacity', t > 3.0 ? Math.sin(p * Math.PI) : 0); });
    }
  };
}
