// lonely：新しい街にスーツケースで来たまめ。2人連れが楽しそうに通り過ぎ、ひとり取り残される（例文 She felt lonely in the new city.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';
import { P, blinkAt, hp, walkTo, path, person, streetBg, suitcase, pullCase, heart, sym } from './confused.js';

export const meta = { duration: 4.4, beats: [[0, '新しい街'], [1.3, '2人連れが通る'], [3.2, 'ひとりきり']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 1;
  const FY = streetBg(k, 236, 'evening');
  // 街灯
  el('rect', { x: 320, y: FY - 130, width: 5, height: 130, fill: pal.sub });
  el('circle', { cx: 322, cy: FY - 134, r: 9, fill: '#FFE7A8' });
  const rod = el('line', { stroke: pal.sub, 'stroke-width': 3.5, 'stroke-linecap': 'round' });
  k.shadow(246, FY + 1, 22, 3.5);
  el('rect', { x: 226, y: FY - 48, width: 40, height: 44, rx: 6, fill: pal.violet });
  [238, 254].forEach((x) => el('rect', { x: x - 1.5, y: FY - 44, width: 3, height: 36, rx: 1.5, fill: '#7F63D6' }));
  [232, 260].forEach((x) => el('circle', { cx: x, cy: FY - 2, r: 3.5, fill: pal.ink }));
  const b = k.buddy({ x: 190, y: FY, scale: S });
  const pairs = [['coral', 'blue'], ['yellow', 'violet']].map(([a, c], i) => [person(k, a, { scale: 0.9 }), person(k, c, { scale: 0.9 })]);
  const hs = [0, 1].map(() => heart(k));
  const xa = path([[0.6, 460], [2.6, -60]]), xb = path([[1.6, -80], [3.6, 470]]);
  const dot = sym(k, '…', pal.sub, 20);
  return {
    update(t) {
      const slump = easeInOut(seg(t, 3.0, 3.6)), lookP = t < 2.6 ? lerp(0, 0.9, seg(t, 1.0, 1.4)) : lerp(-0.9, 0, seg(t, 3.0, 3.4));
      P(b, { x: 190, lean: 8 * slump, squash: 1 - 0.04 * slump, look: t < 1.6 ? lookP : t < 2.8 ? lerp(0.9, -0.9, seg(t, 1.6, 2.6)) : lookP * 0.3,
        armL: 8 + 40 * hump(seg(t, 1.5, 2.1)), armR: 30, mood: t > 1.8 ? 'sad' : 'smile', blink: blinkAt(t) });
      const h = hp(b, S, 'R'); k.set(rod, { x1: h.x, y1: h.y, x2: 246, y2: FY - 46 });
      [[xa, -1, 0.6], [xb, 1, 1.6]].forEach(([f, d, t0], i) => {
        const x = f(t), w = walkTo(f, t, f(0), d);
        pairs[i].forEach((p, j) => P(p, { x: x + j * 46 * -d, walk: w.walk + j, facing: j ? -d : d, armL: w.armL, armR: j ? w.armR : 40, lean: 3, mood: Math.sin(t * 9 + j) > 0 ? 'open' : 'grin', look: 0.4, blink: blinkAt(t, j) }));
        tf(hs[i], x - 23 * d, FY - 112 + 4 * Math.sin(t * 5), 0, (t > t0 && t < t0 + 2) ? 1 : 0.001);
      });
      dot(seg(t, 3.3, 3.7), 214, FY - 110);
    }
  };
}
