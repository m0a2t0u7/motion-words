// beat around the bush：茂みの周りを棒でたたくだけで、中心（本題）に入らない（例文 Stop beating around the bush and tell me.）
import { seg, lerp, easeInOut, hump, smooth } from '../ease.js';

export const meta = { duration: 4.0, beats: [[0, '茂みの前'], [1.5, '周りをたたく'], [3.2, '中心は手つかず']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'outdoor' });
  const bush = g({});
  tf(bush, 280, FY);
  k.shadow(0, 2, 62, 8, bush);
  [[-38, -26, 30], [38, -26, 30], [0, -34, 38], [-18, -58, 26], [22, -58, 26]].forEach(([cx, cy, r]) => el('circle', { cx, cy, r, fill: pal.green }, bush));
  // 茂みの中心にある宝（本題）
  const core = g({}, bush);
  tf(core, 0, -36);
  el('path', { d: 'M 0 -12 L 4 -4 L 13 -3 L 6 3 L 8 12 L 0 7 L -8 12 L -6 3 L -13 -3 L -4 -4 Z', fill: pal.yellow, stroke: pal.yellowDark, 'stroke-width': 2, 'stroke-linejoin': 'round' }, core);
  // 手前の葉（中心をふさぐ）
  [[-30, -14, 22], [30, -14, 22], [0, -12, 24]].forEach(([cx, cy, r]) => el('circle', { cx, cy, r, fill: '#4DB36F' }, bush));

  const b = k.buddy({ x: 110, y: FY, scale: 1 });
  const stick = g({});
  el('line', { x1: 0, y1: 0, x2: 0, y2: -46, stroke: pal.woodDark, 'stroke-width': 5, 'stroke-linecap': 'round' }, stick);
  const marks = [0, 1, 2].map(() => el('path', { d: 'M -5 0 L 0 -6 L 5 0', fill: 'none', stroke: pal.sub, 'stroke-width': 2.4, 'stroke-linecap': 'round' }));
  const base = { armL: 8, armR: 8, lean: 0, squash: 1, walk: 0, look: 0, mood: 'smile', blink: 0, lift: 0, facing: 1 };

  return {
    update(t) {
      // 茂みの周りの弧を行ったり来たり（中心には入らない）
      const x = 130 + 62 * (0.5 - 0.5 * Math.cos(Math.min(t, 3.2) * 2.1)) * 1 + 0;
      const walking = t < 3.2;
      const sw = Math.sin(t * 7.5);
      const swing = walking ? Math.max(0, sw) : 0;
      b.pose({ ...base, x, walk: walking ? t * 6 : 0, armR: lerp(95, 150, swing), lean: 4 + swing * 6, look: 0.8, mood: t > 3.0 ? 'flat' : 'smile' });
      const h = b.handPos('R');
      const rot = lerp(-70, 10, 1 - swing);
      tf(stick, h.x, h.y, rot);
      // 棒の先で茂みの手前の地面・縁をたたく
      marks.forEach((m, i) => {
        const p = seg(((t * 1.2 + i / 3) % 1), 0, 0.5);
        const mx = 205 + i * 12 + (i % 2) * 8, my = FY - 20 - (i % 3) * 14;
        tf(m, mx, my, 0, 1, 1);
        m.setAttribute('opacity', walking ? hump(p) * 0.8 : 0);
      });
      tf(core, 0, -36, 0, 1 + 0.08 * Math.sin(t * 6), 1 + 0.08 * Math.sin(t * 6));
    }
  };
}
