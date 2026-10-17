// inventory：まめがクリップボードを持って棚を順に数え、棚ごとの在庫数が分かる（例文 We need to check the inventory before the sale.）
import { seg, lerp, easeInOut, easeOut, backOut, hump } from '../ease.js';

export const meta = { duration: 4.3, beats: [[0, '棚の商品'], [1.7, '数える'], [3.5, '在庫が分かる']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 250, mood: 'indoor' });

  // SALE のポスター
  const poster = g({});
  tf(poster, 200, 18);
  el('rect', { x: -34, y: 4, width: 72, height: 62, rx: 6, fill: pal.shadow }, poster);
  el('rect', { x: -36, y: 0, width: 72, height: 62, rx: 6, fill: pal.red }, poster);
  el('rect', { x: -30, y: 6, width: 60, height: 50, rx: 4, fill: 'none', stroke: '#FFFFFF', 'stroke-width': 2, opacity: 0.7 }, poster);
  k.text(0, 31, 'SALE', { 'font-size': 24, fill: '#FFFFFF' }, poster);
  [-18, 18].forEach((x) => el('circle', { cx: x, cy: 14, r: 2.5, fill: pal.yellow }, poster));

  // 棚と箱
  const defs = [
    { cx: 62, n: 12, per: 4, w: 21 },
    { cx: 200, n: 8, per: 3, w: 26 },
    { cx: 338, n: 15, per: 5, w: 16 }
  ];
  const colors = ['#E7B97E', '#F2C98F', '#E0AC6E', '#9ED0F0', '#F5A99A'];
  const TIER = [150, 190, 230];
  const shelves = defs.map((d, si) => {
    const L = d.cx - 52, R = d.cx + 52;
    el('rect', { x: L - 4, y: 108, width: 6, height: 128, rx: 3, fill: pal.woodDark });
    el('rect', { x: R - 2, y: 108, width: 6, height: 128, rx: 3, fill: pal.woodDark });
    TIER.forEach((y) => el('rect', { x: L - 4, y, width: R - L + 8, height: 6, rx: 3, fill: pal.wood }));
    const boxes = [];
    for (let n = 0; n < d.n; n++) {
      const tier = Math.floor(n / d.per), col = n % d.per;
      const count = Math.min(d.per, d.n - tier * d.per);
      const gap = (R - L - 6 - count * d.w) / (count + 1);
      const x = L + 3 + gap + col * (d.w + gap) + d.w / 2;
      const h = 22 + ((n * 7 + si * 3) % 4) * 4;
      const y = TIER[tier];
      const bx = g({});
      tf(bx, x, y);
      el('rect', { x: -d.w / 2, y: -h, width: d.w, height: h, rx: 3, fill: colors[(n + si) % colors.length], stroke: 'rgba(40,52,70,0.2)', 'stroke-width': 1.5 }, bx);
      el('rect', { x: -2.5, y: -h, width: 5, height: h, fill: 'rgba(255,255,255,0.5)' }, bx);
      const hl = el('rect', { x: -d.w / 2 - 2, y: -h - 2, width: d.w + 4, height: h + 4, rx: 4, fill: 'none', stroke: pal.yellowDark, 'stroke-width': 3, opacity: 0 }, bx);
      boxes.push({ hl });
    }
    // 数のバッジ
    const badge = g({});
    el('circle', { r: 17, fill: '#FFFFFF', stroke: pal.blue, 'stroke-width': 3.5 }, badge);
    k.text(0, 1, String(d.n), { 'font-size': 19, fill: pal.blueDark }, badge);
    return { d, boxes, badge };
  });

  // まめ（クリップボード）
  const b = k.buddy({ x: 62, y: 292, scale: 0.7 });
  const board = g({});
  el('rect', { x: -2, y: -18, width: 30, height: 38, rx: 4, fill: pal.woodDark }, board);
  el('rect', { x: 2, y: -13, width: 22, height: 30, rx: 2, fill: '#FFFFFF' }, board);
  el('rect', { x: 9, y: -20, width: 8, height: 6, rx: 2, fill: '#8795AB' }, board);
  const rows = [0, 1, 2].map((i) => {
    el('line', { x1: 10, y1: -6 + i * 8, x2: 22, y2: -6 + i * 8, stroke: '#D5DBE5', 'stroke-width': 2.4, 'stroke-linecap': 'round' }, board);
    return el('path', { d: `M 4 ${-6 + i * 8} L 6 ${-4 + i * 8} L 9 ${-9 + i * 8}`, fill: 'none', stroke: pal.green, 'stroke-width': 2, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', opacity: 0 }, board);
  });
  const sp = g({});
  el('path', { d: 'M 0 -8 Q 1.5 -1.5 8 0 Q 1.5 1.5 0 8 Q -1.5 1.5 -8 0 Q -1.5 -1.5 0 -8 Z', fill: pal.yellow }, sp);

  const stops = [[0.35, 1.15], [1.75, 2.5], [3.0, 3.7]];
  const posX = (t) => {
    if (t < stops[0][1]) return 62;
    if (t < stops[1][0]) return lerp(62, 200, easeInOut(seg(t, stops[0][1], stops[1][0])));
    if (t < stops[1][1]) return 200;
    if (t < stops[2][0]) return lerp(200, 326, easeInOut(seg(t, stops[1][1], stops[2][0])));
    return 326;
  };

  return {
    update(t) {
      const x = posX(t);
      const walking = (t > stops[0][1] && t < stops[1][0]) || (t > stops[1][1] && t < stops[2][0]);
      const w = walking ? (t * 9) : 0;
      const done = t >= 3.75;
      b.pose({
        x, walk: w, armR: 108, armL: done ? 140 + 12 * Math.sin((t - 3.75) * 11) : walking ? 8 - Math.sin(w) * 12 : 8,
        look: walking ? 0.5 : -0.2, lean: 3, mood: done ? 'grin' : 'smile',
        lift: done ? 6 * Math.abs(Math.sin((t - 3.75) * 7)) * (1 - seg(t, 3.75, 4.3)) : 0
      });
      const hp = b.handPos('R');
      tf(board, hp.x - 2, hp.y - 14 - (walking ? Math.abs(Math.sin(w)) * 2 : 0), -4, 0.85, 0.85);

      shelves.forEach((s, si) => {
        const [t0] = stops[si];
        const n = s.boxes.length;
        s.boxes.forEach((bx, i) => {
          const ts = t0 + 0.2 + (i / n) * 0.55;
          bx.hl.setAttribute('opacity', hump(seg(t, ts, ts + 0.14)));
        });
        const tp = t0 + 0.85;
        const pop = t < tp ? 0 : backOut(seg(t, tp, tp + 0.28), 2.2);
        tf(s.badge, s.d.cx, 94 - 4 * hump(seg(t, tp, tp + 0.28)), 0, pop, pop);
        rows[si].setAttribute('opacity', t >= tp ? 1 : 0);
      });
      const u = seg(t, 3.8, 4.3);
      const ss = hump(u) * 1.1;
      tf(sp, 296, 120, t * 60, ss, ss);
    }
  };
}
