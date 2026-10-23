// bitter：ブラックコーヒーを一口飲んで、苦くて顔をしかめる（例文 Black coffee tastes bitter to me.）
import { seg, lerp, easeInOut, easeOut, hump, wobble, clamp } from '../ease.js';
import { P, blinkAt } from './run-after.js';
import { kitchenBg } from './weigh.js';
import { hp, reach } from './dig.js';

export const meta = { duration: 4.2, beats: [[0, 'コーヒー'], [1.6, '一口飲む'], [2.6, '苦い顔']] };

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
  const sh = el('ellipse', { cx: SP.x, cy: 198, rx: 13, ry: 3, fill: pal.shadow, opacity: 0.4 });
  const b = k.buddy({ x: 130, y: FY, scale: S });
  P(b, {});
  const aT = reach(b, S, 'R', SP.x, SP.y), aM = 128;
  const cup = g({});
  el('path', { d: 'M -10 -2 H 10 V 10 Q 10 16 4 16 H -4 Q -10 16 -10 10 Z', fill: '#fff', stroke: pal.line, 'stroke-width': 1.5 }, cup);
  el('path', { d: 'M 10 3 q 8 0 8 5 q 0 4 -8 4', fill: 'none', stroke: '#fff', 'stroke-width': 3 }, cup);
  el('ellipse', { cx: 0, cy: -2, rx: 10, ry: 2.6, fill: pal.coffee });
  const steam = [-4, 4].map((x) => el('path', { d: `M ${x} -5 q -3 -5 0 -9 q 3 -4 0 -8`, fill: 'none', stroke: '#fff', 'stroke-width': 2, 'stroke-linecap': 'round', opacity: 0.8 }, cup));
  const marks = [0, 1, 2].map(() => el('path', { d: 'M 0 0 q 4 -5 0 -10 q -4 -5 0 -10', fill: 'none', stroke: '#5E7B4A', 'stroke-width': 3, 'stroke-linecap': 'round' }));
  const drop = el('path', { d: 'M 0 -6 Q 5 1 0 5 Q -5 1 0 -6 Z', fill: pal.coffee });
  return {
    update(t) {
      const a = kf(t, [[0, 8], [0.7, 8], [1.3, aT], [1.5, aT], [2.4, aM], [3.0, aM], [3.7, aT], [4.0, 8]]);
      const sip = seg(t, 2.2, 2.6), bit = seg(t, 2.5, 2.8);
      P(b, { armR: a, lean: 3 * sip, look: 0.4, squash: 1 - 0.04 * hump(bit), mood: t < 2.4 ? 'smile' : 'sad', blink: t > 2.5 && t < 3.6 ? 1 : blinkAt(t) });
      const holding = t > 1.5 && t < 3.7;
      const h = hp(b, S, 'R');
      const tilt = holding ? -26 * hump(seg(t, 2.1, 2.7)) * (t < 2.7 ? 1 : 0) : 0;
      if (holding) tf(cup, h.x - 6, h.y - 4, tilt, S);
      else tf(cup, SP.x, SP.y, 0, 1);
      sh.setAttribute('opacity', holding ? 0 : 0.4);
      steam.forEach((s, i) => s.setAttribute('opacity', 0.35 + 0.4 * Math.abs(Math.sin(t * 2.5 + i * 2))));
      const hx = 130, hy = FY - 84 * S;
      marks.forEach((m, i) => {
        const u = (t * 0.9 + i / 3) % 1, on = seg(t, 2.7, 3.0);
        tf(m, hx - 34 + i * 34, hy - 20 - u * 14, 0, 0.8);
        m.setAttribute('opacity', on * hump(u) * (t > 3.9 ? 0.5 : 1));
      });
      tf(drop, hx + 40, hy + 10 + easeOut(seg(t, 2.8, 3.8)) * 20, 0, 1);
      drop.setAttribute('opacity', seg(t, 2.8, 2.9) * (1 - seg(t, 3.6, 3.9)));
    }
  };
}
