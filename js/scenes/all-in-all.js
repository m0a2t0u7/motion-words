// all in all：旅の写真を1枚ずつ見る（晴れ・雨・ごはん・景色）。雨の日もあったが、全部をまとめて見ると「良い旅」（例文 All in all, it was a good trip.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';
import { P, blinkAt, sofa } from './run-after.js';
import { roomBg } from './look-over.js';
import { popS } from './from-scratch.js';
import { heart } from './weigh.js';

function photo(k, kind) {
  const { el, g, pal } = k;
  const p = g({});
  el('rect', { x: -30, y: -24, width: 60, height: 48, rx: 3, fill: '#fff', stroke: pal.line, 'stroke-width': 2 }, p);
  const sky = kind === 1 ? '#AEB8C8' : '#BFE3F7';
  el('rect', { x: -26, y: -20, width: 52, height: 34, fill: sky }, p);
  if (kind === 0) { el('circle', { cx: 14, cy: -10, r: 6, fill: pal.yellow }, p); el('rect', { x: -26, y: 4, width: 52, height: 10, fill: '#F6E2B8' }, p); el('path', { d: 'M -26 4 Q -13 0 0 4 T 26 4', fill: pal.water }, p); }
  if (kind === 1) { el('ellipse', { cx: 0, cy: -12, rx: 16, ry: 6, fill: '#8F9AB0' }, p); [-10, -2, 6, 14].forEach((x) => el('line', { x1: x, y1: -4, x2: x - 3, y2: 8, stroke: '#5F8FC8', 'stroke-width': 2 }, p)); }
  if (kind === 2) { el('ellipse', { cx: 0, cy: 6, rx: 16, ry: 5, fill: '#fff' }, p); el('path', { d: 'M -12 4 Q 0 -12 12 4 Z', fill: '#F2A65A' }, p); el('circle', { cx: -3, cy: -4, r: 2, fill: pal.red }, p); }
  if (kind === 3) { el('path', { d: 'M -26 14 L -8 -10 L 4 4 L 12 -4 L 26 14 Z', fill: '#7FC79A' }, p); el('path', { d: 'M -12 -5 L -8 -10 L -4 -5 Z', fill: '#fff' }, p); }
  const face = kind === 1 ? 'M -5 22 Q 0 18 5 22' : 'M -5 19 Q 0 24 5 19';
  el('circle', { cx: 22, cy: 18, r: 7, fill: kind === 1 ? '#DCE3EC' : '#FFE8A3' }, p);
  el('path', { d: face.replace(/-5 (\d+)/, '17 $1').replace(/Q 0/, 'Q 22').replace(/5 (\d+)$/, '27 $1'), stroke: pal.ink, 'stroke-width': 1.6, fill: 'none' }, p);
  return p;
}

export const meta = { duration: 4.4, beats: [[0, '旅の写真'], [1.1, '雨の日も'], [3.0, '全体で良い旅']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = roomBg(k, 'home', 240);
  el('rect', { x: 160, y: 30, width: 228, height: 128, rx: 6, fill: '#E9DCC8', stroke: pal.woodDark, 'stroke-width': 3 });
  const ph = [0, 1, 2, 3].map((i) => photo(k, i));
  const pos = [[210, 66], [282, 66], [210, 124], [282, 124]].map(([x, y]) => [x + 22, y - 4]);
  const ring = el('rect', { x: 192, y: 28, width: 168, height: 128, rx: 14, fill: 'none', stroke: pal.green, 'stroke-width': 4, 'stroke-dasharray': 600, 'stroke-dashoffset': 600 });
  const so = sofa(k, 100, FY, 130);
  const b = k.buddy({ x: 100, y: FY - 26, facing: 1 });
  so.front();
  const big = g({}); heart(k, big, pal.red);
  return {
    update(t) {
      const show = [0.3, 1.0, 1.7, 2.3];
      ph.forEach((p, i) => tf(p, pos[i][0], pos[i][1], [-3, 2, 3, -2][i], popS(seg(t, show[i], show[i] + 0.35))));
      const cur = t < 1.0 ? 0 : t < 1.7 ? 1 : t < 2.3 ? 2 : 3;
      const rain = cur === 1 && t < 1.7;
      const all = easeInOut(seg(t, 2.9, 3.6));
      k.set(ring, { 'stroke-dashoffset': 600 * (1 - all) });
      const thumb = easeOut(seg(t, 3.5, 3.9));
      P(b, { x: 100, y: FY - 26, facing: 1, look: 0.7, armR: lerp(lerp(20, 60, seg(t, 0.2, 0.5)), 160, thumb), armL: 10, mood: thumb > 0 ? 'grin' : rain ? 'sad' : 'smile', lean: rain ? -3 : 0, blink: blinkAt(t), squash: 1 - 0.04 * hump(seg(t, 3.6, 4.0)) });
      tf(big, 276, 92, 0, popS(seg(t, 3.6, 4.0)) * 2.4);
      big.setAttribute('opacity', t > 3.6 ? 1 : 0);
    }
  };
}
