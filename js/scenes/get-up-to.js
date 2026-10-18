// get up to：月曜、同僚が週末のカレンダーを見せて「週末は何してた？」とたずね、まめが思い出そうとする（例文 What did you get up to last weekend?）
import { seg, lerp, easeInOut, hump } from '../ease.js';
import { person, officeBg, pop } from './queue-up.js';
import { bubble } from './weigh.js';

export const meta = { duration: 4.2, beats: [[0, '月曜の朝'], [1.6, '週末は？'], [3.4, '思い出す']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = officeBg(k, 236);
  const S = 0.9;
  const me = k.buddy({ x: 120, y: FY + 4, scale: S });
  const ask = person(k, 'coral', { x: 290, y: FY + 4, scale: S, facing: -1 });
  const qb = bubble(k, 96, 46);
  ['SAT', 'SUN'].forEach((d, i) => { el('rect', { x: -40 + i * 34, y: -15, width: 30, height: 30, rx: 4, fill: '#fff', stroke: pal.blue, 'stroke-width': 2 }, qb); k.text(-25 + i * 34, 0, d, { 'font-size': 9, fill: pal.blueDark }, qb); });
  k.text(36, 1, '?', { 'font-size': 20, fill: pal.coralDark }, qb);
  const th = g({});
  el('ellipse', { rx: 30, ry: 18, fill: '#fff', stroke: pal.line, 'stroke-width': 2 }, th);
  el('circle', { cx: 18, cy: 26, r: 5, fill: '#fff', stroke: pal.line, 'stroke-width': 2 }, th);
  const dots = [-12, 0, 12].map((x) => el('circle', { cx: x, cy: 0, r: 3.5, fill: pal.sub }, th));
  return {
    update(t) {
      ask.pose({ look: -0.5, mood: t < 2.4 ? 'open' : 'smile', armR: 40 + 40 * hump(seg(t, 0.5, 2.0)) });
      tf(qb, 250, FY - 118, 0, Math.max(0.001, pop(seg(t, 0.4, 0.8))));
      const think = easeInOut(seg(t, 2.2, 2.7));
      me.pose({ look: lerp(0.5, -0.2, think), mood: t < 2.2 ? 'smile' : 'flat', armR: lerp(10, 165, think), lean: -4 * think, blink: Math.abs(t - 1.5) < 0.06 ? 1 : 0 });
      tf(th, 100, FY - 120, 0, Math.max(0.001, pop(seg(t, 2.6, 3.0))));
      dots.forEach((d, i) => d.setAttribute('opacity', t > 3.0 + i * 0.25 ? 1 : 0.2));
    }
  };
}
