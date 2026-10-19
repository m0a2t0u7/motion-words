// belt：たくさん食べたあと、まめがおなかのベルトのバックルを外して穴をひとつゆるめ、ほっとする（例文 He loosened his belt after the big meal.）
import { seg, lerp, easeInOut, easeOut, hump, wobble } from '../ease.js';
import { wardrobe, reach, P, blinkAt } from './skirt.js';

export const meta = { duration: 4.4, beats: [[0, 'おなかいっぱい'], [1.3, 'ベルトをゆるめる'], [3.1, 'ほっとする']] };

export function create(k) {
  const { el, g, pal, tf } = k, S = 1.55;
  const FY = k.backdrop({ floorY: 240, mood: 'indoor' });
  el('rect', { x: 0, y: FY - 6, width: 400, height: 6, fill: pal.line });
  // 食卓と空の皿（左）
  k.shadow(80, FY + 1, 76, 4);
  el('rect', { x: 0, y: 168, width: 150, height: 9, rx: 3, fill: pal.wood });
  [14, 136].forEach((x) => el('rect', { x: x - 3, y: 177, width: 6, height: FY - 177, fill: pal.woodDark }));
  [[34, 0], [72, 1], [110, 0]].forEach(([x, i]) => {
    el('ellipse', { cx: x, cy: 166, rx: 18, ry: 4.5, fill: '#fff', stroke: pal.line, 'stroke-width': 2 });
    if (i) el('path', { d: `M ${x - 8} 160 q 8 -16 16 0`, fill: '#fff', stroke: pal.line, 'stroke-width': 2 });
  });
  el('path', { d: 'M 140 120 l 4 20 M 148 120 l 0 20', stroke: pal.sub, 'stroke-width': 2.5, 'stroke-linecap': 'round', opacity: 0 });
  const b = k.buddy({ x: 240, y: FY, scale: S });
  const W = wardrobe(k, b);
  W.top({ color: '#fff', dark: pal.line, sleeve: 'short', to: -22, collar: true });
  W.bottom({ kind: 'trousers', color: '#7C8AA5', dark: '#5E6B86', from: -22 });
  W.feet('shoe', pal.ink);
  // ベルト（体の座標）：帯＋バックル＋余った先（穴つき）
  const belt = g({}, W.torso);
  el('rect', { x: -32, y: -24, width: 64, height: 7, fill: '#6B4329' }, belt);
  const tip = g({}, belt);
  el('rect', { x: -22, y: -23.5, width: 22, height: 6, rx: 3, fill: '#8A5A3C' }, tip);
  [-18, -13, -8].forEach((x) => el('circle', { cx: x, cy: -20.5, r: 1.2, fill: '#3E2716' }, tip));
  const buckle = g({}, b.body);
  el('rect', { x: -6, y: -26, width: 12, height: 11, rx: 2, fill: 'none', stroke: '#D9B44A', 'stroke-width': 2.6 }, buckle);
  el('line', { x1: 0, y1: -25, x2: 0, y2: -16, stroke: '#D9B44A', 'stroke-width': 2 }, buckle);
  const puff = el('path', { d: 'M 0 0 q 8 -6 16 0 q 6 5 12 0', fill: 'none', stroke: '#C9D3E0', 'stroke-width': 3, 'stroke-linecap': 'round' });
  const tight = [-1, 1].map((d) => el('path', { d: `M 0 -5 L ${d * 6} 0 L 0 5`, fill: 'none', stroke: pal.coralDark, 'stroke-width': 2.4, 'stroke-linecap': 'round' }));
  return {
    update(t) {
      const reachP = easeInOut(seg(t, 1.0, 1.4)) * (1 - easeInOut(seg(t, 2.8, 3.2)));
      const pull = easeInOut(seg(t, 1.5, 2.0)), back = easeInOut(seg(t, 2.1, 2.7));
      const relief = easeOut(seg(t, 2.7, 3.3));
      // 苦しい（つぶれて細い）→ ゆるめるとおなかが広がる
      const sq = lerp(1.02, 0.93, relief) + 0.02 * wobble(seg(t, 2.7, 3.6), 2, 4) + 0.008 * Math.sin(t * 5) * (1 - relief);
      P(b, { x: 240, squash: sq, lean: -4 * relief, look: t < 1.0 ? -0.4 : lerp(0.2, 0, relief), mood: t < 2.7 ? 'flat' : 'grin', blink: relief > 0.3 ? 1 : blinkAt(t) });
      const wy = FY - (10 + 20 * sq) * S;
      if (reachP > 0) b.pose({ armR: lerp(8, reach(b, S, 'R', 240 + 4 * S, wy), reachP), armL: lerp(8, reach(b, S, 'L', 240 - 14 * S, wy), reachP) });
      else b.pose({ armR: lerp(8, 40, relief) , armL: lerp(8, 40, relief) });
      // 先を引き出して、ひとつ外側の穴で留め直す（余りが短くなる）
      tf(tip, 6 * pull * (1 - back) + 5 * back, 0);
      tf(buckle, 3 * pull * (1 - back), 0);
      tight.forEach((n, i) => { tf(n, 240 + (i ? 1 : -1) * 54, wy, 0, i ? 1 : -1); n.setAttribute('opacity', t < 1.4 ? 0.5 + 0.5 * Math.sin(t * 12) : 0); });
      const q = seg(t, 2.8, 3.8);
      tf(puff, 240 + 34, FY - 92 * S + 4 - 10 * q); puff.setAttribute('opacity', hump(q));
    }
  };
}
