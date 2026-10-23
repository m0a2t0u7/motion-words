// ripe：青い桃が色づいて熟し、まめが手に取って嬉しそうに持ち上げる（例文 These peaches are ripe and sweet.）
import { seg, lerp, easeInOut, easeOut, hump, wobble, clamp } from '../ease.js';
import { P, blinkAt, walkTo } from './run-after.js';
import { kitchenBg } from './weigh.js';
import { hp, reach } from './dig.js';

export const meta = { duration: 4.4, beats: [[0, '青い桃'], [1.6, '色づく'], [3.2, '熟した桃']] };

const kf = (t, pts) => {
  for (let i = 1; i < pts.length; i++) if (t < pts[i][0]) return lerp(pts[i - 1][1], pts[i][1], easeInOut(seg(t, pts[i - 1][0], pts[i][0])));
  return pts[pts.length - 1][1];
};
const star = 'M 0 -6 L 1.6 -1.6 L 6 0 L 1.6 1.6 L 0 6 L -1.6 1.6 L -6 0 L -1.6 -1.6 Z';

const hex = (c) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
const mix = (a, b, u) => '#' + hex(a).map((v, i) => Math.round(lerp(v, hex(b)[i], u)).toString(16).padStart(2, '0')).join('');

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = kitchenBg(k);
  const S = 1.2, SP = { x: 193, y: 182 };
  k.shadow(290, FY, 110, 7);
  el('rect', { x: 176, y: 198, width: 214, height: 9, rx: 3, fill: pal.wood });
  [[190, 207], [368, 207]].forEach(([x, y]) => el('rect', { x, y, width: 9, height: 29, rx: 2, fill: pal.woodDark }));
  el('ellipse', { cx: 227, cy: 198, rx: 50, ry: 5, fill: pal.woodDark, opacity: 0.35 });
  const peach = (parent) => {
    const body = el('circle', { cx: 0, cy: 7, r: 9, fill: '#A9D18E' }, parent);
    el('path', { d: 'M 0 -1 Q -3 7 0 15', fill: 'none', stroke: '#fff', 'stroke-width': 1.2, opacity: 0.5 }, parent);
    el('path', { d: 'M 0 -2 q 6 -6 10 -2 q -5 5 -10 2 Z', fill: pal.green }, parent);
    return body;
  };
  const others = [[216, 182], [238, 182], [227, 170]].map(([x, y]) => { const p = g({}); tf(p, x, y); return [p, peach(p)]; });
  const b = k.buddy({ x: 130, y: FY, scale: S });
  P(b, {});
  const aT = reach(b, S, 'R', SP.x, SP.y), aM = 150;
  const mine = g({}), mb = peach(mine);
  const sp = [0, 1, 2, 3].map(() => el('path', { d: star, fill: pal.yellow }));
  return {
    update(t) {
      const a = kf(t, [[0, 8], [2.2, 8], [2.7, aT], [2.9, aT], [3.5, aM], [4.4, aM]]);
      const ripe = easeInOut(seg(t, 0.4, 2.0)), gr = 1 + 0.1 * hump(seg(t, 1.4, 2.4));
      const col = mix('#A9D18E', '#FFA48C', ripe);
      mb.setAttribute('fill', col);
      others.forEach(([p, c]) => c.setAttribute('fill', col));
      P(b, { armR: a, look: 0.4, squash: 1, mood: t < 2.2 ? 'smile' : 'grin', blink: blinkAt(t) });
      const holding = t > 2.9, h = hp(b, S, 'R');
      if (holding) tf(mine, h.x - 3, h.y - 4, 0, S * (1 + 0.1 * hump(seg(t, 3.0, 3.6))));
      else tf(mine, SP.x, SP.y, 0, 1 + (gr - 1));
      sp.forEach((s, i) => {
        const on = seg(t, 1.5, 1.9) * (1 - seg(t, 2.3, 2.6));
        const px = [180, 222, 250, 205][i], py = [160, 150, 160, 140][i];
        tf(s, px, py - 6 * hump(seg(t, 1.5, 2.6)), 0, 0.7 + 0.5 * on);
        s.setAttribute('opacity', on);
      });
    }
  };
}
