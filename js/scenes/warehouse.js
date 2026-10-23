// warehouse：大きな倉庫で、まめが台車の段ボールを持ち上げ、高い棚の空いた場所へしまっていく（例文 The boxes are stored in the warehouse.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';
import { P, blinkAt, hp, aim, walkTo, path, box, helmet } from './confused.js';

export const meta = { duration: 4.4, beats: [[0.0, '荷物が届く'], [1.15, '棚へしまう'], [3.44, '倉庫に保管']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 0.95;
  const FY = k.backdrop({ floorY: 240, mood: 'indoor' });
  el('rect', { x: 0, y: 0, width: 400, height: FY, fill: '#E6E1D8' });
  for (let x = 0; x < 400; x += 40) el('line', { x1: x, y1: 0, x2: x, y2: FY, stroke: '#DAD3C7', 'stroke-width': 2 });
  // シャッター（右奥）
  el('rect', { x: 300, y: FY - 130, width: 96, height: 130, fill: '#C9D2DD' });
  for (let i = 0; i < 8; i++) el('line', { x1: 300, y1: FY - 130 + i * 10, x2: 396, y2: FY - 130 + i * 10, stroke: '#AAB4C2', 'stroke-width': 2 });
  // 高い棚（3段）。空き2か所以外は箱で埋まる
  const SX = 20, SW = 170, L = [FY - 4, FY - 66, FY - 128, FY - 190];
  [SX, SX + SW].forEach((x) => el('rect', { x: x - 3, y: L[3] - 6, width: 6, height: FY - L[3] + 6, fill: pal.blueDark }));
  L.forEach((y) => el('rect', { x: SX - 4, y, width: SW + 8, height: 6, fill: pal.blue }));
  const slots = [];
  for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) { const x = SX + 30 + c * 56, y = L[r]; if ((r === 0 && c === 2) || (r === 1 && c === 1)) slots.push({ x, y }); else tf(box(k, 44, 36, ['#E3B77E', '#D9A86C', '#EAC28E'][(r + c) % 3]), x, y); }
  // 台車と箱
  el('rect', { x: 236, y: FY - 10, width: 60, height: 6, fill: pal.sub });
  [242, 290].forEach((x) => el('circle', { cx: x, cy: FY - 3, r: 4, fill: pal.ink }));
  el('rect', { x: 292, y: FY - 50, width: 4, height: 44, fill: pal.sub });
  const bx = [0, 1].map(() => box(k, 40, 32, '#E3B77E'));
  const b = k.buddy({ x: 230, y: FY, scale: S, facing: -1 });
  helmet(k, b, pal.yellow, pal.yellowDark);
  const T = [[0.4, 1.0, 2.0], [2.4, 3.0, 4.0]];
  return {
    update(t) {
      t *= 4.6 / 4.4; // 4.4 秒に収める
      const i = t < 2.3 ? 0 : 1, [t0, t1, t2] = T[i], s = slots[i];
      // 台車で持ち上げ→棚の前へ歩く→置く→戻る
      const xf = path([[t0, 230], [t1, 230], [t1 + 0.6, s.x + 34], [t2, s.x + 34], [t2 + 0.4, 230]]);
      const w = walkTo(xf, t, 230, -1), lift = easeOut(seg(t, t0, t0 + 0.4)) * (1 - seg(t, t2 - 0.3, t2));
      const put = easeInOut(seg(t, t1 + 0.5, t2 - 0.2));
      P(b, { x: w.x, walk: w.walk, facing: w.m > 0.05 ? w.facing : -1, lean: w.lean + 8 * hump(seg(t, t0, t0 + 0.4)), look: 0.5, mood: 'smile', blink: blinkAt(t), armL: 8, armR: 8 });
      bx.forEach((n, j) => {
        let x, y;
        if (j < i || t > T[j][2] - 0.2) { x = slots[j].x; y = slots[j].y; }
        else if (j > i || t < T[j][0]) { x = 266; y = FY - 10 - (j === 1 ? 32 : 0); }
        else {
          const hx = b.state.x - 34, hy = lerp(FY - 50, s.y - 10, put);
          x = lerp(266, hx, lift); y = lerp(FY - 10 - 0, hy, lift);
          if (put >= 1 || t > t2 - 0.2) { x = s.x; y = s.y; }
        }
        tf(n, x, y, 0, 1);
        if (j === i && t > t0 && t < t2 - 0.2) { aim(b, S, 'R', x + 14 * (b.state.facing > 0 ? -1 : 1), y - 18); aim(b, S, 'L', x - 14, y - 18); }
      });
    }
  };
}
