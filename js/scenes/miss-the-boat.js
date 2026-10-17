// miss the boat：ぐずぐずしているうちに船が出港。走って桟橋に着いたときにはもう遠く（例文 If you wait too long, you'll miss the boat.）
import { seg, lerp, easeInOut, easeOut, easeIn, backOut, wobble, hump } from '../ease.js';

export const meta = { duration: 4.4, beats: [[0, '船が待っている'], [1.4, '出港する'], [3.2, '乗り遅れた']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 226, mood: 'outdoor' });
  // 海
  el('rect', { x: 196, y: 190, width: 204, height: 110, fill: pal.water });
  for (let i = 0; i < 4; i++) el('path', { d: `M ${210 + i * 52} ${232 + (i % 2) * 20} q 8 -6 16 0 t 16 0`, fill: 'none', stroke: '#fff', 'stroke-width': 2.5, opacity: 0.7 });
  // 桟橋
  el('rect', { x: 0, y: FY, width: 200, height: 14, fill: pal.wood });
  el('rect', { x: 0, y: FY + 12, width: 200, height: 4, fill: pal.woodDark });
  [30, 100, 184].forEach((x) => el('rect', { x: x, y: FY + 14, width: 8, height: 50, fill: pal.woodDark }));
  el('rect', { x: 0, y: FY + 40, width: 400, height: 0 });
  // 船
  const boat = g({});
  el('path', { d: 'M -64 0 L 64 0 L 48 30 L -48 30 Z', fill: pal.coral }, boat);
  el('rect', { x: -64, y: -4, width: 128, height: 8, rx: 3, fill: '#fff' }, boat);
  el('rect', { x: -24, y: -38, width: 48, height: 34, rx: 6, fill: '#fff' }, boat);
  el('circle', { cx: -10, cy: -22, r: 6, fill: '#BFE0F8' }, boat);
  el('circle', { cx: 10, cy: -22, r: 6, fill: '#BFE0F8' }, boat);
  el('line', { x1: 36, y1: -4, x2: 36, y2: -50, stroke: pal.ink, 'stroke-width': 3 }, boat);
  el('path', { d: 'M 36 -50 L 58 -42 L 36 -34 Z', fill: pal.yellow }, boat);
  const wake = el('path', { d: 'M 0 0', fill: 'none', stroke: '#fff', 'stroke-width': 4, 'stroke-linecap': 'round', opacity: 0 });
  const b = k.buddy({ x: 30, y: FY, scale: 1.0 });
  const bag = g({});
  el('rect', { x: -9, y: -6, width: 18, height: 14, rx: 3, fill: pal.violet }, bag);
  const clk = g({});
  el('circle', { r: 11, fill: '#fff', stroke: pal.ink, 'stroke-width': 2.5 }, clk);
  const ch = el('line', { x1: 0, y1: 0, x2: 0, y2: -7, stroke: pal.ink, 'stroke-width': 2, 'stroke-linecap': 'round' }, clk);
  return {
    update(t) {
      const dep = easeIn(seg(t, 1.3, 3.3));
      const bx = 262 + 100 * dep, sc = 1 - 0.5 * dep;
      const bob = 2.5 * Math.sin(t * 3);
      tf(boat, bx, 192 - 6 * dep + bob, 0.6 * Math.sin(t * 3), sc, sc);
      k.set(wake, { d: `M ${bx - 70 * sc} 222 q -20 4 -40 0`, opacity: dep > 0.02 ? 0.8 : 0 });
      // まめ：のんびり → 気づいて走る → 桟橋の端で止まる
      const run = easeIn(seg(t, 1.5, 2.4)) * 0.0 + easeInOut(seg(t, 1.6, 2.7));
      const x = lerp(40, 168, run);
      const running = run > 0 && run < 1;
      const wait = t < 1.6;
      b.pose({
        x: wait ? 40 + 6 * Math.sin(t * 2) : x, walk: running ? t * 16 : wait ? 0 : 0,
        lean: running ? 14 : t > 2.7 ? -6 * hump(seg(t, 2.7, 3.4)) : 0,
        armR: running ? 90 + 40 * Math.sin(t * 16) : t > 2.8 ? 125 + 8 * Math.sin(t * 8) : 8,
        armL: running ? 90 - 40 * Math.sin(t * 16) : t > 2.8 ? 125 : 8,
        mood: wait ? 'smile' : running ? 'open' : 'sad', look: 0.9,
        squash: 1 - 0.05 * hump(seg(t, 2.6, 3.0))
      });
      // 待っている間は時計を見て、あちこち見ている
      const cp = wait ? backOut(seg(t, 0.4, 0.8), 2) : 0;
      tf(clk, 62, FY - 100, 0, cp, cp);
      tf(ch, 0, 0, t * 200);
      tf(bag, wait ? 80 : b.state.x + 24, wait ? FY - 4 : FY - 12, 0, 1, 1);
      bag.setAttribute('opacity', 1);
    }
  };
}
