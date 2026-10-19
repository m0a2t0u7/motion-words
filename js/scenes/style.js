// style：彼女がノートに独特の丸い筆記体で書き、ページの隅にゆかいな落書き。読んだまめが笑って気に入る（例文 I really like her style of writing and her sense of humor.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';
import { reach, P, blinkAt } from './skirt.js';
import { drawOn } from './work-on.js';
import { heart } from './weigh.js';

export const meta = { duration: 4.4, beats: [[0, '彼女が書く'], [1.6, '文章を読む'], [3.0, '笑って好き']] };

export function create(k) {
  const { el, g, pal, tf } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  el('rect', { x: 0, y: FY - 6, width: 400, height: 6, fill: pal.line });
  // 拡大したノートのページ
  const pg = g({}); tf(pg, 200, 74);
  el('rect', { x: -96, y: -52, width: 192, height: 104, rx: 6, fill: '#fff', stroke: pal.line, 'stroke-width': 3 }, pg);
  [-30, -6, 18].forEach((y) => el('line', { x1: -84, y1: y + 8, x2: 84, y2: y + 8, stroke: '#E3ECF5', 'stroke-width': 1.5 }, pg));
  const lines = [-30, -6, 18].map((y, i) => {
    let d = `M -82 ${y + 4}`;
    for (let j = 0; j < (i === 2 ? 5 : 8); j++) { const x = -82 + j * 19; d += ` c 6 -14 12 -14 9 0 c -2 8 6 8 10 -2`; void x; }
    return drawOn(el('path', { d, fill: 'none', stroke: pal.violet, 'stroke-width': 2.4, 'stroke-linecap': 'round' }, pg));
  });
  // 落書き：サングラスの太陽
  const sun = g({}, pg); tf(sun, 58, 22);
  el('circle', { r: 13, fill: pal.yellow }, sun);
  for (let i = 0; i < 8; i++) el('line', { x1: 0, y1: -16, x2: 0, y2: -21, stroke: pal.yellowDark, 'stroke-width': 2.4, 'stroke-linecap': 'round', transform: `rotate(${i * 45})` }, sun);
  el('path', { d: 'M -10 -3 h 8 v 4 q -4 3 -8 0 Z M 2 -3 h 8 v 4 q -4 3 -8 0 Z', fill: pal.ink }, sun);
  el('path', { d: 'M -5 6 Q 0 10 5 6', stroke: pal.ink, 'stroke-width': 1.8, fill: 'none' }, sun);
  // 机と2人
  const her = k.buddy({ x: 250, y: FY, scale: 1.1, facing: -1, color: pal.coral, dark: pal.coralDark });
  const b = k.buddy({ x: 120, y: FY, scale: 1.1 });
  k.shadow(200, FY + 1, 70, 4);
  el('rect', { x: 140, y: 186, width: 130, height: 8, rx: 3, fill: pal.wood });
  [150, 260].forEach((x) => el('rect', { x: x - 3, y: 194, width: 6, height: FY - 194, fill: pal.woodDark }));
  el('path', { d: 'M 170 186 L 176 180 L 226 180 L 232 186 Z', fill: '#fff', stroke: pal.line, 'stroke-width': 1.5 });
  const pen = el('line', { stroke: pal.ink, 'stroke-width': 3, 'stroke-linecap': 'round' });
  const ha = [0, 1].map(() => k.text(0, 0, 'ha', { 'font-size': 14, fill: pal.coralDark }));
  const hs = [0, 1].map(() => heart(k, k.root, pal.red));
  return {
    update(t) {
      lines.forEach((f, i) => f(seg(t, 0.2 + i * 0.45, 0.65 + i * 0.45)));
      tf(sun, 58, 22, 0, t > 1.7 ? easeOut(seg(t, 1.7, 2.0)) * (1 + 0.05 * Math.sin(t * 6)) : 0.001);
      const wr = t < 2.0 ? Math.sin(t * 26) * 4 : 0;
      P(her, { x: 250, facing: -1, lean: 8, armR: reach(her, 1.1, 'R', 214 + wr, 180), look: 0.5, mood: t > 3.0 ? 'grin' : 'smile', blink: blinkAt(t, 1) });
      const H = { x: 214 + wr, y: 182 };
      k.set(pen, { x1: H.x, y1: H.y, x2: H.x + 4, y2: H.y - 12 });
      const lean = easeInOut(seg(t, 1.2, 1.7));
      const laugh = t > 2.6 ? Math.abs(Math.sin((t - 2.6) * 14)) * (1 - seg(t, 3.8, 4.4)) : 0;
      P(b, { x: 120 + 14 * lean, lean: 8 * lean - 6 * laugh, lift: 3 * laugh, look: 0.6, mood: t > 2.5 ? 'grin' : 'smile', blink: t > 2.6 ? 0.8 : blinkAt(t), armL: 8 + 20 * laugh, armR: 8 + 30 * laugh });
      ha.forEach((n, i) => { const q = seg(t, 2.7 + i * 0.3, 3.5 + i * 0.3); tf(n, 100 + i * 34, FY - 120 - 16 * q, 0, hump(q) + 0.001); });
      hs.forEach((n, i) => { const q = seg(t, 3.4 + i * 0.25, 4.4); tf(n, 120 + (i ? 30 : -24), FY - 150 - 12 * q, 0, hump(q) + 0.001); });
    }
  };
}
