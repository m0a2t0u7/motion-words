// presentation：まめがスライドを指しながら、チームの前で発表する（例文 I gave a presentation to the team.）
import { seg, lerp, easeOut, easeInOut, hump, clamp } from '../ease.js';
import { P, blinkAt } from './run-after.js';
import { roomBg } from './look-over.js';
import { reach } from './weigh.js';

export const meta = { duration: 4.4, beats: [[0, 'スライドを映す'], [1.2, 'チームに説明'], [3.4, '拍手をもらう']] };

export function create(k) {
  const { el, pal } = k;
  const FY = roomBg(k, 'office', 240);
  const sx = 130, sy = 50, sw = 130, sh = 96;
  el('rect', { x: sx - 4, y: sy - 4, width: sw + 8, height: sh + 8, rx: 6, fill: pal.line });
  el('rect', { x: sx, y: sy, width: sw, height: sh, rx: 4, fill: '#fff' });
  el('rect', { x: sx + 12, y: sy + 10, width: 46, height: 8, rx: 4, fill: pal.blue });
  const bars = [[pal.coral, 40], [pal.yellow, 58], [pal.mint, 76]].map(([c, h], i) => ({ h, n: el('rect', { x: sx + 20 + i * 34, width: 22, rx: 3, fill: c }) }));
  const S = 0.9, b = k.buddy({ x: 84, y: FY, scale: S });
  const team = [[284, pal.coral, pal.coralDark], [328, pal.yellow, pal.yellowDark], [372, pal.violet, pal.violet]].map(([x, c, d], i) =>
    ({ x, b: k.buddy({ x, y: FY + 2, scale: 0.6, facing: -1, color: c, dark: d }) }));
  const claps = [0, 1].map(() => k.text(0, 0, '!', { 'font-size': 18, fill: pal.red }));
  return {
    update(t) {
      bars.forEach((r, i) => { const h = r.h * easeOut(seg(t, 0.5 + i * 0.5, 1.1 + i * 0.5)); k.set(r.n, { y: sy + sh - 10 - h, height: Math.max(h, 0.01) }); });
      const tgt = [sx + 50, sx + 84, sx + 118][clamp(Math.floor((t - 1.2) / 0.7), 0, 2)];
      const pt = seg(t, 0.9, 1.4) * (1 - seg(t, 3.3, 3.7));
      P(b, { armL: 8, armR: 8, look: 0.6, mood: t > 3.3 ? 'grin' : 'open', blink: blinkAt(t), lean: 2 });
      if (pt > 0) b.pose({ armR: lerp(8, reach(b, S, 'R', tgt, sy + 30), easeOut(pt)) });
      if (t > 3.3) b.pose({ armR: lerp(120, 8, 0), lift: 4 * hump(seg(t, 3.4, 4.0)) });
      team.forEach((m, i) => {
        const nod = t > 1.4 && t < 3.3 ? Math.max(0, Math.sin((t - 1.4) * 4 + i)) * 0.05 : 0;
        const ap = t > 3.4 ? Math.abs(Math.sin((t - 3.4) * 9 + i)) : 0;
        P(m.b, { facing: -1, y: FY + 2, look: 0.8, squash: 1 - nod, mood: t > 3.3 ? 'grin' : 'smile', blink: blinkAt(t, i), armL: 8 + 90 * ap, armR: 8 + 90 * ap });
      });
      claps.forEach((c, i) => { k.tf(c, 330 + i * 30, FY - 82 - 6 * hump(seg(t, 3.4, 4.2)), 0, 1, 1); c.setAttribute('opacity', t > 3.4 ? 1 : 0); });
    }
  };
}
