// reserve：2人用のテーブルに「RESERVED」の札を置いて席を確保する（例文 I'd like to reserve a table for two.）
import { seg, lerp, easeInOut, easeOut, easeIn, backOut, wobble, clamp } from '../ease.js';

export const meta = { duration: 4.0, beats: [[0, '空いている席'], [1.0, '札を置く'], [2.5, '確保された']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 250, mood: 'indoor' });
  // 壁の飾り
  el('rect', { x: 28, y: 40, width: 72, height: 62, rx: 8, fill: '#DDEFFA' });
  el('line', { x1: 64, y1: 40, x2: 64, y2: 102, stroke: '#FFFFFF', 'stroke-width': 4 });
  el('rect', { x: 306, y: 44, width: 62, height: 48, rx: 6, fill: '#FFFFFF', stroke: pal.woodDark, 'stroke-width': 5 });
  el('circle', { cx: 337, cy: 68, r: 11, fill: pal.coral, opacity: 0.8 });
  el('path', { d: 'M 312 90 L 326 76 L 336 86 L 346 74 L 362 90 Z', fill: pal.mint, opacity: 0.7 });

  const chair = (x, dir) => {
    const c = g({});
    tf(c, x, FY, 0, dir, 1);
    k.shadow(0, 2, 30, 5, c);
    el('rect', { x: -26, y: -30, width: 6, height: 30, rx: 3, fill: pal.woodDark }, c);
    el('rect', { x: 14, y: -30, width: 6, height: 30, rx: 3, fill: pal.woodDark }, c);
    el('rect', { x: -26, y: -96, width: 8, height: 68, rx: 4, fill: pal.wood }, c);
    el('rect', { x: -22, y: -88, width: 18, height: 30, rx: 8, fill: pal.mint }, c);
    el('rect', { x: -26, y: -38, width: 50, height: 11, rx: 5, fill: pal.wood }, c);
    el('rect', { x: -22, y: -46, width: 44, height: 10, rx: 5, fill: pal.mint }, c);
    return c;
  };
  chair(66, 1);
  chair(334, -1);

  // テーブル（白いクロス）
  const TX = 200, TY = 202;
  k.shadow(TX, FY + 2, 100, 7);
  el('path', { d: `M ${TX - 94} ${TY + 4} L ${TX - 100} ${FY - 6} Q ${TX} ${FY + 8} ${TX + 100} ${FY - 6} L ${TX + 94} ${TY + 4} Z`, fill: '#FFFFFF', stroke: '#E1E6EE', 'stroke-width': 2, 'stroke-linejoin': 'round' });
  el('path', { d: `M ${TX - 100} ${FY - 12} Q ${TX} ${FY + 2} ${TX + 100} ${FY - 12} L ${TX + 100} ${FY - 6} Q ${TX} ${FY + 8} ${TX - 100} ${FY - 6} Z`, fill: pal.coral, opacity: 0.85 });
  el('ellipse', { cx: TX, cy: TY, rx: 96, ry: 22, fill: '#FFFFFF', stroke: '#E1E6EE', 'stroke-width': 2 });
  // 2人分のお皿
  [-56, 56].forEach((dx) => {
    el('ellipse', { cx: TX + dx, cy: TY + 1, rx: 24, ry: 6.5, fill: '#F1F4F8', stroke: '#DCE2EB', 'stroke-width': 2 });
    el('ellipse', { cx: TX + dx, cy: TY + 1, rx: 14, ry: 3.5, fill: '#FFFFFF' });
    el('line', { x1: TX + dx + (dx < 0 ? -34 : 34), y1: TY - 4, x2: TX + dx + (dx < 0 ? -34 : 34), y2: TY + 6, stroke: pal.sub, 'stroke-width': 2.5, 'stroke-linecap': 'round' });
  });
  // 確保されたあとの淡い光
  const glow = el('ellipse', { cx: TX, cy: TY + 2, rx: 54, ry: 13, fill: pal.yellow, opacity: 0 });

  // 札
  const CW = 100, CH = 46;
  const hang = g({}); // 手の位置が原点。振り子のように揺れる
  const hold = g({}, hang);
  tf(hold, 0, CH + 4);
  const card = g({}, hold);
  el('rect', { x: -CW / 2 + 3, y: -CH + 4, width: CW, height: CH, rx: 8, fill: pal.shadow }, card);
  el('rect', { x: -CW / 2, y: -CH, width: CW, height: CH, rx: 8, fill: pal.red }, card);
  el('rect', { x: -CW / 2 + 5, y: -CH + 5, width: CW - 10, height: CH - 10, rx: 5, fill: 'none', stroke: '#FFFFFF', 'stroke-width': 2, opacity: 0.6 }, card);
  k.text(0, -CH / 2 + 1, 'RESERVED', { 'font-size': 16, fill: '#FFFFFF' }, card);
  // 上から降りてくる手（腕は画面の外から）
  const arm = el('line', { stroke: pal.mintDark, 'stroke-width': 15, 'stroke-linecap': 'round' });
  const hand = el('circle', { r: 12, fill: pal.mint, stroke: pal.mintDark, 'stroke-width': 3 });
  // ✓
  const check = g({});
  el('circle', { r: 17, fill: pal.green, stroke: '#FFFFFF', 'stroke-width': 4 }, check);
  el('path', { d: 'M -8 1 L -2 7 L 9 -7', fill: 'none', stroke: '#FFFFFF', 'stroke-width': 4.5, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, check);
  const sparks = [[138, 164], [312, 182], [200, 120]].map(([x, y], i) => {
    const s = g({});
    el('path', { d: 'M 0 -8 Q 1.5 -1.5 8 0 Q 1.5 1.5 0 8 Q -1.5 1.5 -8 0 Q -1.5 -1.5 0 -8 Z', fill: i % 2 ? pal.yellow : pal.mint }, s);
    return { s, x, y };
  });

  const BASEY = TY + 2; // 札を置く高さ
  return {
    update(t) {
      // ---- 手が札をつまんで降りてきて、置いて、戻る ----
      const down = easeInOut(seg(t, 0.8, 1.85));
      const up = easeIn(seg(t, 2.25, 2.85));
      const hy = lerp(-72, BASEY - CH - 4, down) - lerp(0, 190, up);
      const hx = lerp(214, 200, down);
      const placed = seg(t, 1.8, 2.2);
      // 置く前は斜めに揺れる、置くと立つ
      const swing = (1 - placed) * (-14 * (1 - down * 0.55) + 7 * Math.sin((t - 0.8) * 7) * (1 - down * 0.6));
      // 置いたあとの札は手から離れて、テーブルに残る
      const hyCard = t < 2.2 ? hy : BASEY - CH - 4;
      tf(hang, t < 2.2 ? hx : 200, hyCard, swing);
      const land = t >= 1.85 ? wobble(seg(t, 1.85, 2.5), 2.5, 5) : 0;
      tf(card, 0, 0, 0, 1 + 0.06 * land, 1 - 0.1 * land);
      const stand = t >= 1.85 ? 1 : 0;
      // 手と腕
      k.set(hand, { cx: hx, cy: hy, opacity: 1 });
      k.set(arm, { x1: hx + 34, y1: -80, x2: hx, y2: hy, opacity: 1 });

      // ---- 光と ✓ ----
      const gp = easeOut(seg(t, 2.1, 2.7));
      k.set(glow, { opacity: 0.32 * gp, rx: 40 + 24 * gp });
      const cp = seg(t, 2.45, 2.8);
      const cs = cp <= 0 ? 0 : backOut(cp, 2.4);
      tf(check, 260, BASEY - CH - 4, 0, cs, cs);
      sparks.forEach((q, i) => {
        const u = seg(t, 2.6 + i * 0.1, 3.05 + i * 0.1);
        const sc = u <= 0 ? 0 : u >= 1 ? 0.85 + 0.15 * Math.sin(t * 8 + i) : easeOut(u);
        tf(q.s, q.x, q.y, t * 40, sc, sc);
      });
    }
  };
}
