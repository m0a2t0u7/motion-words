// sour：レモンをかじって、酸っぱくてぎゅっと顔をすぼめる（例文 The lemon was very sour.）
import { seg, lerp, easeInOut, easeOut, hump, wobble, clamp } from '../ease.js';
import { P, blinkAt } from './run-after.js';
import { kitchenBg } from './weigh.js';
import { hp, reach } from './dig.js';

export const meta = { duration: 4.2, beats: [[0, 'レモン'], [1.8, 'かじる'], [2.7, '酸っぱい']] };

const kf = (t, pts) => {
  for (let i = 1; i < pts.length; i++) if (t < pts[i][0]) return lerp(pts[i - 1][1], pts[i][1], easeInOut(seg(t, pts[i - 1][0], pts[i][0])));
  return pts[pts.length - 1][1];
};

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = kitchenBg(k);
  const S = 1.2, SP = { x: 193, y: 182 };
  k.shadow(290, FY, 110, 7);
  el('rect', { x: 176, y: 198, width: 214, height: 9, rx: 3, fill: pal.wood });
  [[190, 207], [368, 207]].forEach(([x, y]) => el('rect', { x, y, width: 9, height: 29, rx: 2, fill: pal.woodDark }));
  el('ellipse', { cx: 193, cy: 198, rx: 16, ry: 3, fill: pal.shadow, opacity: 0.35 });
  const b = k.buddy({ x: 130, y: FY, scale: S });
  P(b, {});
  const aT = reach(b, S, 'R', SP.x, SP.y), aM = 128;
  const lem = g({});
  el('ellipse', { cx: 0, cy: 8, rx: 12, ry: 8, fill: pal.yellow, stroke: pal.yellowDark, 'stroke-width': 1.5 }, lem);
  el('path', { d: 'M 11 6 q 5 0 5 2 q 0 2 -5 2', fill: pal.yellow, stroke: pal.yellowDark, 'stroke-width': 1.5 }, lem);
  el('path', { d: 'M -11 6 q -4 0 -4 2 q 0 2 4 2', fill: pal.yellow, stroke: pal.yellowDark, 'stroke-width': 1.5 }, lem);
  const cut = el('ellipse', { cx: 12, cy: 8, rx: 3, ry: 7, fill: '#FFF3B0', opacity: 0 }, lem);
  const sp = [0, 1, 2].map(() => el('path', { d: 'M 0 -6 Q 4 1 0 4 Q -4 1 0 -6 Z', fill: '#FFF3B0', stroke: pal.yellowDark, 'stroke-width': 1 }));
  const rays = [-1, 1].map(() => [0, 1, 2].map(() => el('line', { x1: 0, y1: 0, x2: 9, y2: 0, stroke: pal.sub, 'stroke-width': 2.4, 'stroke-linecap': 'round' })));
  return {
    update(t) {
      const a = kf(t, [[0, 8], [0.7, 8], [1.3, aT], [1.5, aT], [2.3, aM], [3.7, aM], [4.0, 40]]);
      const pk = seg(t, 2.5, 2.9), shake = pk * (1 - seg(t, 3.5, 3.9)) * Math.sin(t * 22);
      P(b, { armR: a, lean: 3 * seg(t, 2.0, 2.4) + 2 * shake, look: 0.4, squash: 1 - 0.1 * easeOut(pk), mood: t < 2.5 ? 'smile' : 'flat', blink: t > 2.6 ? 1 : blinkAt(t) });
      const holding = t > 1.5, h = hp(b, S, 'R');
      if (holding) tf(lem, h.x - 5, h.y - 4, -14 * hump(seg(t, 2.0, 2.6)), S);
      else tf(lem, SP.x, SP.y, 0, 1);
      cut.setAttribute('opacity', t > 2.6 ? 1 : 0);
      const hx = 130, hy = FY - 84 * S;
      sp.forEach((s, i) => {
        const u = seg(t, 2.6 + i * 0.08, 3.4 + i * 0.08);
        tf(s, h.x + 4 + u * (12 + i * 8), h.y - 8 + u * (-14 + u * 40) - i * 4, 0, 1);
        s.setAttribute('opacity', u > 0 && u < 1 ? 1 : 0);
      });
      rays.forEach((r, si) => r.forEach((ln, i) => {
        const on = seg(t, 2.7, 3.0) * (1 - seg(t, 3.9, 4.2)), ang = (-30 + i * 30) * (si ? 1 : -1) + (si ? 0 : 180);
        tf(ln, hx + (si ? 36 : -36), hy + 22 + (i - 1) * 8, ang, 1);
        ln.setAttribute('opacity', on);
      }));
    }
  };
}
