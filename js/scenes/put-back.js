// put back：まめが手に持った本を本棚の空いたすき間へ差し込み、元の場所に戻す（例文 Please put the book back on the shelf.）
import { seg, lerp, easeInOut, easeOut, wobble, clamp } from '../ease.js';
import { reach, hp } from './dig.js';
import { gait } from './weigh.js';

export const meta = { duration: 4.0, beats: [[0, '本を持つ'], [1.6, '棚のすき間へ'], [3.0, '元に戻した']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 240, mood: 'indoor' });
  // 本棚（静止）
  const SX = 250, SY = 70;
  el('rect', { x: SX, y: SY, width: 120, height: 170, rx: 4, fill: pal.woodDark });
  el('rect', { x: SX + 6, y: SY + 6, width: 108, height: 158, fill: '#F2DDBB' });
  [SY + 60, SY + 112].forEach((y) => el('rect', { x: SX + 6, y, width: 108, height: 6, fill: pal.woodDark }));
  const C = [pal.blue, pal.coral, pal.yellow, null, pal.violet, pal.green, pal.blue];
  C.forEach((c, i) => { if (c) el('rect', { x: SX + 10 + i * 14, y: SY + 60 - (i % 2 ? 44 : 48), width: 12, height: i % 2 ? 44 : 48, rx: 2, fill: c }); });
  [pal.green, pal.yellow, pal.coral, pal.blue, pal.violet].forEach((c, i) => el('rect', { x: SX + 12 + i * 18, y: SY + 112 - 40, width: 15, height: 40, rx: 2, fill: c }));
  const gapX = SX + 10 + 3 * 14 + 6;
  // 戻す本（原点＝下端中央）
  const bk = g({});
  el('rect', { x: -6, y: -46, width: 12, height: 46, rx: 2, fill: pal.red }, bk);
  el('rect', { x: -4, y: -38, width: 8, height: 3, fill: '#fff', opacity: 0.7 }, bk);
  const B = k.buddy({ x: 70, y: FY, scale: 0.9 });
  k.root.appendChild(bk);
  const xf = (t) => lerp(70, 196, easeInOut(seg(t, 0.3, 1.5)));
  return {
    update(t) {
      const p = gait(xf, t, 70);
      const lift = easeInOut(seg(t, 1.5, 2.2)), push = easeInOut(seg(t, 2.2, 2.8));
      const h0 = { x: p.x + 30, y: FY - 60 };
      const top = { x: gapX, y: SY + 4 };
      // 本：手で持つ→すき間の真上→下へ差し込む
      const bx = lerp(h0.x, gapX, lift), by = lerp(h0.y + 20, SY + 60 - 30 + 30 * 0, lift);
      const fy = lerp(by, SY + 60, push);
      tf(bk, bx, fy + 2 * wobble(seg(t, 2.8, 3.2), 2, 6), lerp(-20, 0, lift));
      const ra = reach(B, 0.9, 'R', bx, fy - 30);
      const rel = seg(t, 2.9, 3.3);
      B.pose({ x: p.x, walk: p.walk, armL: p.armL, armR: t < 0.3 ? 50 : lerp(lerp(50, ra, seg(t, 1.4, 1.6)), 20, rel), lean: p.lean + 4 * push, lift: 6 * lift * (1 - rel), look: 0.6, mood: t > 3.0 ? 'grin' : 'smile' });
      if (t < 1.4) B.pose({ armR: reach(B, 0.9, 'R', bx, fy - 20) });
    }
  };
}
