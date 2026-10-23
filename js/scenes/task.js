// task：散らかった部屋で、まめがおもちゃを箱へ入れていき、チェックリストの「そうじ」に印を付ける。かんたんな作業（例文 Cleaning the room is a simple task.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';
import { P, blinkAt, aim, walkTo, path, homeBg, box, check, sym } from './confused.js';
import { icon } from './in-common.js';

export const meta = { duration: 4.4, beats: [[0.0, '散らかった部屋'], [0.96, '片づける'], [3.44, '作業完了']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 0.95;
  const FY = homeBg(k, { winX: 160 });
  // チェックリスト（壁）
  el('rect', { x: 300, y: 36, width: 76, height: 90, rx: 4, fill: '#fff', stroke: pal.line, 'stroke-width': 2 });
  el('rect', { x: 330, y: 30, width: 16, height: 10, rx: 3, fill: pal.sub });
  const rows = [56, 80, 104];
  rows.forEach((y) => el('rect', { x: 308, y: y - 7, width: 14, height: 14, rx: 2, fill: 'none', stroke: pal.sub, 'stroke-width': 2 }));
  const icons = [['ball', 0], ['book', 1], ['apple', 2]];
  icons.forEach(([kd, i]) => { const n = icon(k, kd); tf(n, 350, rows[i], 0, 0.55); });
  const done = check(k, 315, rows[0], 0.7, pal.green);
  // おもちゃ箱
  const BXX = 250;
  const bx = box(k, 56, 36, '#7FB3E8'); tf(bx, BXX, FY); k.shadow(BXX, FY + 1, 32, 4);
  // 床に散らばったおもちゃ
  const toys = [['ball', 60], ['book', 120], ['apple', 180], ['ball', 210]].map(([kd, x]) => ({ n: icon(k, kd), x }));
  const b = k.buddy({ x: 40, y: FY, scale: S });
  const note = sym(k, '♪', pal.violet, 22);
  const T = toys.map((_, i) => 0.6 + i * 0.7);
  return {
    update(t) {
      t *= 4.6 / 4.4; // 4.4 秒に収める
      // 各おもちゃ：近づいて拾い、箱へ入れる
      const i = Math.max(0, Math.min(3, Math.floor((t - 0.6) / 0.7)));
      const xf = path(toys.flatMap((o, j) => [[T[j] - 0.25, o.x - 26], [T[j] + 0.35, o.x - 26]]).concat([[3.6, 200]]));
      const w = walkTo(xf, t, toys[0].x - 26, 1);
      P(b, { x: w.x, walk: w.walk, facing: 1, lean: w.lean, armL: 14, mood: 'grin', look: 0.6, blink: blinkAt(t), armR: 14 });
      toys.forEach((o, j) => {
        const q = seg(t, T[j], T[j] + 0.4);
        const sx = o.x, sy = FY - 10;
        const ex = BXX + (j - 1.5) * 8, ey = FY - 30;
        const x = lerp(sx, ex, easeInOut(q)), y = lerp(sy, ey, easeInOut(q)) - 50 * hump(q);
        tf(o.n, x, y, q * 360, q >= 1 ? 0.001 : 0.7);
        if (q > 0 && q < 1) aim(b, S, 'R', x, y);
        else if (Math.abs(t - T[j] + 0.1) < 0.12) aim(b, S, 'R', sx, sy);
      });
      // 最後にリストへ印
      const fin = seg(t, 3.6, 3.9);
      done(fin);
      if (t > 3.4) { const wx = lerp(200, 280, easeInOut(seg(t, 3.4, 3.7))); b.pose({ x: wx, walk: wx * 0.107, armR: t > 3.6 ? 150 : 14 }); }
      note(seg(t, 1.0, 1.3), w.x + 30 + 4 * Math.sin(t * 4), FY - 110 + 4 * Math.sin(t * 6));
    }
  };
}
