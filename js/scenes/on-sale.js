// on sale：靴屋の店員が値札を下げた値段に替えて「SALE」の札を出す→まめが喜んでその靴を手に取る（例文 These shoes are on sale today.）
import { seg, lerp, easeInOut, easeOut, hump, wobble } from '../ease.js';
import { P, reach, held, walk, path, popIn } from './in-common.js';

export const meta = { duration: 4.4, beats: [[0, 'いつもの値段'], [1.3, '今日は値下げ'], [3.2, 'セール中']] };

function shoe(k, parent, c) {
  const g = k.g({}, parent);
  k.el('path', { d: 'M -14 0 L -14 -12 Q -8 -14 -4 -10 Q 4 -4 14 -4 Q 18 -2 18 2 L 18 4 L -14 4 Z', fill: c }, g);
  k.el('rect', { x: -14, y: 2, width: 32, height: 3, rx: 1.5, fill: '#fff' }, g);
  return g;
}

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 240, mood: 'indoor' });
  el('rect', { x: 0, y: FY - 6, width: 400, height: 6, fill: pal.line });
  // 店の棚
  [92, 140].forEach((y) => el('rect', { x: 16, y, width: 130, height: 5, fill: pal.woodDark }));
  [[40, 92, pal.blue], [104, 92, pal.violet], [40, 140, pal.yellow], [104, 140, pal.green]].forEach(([x, y, c]) => { const s = shoe(k, k.root, c); tf(s, x, y - 4, 0, 0.9); });
  // 展示台と目玉の赤い靴
  k.shadow(250, FY, 46, 4);
  el('rect', { x: 210, y: 180, width: 80, height: FY - 180, rx: 4, fill: '#F1E4CF' });
  el('rect', { x: 206, y: 176, width: 88, height: 7, rx: 3, fill: pal.woodDark });
  const pair = g({}); const s1 = shoe(k, pair, pal.red), s2 = shoe(k, pair, pal.red); tf(s1, -12, 0); tf(s2, 14, 2);
  // 値札（80→40）
  const tag = g({}); tf(tag, 250, 206);
  el('rect', { x: -22, y: -12, width: 44, height: 24, rx: 4, fill: '#fff', stroke: pal.ink, 'stroke-width': 2 }, tag);
  const old = k.text(0, 1, '80', { 'font-size': 15, fill: pal.ink }, tag);
  const slash = el('line', { x1: -14, y1: 6, x2: 14, y2: -5, stroke: pal.red, 'stroke-width': 3, 'stroke-linecap': 'round', opacity: 0 }, tag);
  const nw = k.text(0, 0, '40', { 'font-size': 18, fill: pal.red }, tag);
  // SALE 札（店員が掛ける）
  const sale = g({});
  el('line', { x1: -16, y1: -24, x2: 0, y2: -36, stroke: pal.sub, 'stroke-width': 2 }, sale);
  el('line', { x1: 16, y1: -24, x2: 0, y2: -36, stroke: pal.sub, 'stroke-width': 2 }, sale);
  el('rect', { x: -32, y: -24, width: 64, height: 26, rx: 5, fill: pal.red }, sale);
  k.text(0, -10, 'SALE', { 'font-size': 15, fill: '#fff' }, sale);
  const hook = el('circle', { cx: 250, cy: 104, r: 3, fill: pal.sub });
  const C = k.buddy({ x: 330, y: FY, scale: 0.86, facing: -1, color: pal.coral, dark: pal.coralDark });
  const A = k.buddy({ x: 440, y: FY, scale: 0.86, facing: -1 });
  const xa = path([[1.9, 440], [2.9, 300]]);
  k.root.appendChild(pair);
  return {
    update(t) {
      // 店員：札を持ち上げてフックに掛ける→値札に線を引く
      const hang = easeInOut(seg(t, 0.3, 1.0));
      const mark = easeOut(seg(t, 1.1, 1.5));
      const hp0 = { x: lerp(300, 262, hang), y: lerp(200, 116, hang) };
      const hp1 = { x: 262, y: 206 };
      const tgt = t < 1.05 ? hp0 : t < 1.6 ? { x: lerp(262, hp1.x, easeOut(seg(t, 1.0, 1.15))), y: lerp(116, hp1.y, easeOut(seg(t, 1.0, 1.15))) } : null;
      P(C, { look: 0.5, mood: 'smile', armR: tgt ? reach(C, 0.86, 'R', tgt.x, tgt.y) : lerp(60, 8, easeOut(seg(t, 1.6, 2.0))), lift: 4 * hang * (t < 1.05 ? 1 : 0) });
      const h = held(k, C, 0.86, k.g({}), 'R');
      const onHook = t > 1.0;
      const sw = onHook ? 4 * wobble(seg(t, 1.0, 2.0), 2, 4) : 0;
      tf(sale, onHook ? 250 : h.x, onHook ? 140 : h.y + 34, sw);
      slash.setAttribute('opacity', mark > 0 ? 1 : 0); k.set(slash, { x2: lerp(-14, 14, mark) });
      tf(nw, 0, 34 - 2 * hump(seg(t, 1.4, 1.7)), 0, popIn(seg(t, 1.4, 1.7)));
      // まめ：入ってきて札を見て大喜び→靴を手に取る
      walk(A, xa, t, { look: 0.5, mood: t > 2.6 ? 'grin' : 'smile' });
      const grab = easeInOut(seg(t, 3.0, 3.4)), up = easeInOut(seg(t, 3.4, 3.9));
      if (t > 2.9) A.pose({ armR: reach(A, 0.86, 'R', lerp(320, 262, grab), lerp(200, 170, grab) - 20 * up), lift: 5 * hump(seg(t, 2.6, 3.0)) });
      const ha = held(k, A, 0.86, k.g({}), 'R');
      if (t > 3.4) tf(pair, ha.x, ha.y + 4, 0, 0.9); else tf(pair, 250, 172, 0, 0.9);
    }
  };
}
