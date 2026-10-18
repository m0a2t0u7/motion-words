// follow：犬が飼い主のすぐ後ろをどこへでもついて歩き、止まれば隣で止まる（例文 The dog follows me everywhere.）
import { seg, lerp, easeInOut, wobble } from '../ease.js';
import { gait } from './dig.js';
import { streetBg } from './weigh.js';

export const meta = { duration: 4.4, beats: [[0, '歩き出す'], [1.6, '犬もついてくる'], [3.6, '止まっても横に']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = streetBg(k, 240);
  el('rect', { x: 300, y: FY - 34, width: 50, height: 6, rx: 3, fill: pal.woodDark });
  el('rect', { x: 306, y: FY - 28, width: 5, height: 28, fill: pal.woodDark });
  el('rect', { x: 340, y: FY - 28, width: 5, height: 28, fill: pal.woodDark });
  const me = k.buddy({ x: 90, y: FY, facing: 1 });
  // 犬
  const dog = g({}), sh = k.shadow(0, 0, 26, 5, dog), flip = g({}, dog);
  const legs = [-14, -8, 12, 18].map((x, i) => el('line', { x1: 0, y1: 0, x2: 0, y2: 14, stroke: i % 2 ? '#B98550' : '#9A6C3E', 'stroke-width': 6, 'stroke-linecap': 'round' }, g({}, flip)));
  const lg = legs.map((l) => l.parentNode);
  const tail = g({}, flip);
  el('path', { d: 'M 0 0 Q -10 -8 -8 -18', stroke: '#B98550', 'stroke-width': 6, fill: 'none', 'stroke-linecap': 'round' }, tail);
  el('ellipse', { cx: 2, cy: -26, rx: 26, ry: 14, fill: '#D6A06A' }, flip);
  const head = g({}, flip);
  el('ellipse', { cx: 0, cy: 0, rx: 13, ry: 11, fill: '#D6A06A' }, head);
  el('ellipse', { cx: 11, cy: 4, rx: 8, ry: 6, fill: '#F1D7B3' }, head);
  el('circle', { cx: 18, cy: 1, r: 2.6, fill: pal.ink }, head);
  el('circle', { cx: 4, cy: -3, r: 2.2, fill: pal.ink }, head);
  el('ellipse', { cx: -6, cy: -6, rx: 5, ry: 10, fill: '#9A6C3E', transform: 'rotate(18 -6 -6)' }, head);
  const tongue = el('ellipse', { cx: 14, cy: 11, rx: 3, ry: 4.5, fill: pal.coral }, head);
  const mx = (t) => lerp(90, 250, easeInOut(seg(t, 0.3, 2.4))) + lerp(0, 40, easeInOut(seg(t, 3.6, 4.2)));
  const dx = (t) => mx(t - 0.5) - 52;
  return {
    update(t) {
      const a = gait(mx, t, 90, 16, 0.107);
      me.pose({ x: a.x, walk: a.walk, armL: a.armL, armR: a.armR, lean: a.lean, look: -0.5, mood: 'smile' });
      const d = gait(dx, t, 38, 0, 0.19), s = Math.sin(d.walk);
      tf(dog, d.x, FY, 0, 1);
      legs.forEach((l, i) => tf(lg[i], [-14, -8, 12, 18][i], -14, (i % 2 ? -s : s) * 30 * d.m));
      tf(tail, -22, -30, Math.sin(t * 14) * 18);
      tf(head, 26, -40 - Math.abs(s) * 2 * d.m, 0);
      tf(flip, 0, -Math.abs(s) * 2 * d.m);
      k.set(tongue, { opacity: d.m < 0.3 ? 1 : 0 });
    }
  };
}
