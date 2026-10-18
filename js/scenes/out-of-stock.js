// out of stock：まめが欲しい商品の絵を見せる→店員が棚を確かめると空っぽ。札を貼って「すみません」とおじぎ（例文 Sorry, that item is out of stock.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';
import { P, reach, held, cue, popIn } from './in-common.js';

export const meta = { duration: 4.4, beats: [[0, 'これください'], [1.2, '棚が空っぽ'], [2.8, '在庫切れです']] };

function jar(k, parent, c) {
  const g = k.g({}, parent);
  k.el('rect', { x: -7, y: -18, width: 14, height: 18, rx: 3, fill: c }, g);
  k.el('rect', { x: -8, y: -22, width: 16, height: 5, rx: 2, fill: k.pal.ink, opacity: 0.6 }, g);
  k.el('rect', { x: -5, y: -12, width: 10, height: 5, rx: 1, fill: '#fff', opacity: 0.8 }, g);
  return g;
}

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 240, mood: 'indoor' });
  el('rect', { x: 0, y: FY - 6, width: 400, height: 6, fill: pal.line });
  // 棚：上段のまんなかだけ空
  el('rect', { x: 236, y: 52, width: 150, height: FY - 58, rx: 4, fill: '#F1E4CF' });
  [110, 170].forEach((y) => el('rect', { x: 236, y, width: 150, height: 6, fill: pal.woodDark }));
  [[256, 110, pal.yellow], [276, 110, pal.yellow], [350, 110, pal.green], [370, 110, pal.green], [256, 170, pal.violet], [280, 170, pal.violet], [312, 170, pal.coral], [336, 170, pal.coral], [362, 170, pal.yellow]].forEach(([x, y, c]) => { const j = jar(k, k.root, c); tf(j, x, y); });
  el('rect', { x: 296, y: 82, width: 40, height: 27, rx: 3, fill: 'none', stroke: pal.sub, 'stroke-width': 2, 'stroke-dasharray': '4 3' });
  const tag = g({}); el('rect', { x: -26, y: -9, width: 52, height: 18, rx: 3, fill: pal.red }, tag); k.text(0, 1, 'SOLD OUT', { 'font-size': 9.5, fill: '#fff' }, tag);
  const A = k.buddy({ x: 110, y: FY, scale: 0.88 });
  const C = k.buddy({ x: 214, y: FY, scale: 0.88, facing: -1, color: pal.coral, dark: pal.coralDark });
  // まめが持つ商品カード（青いびん）
  const card = g({}); el('rect', { x: -16, y: -20, width: 32, height: 40, rx: 4, fill: '#fff', stroke: pal.line, 'stroke-width': 2 }, card);
  const cj = jar(k, card, pal.blue); tf(cj, 0, 12);
  const sorry = cue(k, 'Sorry!', 70, 30, 1, 15);
  return {
    update(t) {
      const showC = easeOut(seg(t, 0.2, 0.6)) * (1 - easeInOut(seg(t, 3.4, 3.8)));
      P(A, { look: 0.6, armR: lerp(8, 70, showC), mood: t > 3.0 ? 'sad' : 'smile', lean: 4 * showC });
      const hc = held(k, A, 0.88, card, 'R', 0, 34); tf(card, hc.x, hc.y - 14, 0, 0.9 * (showC > 0.02 ? 1 : 0.001));
      // 店員：棚の方を向いて確認→札を貼る→振り向いておじぎ
      const turn = t > 1.0 && t < 2.5;
      const stick = easeInOut(seg(t, 1.5, 2.0));
      const bow = hump(seg(t, 2.7, 3.9));
      P(C, { facing: turn ? 1 : -1, look: turn ? 0.4 : 0.6, mood: t > 1.3 && t < 2.6 ? 'open' : t > 2.6 ? 'sad' : 'smile', lean: 26 * bow, lift: 3 * hump(seg(t, 1.6, 2.0)) });
      if (turn) C.pose({ armR: reach(C, 0.88, 'R', lerp(240, 300, stick), lerp(150, 98, stick)) });
      const h = held(k, C, 0.88, k.g({}), 'R', 0, 30);
      const stuck = t > 2.0;
      tf(tag, stuck ? 316 : h.x, stuck ? 96 : h.y, stuck ? -4 : 0, t > 1.3 ? (stuck ? 1 : 0.8) : 0.001);
      sorry.show(seg(t, 2.75, 3.05) * (1 - seg(t, 4.1, 4.3)), 228, 112);
    }
  };
}
