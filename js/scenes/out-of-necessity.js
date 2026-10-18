// out of necessity：お腹がペコペコで皿は空っぽ。仕方なくレシピを見ながら、まめが自分で卵を割って焼く（例文 I learned to cook out of necessity.）
import { seg, lerp, easeInOut, easeOut, hump, wobble } from '../ease.js';
import { P, reach, held, icon, kitchenBg } from './in-common.js';

export const meta = { duration: 4.4, beats: [[0, 'お腹ペコペコ'], [1.4, '仕方なく'], [3.4, '自分で作った']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = kitchenBg(k, 240);
  el('rect', { x: 0, y: FY - 6, width: 400, height: 6, fill: pal.line });
  // カウンターとコンロ
  el('rect', { x: 210, y: 186, width: 190, height: FY - 186, fill: '#E9EDF2' });
  el('rect', { x: 206, y: 180, width: 194, height: 8, rx: 3, fill: '#B8C2CF' });
  const flame = [0, 1, 2].map((i) => el('path', { d: 'M 0 0 Q -4 -6 0 -11 Q 4 -6 0 0 Z', fill: i % 2 ? pal.yellow : '#FF9E5C' }));
  el('rect', { x: 262, y: 172, width: 56, height: 8, rx: 3, fill: '#4A5468' });
  el('rect', { x: 318, y: 174, width: 34, height: 4, rx: 2, fill: '#4A5468' });
  const white = el('path', { d: 'M -14 0 Q -16 -6 -6 -6 Q 0 -10 8 -6 Q 16 -6 14 0 Z', fill: '#fff', stroke: '#D9C9A8', 'stroke-width': 1.5, opacity: 0 });
  const yolk = el('circle', { r: 4.5, fill: pal.yellow, opacity: 0 });
  // レシピ本（立てかけ）
  const rb = g({}); tf(rb, 372, 160); el('rect', { x: -14, y: -18, width: 28, height: 36, rx: 3, fill: '#fff', stroke: pal.blue, 'stroke-width': 3 }, rb);
  [-8, -2, 4].forEach((y) => el('rect', { x: -8, y, width: 16, height: 3, rx: 1.5, fill: pal.sub }, rb));
  // 空の皿（左の台）
  el('rect', { x: 20, y: 196, width: 90, height: FY - 196, fill: pal.wood });
  el('rect', { x: 16, y: 190, width: 98, height: 7, rx: 3, fill: pal.woodDark });
  el('ellipse', { cx: 64, cy: 188, rx: 22, ry: 5, fill: '#fff', stroke: pal.line, 'stroke-width': 2 });
  const A = k.buddy({ x: 150, y: FY, scale: 0.9 });
  const growl = el('path', { d: 'M 0 0 l 4 -4 l 4 4 l 4 -4', stroke: pal.sub, 'stroke-width': 2.4, fill: 'none' });
  const egg = g({}); el('ellipse', { rx: 6, ry: 8, fill: '#FFF7E6', stroke: '#E8D9BC', 'stroke-width': 1.5 }, egg);
  const sizzle = [0, 1, 2].map(() => el('path', { d: 'M 0 0 Q -3 -5 0 -10', stroke: '#C9D1DC', 'stroke-width': 2, fill: 'none' }));
  return {
    update(t) {
      // お腹をおさえる→皿を見る（空）→コンロへ
      const go = easeInOut(seg(t, 1.2, 1.8));
      const x = lerp(150, 236, go);
      const hungry = t < 1.3;
      const crack = easeInOut(seg(t, 2.1, 2.5));
      const fry = seg(t, 2.6, 3.6);
      P(A, { x, walk: (x - 150) * 0.107, facing: t < 0.7 ? -1 : 1, look: t < 0.7 ? 0.7 : 0.5, mood: hungry ? 'sad' : t > 3.6 ? 'grin' : 'flat', squash: hungry ? 0.97 : 1, lean: hungry ? 6 : 4 });
      if (hungry) A.pose({ armR: 40, armL: 40 });
      else if (t < 2.6) A.pose({ armR: t > 1.9 ? reach(A, 0.9, 'R', lerp(270, 290, crack), lerp(150, 162, crack)) : 10, armL: 10, look: t < 2.0 ? 0.9 : 0.5 });
      else A.pose({ armR: reach(A, 0.9, 'R', 300 + 4 * Math.sin(t * 10), 166), armL: 10 });
      if (t > 3.6) A.pose({ armR: lerp(A.state.armR, 20, easeOut(seg(t, 3.6, 3.9))), lift: 4 * hump(seg(t, 3.7, 4.1)) });
      const h = held(k, A, 0.9, egg, 'R', 0, 30);
      tf(egg, h.x, h.y - 6, 0, 1); egg.setAttribute('opacity', t > 1.85 && t < 2.5 ? 1 : 0);
      flame.forEach((f, i) => tf(f, 274 + i * 16, 186, 0, 1, t > 1.9 ? 1 + 0.25 * Math.sin(t * 13 + i * 2) : 0.001));
      const e = easeOut(seg(t, 2.45, 2.7));
      tf(white, 290, 172, 0, Math.max(0.01, e), Math.max(0.01, e)); white.setAttribute('opacity', t > 2.45 ? 1 : 0);
      tf(yolk, 290, 167); k.set(yolk, { opacity: t > 2.45 ? 1 : 0, fill: lerp(0, 1, fry) > 0.8 ? '#FFB93A' : pal.yellow });
      sizzle.forEach((s, i) => { const q = (t * 1.5 + i / 3) % 1; tf(s, 278 + i * 12, 164 - 14 * q); s.setAttribute('opacity', t > 2.6 && t < 3.9 ? Math.sin(q * Math.PI) : 0); });
      tf(growl, A.state.x - 6, FY - 40); growl.setAttribute('opacity', hungry ? (Math.sin(t * 12) > 0 ? 1 : 0.3) : 0);
    }
  };
}
