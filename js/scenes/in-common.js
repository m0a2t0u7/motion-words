// in common：2人の好きな物が次々に同じだと分かり、ハイタッチする（例文 We have a lot in common.）
// このファイルは ph2 の会話表現シーンが共有する小道具もまとめて export する。
import { seg, lerp, easeInOut, easeOut, backOut, hump, clamp, wobble } from '../ease.js';
import { hp, reach } from './dig.js';
import { P } from './run-after.js';
import { say } from './look-over.js';
export { hp, held, reach } from './dig.js';
export { P, run, sofa, clock, win, car } from './run-after.js';
export { say, cloud, phone, roomBg } from './look-over.js';
export { thought, rain, check } from './work-on.js';
export { path, walk, sign, door, person, pop } from './queue-up.js';
export { streetBg, kitchenBg, heart } from './weigh.js';
export { officeBg, desk, monitor, coin, star } from './get-on-with.js';
export { papers } from './hand-over.js';
export { bulb } from './look-to.js';

// 吹き出し＋短い英語。show(p, x, y)
export function cue(k, str, w = 70, h = 30, tail = -1, fs = 14) {
  const b = say(k, w, h, tail);
  if (str) k.text(0, 1, str, { 'font-size': fs, fill: k.pal.ink }, b.g);
  return b;
}
// 話している間だけ口がぱくぱく
export const talk = (t, a, b) => (t > a && t < b && Math.sin(t * 22) > -0.2 ? 'open' : null);
export const sc = (p) => Math.max(0.001, p);
export const popIn = (p) => (p <= 0 ? 0.001 : p >= 1 ? 1 : backOut(clamp(p)));
// 汗のしずく
export function drop(k, parent) {
  return k.el('path', { d: 'M 0 -7 Q 5 0 0 5 Q -5 0 0 -7 Z', fill: k.pal.water }, parent || k.root);
}
// 段ボール箱
export function box(k, w = 46, h = 36, color = '#E3B77E', parent) {
  const g = k.g({}, parent);
  k.el('rect', { x: -w / 2, y: -h, width: w, height: h, rx: 3, fill: color }, g);
  k.el('rect', { x: -w / 2, y: -h, width: w, height: 6, fill: '#000', opacity: 0.08 }, g);
  k.el('rect', { x: -4, y: -h, width: 8, height: h * 0.5, fill: '#F4E1C1' }, g);
  return g;
}
// 絵アイコン（中心原点、おおよそ半径12）
export function icon(k, kind, parent) {
  const { el, pal } = k, g = k.g({}, parent);
  const I = {
    ball: () => { el('circle', { r: 11, fill: '#fff', stroke: pal.ink, 'stroke-width': 2 }, g); el('path', { d: 'M 0 -5 L 5 -1 L 3 5 L -3 5 L -5 -1 Z', fill: pal.ink }, g); },
    note: () => { el('path', { d: 'M -4 8 L -4 -9 L 8 -12 L 8 5', stroke: pal.violet, 'stroke-width': 3, fill: 'none', 'stroke-linejoin': 'round' }, g); el('ellipse', { cx: -7, cy: 8, rx: 4.5, ry: 3.5, fill: pal.violet }, g); el('ellipse', { cx: 5, cy: 5, rx: 4.5, ry: 3.5, fill: pal.violet }, g); },
    cup: () => { el('path', { d: 'M -9 -6 L 7 -6 L 5 10 L -7 10 Z', fill: pal.coffee }, g); el('path', { d: 'M 7 -2 Q 13 -1 6 6', stroke: pal.coffee, 'stroke-width': 2.6, fill: 'none' }, g); el('path', { d: 'M -3 -9 Q -6 -13 -2 -16 M 2 -9 Q -1 -13 3 -16', stroke: pal.sub, 'stroke-width': 1.6, fill: 'none' }, g); },
    pizza: () => { el('path', { d: 'M -11 -9 Q 0 -14 11 -9 L 0 12 Z', fill: pal.yellow, stroke: '#E9A43A', 'stroke-width': 2.5, 'stroke-linejoin': 'round' }, g); [[-3, -5], [4, -4], [0, 3]].forEach(([x, y]) => el('circle', { cx: x, cy: y, r: 2.4, fill: pal.red }, g)); },
    pasta: () => { el('path', { d: 'M -12 1 Q 0 14 12 1 Z', fill: '#fff', stroke: pal.line, 'stroke-width': 2 }, g); el('path', { d: 'M -8 1 Q -6 -8 0 -5 Q 6 -9 8 1', fill: '#F4D27A', stroke: '#E0B54E', 'stroke-width': 1.5 }, g); el('circle', { cx: 0, cy: -3, r: 3, fill: pal.red }, g); },
    bed: () => { el('rect', { x: -12, y: -2, width: 24, height: 8, rx: 2, fill: pal.blue }, g); el('rect', { x: -12, y: -8, width: 8, height: 6, rx: 2, fill: '#fff', stroke: pal.line }, g); el('rect', { x: -13, y: -10, width: 3, height: 20, fill: pal.woodDark }, g); el('rect', { x: 10, y: 0, width: 3, height: 10, fill: pal.woodDark }, g); },
    book: () => { el('rect', { x: -10, y: -12, width: 20, height: 24, rx: 2, fill: pal.blue }, g); el('rect', { x: -10, y: -12, width: 4, height: 24, fill: pal.blueDark }, g); el('rect', { x: -3, y: -6, width: 10, height: 4, rx: 1, fill: '#fff', opacity: 0.8 }, g); },
    apple: () => { el('circle', { cx: 0, cy: 2, r: 9, fill: pal.red }, g); el('path', { d: 'M 0 -6 L 1 -11', stroke: pal.woodDark, 'stroke-width': 2 }, g); el('ellipse', { cx: 5, cy: -9, rx: 4, ry: 2, fill: pal.green }, g); },
    fish: () => { el('path', { d: 'M -12 0 Q 0 -10 10 0 Q 0 10 -12 0 Z M 8 0 L 14 -6 L 14 6 Z', fill: pal.blue }, g); el('circle', { cx: -5, cy: -1, r: 1.6, fill: pal.ink }, g); }
  };
  (I[kind] || I.ball)();
  return g;
}
// 2人が正面を向き合うときの共通姿勢
export const face2 = (b, o) => P(b, { look: 0.5, ...o });

export const meta = { duration: 4.2, beats: [[0, '好きな物'], [1.3, '同じだ！'], [3.2, '共通点が多い']] };

export function create(k) {
  const { el, tf, pal } = k;
  const FY = k.backdrop({ floorY: 240, mood: 'indoor' });
  el('rect', { x: 0, y: FY - 6, width: 400, height: 6, fill: pal.line });
  el('rect', { x: 160, y: 40, width: 80, height: 60, rx: 6, fill: '#DDEFFA', stroke: '#fff', 'stroke-width': 5 });
  const A = k.buddy({ x: 112, y: FY, scale: 0.9 });
  const C = k.buddy({ x: 288, y: FY, scale: 0.9, facing: -1, color: pal.coral, dark: pal.coralDark });
  const kinds = ['ball', 'note', 'cup'];
  const bA = say(k, 112, 44, 1), bC = say(k, 112, 44, -1);
  const iA = kinds.map((n, i) => { const g = icon(k, n, bA.g); return g; });
  const iC = kinds.map((n, i) => { const g = icon(k, n, bC.g); return g; });
  const links = kinds.map(() => el('path', { d: '', stroke: pal.green, 'stroke-width': 3, fill: 'none', 'stroke-dasharray': '4 4', 'stroke-linecap': 'round' }));
  const marks = kinds.map(() => { const g = k.g({}); el('circle', { r: 9, fill: pal.green }, g); el('path', { d: 'M -4 0 L -1 3 L 4 -3', stroke: '#fff', 'stroke-width': 2.4, fill: 'none', 'stroke-linecap': 'round' }, g); return g; });
  return {
    update(t) {
      const meet = easeInOut(seg(t, 3.0, 3.6));
      const hi = hump(seg(t, 3.5, 4.0));
      const ax = lerp(112, 160, meet), cx = lerp(288, 240, meet);
      P(A, { x: ax, walk: (ax - 112) * 0.107, look: 0.6, mood: t > 1.4 ? 'grin' : 'smile', armR: lerp(8, 135, easeOut(seg(t, 3.3, 3.6))), lean: -4 * hi, lift: 6 * hi });
      P(C, { x: cx, walk: (288 - cx) * 0.107, look: 0.6, mood: t > 1.6 ? 'grin' : 'smile', armR: lerp(8, 135, easeOut(seg(t, 3.3, 3.6))), lean: -4 * hi, lift: 6 * hi });
      bA.show(seg(t, 0.15, 0.45), 112, 70);
      bC.show(seg(t, 0.35, 0.65), 288, 70);
      kinds.forEach((_, i) => {
        const tA = 0.6 + i * 0.6, tC = 1.0 + i * 0.6;
        tf(iA[i], -34 + i * 34, 0, 0, popIn(seg(t, tA, tA + 0.3)));
        tf(iC[i], -34 + i * 34, 0, 0, popIn(seg(t, tC, tC + 0.3)));
        const q = easeOut(seg(t, tC + 0.25, tC + 0.6));
        const xa = 112 - 34 + i * 34, xc = 288 - 34 + i * 34;
        k.set(links[i], { d: `M ${xa} 86 Q 200 ${130 + i * 10} ${lerp(xa, xc, q)} ${lerp(86, 86, q)}`, opacity: q > 0 && t < 3.0 ? 1 : 0 });
        tf(marks[i], 170 + i * 30, 132, 0, popIn(seg(t, tC + 0.5, tC + 0.8)));
      });
    }
  };
}
