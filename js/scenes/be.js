// be：病院で、まめが看護師の姉を紹介する。帽子・エプロン・名札で「看護師である」ことが分かる（例文 My sister is a nurse.）
// このファイルは y0 系シーンの共有小道具も export する（notebook / pencil / clinicBg / popS）
import { seg, lerp, easeInOut, easeOut, backOut, hump, clamp, wobble } from '../ease.js';
import { hp } from './dig.js';
import { P, blinkAt } from './run-after.js';
import { path, walk } from './queue-up.js';
export const popS = (p) => (p <= 0 ? 0.001 : p >= 1 ? 1 : Math.max(0.001, backOut(clamp(p))));
// ノート（原点＝中心、開いた形）。write(q) で行が書かれていく（0〜1）
export function notebook(k, x, y, parent) {
  const { el, pal } = k, g = k.g({}, parent); k.tf(g, x, y);
  el('path', { d: 'M -40 -12 L 0 -9 L 40 -12 L 40 8 L 0 11 L -40 8 Z', fill: '#fff', stroke: pal.line, 'stroke-width': 2, 'stroke-linejoin': 'round' }, g);
  el('line', { x1: 0, y1: -9, x2: 0, y2: 11, stroke: pal.line, 'stroke-width': 2 }, g);
  const lines = [-5, 0, 5].flatMap((dy) => [[-34, dy], [6, dy]]).map(([lx, ly]) => el('line', { x1: lx, y1: ly, x2: lx + 28, y2: ly, stroke: pal.blueDark, 'stroke-width': 1.8, 'stroke-linecap': 'round', 'stroke-dasharray': 28, 'stroke-dashoffset': 28 }, g));
  return { g, write(q) { lines.forEach((l, i) => l.setAttribute('stroke-dashoffset', (28 * (1 - clamp(q * lines.length - i))).toFixed(1))); } };
}
// 鉛筆（原点＝握り、+y＝先）
export function pencil(k, parent) {
  const g = k.g({}, parent), pal = k.pal;
  k.el('rect', { x: -3, y: -16, width: 6, height: 24, rx: 1.5, fill: pal.yellow, stroke: pal.yellowDark, 'stroke-width': 1 }, g);
  k.el('path', { d: 'M -3 8 L 0 15 L 3 8 Z', fill: '#F3D8B0' }, g);
  k.el('rect', { x: -3, y: -19, width: 6, height: 4, rx: 1.5, fill: '#F49AB0' }, g);
  return g;
}
// 病院の背景（腰壁・十字の表示板・カーテン）
export function clinicBg(k, FY = 236) {
  const { el, g, tf, pal } = k;
  k.backdrop({ floorY: FY, mood: 'indoor' });
  el('rect', { x: 0, y: 150, width: 400, height: FY - 150, fill: '#E4F1F4' });
  el('rect', { x: 0, y: 148, width: 400, height: 4, fill: '#CFE3E8' });
  const sg = g({}); tf(sg, 168, 64);
  el('rect', { x: -30, y: -24, width: 60, height: 48, rx: 8, fill: '#fff', stroke: pal.line, 'stroke-width': 2 }, sg);
  el('path', { d: 'M -6 -15 h 12 v 9 h 9 v 12 h -9 v 9 h -12 v -9 h -9 v -12 h 9 Z', fill: pal.red }, sg);
  el('rect', { x: 318, y: 30, width: 70, height: 4, rx: 2, fill: pal.sub });
  for (let i = 0; i < 4; i++) el('path', { d: `M ${320 + i * 17} 34 q 8 90 0 196 h 17 q -8 -106 0 -196 Z`, fill: i % 2 ? '#CFE8F2' : '#DDF0F7' });
  return FY;
}

export const meta = { duration: 4.0, beats: [[0, '姉が来る'], [1.7, '紹介する'], [2.8, '看護師です']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = clinicBg(k);
  const me = k.buddy({ x: 108, y: FY, scale: 0.9 });
  const sis = k.buddy({ x: 470, y: FY, scale: 1, facing: -1, color: pal.coral, dark: pal.coralDark });
  // 看護師の帽子とエプロン（体と一緒に動く）
  const cap = g({}, sis.body);
  el('path', { d: 'M -19 -76 L -16 -94 L 16 -94 L 19 -76 Q 0 -82 -19 -76 Z', fill: '#fff', stroke: pal.line, 'stroke-width': 1.5 }, cap);
  el('path', { d: 'M -2.5 -91 h 5 v 4 h 4 v 5 h -4 v 4 h -5 v -4 h -4 v -5 h 4 Z', fill: pal.red }, cap);
  el('path', { d: 'M -22 -30 L 22 -30 L 24 -2 Q 0 4 -24 -2 Z', fill: '#fff', opacity: 0.95 }, sis.body);
  const tag = g({}, sis.body);
  el('rect', { x: -2, y: -26, width: 26, height: 12, rx: 3, fill: pal.blue }, tag);
  // クリップボード（姉の手前の手）
  const cb = g({});
  el('rect', { x: -11, y: -2, width: 22, height: 28, rx: 3, fill: pal.woodDark }, cb);
  el('rect', { x: -8, y: 3, width: 16, height: 20, fill: '#fff' }, cb);
  [8, 12, 16].forEach((y) => el('line', { x1: -5, y1: y, x2: 5, y2: y, stroke: pal.sub, 'stroke-width': 1.5 }, cb));
  el('rect', { x: -4, y: -4, width: 8, height: 5, rx: 1.5, fill: pal.sub }, cb);
  // 名札「NURSE」が光る
  const badge = g({});
  el('rect', { x: -34, y: -13, width: 68, height: 26, rx: 13, fill: '#fff', stroke: pal.blue, 'stroke-width': 2.5 }, badge);
  k.text(0, 1, 'NURSE', { 'font-size': 14, fill: pal.blueDark }, badge);
  const xf = path([[0.1, 470], [1.6, 250]]);
  return {
    update(t) {
      walk(sis, xf, t, { armR: 8, mood: 'smile', look: 0.3 });
      const arrived = seg(t, 1.6, 2.0), bow = hump(seg(t, 2.9, 3.6));
      if (t > 1.6) P(sis, { x: 250, facing: -1, armR: lerp(8, 40, easeOut(arrived)), armL: 10, lean: 10 * bow, mood: 'grin', look: 0.4, blink: blinkAt(t) });
      const h = hp(sis, 1, 'R', 26); tf(cb, h.x, h.y - 6, -6);
      const pres = easeOut(seg(t, 1.7, 2.2));
      P(me, { armR: lerp(8, 70, pres) + 4 * Math.sin(t * 3) * pres, armL: 10, lean: -3 * pres, look: lerp(0, 0.8, easeInOut(seg(t, 0.6, 1.2))), mood: t > 1.7 && t < 2.5 && Math.sin(t * 22) > -0.2 ? 'open' : 'grin', blink: blinkAt(t, 1.1) });
      const bp = seg(t, 2.6, 3.0);
      tf(badge, 262, 104 - 6 * easeOut(bp), 0, popS(bp));
      badge.setAttribute('opacity', bp > 0 ? 1 : 0);
    }
  };
}
