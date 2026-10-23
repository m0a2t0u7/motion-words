// strict：先生のまめが、宿題を忘れた生徒に首を横に振って指でさし、その場で宿題をさせる（例文 Our teacher is strict about homework.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';
import { P, blinkAt, hp, aim, walkTo, path, person, elder, mark, sym, onFace, paper, pencil, hold, chair } from './confused.js';

export const meta = { duration: 4.4, beats: [[0.0, '宿題は？'], [1.53, '忘れたらだめ'], [3.06, '今やりなさい']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 1, KS = 0.72;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  el('rect', { x: 120, y: 26, width: 200, height: 76, rx: 4, fill: '#3E6B5A', stroke: pal.woodDark, 'stroke-width': 6 });
  el('rect', { x: 140, y: 44, width: 74, height: 22, rx: 3, fill: '#fff', opacity: 0.85 });
  k.text(177, 56, 'HOMEWORK', { 'font-size': 10 });
  // 生徒の机（左）
  const top = FY - 40;
  const kid = person(k, 'coral', { x: 290, y: FY, scale: KS, facing: -1 });
  k.shadow(70, FY + 1, 40, 4);
  el('rect', { x: 30, y: top, width: 80, height: 7, rx: 3, fill: pal.wood });
  [36, 98].forEach((x) => el('rect', { x, y: top + 7, width: 6, height: 33, fill: pal.woodDark }));
  const b = k.buddy({ x: 350, y: FY, scale: S, facing: -1 });
  const f = onFace(k, b);
  [-10, 10].forEach((x) => el('rect', { x: x - 7, y: -59, width: 14, height: 10, rx: 2, fill: 'none', stroke: pal.ink, 'stroke-width': 1.8 }, f));
  [-1, 1].forEach((d) => el('line', { x1: d * 16, y1: -66, x2: d * 5, y2: -63, stroke: pal.ink, 'stroke-width': 2.4, 'stroke-linecap': 'round' }, f));
  const sh = g({}); paper(k, sh, 28, 34, 4); const pn = pencil(k);
  const xm = mark(k, 'x', undefined, 1.4), bang = sym(k, '!', pal.red, 26);
  const kx = path([[0.2, 290], [0.9, 250], [3.0, 250], [3.6, 130]]);
  return {
    update(t) {
      t *= 4.6 / 4.4; // 4.4 秒に収める
      // 生徒：手ぶらで来て、言われて机へ
      const kw = walkTo(kx, t, 290, -1), shrug = hump(seg(t, 1.0, 1.6));
      P(kid, { x: kw.x, walk: kw.walk, facing: kw.facing, armL: 8 + 60 * shrug, armR: 8 + 60 * shrug, lean: kw.lean, mood: t > 1.6 ? 'sad' : 'flat', look: 0.5, blink: blinkAt(t, 1) });
      const write = t > 3.7;
      if (write) { kid.pose({ facing: -1, lean: 14, look: 0.8 }); aim(kid, KS, 'R', 80 + 8 * Math.sin(t * 20), top - 4); }
      hold(k, kid, KS, pn, 'R', 30); pn.setAttribute('opacity', write ? 1 : 0);
      tf(sh, 74, top - 2, 0, 1.1, 0.14); sh.setAttribute('opacity', seg(t, 3.6, 3.8));
      // 先生：首を振る→指さす→腕組み風に見守る
      const shake = seg(t, 1.6, 2.4), point = seg(t, 2.6, 3.6);
      P(b, { x: 350, facing: -1, look: Math.sin(shake * Math.PI * 4) * 0.8 * (shake > 0 && shake < 1 ? 1 : 0) + 0.4 * (1 - shake), armL: 20, armR: 10, lean: 2, mood: 'flat', blink: blinkAt(t) });
      if (point > 0 && point < 1) aim(b, S, 'R', 70, top - 20);
      if (t > 3.6) b.pose({ armR: 40, armL: 40, lean: -4 });
      tf(xm, 250, FY - 100, 0, t > 1.4 && t < 2.6 ? 1.4 * easeOut(seg(t, 1.4, 1.7)) : 0.001);
      bang(seg(t, 2.6, 2.9) * (1 - seg(t, 3.5, 3.7)), 330, FY - 120);
    }
  };
}
