// liquid：まめが水差しから水をコップに注ぐ。水は流れて、コップの形におさまる（例文 Water is a liquid substance.）
import { seg, lerp, easeInOut, easeOut, hump, wobble, clamp } from '../ease.js';
import { P, blinkAt, walkTo } from './run-after.js';
import { kitchenBg } from './weigh.js';
import { hp, reach } from './dig.js';

export const meta = { duration: 4.6, beats: [[0, '水差し'], [2.0, '注ぐ'], [3.6, '水がたまる']] };

const kf = (t, pts) => {
  for (let i = 1; i < pts.length; i++) if (t < pts[i][0]) return lerp(pts[i - 1][1], pts[i][1], easeInOut(seg(t, pts[i - 1][0], pts[i][0])));
  return pts[pts.length - 1][1];
};
const star = 'M 0 -6 L 1.6 -1.6 L 6 0 L 1.6 1.6 L 0 6 L -1.6 1.6 L -6 0 L -1.6 -1.6 Z';

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = kitchenBg(k);
  const S = 1.2, SP = { x: 193, y: 182 }, GX = 222, GB = 198, GH = 26;
  k.shadow(290, FY, 110, 7);
  el('rect', { x: 176, y: 198, width: 214, height: 9, rx: 3, fill: pal.wood });
  [[190, 207], [368, 207]].forEach(([x, y]) => el('rect', { x, y, width: 9, height: 29, rx: 2, fill: pal.woodDark }));
  // コップ（水位は update で変える）
  const wat = el('rect', { x: GX - 9, y: GB, width: 18, height: 0, fill: pal.water, opacity: 0.85 });
  const surf = el('ellipse', { cx: GX, cy: GB, rx: 9, ry: 1.8, fill: '#fff', opacity: 0 });
  el('path', { d: `M ${GX - 11} ${GB - GH} H ${GX + 11} L ${GX + 9} ${GB} H ${GX - 9} Z`, fill: '#fff', opacity: 0.25, stroke: pal.line, 'stroke-width': 1.5 });
  const b = k.buddy({ x: 130, y: FY, scale: S });
  P(b, {});
  const aT = reach(b, S, 'R', SP.x, SP.y), aP = 110;
  const pit = g({});
  el('path', { d: 'M -9 -10 H 9 L 10 -13 L 12 -9 L 9 -9 L 10 14 Q 10 16 8 16 H -8 Q -10 16 -10 14 Z', fill: '#DDEFFA', stroke: pal.blue, 'stroke-width': 1.5, 'stroke-linejoin': 'round' }, pit);
  el('path', { d: 'M -10 -4 q -8 0 -8 8 q 0 6 8 6', fill: 'none', stroke: pal.blue, 'stroke-width': 2.4 }, pit);
  el('rect', { x: -8, y: 2, width: 16, height: 13, rx: 2, fill: pal.water, opacity: 0.7 }, pit);
  const stream = el('line', { stroke: pal.water, 'stroke-width': 3.6, 'stroke-linecap': 'round' });
  const drops = [0, 1, 2].map(() => el('circle', { r: 1.8, fill: pal.water }));
  return {
    update(t) {
      const a = kf(t, [[0, 8], [0.7, 8], [1.3, aT], [1.5, aT], [2.0, aP], [3.6, aP], [4.1, aT], [4.4, aT]]);
      const tilt = kf(t, [[0, 0], [1.5, 0], [2.1, 58], [3.5, 58], [4.1, 0]]);
      P(b, { armR: a, look: 0.5, lean: 3 * seg(t, 1.8, 2.2), mood: t > 3.8 ? 'grin' : 'smile', blink: blinkAt(t) });
      const holding = t > 1.5 && t < 4.3, h = hp(b, S, 'R');
      if (holding) tf(pit, h.x, h.y, tilt, S); else tf(pit, SP.x, SP.y, 0, 1);
      const r = (tilt * Math.PI) / 180, sx = h.x + (10 * Math.cos(r) + 10 * Math.sin(r)) * S, sy = h.y + (10 * Math.sin(r) - 10 * Math.cos(r)) * S;
      const lv = easeOut(seg(t, 2.2, 3.6)) * 0.85, top = GB - GH * lv, on = holding && tilt > 40 && t < 3.55;
      k.set(wat, { y: top, height: GB - top });
      const ripple = Math.sin(t * 14) * 0.5 * (t > 2.2 ? 1 - seg(t, 3.6, 4.6) : 0);
      k.set(surf, { cy: top, ry: 1.8 + ripple });
      surf.setAttribute('opacity', lv > 0.02 ? 0.8 : 0);
      k.set(stream, { x1: sx, y1: sy, x2: sx + 1, y2: Math.max(top, sy) });
      stream.setAttribute('opacity', on ? 1 : 0);
      drops.forEach((d, i) => {
        const u = (t * 3 + i / 3) % 1;
        tf(d, sx + (i - 1) * 5 * u + 1, top - u * 9, 0, 1);
        d.setAttribute('opacity', on ? 1 - u : 0);
      });
    }
  };
}
