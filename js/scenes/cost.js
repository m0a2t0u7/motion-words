// cost：店のテーブルのかばん。客が値札をめくると「$50」と分かる（例文 This bag costs fifty dollars.）
import { seg, lerp, easeInOut, easeOut, backOut, wobble } from '../ease.js';
import { reach, gait, table } from './dig.js';
import { bubble } from './weigh.js';

export const meta = { duration: 4.2, beats: [[0, 'かばんを見る'], [1.4, '値札をめくる'], [2.8, '50ドル']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  table(k, 190);
  el('rect', { x: 30, y: 46, width: 76, height: 66, rx: 6, fill: '#DDEFFA', stroke: '#fff', 'stroke-width': 5 });
  el('rect', { x: 250, y: 70, width: 120, height: 6, rx: 3, fill: pal.woodDark });
  [[262, pal.coral], [290, pal.yellow], [318, pal.violet], [344, pal.blue]].forEach(([x, c]) => el('rect', { x, y: 50, width: 18, height: 20, rx: 4, fill: c, opacity: 0.8 }));
  const bagG = g({}); tf(bagG, 244, 186);
  k.shadow(0, 2, 34, 5, bagG);
  el('path', { d: 'M -14 -42 Q -14 -64 0 -64 Q 14 -64 14 -42', fill: 'none', stroke: pal.violet, 'stroke-width': 5, 'stroke-linecap': 'round' }, bagG);
  el('path', { d: 'M -22 -44 H 22 L 26 0 H -26 Z', fill: pal.coral, stroke: pal.coralDark, 'stroke-width': 2, 'stroke-linejoin': 'round' }, bagG);
  el('rect', { x: -22, y: -44, width: 44, height: 8, fill: pal.coralDark, opacity: 0.35 }, bagG);
  el('circle', { cx: 4, cy: -22, r: 7, fill: '#fff', opacity: 0.8 }, bagG);
  // 値札：ひもでかばんの取っ手から下がる
  const str = el('path', { d: '', fill: 'none', stroke: pal.sub, 'stroke-width': 1.6 });
  const tag = g({});
  const face = g({}, tag);
  el('rect', { x: -12, y: 0, width: 24, height: 30, rx: 4, fill: '#fff', stroke: pal.sub, 'stroke-width': 2 }, face);
  el('circle', { cx: 0, cy: 5, r: 2.2, fill: pal.line, stroke: pal.sub, 'stroke-width': 1 }, face);
  const price = k.text(0, 19, '$50', { 'font-size': 11, fill: pal.red }, face);
  const back = el('rect', { x: -12, y: 0, width: 24, height: 30, rx: 4, fill: '#F2F4F7', stroke: pal.sub, 'stroke-width': 2 }, tag);
  const b = k.buddy({ x: 70, y: 236 });
  const bub = bubble(k, 104, 52);
  const big = k.text(0, 0, '$50', { 'font-size': 30, fill: pal.red }, bub);
  const xf = (t) => lerp(70, 166, easeInOut(seg(t, 0.1, 1.3)));
  return {
    update(t) {
      const p = gait(xf, t, 70, 16), tg = easeInOut(seg(t, 1.2, 1.7)), rel = easeInOut(seg(t, 1.7, 2.3));
      const fl = Math.cos(rel * Math.PI); // 1 → -1：めくる
      const ty = 196;
      const sw = wobble(seg(t, 2.2, 3.2), 2, 3) * 0.12;
      const tp = { x: lerp(203, 200, tg), y: lerp(ty - 20, ty - 26, tg) };
      b.pose({ x: p.x, walk: p.walk, armL: p.armL, lean: p.lean + 3 * tg, armR: 8, look: 0.6, mood: t > 2.4 ? 'open' : 'smile', squash: 1 });
      const A = reach(b, 1, 'R', tp.x, tp.y);
      b.pose({ armR: p.m > 0.2 ? p.armR : lerp(8, A, tg) });
      k.set(str, { d: `M 232 122 Q 218 ${tp.y - 40} ${tp.x} ${tp.y - 2}` });
      tf(tag, tp.x, tp.y - 2, 12 * sw * 10 + (1 - tg) * 6);
      face.setAttribute('transform', `scale(${Math.abs(fl).toFixed(3) || 0.001} 1)`);
      face.setAttribute('display', fl < 0 ? '' : 'none');
      k.set(back, { opacity: fl >= 0 ? 1 : 0 });
      const pop = backOut(seg(t, 2.3, 2.9), 1.3);
      tf(bub, 190, 88, 0, pop, pop); bub.setAttribute('opacity', pop > 0.01 ? 1 : 0);
    }
  };
}
