// weather：1週間の天気表に、月曜から日曜まで毎日、晴れマークを描き入れていく（例文 The weather was nice all week.）
import { seg, lerp, easeInOut, easeOut, clamp, hump } from '../ease.js';
import { gait, held, reach, P, blinkAt, sunG, popIn } from './nature.js';
import { pencil } from './check.js';

export const meta = { duration: 4.4, beats: [[0, '月曜は晴れ'], [1.2, '毎日晴れ'], [3.5, '1週間ずっと晴れ']] };

export function create(k) {
  const { el, tf, pal } = k, S = 0.9;
  const FY = k.backdrop({ floorY: 240, mood: 'indoor' });
  el('rect', { x: 0, y: FY, width: 400, height: 60, fill: '#E6DED2' });
  const BX = 70, BY = 50, BW = 300, BH = 120, CW = BW / 7;
  el('rect', { x: BX + 4, y: BY + 4, width: BW, height: BH, rx: 6, fill: '#000', opacity: 0.08 });
  el('rect', { x: BX, y: BY, width: BW, height: BH, rx: 6, fill: '#fff', stroke: pal.line, 'stroke-width': 2 });
  el('rect', { x: BX, y: BY, width: BW, height: 26, rx: 6, fill: pal.blue });
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const suns = days.map((d, i) => {
    const cx = BX + CW * (i + 0.5);
    k.text(cx, BY + 14, d, { 'font-size': 13, fill: '#fff' });
    if (i) el('line', { x1: BX + CW * i, y1: BY + 30, x2: BX + CW * i, y2: BY + BH - 6, stroke: pal.line, 'stroke-width': 1.5 });
    const s = sunG(k, 10); return { s, cx, cy: BY + 74 };
  });
  const b = k.buddy({ x: 40, y: FY, scale: S });
  const pen = pencil(k);
  const T0 = 0.6, DT = 0.42;
  const colAt = (t) => clamp((t - T0) / DT, 0, 7);
  const xf = (t) => lerp(40, BX + CW * 6.5 - 50, easeInOut(clamp((t - 0.3) / (T0 + 6.5 * DT - 0.3))));
  return {
    update(t) {
      const w = gait(xf, t, 40, 6, 0.12);
      const i = clamp(Math.floor(colAt(t)), 0, 6), q = seg(t - T0 - i * DT, 0, DT);
      const tx = suns[i].cx, ty = suns[i].cy - 4 * hump(seg(q, 0.2, 0.6));
      const hop = t > 3.7 ? 6 * hump(seg(t, 3.7, 4.0)) : 0;
      P(b, { x: w.x, walk: w.walk, lean: 4, look: 0.7, mood: t > 3.6 ? 'grin' : 'smile', blink: blinkAt(t), armL: 14 + 100 * easeOut(seg(t, 3.7, 4.0)), lift: hop });
      const rch = easeOut(seg(t, 0.2, T0)) * (1 - easeInOut(seg(t, 3.5, 3.9)));
      b.pose({ armR: lerp(8, reach(b, S, 'R', tx, ty + 30), rch) });
      held(k, b, S, pen, 'R', 0);
      suns.forEach(({ s, cx, cy }, j) => { const p = seg(t, T0 + j * DT + 0.12, T0 + j * DT + 0.4); tf(s.g, cx, cy, 0, popIn(p)); s.rays.setAttribute('transform', `rotate(${(t * 20).toFixed(1)})`); });
    }
  };
}
