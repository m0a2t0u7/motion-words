// colleague：昼休み、社員証を付けた同僚と休憩室で並んでお弁当を食べ、笑い合う（例文 I had lunch with a colleague.）
import { seg, lerp, easeInOut, easeOut, hump, clamp } from '../ease.js';
import { BL, hp, reach, held, P, blinkAt, wear, deskFront } from './member.js';
import { officeBg } from './get-on-with.js';
import { fork } from './restaurant.js';

export const meta = { duration: 4.4, beats: [[0, '昼休み'], [1.2, '一緒に食べる'], [3.0, '同僚とランチ']] };

function bento(k, x, y) {
  const g = k.g({}), { el, pal } = k;
  el('rect', { x: -18, y: -10, width: 36, height: 12, rx: 3, fill: '#2B3446' }, g);
  el('rect', { x: -15, y: -12, width: 14, height: 6, rx: 3, fill: '#fff' }, g);
  el('circle', { cx: 6, cy: -10, r: 4, fill: pal.red }, g); el('circle', { cx: 12, cy: -10, r: 3, fill: pal.green }, g);
  k.tf(g, x, y);
  return g;
}

export function create(k) {
  const { el, g, tf, pal } = k, S = 0.95, FY = 236;
  officeBg(k, FY, 150);
  el('circle', { cx: 80, cy: 60, r: 18, fill: '#fff', stroke: pal.ink, 'stroke-width': 3 });
  el('path', { d: 'M 80 60 V 46 M 80 60 V 74', stroke: pal.ink, 'stroke-width': 2.6, 'stroke-linecap': 'round' });
  const b = k.buddy({ x: 140, y: FY, scale: S, facing: 1 }); wear(k, b, 'badge', '#DCEBFF');
  const c = k.buddy({ x: 270, y: FY, scale: S, facing: -1, ...BL(k) }); wear(k, c, 'badge', '#DCEBFF');
  const TOP = FY - 28;
  deskFront(k, 110, 190, TOP, FY);
  bento(k, 180, TOP); bento(k, 232, TOP);
  const f1 = fork(k), f2 = fork(k);
  const food1 = el('circle', { r: 3.5, fill: '#fff' }), food2 = el('circle', { r: 3.5, fill: pal.red });
  return {
    update(t) {
      const cyc = (t0, o) => { const q = ((t - t0 + o) % 1.1) / 1.1; return t > t0 && t < 3.0 ? q : 0; };
      const q1 = cyc(0.7, 0), q2 = cyc(1.0, 0.4);
      const laugh = hump(seg(t, 3.1, 4.4));
      [[b, q1, f1, food1, 180, 1], [c, q2, f2, food2, 232, -1]].forEach(([p, q, f, fd, bx, dir], i) => {
        const up = hump(seg(q, 0.15, 0.9));
        P(p, { look: q > 0.1 && q < 0.95 ? 0.3 : 0.9, blink: blinkAt(t, i), mood: up > 0.6 ? 'open' : laugh > 0.2 ? 'grin' : 'smile', lean: 6 - 8 * laugh * Math.abs(Math.sin(t * 9)), squash: 1 - 0.04 * laugh * Math.abs(Math.sin(t * 9)) });
        const mouth = { x: p.state.x + dir * 12 * S, y: FY - 52 * S };
        const box = { x: bx, y: TOP - 12 };
        const tg = { x: lerp(box.x, mouth.x + dir * 6, up), y: lerp(box.y, mouth.y, up) };
        p.pose({ armR: reach(p, S, 'R', tg.x, tg.y) });
        const h = held(k, p, S, f, 'R', 0, 26);
        tf(fd, h.x + dir * 2, h.y + (up > 0.1 && up < 0.95 ? 0 : 200), 0, up > 0.85 ? 0.001 : 1);
      });
    }
  };
}
