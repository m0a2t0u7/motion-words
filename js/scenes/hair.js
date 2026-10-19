// hair：長い黒髪の女の子が、髪をくしでとかす。髪がさらりと揺れる（例文 She has long black hair.）
import { seg, lerp, easeInOut, easeOut, hump, clamp, wobble } from '../ease.js';
import { hp, reach, P, blinkAt, bp, hair, twinkle, pop } from './body.js';
import { homeBg } from './furniture.js';

export const meta = { duration: 4.2, beats: [[0, '長い黒髪'], [1.0, 'くしでとかす'], [3.0, 'さらさら']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 1.25, FY = 240;
  homeBg(k, { FY, winX: 290, curtain: '#C9E4D5' });
  const b = k.buddy({ x: 170, y: FY, scale: S, facing: 1, color: pal.coral, dark: pal.coralDark });
  const h = hair(k, b, '#24242C', 76);
  const comb = g({});
  el('rect', { x: -4, y: -14, width: 8, height: 28, rx: 3, fill: pal.violet }, comb);
  for (let y = -12; y < 14; y += 4) el('line', { x1: 4, y1: y, x2: 10, y2: y, stroke: pal.violet, 'stroke-width': 2 }, comb);
  const sp = [0, 1, 2].map(() => twinkle(k, null, '#fff'));
  return {
    update(t) {
      const cyc = seg(t, 0.8, 3.0) * 3, ph = cyc % 1, on = t > 0.8 && t < 3.0;
      const down = on ? easeInOut(clamp(ph / 0.75)) : 0;
      const sw = Math.sin(t * 3) * 3 + (t > 3.0 ? wobble(seg(t, 3.0, 4.2), 2, 3) * 8 : 0);
      P(b, { look: -0.3, blink: blinkAt(t), mood: t > 3 ? 'grin' : 'smile', lean: t > 3.0 ? -6 * hump(seg(t, 3.0, 3.6)) : 0 });
      h.back.setAttribute('transform', `rotate(${sw.toFixed(2)} 0 -80)`);
      const p = bp(b, S, 36, lerp(-74, -12, down) - (on && ph > 0.75 ? 0 : 0));
      const rest = easeInOut(seg(t, 0.4, 0.8)) * (1 - easeInOut(seg(t, 3.0, 3.4)));
      b.pose({ armR: rest > 0.02 ? lerp(8, reach(b, S, 'R', p.x + 6, p.y), rest) : 8 });
      const hh = hp(b, S, 'R', 26);
      tf(comb, hh.x - 2, hh.y, 0, S * 0.8); comb.setAttribute('opacity', rest > 0.05 ? 1 : 0);
      sp.forEach((s, i) => { const q = seg(t, 3.1 + i * 0.15, 4.2); const pp = bp(b, S, -40 + i * 40, -60 + (i % 2) * 30); tf(s, pp.x, pp.y, 45 * q, pop(easeOut(seg(q, 0, 0.3)) * (0.6 + 0.4 * Math.sin(t * 9 + i)))); });
    }
  };
}
