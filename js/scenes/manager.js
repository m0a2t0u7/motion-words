// manager：店長のまめが壁のシフト表をペンで1行ずつ確かめ、チェックを付けていく（例文 The manager checked the schedule.）
import { seg, lerp, easeInOut, easeOut, hump, clamp } from '../ease.js';
import { CO, reach, held, P, blinkAt, wear, pop } from './member.js';
import { pencil } from './check.js';
import { mark } from './so-far-so-good.js';

export const meta = { duration: 4.4, beats: [[0, 'シフト表'], [1.0, '1行ずつ確認'], [3.6, '確認できた']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 1.05, FY = 236;
  k.backdrop({ floorY: FY, mood: 'indoor' });
  el('rect', { x: 0, y: FY - 14, width: 400, height: 14, fill: '#ECE6DC' });
  // シフト表（曜日×3人）
  const BX = 150, BY = 92, BW = 220, BH = 112;
  el('rect', { x: BX, y: BY, width: BW, height: BH, rx: 6, fill: '#fff', stroke: pal.line, 'stroke-width': 3 });
  k.text(BX + BW / 2, BY - 12, 'SCHEDULE', { 'font-size': 13, fill: pal.sub });
  ['M', 'T', 'W', 'T', 'F'].forEach((d, i) => k.text(BX + 64 + i * 32, BY + 14, d, { 'font-size': 11, fill: pal.sub }));
  const rc = [pal.coral, pal.blue, pal.yellow];
  const rows = rc.map((c, r) => {
    const y = BY + 40 + r * 26;
    el('circle', { cx: BX + 30, cy: y, r: 8, fill: c });
    [0, 1, 2, 3, 4].forEach((i) => { if ((i + r) % 3 !== 2) el('rect', { x: BX + 52 + i * 32, y: y - 7, width: 24, height: 14, rx: 4, fill: c, opacity: 0.55 }); });
    const m = mark(k, 'check', null, 1.1); return { y, m };
  });
  const st = k.buddy({ x: 40, y: FY, scale: 0.8, facing: 1, ...CO(k) }); wear(k, st, 'apron', '#fff');
  const b = k.buddy({ x: 112, y: FY, scale: S, facing: 1 }); wear(k, b, 'tie', pal.coralDark); wear(k, b, 'badge', '#DCEBFF');
  const pen = pencil(k);
  return {
    update(t) {
      const t0 = 0.8, dt = 0.85;
      const i = clamp(Math.floor((t - t0) / dt), 0, 2), q = seg(t - t0 - i * dt, 0, dt);
      let tx = BX + 52, ty = rows[0].y;
      if (t < t0) { tx = lerp(BX + 10, BX + 52, easeInOut(seg(t, 0.2, t0))); ty = lerp(BY + 110, rows[0].y, easeInOut(seg(t, 0.2, t0))); }
      else if (t < t0 + 3 * dt) { tx = lerp(BX + 52, BX + 150, easeInOut(seg(q, 0, 0.6))); ty = rows[i].y + 3 * hump(seg(q, 0.7, 0.95)); if (q > 0.62) tx = lerp(BX + 150, BX + 14, easeInOut(seg(q, 0.62, 0.8))); }
      else { tx = BX + 14; ty = lerp(rows[2].y, rows[2].y + 40, easeOut(seg(t, t0 + 3 * dt, t0 + 3 * dt + 0.5))); }
      P(b, { lean: 4, look: 0.9, blink: blinkAt(t), armL: 14, mood: t > 3.6 ? 'grin' : 'flat' });
      b.pose({ armR: reach(b, S, 'R', tx, ty) });
      held(k, b, S, pen, 'R', 0, 20);
      rows.forEach(({ y, m }, j) => tf(m, BX + 12, y, 0, pop(seg(t, t0 + j * dt + 0.8 * dt, t0 + j * dt + dt))));
      P(st, { look: 0.6, blink: blinkAt(t, 1), mood: t > 3.6 ? 'grin' : 'smile', armR: t > 3.6 ? 8 + 120 * hump(seg(t, 3.6, 4.4)) : 8 });
    }
  };
}
