import { seg, lerp, easeInOut, easeOut, easeIn, backOut, smooth, wobble, hump, clamp } from '../ease.js';
const D = Math.PI / 180;
// 手(R/L)を点(tx,ty)へ向ける腕の角度
function aim(b, S, tx, ty, side = 'R') {
  const s = b.state, f = s.facing, o = side === 'R' ? 1 : -1;
  return Math.atan2((tx - (s.x + 27 * S * f * o)) * f * o, ty - (s.y - 56 * S - s.lift)) / D;
}
function cursor(k, parent) {
  return k.el('path', { d: 'M0 0 L0 15 L4 11.5 L7 18 L10 16.5 L7 10.5 L12 10.5 Z', fill: k.pal.ink, stroke: '#fff', 'stroke-width': 1.4, 'stroke-linejoin': 'round' }, parent);
}
function pen(k, parent, c) {
  const p = k.g({}, parent);
  k.el('line', { x1: 0, y1: 0, x2: -22, y2: -6, stroke: c || k.pal.coralDark, 'stroke-width': 5, 'stroke-linecap': 'round' }, p);
  k.el('path', { d: 'M 0 0 L 6 1.6 L 0 3 Z', fill: '#F4D9B5' }, p);
  k.el('circle', { cx: 5.2, cy: 1.7, r: 1.1, fill: k.pal.ink }, p);
  return p;
}

// boil-down：ソースを煮て水分を減らし、量を少なく濃くする（Boil down the sauce until it thickens.）
export const meta = { duration: 4.2, beats: [[0, 'たっぷり'], [1.4, 'ぐつぐつ煮る'], [3.4, '少なく濃く']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  const S = 1.1;
  el('rect', { x: 200, y: 214, width: 200, height: 22, fill: '#7B8594' });
  el('rect', { x: 200, y: 214, width: 200, height: 7, fill: '#9AA3B2' });
  const PX = 300, TOP = 128, BOT = 212, HW = 56;
  const flame = g({});
  [[-26, 12], [-10, 17], [10, 17], [26, 12]].forEach(([x, h]) => el('path', { d: `M ${x} 0 Q ${x - 7} -${h * 0.6} ${x} -${h} Q ${x + 7} -${h * 0.6} ${x} 0 Z`, fill: pal.red, opacity: 0.9 }, flame));
  tf(flame, PX, 214);
  // 鍋の中（断面）
  const clip = k.clip((cp) => el('rect', { x: PX - HW + 4, y: TOP, width: HW * 2 - 8, height: BOT - TOP - 3, rx: 8 }, cp));
  el('rect', { x: PX - HW, y: TOP, width: HW * 2, height: BOT - TOP, rx: 12, fill: '#E9EDF3', stroke: '#8A96A8', 'stroke-width': 6 });
  const liq = el('rect', { x: PX - HW, y: TOP + 6, width: HW * 2, height: BOT - TOP, fill: '#F28A6A', 'clip-path': clip });
  const surf = el('rect', { x: PX - HW, y: TOP + 6, width: HW * 2, height: 5, fill: '#FFB39A', 'clip-path': clip });
  el('rect', { x: PX + HW - 4, y: TOP + 10, width: 30, height: 9, rx: 4, fill: '#4A5568' });
  el('rect', { x: PX - HW - 26, y: TOP + 10, width: 24, height: 9, rx: 4, fill: '#4A5568' });
  const bub = [0, 1, 2, 3, 4].map((i) => el('circle', { r: 3, fill: '#FFD2C2', opacity: 0.8, 'clip-path': clip }));
  // 元の量の目印
  el('line', { x1: PX - HW - 8, y1: TOP + 6, x2: PX + HW + 8, y2: TOP + 6, stroke: pal.sub, 'stroke-width': 2, 'stroke-dasharray': '5 4', opacity: 0.8 });
  const arrow = g({});
  el('line', { x1: 0, y1: 0, x2: 0, y2: 1, stroke: pal.blueDark, 'stroke-width': 3 }, arrow);
  const alen = el('line', { x1: 0, y1: 0, x2: 0, y2: 0, stroke: pal.blueDark, 'stroke-width': 3, 'stroke-linecap': 'round' }, arrow);
  const ahead = el('path', { d: 'M -6 -2 L 0 6 L 6 -2 Z', fill: pal.blueDark }, arrow);
  tf(arrow, PX + HW + 18, TOP + 8);
  const steam = [0, 1, 2].map(() => el('path', { d: 'M 0 0 q -6 -8 0 -16 q 6 -8 0 -16', stroke: '#C9D3E0', 'stroke-width': 3, fill: 'none', 'stroke-linecap': 'round' }));
  const b = k.buddy({ x: 190, y: FY, scale: S });
  const sp = g({});
  el('line', { x1: 0, y1: 0, x2: 54, y2: 0, stroke: pal.woodDark, 'stroke-width': 5, 'stroke-linecap': 'round' }, sp);
  el('ellipse', { cx: 58, cy: 0, rx: 9, ry: 6, fill: pal.wood, stroke: pal.woodDark, 'stroke-width': 2 }, sp);
  return {
    update(t) {
      const p = easeInOut(seg(t, 0.8, 3.3));
      const lv = TOP + 6 + p * 52;
      k.set(liq, { y: lv, height: BOT - lv + 4, fill: p < 0.5 ? `rgb(${Math.round(lerp(242, 214, p * 2))},${Math.round(lerp(138, 100, p * 2))},${Math.round(lerp(106, 78, p * 2))})` : `rgb(${Math.round(lerp(214, 160, (p - 0.5) * 2))},${Math.round(lerp(100, 56, (p - 0.5) * 2))},${Math.round(lerp(78, 46, (p - 0.5) * 2))})` });
      k.set(surf, { y: lv, opacity: 0.8 });
      k.set(alen, { y2: 52 * p });
      tf(ahead, 0, 52 * p, 0);
      bub.forEach((c, i) => {
        const ph = (t * 0.9 + i * 0.21) % 1;
        tf(c, PX - 40 + i * 20 + Math.sin(t * 4 + i) * 3, lerp(BOT - 10, lv + 6, ph), 0, 0.6 + 0.5 * ph);
        k.set(c, { opacity: t > 0.7 ? 0.9 * (1 - ph * 0.5) : 0 });
      });
      steam.forEach((s, i) => {
        const q = (t * 0.6 + i * 0.33) % 1;
        tf(s, PX - 24 + i * 24, TOP - 8 - q * 28, 0, 0.8);
        k.set(s, { opacity: (t > 0.7 ? 0.6 : 0) * (1 - q) * (1 - 0.5 * p) });
      });
      const reach = easeInOut(seg(t, 0.3, 0.8));
      const st = t > 0.8 ? t : 0;
      const sw = Math.sin(st * 6) * 6 * (t > 0.8 ? 1 : 0);
      b.pose({ armR: lerp(8, 95, reach) + Math.cos(st * 6) * 3, lean: 4 * reach, look: 1, mood: t > 3.4 ? 'grin' : 'smile', blink: t > 0.2 && t < 0.3 ? 1 : 0 });
      const h = b.handPos('R');
      const tx = PX - 6 + sw, ty = lv + 24;
      const ang = Math.atan2(ty - h.y, tx - h.x) / D;
      const L = Math.hypot(tx - h.x, ty - h.y);
      tf(sp, h.x, h.y, ang, L / 58 > 1.4 ? 1.2 : L / 58 || 1);
      k.set(sp, { opacity: reach > 0.05 ? 1 : 0 });
    }
  };
}
