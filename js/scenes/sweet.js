// sweet：ケーキを一口食べて、甘さのメーターが「ちょうどいい」を超えて甘すぎる顔になる（例文 This cake is too sweet for me.）
import { seg, lerp, easeInOut, easeOut, hump, wobble, clamp } from '../ease.js';
import { P, blinkAt } from './run-after.js';
import { kitchenBg } from './weigh.js';
import { hp, reach } from './dig.js';

export const meta = { duration: 4.4, beats: [[0, 'ケーキ'], [1.8, '一口食べる'], [3.0, '甘すぎる']] };

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
  el('ellipse', { cx: 200, cy: 198, rx: 30, ry: 5, fill: '#EEF1F5', stroke: pal.line, 'stroke-width': 1.5 });
  el('ellipse', { cx: 268, cy: 197, rx: 14, ry: 3, fill: '#EEF1F5' });
  // 甘さメーター
  const MX = 292, MY = 78, MW = 80;
  el('rect', { x: MX, y: MY, width: MW, height: 12, rx: 6, fill: '#fff', stroke: pal.line, 'stroke-width': 1.5 });
  const fill = el('rect', { x: MX + 2, y: MY + 2, width: 0, height: 8, rx: 4, fill: pal.coral });
  el('line', { x1: MX + MW * 0.7, y1: MY - 6, x2: MX + MW * 0.7, y2: MY + 18, stroke: pal.ink, 'stroke-width': 2.4 });
  el('path', { d: `M ${MX + MW * 0.7 - 5} ${MY - 10} h 10 l -5 6 Z`, fill: pal.ink });
  const b = k.buddy({ x: 130, y: FY, scale: S });
  P(b, {});
  const aT = reach(b, S, 'R', SP.x, SP.y), aM = 128;
  const cake = g({});
  el('path', { d: 'M -12 16 V 2 L 12 -2 V 16 Z', fill: '#FFD9A8' }, cake);
  el('path', { d: 'M -12 8 L 12 5 V 8 L -12 11 Z', fill: pal.coral, opacity: 0.8 }, cake);
  el('path', { d: 'M -13 2 Q -6 -4 0 0 Q 6 -4 13 -3 L 12 -2 L -12 2 Z', fill: '#fff' }, cake);
  el('circle', { cx: 0, cy: -4, r: 4, fill: pal.red }, cake);
  const bite = el('circle', { cx: 12, cy: 4, r: 0, fill: '#F7F4EE' }, cake);
  const sw = el('path', { d: 'M 0 -6 Q 5 1 0 5 Q -5 1 0 -6 Z', fill: pal.water, stroke: pal.blue, 'stroke-width': 1 });
  const sp = [0, 1, 2].map(() => el('path', { d: 'M 0 -6 L 1.6 -1.6 L 6 0 L 1.6 1.6 L 0 6 L -1.6 1.6 L -6 0 L -1.6 -1.6 Z', fill: pal.yellow }));
  return {
    update(t) {
      const a = kf(t, [[0, 8], [0.7, 8], [1.3, aT], [1.5, aT], [2.4, aM], [3.4, aM], [4.0, aT]]);
      const e = seg(t, 2.4, 3.6);
      P(b, { armR: a, lean: 3 * seg(t, 2.0, 2.4), look: 0.4, squash: 1 - 0.03 * hump(seg(t, 2.6, 3.0)), mood: t < 2.5 ? 'smile' : t < 3.0 ? 'grin' : 'flat', blink: t > 3.1 && t < 3.9 ? 1 : blinkAt(t) });
      const holding = t > 1.5 && t < 4.0, h = hp(b, S, 'R');
      if (holding) tf(cake, h.x - 5, h.y - 4, -12 * hump(seg(t, 2.0, 2.6)), S);
      else tf(cake, SP.x, SP.y, 0, 1);
      bite.setAttribute('r', t > 2.6 ? 6 : 0);
      k.set(fill, { width: 66 * easeOut(seg(t, 2.4, 3.6)) });
      fill.setAttribute('fill', e > 0.62 ? pal.red : pal.coral);
      const hx = 130, hy = FY - 84 * S;
      sp.forEach((s, i) => {
        const u = (t * 0.9 + i / 3) % 1;
        tf(s, hx - 40 + i * 40, hy - 6 - u * 16, 0, 0.8);
        s.setAttribute('opacity', (seg(t, 2.4, 2.8) * (1 - seg(t, 2.9, 3.2))) * hump(u));
      });
      tf(sw, hx + 40, hy + 14 + easeOut(seg(t, 3.2, 4.2)) * 22, 0, 1);
      sw.setAttribute('opacity', seg(t, 3.2, 3.3) * (1 - seg(t, 4.0, 4.3)));
    }
  };
}
