// crush：彼が缶の上に足を振り下ろし、踏みつぶして平らにする（例文 He crushed the can with his foot.）
import { seg, lerp, easeInOut, easeIn, easeOut, wobble, hump } from '../ease.js';

export const meta = { duration: 4.2, beats: [[0, '缶を見下ろす'], [1.5, '足を上げる'], [3.2, '平らになった']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const S = 1.15;
  const FY = k.backdrop({ floorY: 240, mood: 'outdoor' });
  el('rect', { x: 0, y: FY - 4, width: 400, height: 4, fill: pal.floorEdge });
  // ごみ箱（奥）
  el('rect', { x: 300, y: FY - 70, width: 50, height: 70, rx: 6, fill: '#B9C4D2' });
  el('rect', { x: 296, y: FY - 78, width: 58, height: 10, rx: 4, fill: '#9AA6B6' });
  const b = k.buddy({ x: 130, y: FY, scale: S, color: pal.blue, dark: pal.blueDark });
  const legs = b.g.children[1].children;
  // 缶（原点は底の中央）
  const CX = 130 + 29 * S, CH = 26;
  const sh = k.shadow(CX, FY, 14, 3);
  const can = g({});
  el('rect', { x: -10, y: -CH, width: 20, height: CH, rx: 3, fill: '#D9DEE6' }, can);
  el('rect', { x: -10, y: -CH + 7, width: 20, height: 10, fill: pal.red }, can);
  el('ellipse', { cx: 0, cy: -CH, rx: 10, ry: 2.6, fill: '#F2F4F8' }, can);
  el('rect', { x: -2, y: -CH - 1, width: 4, height: 2, rx: 1, fill: '#9AA6B6' }, can);
  const puffs = [0, 1, 2, 3].map(() => el('path', { d: 'M 0 0 L 8 0', stroke: pal.sub, 'stroke-width': 2.5, 'stroke-linecap': 'round', opacity: 0 }));
  return {
    update(t) {
      const up = easeInOut(seg(t, 1.0, 1.7)), hold = seg(t, 1.7, 2.1), down = easeIn(seg(t, 2.1, 2.35));
      const back = easeInOut(seg(t, 3.0, 3.6));
      const air = 18 * up * (1 - down);
      const impact = wobble(seg(t, 2.35, 3.0), 3, 5);
      const sq = lerp(1, 0.22, easeOut(seg(t, 2.25, 2.45)));
      // 缶
      tf(can, CX, FY, 0, 1 + (1 - sq) * 0.55, sq);
      k.set(sh, { rx: 14 + 7 * (1 - sq) });
      // 足を上げてから勢いよく下ろす
      const leg = (lerp(0, -64, up) + lerp(0, 14, down)) * (1 - back);
      const dip = hold > 0 ? 1 : 0;
      b.pose({ lift: air, lean: -4 * up * (1 - down) + 10 * down * (1 - back) , squash: 1 - 0.1 * (down >= 1 ? Math.abs(impact) : 0) - 0.04 * (1 - up) * 0, armL: lerp(8, 70, up) * (1 - back), armR: lerp(8, -40, up) * (1 - back) + 8 * back, mood: t > 2.4 ? 'grin' : up > 0.3 ? 'open' : 'flat', look: 0.5 });
      legs[1].setAttribute('transform', `translate(12 ${-14 - air}) rotate(${leg})`);
      // 衝撃線
      puffs.forEach((p, i) => {
        const q = seg(t, 2.35, 2.8), a = (-25 + i * 28) * Math.PI / 180 + (i < 2 ? Math.PI : 0);
        const dir = i < 2 ? -1 : 1, r0 = 14 + 22 * q;
        k.set(p, { opacity: hump(q) * 0.9, transform: `translate(${CX + dir * r0} ${FY - 6 - (i % 2) * 7}) rotate(${dir > 0 ? -15 : 195 })` });
      });
    }
  };
}
