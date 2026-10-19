// vitamin：まめがオレンジを食べると「C」の粒が体に入り、近づいたかぜのばい菌がはね返される（例文 Oranges are full of vitamin C, which helps prevent colds.）
import { seg, lerp, easeInOut, easeOut, hump, wobble } from '../ease.js';
import { reach, hp } from './dig.js';
import { food } from './diet.js';
import { kitchenBg } from './weigh.js';

// かぜのばい菌（原点＝中心）
export function germ(k, parent) {
  const { el, g } = k;
  const o = g({}, parent || k.root);
  for (let i = 0; i < 8; i++) { const a = (i * Math.PI) / 4; el('circle', { cx: Math.cos(a) * 12, cy: Math.sin(a) * 12, r: 3, fill: '#8FAE5C' }, o); }
  el('circle', { r: 11, fill: '#A9C46F' }, o);
  el('circle', { cx: -4, cy: -2, r: 1.8, fill: k.pal.ink }, o);
  el('circle', { cx: 4, cy: -2, r: 1.8, fill: k.pal.ink }, o);
  el('path', { d: 'M -4 4 Q 0 1 4 4', stroke: k.pal.ink, 'stroke-width': 1.6, fill: 'none' }, o);
  return o;
}

export const meta = { duration: 4.4, beats: [[0, 'オレンジ'], [1.0, 'ビタミンC'], [2.7, 'かぜを防ぐ']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = kitchenBg(k, 236);
  el('rect', { x: 0, y: FY - 30, width: 130, height: 30, fill: pal.wood });
  el('rect', { x: 0, y: FY - 34, width: 134, height: 6, rx: 3, fill: pal.woodDark });
  el('path', { d: `M 36 ${FY - 34} Q 66 ${FY - 12} 96 ${FY - 34} Z`, fill: '#fff', stroke: pal.line, 'stroke-width': 2 });
  [[54, FY - 32], [78, FY - 32], [66, FY - 44]].forEach(([x, y]) => tf(food(k, 'orange'), x, y, 0, 0.9));
  const S = 1.05, cx = 190, b = k.buddy({ x: cx, y: FY, scale: S });
  const shield = el('circle', { r: 66, fill: '#FFE9A8', opacity: 0, stroke: pal.yellowDark, 'stroke-width': 3 });
  b.g.parentNode.insertBefore(shield, b.g);
  const or = food(k, 'orange');
  const cs = [0, 1, 2, 3].map(() => { const n = g({}); el('circle', { r: 10, fill: '#FFA53A' }, n); k.text(0, 1, 'C', { 'font-size': 13, fill: '#fff' }, n); return n; });
  const germs = [0, 1, 2].map(() => germ(k));
  const cy = FY - 56 * S;
  return {
    update(t) {
      const bites = [0.9, 1.45].map((a) => hump(seg(t, a, a + 0.45)));
      const hold = t > 0.3 && t < 2.0 ? easeInOut(seg(t, 0.3, 0.7)) * (1 - easeInOut(seg(t, 1.9, 2.1))) : 0;
      const up = Math.max(bites[0], bites[1]);
      b.pose({ armL: 10, armR: 10, mood: up > 0.5 ? 'open' : t > 3.0 ? 'grin' : 'smile', look: t > 2.4 ? 0.8 : 0.3,
        squash: 1 + 0.03 * wobble(seg(t, 3.1, 3.9), 2, 4) });
      const mouth = reach(b, S, 'R', cx + 12, cy - 16);
      b.pose({ armR: lerp(40, lerp(64, mouth, up), hold) });
      const h = hp(b, S, 'R', 30);
      const eaten = seg(t, 1.0, 1.9);
      tf(or, h.x, h.y + 8, 0, Math.max(0.001, 1.15 * (1 - 0.85 * eaten)));
      or.setAttribute('opacity', t < 2.0 ? 1 : 0);
      cs.forEach((c, i) => {
        const q = seg(t, 1.5 + i * 0.18, 2.3 + i * 0.18), a = i * 1.6;
        tf(c, lerp(cx + 18, cx + Math.cos(a) * 20, easeOut(q)), lerp(cy - 20, cy + Math.sin(a) * 18, easeOut(q)) - 20 * hump(q), 0, q <= 0 || q >= 1 ? 0.001 : 1 - 0.4 * q);
      });
      const sh = easeOut(seg(t, 2.2, 2.6));
      k.set(shield, { cx, cy: cy + 4, opacity: 0.35 * sh + 0.1 * sh * Math.sin(t * 6) });
      germs.forEach((gm, i) => {
        const ang = [-0.5, 0.15, 0.75][i];
        const app = easeInOut(seg(t, 2.4, 3.1)), bounce = easeOut(seg(t, 3.1, 3.9));
        const r = lerp(lerp(220, 80, app), 175, bounce);
        tf(gm, cx + Math.cos(ang) * r, cy + Math.sin(ang) * r * 0.7, bounce * 200 * (i % 2 ? 1 : -1), 1 + 0.1 * Math.sin(t * 9 + i));
      });
    }
  };
}
