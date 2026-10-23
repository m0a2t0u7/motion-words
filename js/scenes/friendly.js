// friendly：ホテルに着いたまめを、フロントの2人がにこにこ手を振って迎え、鍵を手渡してくれる（例文 The staff at the hotel were very friendly.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';
import { P, blinkAt, hp, hold, aim, walkTo, path, person, heart, sym } from './confused.js';

export const meta = { duration: 4.4, beats: [[0, 'ホテルに着く'], [1.6, '笑顔で歓迎'], [3.0, '感じがいい']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 1;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  el('rect', { x: 0, y: 0, width: 400, height: FY, fill: '#F4ECDF' });
  el('rect', { x: 0, y: FY, width: 400, height: 64, fill: '#D9C4A6' });
  // シャンデリア風の照明と鍵の棚
  el('line', { x1: 120, y1: 0, x2: 120, y2: 30, stroke: pal.yellowDark, 'stroke-width': 2 });
  el('path', { d: 'M 100 30 h 40 l -8 14 h -24 Z', fill: pal.yellow });
  el('rect', { x: 250, y: 40, width: 120, height: 54, rx: 4, fill: pal.woodDark });
  for (let i = 0; i < 8; i++) el('circle', { cx: 264 + (i % 4) * 30, cy: 56 + Math.floor(i / 4) * 22, r: 4, fill: pal.yellow });
  const staff = [['coral', 270], ['blue', 340]].map(([c, x]) => person(k, c, { x, y: FY - 6, scale: 0.92, facing: -1 }));
  const tie = staff.map(() => el('path', { d: 'M -8 -4 L 0 0 L -8 4 Z M 8 -4 L 0 0 L 8 4 Z', fill: pal.red }));
  // カウンター（手前）
  el('rect', { x: 230, y: FY - 42, width: 170, height: 10, rx: 3, fill: pal.wood });
  el('rect', { x: 236, y: FY - 32, width: 164, height: 32, fill: '#C98A5A' });
  el('rect', { x: 250, y: FY - 24, width: 140, height: 3, fill: '#fff', opacity: 0.3 });
  const b = k.buddy({ x: -40, y: FY, scale: S });
  const key = g({});
  el('circle', { cx: 0, cy: 0, r: 5, fill: 'none', stroke: pal.yellowDark, 'stroke-width': 3 }, key);
  el('path', { d: 'M 0 5 v 14 h 5 M 0 13 h 4', stroke: pal.yellowDark, 'stroke-width': 3, fill: 'none' }, key);
  el('rect', { x: -6, y: 18, width: 12, height: 6, rx: 2, fill: pal.red }, key);
  const hs = [0, 1, 2].map(() => heart(k));
  const xf = path([[0.1, -40], [1.5, 180]]);
  return {
    update(t) {
      const w = walkTo(xf, t, -40, 1);
      const give = easeInOut(seg(t, 2.0, 2.6)), take = t > 2.6;
      P(b, { x: w.x, walk: w.walk, lean: w.lean, armL: w.armL, armR: w.armR, mood: t > 1.5 ? 'grin' : 'smile', look: 0.6, blink: blinkAt(t) });
      if (t > 2.3) aim(b, S, 'R', lerp(230, 214, seg(t, 2.6, 3.0)), FY - 56);
      if (t > 3.2) b.pose({ armL: 8 + 120 * hump(seg(t, 3.2, 4.2)) });
      staff.forEach((s, i) => {
        const wave = seg(t, 1.0 + i * 0.2, 1.3 + i * 0.2) * (i === 0 ? 1 - seg(t, 1.8, 2.0) : 1);
        P(s, { y: FY - 6, facing: -1, lean: 6 * hump(seg(t, 1.2, 1.8)), armR: wave > 0 ? 150 + 15 * Math.sin(t * 14 + i) : 8, armL: 8, mood: 'grin', look: 0.6, blink: blinkAt(t, i) });
        tf(tie[i], s.state.x, FY - 6 - 30 * 0.92 - 10, 0, 1);
      });
      if (t > 1.9) aim(staff[0], 0.92, 'R', lerp(250, 228, give), FY - 56);
      const h = take ? hp(b, S, 'R') : hp(staff[0], 0.92, 'R');
      tf(key, h.x, h.y - 2, 0, t > 1.9 ? 1 : 0.001);
      hs.forEach((n, i) => { const q = seg(t, 3.0 + i * 0.25, 4.2); tf(n, 200 + i * 60, FY - 140 - 26 * q, 0, q > 0 ? 1.3 * hump(q * 0.7 + 0.3) : 0.001); });
    }
  };
}
