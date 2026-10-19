// wall：まめが時計を持ってきて壁のくぎに掛け、下がって見上げる（例文 There is a clock on the wall.）
import { seg, lerp, easeInOut, easeOut, wobble, hump } from '../ease.js';
import { gait, reach, hp } from './dig.js';
import { P, blinkAt, clock } from './run-after.js';

// 壁紙と腰板の部屋
export function wallRoom(k, FY = 236) {
  const { el, pal } = k;
  k.backdrop({ floorY: FY, mood: 'indoor' });
  el('rect', { x: 0, y: 0, width: 400, height: FY, fill: '#F3EBDD' });
  for (let x = 10; x < 400; x += 28) el('rect', { x, y: 0, width: 10, height: FY - 50, fill: '#EADFCB' });
  el('rect', { x: 0, y: FY - 50, width: 400, height: 50, fill: '#D9C3A0' });
  el('rect', { x: 0, y: FY - 54, width: 400, height: 6, rx: 2, fill: pal.woodDark });
  el('rect', { x: 0, y: FY - 6, width: 400, height: 6, fill: pal.woodDark });
  for (let x = 30; x < 400; x += 60) el('line', { x1: x, y1: FY - 48, x2: x, y2: FY - 6, stroke: '#C9B08A', 'stroke-width': 2 });
  return FY;
}

export const meta = { duration: 4.4, beats: [[0, '時計を持つ'], [1.4, '壁に掛ける'], [3.0, '壁に時計']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = wallRoom(k, 236);
  const NX = 230, NY = 92;
  el('circle', { cx: NX, cy: NY, r: 2.6, fill: pal.ink });
  const cg = g({});
  const string = el('path', { d: 'M 0 0 L -14 10 M 0 0 L 14 10', stroke: pal.ink, 'stroke-width': 1.6, fill: 'none' }, cg);
  const ck = clock(k, 0, 30, 24, cg);
  const csh = el('ellipse', { cx: NX + 3, cy: NY + 34, rx: 26, ry: 26, fill: 'rgba(40,52,70,0.10)' });
  const S = 0.95;
  const me = k.buddy({ x: -30, y: FY, scale: S });
  k.root.appendChild(cg);
  const xf = (t) => t < 2.4 ? lerp(-30, NX - 34, easeInOut(seg(t, 0, 1.2))) : lerp(NX - 34, 140, easeInOut(seg(t, 2.4, 3.1)));
  return {
    update(t) {
      const w = gait(xf, t, -30);
      const up = easeInOut(seg(t, 1.2, 1.9)), hung = t > 2.0, back = seg(t, 2.4, 3.1);
      const facing = t > 2.4 && t < 3.1 ? -1 : 1;
      P(me, { x: w.x, walk: w.walk, facing, lift: 6 * up * (hung ? 1 - seg(t, 2.0, 2.3) : 1), lean: w.lean,
        look: t > 3.1 ? 0.6 : 0.4, mood: t > 3.1 ? 'grin' : 'smile', blink: blinkAt(t) });
      // 持つ位置：胸の前 → くぎの高さ
      const cx = lerp(w.x + 46, NX, up), cy = lerp(FY - 56, NY + 30, up);
      if (!hung) {
        me.pose({ armR: reach(me, S, 'R', cx + 16, cy + 6), armL: reach(me, S, 'L', cx - 16, cy + 6) });
        tf(cg, cx, cy - 30);
        string.setAttribute('opacity', up > 0.6 ? 1 : 0);
        csh.setAttribute('opacity', 0);
      } else {
        const sw = 8 * wobble(seg(t, 2.0, 3.0), 2, 4);
        tf(cg, NX, NY, sw);
        string.setAttribute('opacity', 1); csh.setAttribute('opacity', 1);
        const rel = easeOut(seg(t, 2.0, 2.4));
        me.pose({ armR: lerp(reach(me, S, 'R', NX + 16, NY + 36), 8, rel), armL: lerp(reach(me, S, 'L', NX - 16, NY + 36), 8, rel) });
        if (t > 3.1) me.pose({ armR: lerp(8, reach(me, S, 'R', NX, NY + 30), easeOut(seg(t, 3.2, 3.6))) });
      }
      const m = 10 + t * 6;
      ck.set(3 + m / 60, m % 60);
    }
  };
}
