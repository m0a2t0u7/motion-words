// protein：まめがフォークで卵と魚を一口ずつ食べ、腕に力こぶができる（例文 Eggs and fish are good sources of protein.）
import { seg, lerp, easeInOut, easeOut, hump, wobble } from '../ease.js';
import { reach, hp, held } from './dig.js';
import { food, plate, counter } from './diet.js';
import { star } from './get-on-with.js';

export const meta = { duration: 4.2, beats: [[0, '卵と魚'], [0.6, '食べる'], [2.6, '体をつくる']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  k.backdrop({ floorY: 250, mood: 'indoor' });
  el('rect', { x: 290, y: 40, width: 90, height: 64, rx: 6, fill: '#DDEFFA', stroke: '#fff', 'stroke-width': 5 });
  el('line', { x1: 335, y1: 40, x2: 335, y2: 104, stroke: '#fff', 'stroke-width': 4 });
  const S = 1.15, BX = 150, b = k.buddy({ x: BX, y: 232, scale: S });
  const bump = el('ellipse', { rx: 9, ry: 7, fill: pal.mint, stroke: pal.mintDark, 'stroke-width': 2.5 });
  counter(k, 212);
  plate(k, 222, 214, 62);
  plate(k, 292, 214, 74);
  const egg = food(k, 'egg'); tf(egg, 222, 212, 0, 1.4);
  const fish = food(k, 'fish'); tf(fish, 292, 212, 0, 1.5);
  const fork = g({});
  el('line', { x1: 0, y1: 0, x2: 0, y2: 20, stroke: '#AEB7C4', 'stroke-width': 3, 'stroke-linecap': 'round' }, fork);
  [-3, 0, 3].forEach((x) => el('line', { x1: x, y1: 20, x2: x, y2: 28, stroke: '#AEB7C4', 'stroke-width': 1.6 }, fork));
  const bites = ['#FFD34E', '#E3A76A'].map((c) => el('circle', { r: 4.5, fill: c }));
  const stars = [0, 1, 2].map(() => star(k, null, 7));
  const mx = BX + 14, my = 232 - 64 * S;
  const plates = [[224, 200], [290, 198]];
  return {
    update(t) {
      let c = null;
      [0.5, 1.5].forEach((a, i) => {
        const u = seg(t, a, a + 0.95);
        if (u <= 0 || u >= 1) return;
        const [px, py] = plates[i];
        const go = easeInOut(seg(u, 0, 0.35)), back = easeInOut(seg(u, 0.45, 0.8));
        c = { i, u, x: u < 0.42 ? lerp(BX + 50, px, go) : lerp(px, mx, back), y: u < 0.42 ? lerp(190, py, go) : lerp(py, my, back) - 10 * Math.sin(back * Math.PI), carry: u >= 0.42 };
      });
      const flex = easeOut(seg(t, 2.6, 3.0));
      const lean = c ? (c.u < 0.42 ? 14 * hump(seg(c.u, 0, 0.84)) : 4) : 0;
      b.pose({ lean, armL: 10, look: 0.4, mood: c && c.u > 0.78 && c.u < 0.95 ? 'open' : flex > 0.5 ? 'grin' : 'smile',
        squash: 1 + 0.04 * wobble(seg(t, 2.9, 3.8), 2, 4), lift: 2 * hump(seg(t, 2.9, 3.3)) });
      b.pose({ armR: c ? reach(b, S, 'R', c.x, c.y) : lerp(60, 165, flex) });
      const h = hp(b, S, 'R', 30);
      held(k, b, S, fork, 'R', 0, 30);
      const tip = hp(b, S, 'R', 54);
      fork.setAttribute('opacity', t < 2.55 ? 1 : 0);
      bites.forEach((bt, i) => { k.set(bt, { cx: tip.x, cy: tip.y, opacity: c && c.i === i && c.carry && c.u < 0.86 ? 1 : 0 }); });
      tf(egg, 222, 212, 0, 1.4 * (1 - 0.3 * seg(t, 0.9, 1.0)), 1.4);
      tf(fish, 292, 212, 0, 1.5 * (1 - 0.3 * seg(t, 1.9, 2.0)), 1.5);
      const elb = hp(b, S, 'R', 12);
      k.set(bump, { cx: elb.x + 5, cy: elb.y, rx: 9 * flex + 0.01, ry: 7 * flex + 0.01, opacity: flex > 0.05 ? 1 : 0 });
      stars.forEach((s, i) => { const q = seg(t, 3.0 + i * 0.15, 3.9 + i * 0.1); tf(s, elb.x + [-14, 12, 28][i], elb.y - 26 - 14 * q, 30 * q, hump(q) + 0.001); });
    }
  };
}
