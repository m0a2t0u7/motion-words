// once in a blue moon：カレンダーは毎日おうちごはん。外食の日がたった1日だけ、青い月が出る（例文 We eat out once in a blue moon.）
import { seg, lerp, easeInOut, easeOut, backOut, smooth, wobble } from '../ease.js';

export const meta = { duration: 4.2, beats: [[0, '毎日は家ごはん'], [2.0, '日が過ぎていく'], [3.2, 'たまに外食']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 250, mood: 'outdoor' });
  const COLS = 8, ROWS = 3, CW = 36, CH = 30, X0 = 62, Y0 = 52, N = COLS * ROWS, SPECIAL = 21;
  el('rect', { x: X0 - 12, y: Y0 - 14, width: COLS * CW + 22, height: ROWS * CH + 22, rx: 10, fill: '#fff', stroke: '#D5DBE5', 'stroke-width': 2 });
  const cells = [];
  for (let i = 0; i < N; i++) {
    const c = g({});
    const cx = X0 + (i % COLS) * CW + CW / 2, cy = Y0 + Math.floor(i / COLS) * CH + CH / 2;
    tf(c, cx, cy);
    el('rect', { x: -15, y: -12, width: 30, height: 24, rx: 5, fill: '#F1F4F8' }, c);
    const home = g({}, c);
    el('path', { d: 'M -6 1 L 0 -5 L 6 1 L 6 7 L -6 7 Z', fill: pal.sub, opacity: 0.55 }, home);
    cells.push({ c, home, i });
  }
  // 特別な日：フォークとナイフ
  const sp = cells[SPECIAL];
  const star = g({}, sp.c);
  el('rect', { x: -15, y: -12, width: 30, height: 24, rx: 5, fill: '#CFE3FF', stroke: pal.blueDark, 'stroke-width': 2 }, star);
  el('line', { x1: -4, y1: -7, x2: -4, y2: 7, stroke: pal.blueDark, 'stroke-width': 2.5, 'stroke-linecap': 'round' }, star);
  el('line', { x1: 5, y1: -7, x2: 5, y2: 7, stroke: pal.blueDark, 'stroke-width': 2.5, 'stroke-linecap': 'round' }, star);
  star.setAttribute('opacity', 0);
  // 日付マーカー
  const mark = el('rect', { x: -16, y: -13, width: 32, height: 26, rx: 6, fill: 'none', stroke: pal.coral, 'stroke-width': 3 });
  // 青い月
  const moon = g({});
  el('circle', { r: 30, fill: '#BFDDFF', opacity: 0.5 }, moon);
  el('circle', { r: 22, fill: pal.blue }, moon);
  el('circle', { cx: -7, cy: -5, r: 5, fill: pal.blueDark, opacity: 0.4 }, moon);
  el('circle', { cx: 8, cy: 6, r: 3.5, fill: pal.blueDark, opacity: 0.4 }, moon);
  const b = k.buddy({ x: 200, y: FY, scale: 1.0 });
  const plate = g({});
  el('ellipse', { rx: 22, ry: 6, fill: '#fff', stroke: '#CBD3DE', 'stroke-width': 2 }, plate);
  const food = el('circle', { cy: -4, r: 8, fill: pal.coral }, plate);

  return {
    update(t) {
      const D = 2.6; // 日付が最後の日まで進む時間
      const prog = easeInOut(seg(t, 0.3, D));
      const cur = Math.min(SPECIAL, Math.floor(prog * (SPECIAL + 1)));
      cells.forEach(({ c, home, i }) => {
        home.setAttribute('opacity', i === SPECIAL ? (i <= cur && t < 3.0 ? 1 : 0) : i < cur || (i === cur && t > 0.3) ? 1 : 0.15);
        if (i === SPECIAL) return;
      });
      const mx = X0 + (cur % COLS) * CW + CW / 2, my = Y0 + Math.floor(cur / COLS) * CH + CH / 2;
      tf(mark, mx, my, 0, 1 + 0.08 * wobble(seg(t, 2.6, 3.4), 2, 4));
      const sp1 = backOut(seg(t, 3.0, 3.45), 2);
      tf(star, 0, 0, 0, sp1, sp1);
      star.setAttribute('opacity', t < 3.0 ? 0 : 1);
      // 月
      const mp = easeOut(seg(t, 2.9, 3.5));
      tf(moon, 340, lerp(150, 100, mp), 0, mp, mp);
      moon.setAttribute('opacity', t < 2.9 ? 0 : 1);
      // まめ：毎日家ごはん → 最後に外食でばんざい
      const eat = t < 2.7;
      const bite = Math.max(0, Math.sin(t * 6));
      tf(plate, 262, FY - 8);
      plate.setAttribute('opacity', eat ? 1 : 0);
      b.pose({
        x: eat ? 150 : 200,
        armR: eat ? 70 + 20 * bite : 150 + 20 * wobble(seg(t, 3.0, 3.8), 3, 3),
        armL: eat ? 8 : 140,
        mood: eat ? (bite > 0.7 ? 'open' : 'smile') : 'grin',
        look: eat ? 0.8 : 0,
        lift: 0,
        facing: 1
      });
      tf(food, 0, 0, 0, 1, 1);
    }
  };
}
