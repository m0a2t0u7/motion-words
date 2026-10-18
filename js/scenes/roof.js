// roof：赤い屋根の家に雪が降り積もり、屋根が真っ白に覆われる（例文 Snow covered the roof.）
import { seg, lerp, easeInOut, easeOut, smooth } from '../ease.js';

export const meta = { duration: 4.6, beats: [[0, '赤い屋根'], [1.4, '雪が降る'], [3.8, '白く覆った']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 244, mood: 'outdoor' });
  const dim = el('rect', { x: 0, y: 0, width: 400, height: 300, fill: '#C9D6E6', opacity: 0 });
  el('rect', { x: 0, y: FY - 4, width: 400, height: 56, fill: '#F4F8FC' });
  // 家の壁と窓・ドア
  el('rect', { x: 90, y: 124, width: 220, height: FY - 124, fill: '#FBE9DC' });
  el('rect', { x: 188, y: 164, width: 28, height: 80, rx: 3, fill: pal.blue }); el('circle', { cx: 208, cy: 206, r: 2.5, fill: pal.yellow });
  [[110, 150], [242, 150]].forEach(([x, y]) => { el('rect', { x, y, width: 46, height: 40, rx: 4, fill: '#FFE9A8', stroke: '#fff', 'stroke-width': 4 }); el('line', { x1: x + 23, y1: y, x2: x + 23, y2: y + 40, stroke: '#fff', 'stroke-width': 3 }); });
  // 煙突
  el('rect', { x: 250, y: 56, width: 24, height: 50, fill: pal.woodDark });
  const R = 'M 70 126 L 200 30 L 330 126 Z';
  el('path', { d: R, fill: pal.coral, stroke: pal.coral, 'stroke-width': 4, 'stroke-linejoin': 'round' });
  for (let i = 1; i < 5; i++) el('line', { x1: 200 - 130 * (i / 5) * 0.0 - (i * 20), y1: 30 + i * 19, x2: 200 + i * 20, y2: 30 + i * 19, stroke: pal.coralDark, 'stroke-width': 1.5, opacity: 0.45 });
  // 雪：屋根の形でクリップし、上から下へ覆う
  const rid = k.clip((c) => el('path', { d: 'M 66 130 L 200 26 L 334 130 Z' }, c));
  const snowG = g({ 'clip-path': rid });
  const snow = el('path', { d: '', fill: '#fff' }, snowG);
  const shade = el('path', { d: '', fill: '#E3ECF6' }, snowG);
  const cap = el('path', { d: 'M 248 58 Q 262 44 276 58 Q 262 62 248 58 Z', fill: '#fff', opacity: 0 });
  // 軒先の雪の出っ張り
  const lump = el('path', { d: 'M 70 128 Q 80 138 92 130 Q 104 140 118 130 Q 130 138 142 130 Q 156 140 170 130 Q 184 138 198 130 Q 212 140 226 130 Q 240 138 252 130 Q 266 140 280 130 Q 292 138 304 130 Q 316 140 330 128 L 330 124 L 70 124 Z', fill: '#fff', opacity: 0 });
  const fl = Array.from({ length: 50 }, () => el('circle', { fill: '#fff', stroke: '#DCE6F2', 'stroke-width': 0.6 }));
  return {
    update(t) {
      const dens = smooth(seg(t, 0.4, 1.8)), cov = easeInOut(seg(t, 1.5, 3.9)), py = 26 + cov * 112;
      k.set(dim, { opacity: 0.18 * dens });
      // 屋根の雪：下辺が波打ちながら下がる
      const w = (x) => py + 5 * Math.sin(x * 0.09) + 3 * Math.sin(x * 0.23);
      let d = `M 60 20 L 340 20`;
      for (let x = 340; x >= 60; x -= 20) d += ` L ${x} ${w(x)}`;
      k.set(snow, { d: d + ' Z' });
      k.set(shade, { d: `M 60 ${py + 6} L 340 ${py + 6} L 340 ${py + 10} L 60 ${py + 10} Z`, opacity: 0.0 });
      k.set(lump, { opacity: seg(t, 3.5, 4.1) });
      k.set(cap, { opacity: seg(t, 2.4, 3.2) });
      fl.forEach((f, i) => {
        const sp = 38 + (i % 5) * 12, x = ((i * 71) % 420) - 10 + Math.sin(t * 1.8 + i) * 9, y = (t * sp + i * 41) % (FY + 10);
        k.set(f, { cx: x, cy: y, r: 1.6 + (i % 3) * 0.8, opacity: i / 50 < dens ? (t > 4.0 ? 0.5 : 1) : 0 });
      });
    }
  };
}
