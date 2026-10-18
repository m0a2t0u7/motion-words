// reach：一番上の棚の箱に手を伸ばし、背伸びしてもジャンプしても届かない（例文 I can't reach the top shelf.）
import { seg, lerp, easeInOut, easeOut, wobble } from '../ease.js';

export const meta = { duration: 4.4, beats: [[0, '見上げる'], [1.2, '背伸び'], [3.4, '届かない']] };

export function create(k) {
  const { el, pal } = k;
  const FY = k.backdrop({ floorY: 244, mood: 'indoor' });
  // 棚（壁に固定）
  const SX = 226, SW = 150, TOP = 124;
  el('rect', { x: SX - 6, y: 28, width: 6, height: FY - 28, fill: pal.woodDark });
  el('rect', { x: SX + SW, y: 28, width: 6, height: FY - 28, fill: pal.woodDark });
  [TOP, 186].forEach((y) => el('rect', { x: SX - 6, y, width: SW + 12, height: 7, rx: 2, fill: pal.wood }));
  // 低い棚の物
  el('rect', { x: SX + 70, y: 156, width: 26, height: 30, rx: 4, fill: pal.violet });
  el('rect', { x: SX + 104, y: 148, width: 20, height: 38, rx: 4, fill: pal.yellow });
  // 一番上の棚の箱
  el('rect', { x: SX + 24, y: TOP - 46, width: 48, height: 46, rx: 4, fill: '#E9C58F' });
  el('rect', { x: SX + 24, y: TOP - 30, width: 48, height: 6, fill: '#fff', opacity: 0.55 });
  el('rect', { x: SX + 90, y: TOP - 30, width: 30, height: 30, rx: 4, fill: pal.blue });
  const b = k.buddy({ x: 214, y: FY, facing: 1, scale: 1.05 });
  const dots = [0, 1, 2].map(() => el('circle', { r: 3, fill: pal.red, opacity: 0 }));
  const sweat = el('path', { d: 'M 0 -7 Q 5 0 0 5 Q -5 0 0 -7 Z', fill: pal.water, opacity: 0 });
  return {
    update(t) {
      const r1 = easeOut(seg(t, 0.9, 1.5)), f1 = easeInOut(seg(t, 2.0, 2.3));
      const toe = r1 * (1 - f1);
      const jp = seg(t, 2.4, 3.1), jumping = jp > 0 && jp < 1;
      const hop = Math.sin(jp * Math.PI) * 15 * (jumping ? 1 : 0);
      const land = wobble(seg(t, 3.1, 3.7), 2, 4);
      const droop = easeInOut(seg(t, 3.3, 3.9));
      const ang = lerp(8, 176, easeOut(seg(t, 0.4, 1.3)));
      b.pose({
        armR: lerp(ang, 20, droop), armL: lerp(8, 12, droop) + 160 * (ang > 100 ? 1 : 0) * (1 - droop),
        lift: toe * 7 + hop, squash: 1 - 0.07 * land - 0.06 * droop + 0.03 * toe,
        lean: 2 * toe + 6 * droop, look: lerp(0.2, 0.0, droop),
        mood: droop > 0.5 ? 'sad' : toe > 0.4 || jumping ? 'open' : 'flat'
      });
      const H = b.handPos('R');
      const show = t > 1.3 && t < 3.4 ? 1 : 0;
      dots.forEach((d, i) => k.set(d, { cx: H.x + 2, cy: lerp(H.y - 12, TOP - 6, i / 3), opacity: show * 0.8 }));
      k.set(sweat, { opacity: droop < 0.2 ? seg(t, 1.8, 2.2) * 0.9 : 0, transform: `translate(${b.state.x - 30} ${FY - 106 + 8 * seg(t, 1.8, 2.8)})` });
    }
  };
}
