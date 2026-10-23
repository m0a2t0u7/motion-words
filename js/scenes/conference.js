// conference：まめが大きな会議の壇上で話し、客席から拍手が起きる（例文 She spoke at a big conference last week.）
import { seg, lerp, easeOut, hump } from '../ease.js';
import { P, blinkAt } from './run-after.js';
import { roomBg, waves } from './look-over.js';

export const meta = { duration: 4.2, beats: [[0, '壇上に立つ'], [1.2, '講演する'], [3.2, '拍手が起きる']] };

export function create(k) {
  const { el, pal } = k, S = 0.95;
  const FY = roomBg(k, 'office', 240);
  el('rect', { x: 60, y: 30, width: 190, height: 88, rx: 6, fill: '#fff', stroke: pal.line, 'stroke-width': 4 });
  el('rect', { x: 78, y: 42, width: 80, height: 10, rx: 5, fill: pal.violet });
  const bars = [[pal.coral, 40], [pal.yellow, 56], [pal.mint, 30]].map(([c, h], i) => ({ h, n: el('rect', { x: 84 + i * 40, width: 26, rx: 3, fill: c }) }));
  const b = k.buddy({ x: 130, y: FY, scale: S });
  el('path', { d: `M 98 ${FY - 52} H 162 L 168 ${FY} H 92 Z`, fill: pal.wood });
  el('rect', { x: 96, y: FY - 56, width: 68, height: 8, rx: 3, fill: pal.woodDark });
  const cols = [pal.coral, pal.yellow, pal.violet, pal.blue], cd = [pal.coralDark, pal.yellowDark, pal.violet, pal.blueDark];
  const aud = [0, 1, 2, 3, 4].map((i) => ({ i, b: k.buddy({ x: 235 + i * 34, y: FY + 6 + (i % 2) * 6, scale: 0.55, facing: -1, color: cols[i % 4], dark: cd[i % 4] }) }));
  const wv = waves(k, pal.blue);
  const stars = [0, 1, 2].map((i) => k.text(0, 0, '!', { 'font-size': 18, fill: pal.red }));
  return {
    update(t) {
      bars.forEach((r, i) => { const h = r.h * easeOut(seg(t, 0.6 + i * 0.4, 1.2 + i * 0.4)); k.set(r.n, { y: 104 - h, height: Math.max(h, 0.01) }); });
      const sp = seg(t, 1.0, 3.2) * (1 - seg(t, 3.2, 3.3));
      P(b, { armL: 8, armR: 8 + (sp > 0 ? 70 * Math.abs(Math.sin(t * 4)) : 0), look: 0.3, mood: sp > 0 ? 'open' : 'smile', blink: blinkAt(t), lift: t > 3.3 ? 3 * hump(seg(t, 3.3, 4.0)) : 0 });
      if (t > 3.3) b.pose({ mood: 'grin' });
      wv(sp > 0 ? 1 : 0, (t * 0.8) % 1, 175, FY - 90, 1, 1);
      aud.forEach(({ i, b: m }) => {
        const ap = t > 3.3 ? Math.abs(Math.sin((t - 3.3) * 9 + i)) : 0;
        P(m, { facing: -1, y: FY + 6 + (i % 2) * 6, look: 0.8, mood: t > 3.3 ? 'grin' : 'smile', blink: blinkAt(t, i * 0.3), armL: 8 + 90 * ap, armR: 8 + 90 * ap });
      });
      stars.forEach((s, i) => { k.tf(s, 250 + i * 50, FY - 56 - 8 * hump(seg(t, 3.4, 4.2)), 0, 1, 1); s.setAttribute('opacity', t > 3.4 ? 1 : 0); });
    }
  };
}
