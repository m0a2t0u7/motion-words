// fall off：棚の端の本がずれて傾き、棚から床へ落ちる（例文 A book fell off the shelf.）
import { seg, lerp, easeIn, easeInOut, easeOut, wobble, clamp } from '../ease.js';

export const meta = { duration: 3.6, beats: [[0, '棚の上の本'], [1.3, '端から落ちる'], [2.4, '床に落ちた']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 240, mood: 'indoor' });
  el('rect', { x: 40, y: 50, width: 80, height: 70, rx: 6, fill: '#DDEFFA', stroke: '#fff', 'stroke-width': 5 });
  const SY = 130, SX0 = 150, SX1 = 290;
  // 棚の本（静止）
  [[156, 40, pal.blue], [170, 46, pal.coral], [184, 36, pal.yellow], [196, 44, pal.violet], [210, 40, pal.green]].forEach(([x, h, c]) => el('rect', { x, y: SY - h, width: 12, height: h, rx: 2, fill: c }));
  el('rect', { x: SX0, y: SY, width: SX1 - SX0, height: 8, rx: 2, fill: pal.wood });
  el('path', { d: `M ${SX0 + 14} ${SY + 8} L ${SX0 + 14} ${SY + 26} L ${SX0 + 34} ${SY + 8} Z M ${SX1 - 14} ${SY + 8} L ${SX1 - 14} ${SY + 26} L ${SX1 - 34} ${SY + 8} Z`, fill: pal.woodDark });
  const sh = k.shadow(0, FY + 1, 26, 4);
  const book = g({});
  const bk = g({}, book);
  el('rect', { x: -32, y: -10, width: 32, height: 10, rx: 2, fill: pal.red }, bk);
  el('rect', { x: -30, y: -8, width: 28, height: 2, fill: '#fff', opacity: 0.6 }, bk);
  const B = k.buddy({ x: 80, y: FY, scale: 0.8 });
  return {
    update(t) {
      // 横にした本が少しずつ端へずれ、重心が越えたところで傾いて落ちる
      const slide = easeInOut(seg(t, 0.3, 1.2)) * 20;
      const tip = easeIn(seg(t, 1.2, 1.5));
      const f = seg(t, 1.5, 2.1), land = seg(t, 2.1, 2.8);
      let x = 270 + slide, y = SY, r = tip * 40;
      if (f > 0) { x = lerp(x, 330, easeOut(f)); y = lerp(SY, FY, easeIn(f)); r = lerp(40, 180, f); }
      if (land > 0) { x = 330; y = FY - 6 * Math.abs(wobble(land, 1.2, 6)); r = 180 + 4 * wobble(land, 2, 6); }
      tf(book, x, y, r, 1.4);
      tf(bk, 16 * (f > 0 ? 1 : 0), 0);
      const air = clamp(f * (1 - land) + land);
      sh.setAttribute('opacity', f > 0 ? air : 0); tf(sh, x, 0, 0, 0.4 + 0.6 * easeIn(f), 1);
      const look = seg(t, 1.6, 1.9);
      B.pose({ look: lerp(0.2, 1, look), mood: t > 1.7 ? 'open' : 'smile', armL: 8, armR: t > 1.8 ? lerp(8, 60, easeOut(seg(t, 1.8, 2.2))) : 8, lift: 6 * Math.sin(seg(t, 1.7, 2.0) * Math.PI) });
    }
  };
}
