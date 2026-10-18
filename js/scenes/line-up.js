// line up：開店前の店の外に、人が一人ずつやって来て一列に並ぶ（例文 People lined up outside the shop.）
import { seg, lerp, easeInOut, clamp } from '../ease.js';
import { gait, streetBg } from './weigh.js';

export const meta = { duration: 4.4, beats: [[0, '店の前'], [1.8, '次々と並ぶ'], [3.6, '一列になった']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = streetBg(k, 236);
  // 店（右端、ドアは閉まっている）
  el('rect', { x: 300, y: 80, width: 100, height: 156, fill: '#FFF1D2' });
  for (let i = 0; i < 5; i++) el('path', { d: `M ${300 + i * 20} 80 h 20 v 20 q -10 8 -20 0 Z`, fill: i % 2 ? '#fff' : pal.coral });
  el('rect', { x: 316, y: 140, width: 50, height: 96, rx: 3, fill: '#BFE3F5', stroke: '#fff', 'stroke-width': 4 });
  el('rect', { x: 322, y: 120, width: 38, height: 14, rx: 3, fill: '#fff' });
  el('rect', { x: 328, y: 125, width: 26, height: 4, rx: 2, fill: pal.coralDark });
  const cols = [[pal.mint, pal.mintDark], [pal.coral, pal.coralDark], [pal.blue, pal.blueDark], [pal.yellow, pal.yellowDark], [pal.violet, '#8467D8'], [pal.coral, pal.coralDark]];
  const N = 6, GAP = 44, HEAD = 282;
  const ppl = cols.map((c, i) => ({ b: k.buddy({ x: -60, y: FY, scale: 0.62, color: c[0], dark: c[1] }), s: 0.2 + i * 0.55, slot: HEAD - i * GAP }));
  ppl.reverse().forEach((p) => p.b.g.parentNode.appendChild(p.b.g));
  ppl.reverse();
  return {
    update(t) {
      ppl.forEach((p, i) => {
        const xf = (tt) => lerp(-40, p.slot, easeInOut(seg(tt, p.s, p.s + 1.2 + (HEAD - p.slot) / 400)));
        const q = gait(xf, t, -40);
        p.b.pose({ x: q.x, walk: q.walk, armL: q.armL, armR: q.armR, lean: q.lean, look: 0.7, mood: 'smile', squash: 1 + 0.015 * Math.sin(t * 3 + i) * (q.m < 0.1 ? 1 : 0) });
      });
    }
  };
}
