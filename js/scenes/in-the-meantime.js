// in the meantime：鍋を火にかけて煮えるのを待つ間に、まめが食卓にお皿を並べる（例文 Dinner is cooking. In the meantime, set the table.）
import { seg, lerp, easeInOut, easeOut, hump, wobble } from '../ease.js';
import { P, reach, held, say, walk, path, popIn } from './in-common.js';

export const meta = { duration: 4.4, beats: [[0, '煮込み中'], [1.4, 'その間に'], [3.8, '同時に完成']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 240, mood: 'indoor' });
  el('rect', { x: 0, y: FY - 6, width: 400, height: 6, fill: pal.line });
  el('rect', { x: 270, y: 44, width: 90, height: 64, rx: 6, fill: '#DDEFFA', stroke: '#fff', 'stroke-width': 5 });
  // コンロ台と鍋
  el('rect', { x: 10, y: 172, width: 130, height: FY - 172, rx: 4, fill: '#E9EDF2' });
  el('rect', { x: 8, y: 166, width: 134, height: 8, rx: 3, fill: '#B8C2CF' });
  el('rect', { x: 30, y: 196, width: 80, height: 30, rx: 4, fill: '#D7DDE5' });
  const flame = [0, 1, 2].map((i) => el('path', { d: 'M 0 0 Q -4 -6 0 -12 Q 4 -6 0 0 Z', fill: i % 2 ? pal.yellow : '#FF9E5C' }));
  el('rect', { x: 48, y: 140, width: 56, height: 26, rx: 5, fill: pal.red });
  el('rect', { x: 42, y: 146, width: 8, height: 5, rx: 2, fill: pal.coralDark });
  el('rect', { x: 102, y: 146, width: 8, height: 5, rx: 2, fill: pal.coralDark });
  const lid = g({}); el('path', { d: 'M -30 0 Q 0 -10 30 0 Z', fill: '#C9D1DC' }, lid); el('rect', { x: -5, y: -11, width: 10, height: 5, rx: 2, fill: pal.ink }, lid);
  const steam = [0, 1, 2].map(() => el('path', { d: 'M 0 0 Q -5 -8 0 -16 Q 5 -24 0 -32', stroke: '#C9D1DC', 'stroke-width': 3, fill: 'none', 'stroke-linecap': 'round' }));
  // キッチンタイマー（残り時間が減る）
  el('circle', { cx: 120, cy: 120, r: 16, fill: '#fff', stroke: pal.ink, 'stroke-width': 2.5 });
  const pie = el('path', { d: '', fill: pal.coral });
  const ding = [0, 1, 2].map((i) => el('line', { x1: 0, y1: -22, x2: 0, y2: -30, stroke: pal.yellowDark, 'stroke-width': 3, 'stroke-linecap': 'round', transform: '' }));
  const C = k.buddy({ x: 168, y: FY, scale: 0.86, facing: 1, color: pal.coral, dark: pal.coralDark });
  const A = k.buddy({ x: 240, y: FY - 6, scale: 0.86 });
  // 食卓（まめは奥に立つ）
  k.shadow(315, FY, 80, 5);
  el('rect', { x: 230, y: 200, width: 166, height: 8, rx: 3, fill: pal.woodDark });
  el('rect', { x: 236, y: 208, width: 154, height: 18, fill: pal.wood });
  el('rect', { x: 240, y: 226, width: 8, height: FY - 226, fill: pal.woodDark });
  el('rect', { x: 378, y: 226, width: 8, height: FY - 226, fill: pal.woodDark });
  const plate = (parent) => { const p = g({}, parent); el('ellipse', { cx: 0, cy: 0, rx: 15, ry: 4, fill: '#fff', stroke: pal.line, 'stroke-width': 1.5 }, p); return p; };
  const placed = [0, 1, 2].map(() => plate());
  const stack = g({}); const st = [0, 1, 2].map((i) => { const p = plate(stack); tf(p, 0, -i * 4); return p; });
  const bub = say(k, 58, 34, -1);
  el('ellipse', { cx: -6, cy: 2, rx: 13, ry: 4, fill: '#fff', stroke: pal.sub, 'stroke-width': 2 }, bub.g);
  el('path', { d: 'M 12 -6 L 22 2 L 12 10', stroke: pal.coral, 'stroke-width': 3, fill: 'none', 'stroke-linecap': 'round' }, bub.g);
  const xa = path([[1.0, 240], [1.25, 240], [1.75, 262], [2.3, 300], [2.85, 336]]);
  const putT = [1.6, 2.6, 3.4], spots = [276, 320, 364];
  return {
    update(t) {
      // ピンク：まめに頼む→鍋の前で待つ
      const turn = t > 1.1;
      P(C, { facing: turn ? -1 : 1, look: 0.6, mood: t < 1.0 && Math.sin(t * 22) > 0 ? 'open' : 'smile', armR: turn ? lerp(8, 60, easeOut(seg(t, 1.2, 1.6))) : 8 + 80 * hump(seg(t, 0.2, 1.0)) });
      bub.show(seg(t, 0.25, 0.5) * (1 - seg(t, 1.1, 1.3)), 206, 112);
      flame.forEach((f, i) => tf(f, 54 + i * 22, 196, 0, 1, 1 + 0.25 * Math.sin(t * 13 + i * 2)));
      const boil = t > 0.4 ? 1 : 0;
      const done = easeOut(seg(t, 3.9, 4.3));
      tf(lid, 76, 140 - (t < 3.9 ? 1.5 * boil * Math.max(0, Math.sin(t * 17)) : 0) , 0);
      steam.forEach((s, i) => { const q = (t * 0.9 + i / 3) % 1; tf(s, 62 + i * 14, 132 - 26 * q); s.setAttribute('opacity', (0.15 + 0.5 * done) * Math.sin(q * Math.PI) * boil + 0.5 * done * Math.sin(q * Math.PI)); });
      const rem = 1 - seg(t, 0.4, 3.9), a = rem * Math.PI * 2;
      k.set(pie, { d: rem > 0.001 ? `M 120 120 L 120 106 A 14 14 0 ${a > Math.PI ? 1 : 0} 1 ${120 + 14 * Math.sin(a)} ${120 - 14 * Math.cos(a)} Z` : '' });
      ding.forEach((d, i) => d.setAttribute('transform', `translate(120 120) rotate(${-30 + i * 30})`) || d.setAttribute('opacity', t > 3.9 ? hump(seg(t, 3.9, 4.4)) : 0));
      // まめ：皿を1枚ずつ並べる
      let n = 0; putT.forEach((p) => { if (t > p) n++; });
      walk(A, xa, t, { look: 0.6, mood: t > 3.6 ? 'grin' : 'smile' });
      A.pose({ y: FY - 6 });
      const cur = Math.min(2, n), pt = putT[cur];
      const r = n < 3 ? hump(seg(t, pt - 0.35, pt + 0.25)) : 0;
      const tx = lerp(A.state.x + 34, spots[cur], r), ty = lerp(170, 196, r);
      A.pose({ armR: n < 3 ? reach(A, 0.86, 'R', tx, ty) : 10, armL: 10 });
      const h = held(k, A, 0.86, stack, 'R', 0, 32);
      tf(stack, h.x, h.y - 2);
      st.forEach((p, i) => p.setAttribute('opacity', i < 3 - n ? 1 : 0));
      stack.setAttribute('opacity', n < 3 ? 1 : 0);
      placed.forEach((p, i) => { tf(p, spots[i], 199 - 2 * wobble(seg(t, putT[i], putT[i] + 0.4), 2, 5)); p.setAttribute('opacity', t > putT[i] ? 1 : 0); });
    }
  };
}
