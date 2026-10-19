// stadium：スタジアムの客席がファンでいっぱい。旗を振ってウェーブが一周する（例文 The stadium was full of fans.）
import { seg, lerp, easeInOut, easeOut, hump, clamp } from '../ease.js';
import { P, blinkAt } from './restaurant.js';

export const meta = { duration: 4.4, beats: [[0, '満員の客席'], [1.4, 'ウェーブ'], [3.2, '大歓声']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  k.backdrop({ floorY: 300, mood: 'outdoor' });
  // 照明塔
  [30, 370].forEach((x) => { el('rect', { x: x - 3, y: 10, width: 6, height: 70, fill: pal.sub }); el('rect', { x: x - 16, y: 6, width: 32, height: 14, rx: 3, fill: '#FFF6CF', stroke: pal.sub, 'stroke-width': 2 }); });
  // 客席（4段）とファン
  const cols = [[pal.blue, pal.blueDark], [pal.coral, pal.coralDark], [pal.yellow, pal.yellowDark], [pal.violet, '#7F63D6'], [pal.mint, pal.mintDark]];
  const fans = [];
  for (let r = 0; r < 4; r++) {
    const y = 74 + r * 34;
    el('rect', { x: 0, y: y + 10, width: 400, height: 26, fill: r % 2 ? '#C9D2DE' : '#B8C2CE' });
    for (let i = 0; i < 15; i++) {
      const x = 14 + i * 27 + (r % 2) * 13, c = cols[(i * 3 + r) % 5];
      const f = g({});
      el('rect', { x: -10, y: -22, width: 20, height: 26, rx: 9, fill: c[0] }, f);
      el('circle', { cx: -3.5, cy: -14, r: 1.6, fill: pal.ink }, f); el('circle', { cx: 3.5, cy: -14, r: 1.6, fill: pal.ink }, f);
      const arm = el('line', { x1: 8, y1: -10, x2: 12, y2: -26, stroke: c[1], 'stroke-width': 3, 'stroke-linecap': 'round' }, f);
      if ((i + r) % 3 === 0) el('path', { d: 'M 12 -26 l 10 3 l -10 4 Z', fill: ['#fff', pal.red, pal.yellow][(i + r) % 3 === 0 ? (i % 3) : 0] }, f);
      fans.push({ f, x, y, i });
    }
  }
  // フィールド
  el('rect', { x: 0, y: 214, width: 400, height: 86, fill: '#7CC98C' });
  for (let x = 0; x < 400; x += 50) el('rect', { x, y: 214, width: 25, height: 86, fill: '#72BF82' });
  el('rect', { x: 0, y: 212, width: 400, height: 4, fill: '#fff' });
  el('circle', { cx: 200, cy: 262, r: 26, fill: 'none', stroke: '#fff', 'stroke-width': 3 });
  // 手前の自分（後ろ姿でなく横向き、最前列で応援）
  const me = k.buddy({ x: 90, y: 300, scale: 0.9 });
  return {
    update(t) {
      const wx = lerp(-60, 460, seg(t, 0.9, 3.0));
      fans.forEach(({ f, x, y, i }) => {
        const w = Math.exp(-Math.pow((x - wx) / 40, 2)), cheer = t > 3.1 ? Math.abs(Math.sin(t * 9 + i)) * 0.6 : 0;
        tf(f, x, y - 10 * w - 3 * cheer, 0, 1);
      });
      const c = t > 3.1;
      P(me, { lift: c ? 8 * Math.abs(Math.sin(t * 8)) : 0, armL: c ? 160 : 20, armR: c ? 160 : 60, mood: 'grin', look: 0.3, blink: blinkAt(t) });
    }
  };
}
