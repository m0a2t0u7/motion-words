// dull：刃のなまったナイフでトマトを切ろうとするが、押すとトマトがつぶれるだけで切れない（例文 This knife is too dull to cut tomatoes.）
import { seg, lerp, easeInOut, easeOut, hump, wobble } from '../ease.js';
import { P, blinkAt } from './run-after.js';
import { roomBg } from './look-over.js';
import { held } from './dig.js';

export const meta = { duration: 3.8, beats: [[0, 'ナイフを構える'], [1.2, '押しても…'], [2.6, '切れない']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = roomBg(k, 'home', 240);
  k.shadow(260, FY + 2, 80, 5);
  el('rect', { x: 170, y: 215, width: 170, height: 8, rx: 3, fill: pal.wood });
  el('rect', { x: 178, y: 223, width: 7, height: 17, fill: pal.woodDark }); el('rect', { x: 325, y: 223, width: 7, height: 17, fill: pal.woodDark });
  el('rect', { x: 164, y: 211, width: 62, height: 5, rx: 2, fill: '#E7CFA3' });
  const tom = g({}); tf(tom, 192, 211);
  el('ellipse', { cx: 0, cy: -14, rx: 16, ry: 14, fill: pal.red }, tom); el('path', { d: 'M -6 -26 L 0 -22 L 6 -26 L 2 -29 L -2 -29 Z', fill: pal.green }, tom); el('ellipse', { cx: -5, cy: -19, rx: 3, ry: 2, fill: '#fff', opacity: 0.6 }, tom);
  const b = k.buddy({ x: 140, y: FY + 8, scale: 1 });
  const kn = g({});
  el('rect', { x: -4, y: -20, width: 8, height: 20, rx: 3, fill: pal.woodDark }, kn);
  el('path', { d: 'M -4 0 L 4 0 L 4 20 Q 4 25 0 25 Q -4 25 -4 20 Z', fill: '#D5DCE6', stroke: pal.sub, 'stroke-width': 1.5, 'stroke-linejoin': 'round' }, kn);
  const dent = el('path', { d: 'M -3 22 q 3 3 6 0', stroke: pal.sub, 'stroke-width': 1.2, fill: 'none' }, kn);
  const st = [0, 1, 2].map(() => el('line', { x1: 0, y1: 0, x2: 0, y2: -7, stroke: pal.coralDark, 'stroke-width': 2.5, 'stroke-linecap': 'round' }));
  return {
    update(t) {
      const dn = easeInOut(seg(t, 0.4, 1.2)), push = hump(seg(t, 1.2, 1.9)) + hump(seg(t, 1.9, 2.6)), give = easeOut(seg(t, 2.6, 3.2));
      const A = lerp(172, 118, dn) + 0 * push;
      const press = Math.max(0, push);
      P(b, { armR: A + 0, armL: 30, lean: 4 + 8 * press + 4 * give, look: 0.6, mood: t < 1.2 ? 'smile' : 'sad', blink: blinkAt(t) });
      held(k, b, 1, kn, 'R', b.state.armR - b.state.lean);
      const sq = Math.max(press * 0.8, dn > 0.9 ? 0.3 : 0);
      tf(tom, 192, 211, wobble(seg(t, 1.9, 3.3), 3, 3) * 3 * (t > 1.9 ? 1 : 0), 1 + 0.14 * sq, 1 - 0.3 * sq);
      st.forEach((s, i) => { const u = (t * 1.4 + i / 3) % 1; tf(s, 185 + i * 14, 160 - u * 10, (i - 1) * 40); s.setAttribute('opacity', give > 0 ? hump(u) : 0); });
    }
  };
}
