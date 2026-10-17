// cut down on：角砂糖を入れる数が、1日目3個→2日目2個→3日目1個と少しずつ減る。ゼロにはしない（例文 I'm trying to cut down on sugar.）
import { seg, lerp, easeInOut, easeOut, easeIn, backOut, hump, wobble } from '../ease.js';

export const meta = { duration: 4.4, beats: [[0, '多い'], [1.4, '少しずつ減らす'], [2.8, '控えめ']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 240, mood: 'indoor' });
  el('rect', { x: 20, y: 36, width: 70, height: 56, rx: 6, fill: '#D6EDF8' });
  el('line', { x1: 55, y1: 36, x2: 55, y2: 92, stroke: '#FFFFFF', 'stroke-width': 4 });
  const S = 0.95, BX = 150, BY = 218;
  const b = k.buddy({ x: BX, y: BY, scale: S });
  b.g.firstChild.setAttribute('display', 'none');
  // 机（まめの下半身を隠す）
  const TY = 190;
  k.shadow(200, 258, 190, 7);
  el('rect', { x: 20, y: TY, width: 360, height: 18, rx: 7, fill: '#F0D9B8' });
  el('rect', { x: 20, y: TY + 18, width: 360, height: 40, fill: pal.wood });
  el('rect', { x: 20, y: TY + 18, width: 360, height: 4, fill: pal.woodDark, opacity: 0.4 });
  el('rect', { x: 34, y: TY + 58, width: 12, height: 8, rx: 3, fill: pal.woodDark });
  el('rect', { x: 354, y: TY + 58, width: 12, height: 8, rx: 3, fill: pal.woodDark });
  // カップ（右）
  const CX = 214;
  el('ellipse', { cx: CX, cy: TY + 12, rx: 30, ry: 6, fill: '#FFFFFF', stroke: pal.line, 'stroke-width': 2 });
  el('path', { d: `M ${CX - 19} ${TY - 14} L ${CX + 19} ${TY - 14} L ${CX + 15} ${TY + 10} Q ${CX} ${TY + 16} ${CX - 15} ${TY + 10} Z`, fill: '#FFFFFF', stroke: pal.line, 'stroke-width': 2 });
  el('path', { d: `M ${CX + 18} ${TY - 8} Q ${CX + 30} ${TY - 6} ${CX + 26} ${TY + 4} Q ${CX + 23} ${TY + 8} ${CX + 16} ${TY + 6}`, stroke: pal.line, 'stroke-width': 3.5, fill: 'none', 'stroke-linecap': 'round' });
  el('ellipse', { cx: CX, cy: TY - 14, rx: 19, ry: 5, fill: pal.coffee });
  const ripple = el('ellipse', { cx: CX, cy: TY - 14, rx: 6, ry: 2, fill: 'none', stroke: '#C9A27E', 'stroke-width': 1.8, opacity: 0 });
  const steam = [-6, 6].map((x) => el('path', { d: `M ${CX + x} ${TY - 22} Q ${CX + x + 4} ${TY - 30} ${CX + x} ${TY - 38}`, stroke: '#B8C2D1', 'stroke-width': 2.4, fill: 'none', 'stroke-linecap': 'round' }));
  // 角砂糖の皿（左）
  const slots = [192, 180, 170];
  el('ellipse', { cx: 180, cy: TY + 11, rx: 24, ry: 5, fill: '#E6EDF5' });
  const cube = (parent) => {
    const c = g({}, parent);
    el('rect', { x: -6.5, y: -6.5, width: 13, height: 13, rx: 2.5, fill: '#FFFFFF', stroke: '#B9C6D8', 'stroke-width': 1.6 }, c);
    el('path', { d: 'M -4 -4 L 2 -4', stroke: '#DCE6F2', 'stroke-width': 1.8, 'stroke-linecap': 'round' }, c);
    return c;
  };
  // 日ごとの角砂糖数と時刻
  const T0 = [0.1, 1.5, 2.65], NUM = [3, 2, 1];
  const pickAt = (d, i) => T0[d] + 0.3 + 0.34 * i, relAt = (d, i) => pickAt(d, i) + 0.21;
  const piles = [0, 1, 2].map((d) => Array.from({ length: NUM[d] }, () => cube(g({}))));
  const flying = cube(g({}));
  // 日のタグ
  const tag = g({});
  el('rect', { x: -30, y: -13, width: 60, height: 26, rx: 13, fill: pal.blueDark }, tag);
  const tagT = k.text(0, 1, 'DAY 1', { 'font-size': 14, fill: '#FFFFFF' }, tag);
  // グラフ（角砂糖の数）
  el('rect', { x: 276, y: 30, width: 116, height: 118, rx: 12, fill: 'rgba(40,52,70,0.12)', transform: 'translate(3 3)' });
  el('rect', { x: 276, y: 30, width: 116, height: 118, rx: 12, fill: '#FFFFFF', stroke: pal.line, 'stroke-width': 2.5 });
  el('line', { x1: 286, y1: 122, x2: 382, y2: 122, stroke: pal.sub, 'stroke-width': 2.5, 'stroke-linecap': 'round' });
  const BXS = [302, 334, 366];
  BXS.forEach((x, d) => k.text(x, 136, String(d + 1), { 'font-size': 11, fill: pal.sub }));
  const stacks = BXS.map((x, d) => Array.from({ length: NUM[d] }, (_, i) => {
    const c = cube(g({}));
    tf(c, x, 122 - 8.5 - i * 17, 0, 1.25, 1.25);
    return c;
  }));
  const trend = el('path', { d: 'M 302 56 L 334 74 L 366 92', stroke: pal.green, 'stroke-width': 3.5, fill: 'none', 'stroke-linecap': 'round', 'stroke-dasharray': '0 2', pathLength: 1 });
  const arrow = el('path', { d: 'M 358 82 L 369 94 L 354 96', stroke: pal.green, 'stroke-width': 3.5, fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', opacity: 0 });

  const SX = 187, SYS = BY - 56 * S; // 肩
  const ang = (x) => (Math.asin(Math.max(-1, Math.min(1, (x - SX) / 26))) * 180) / Math.PI;
  const HAND = (a) => ({ x: SX + Math.sin((a * Math.PI) / 180) * 26 * 1, y: SYS + Math.cos((a * Math.PI) / 180) * 26 });

  return {
    update(t) {
      // 日のタグ
      const d = t < T0[1] - 0.1 ? 0 : t < T0[2] - 0.1 ? 1 : 2;
      tagT.textContent = `DAY ${d + 1}`;
      const tp = Math.max(0.001, backOut(seg(t, T0[d] - 0.05 > 0 ? T0[d] - 0.05 : 0, T0[d] + 0.2), 1.6));
      tf(tag, CX, 118, 0, tp, tp);
      // まめの右手：皿 → 角砂糖をつまむ → カップの上で離す
      let armA = 70, holding = false, hx = 0, hy = 0, rel = -1;
      for (let dd = 0; dd < 3; dd++) {
        for (let i = 0; i < NUM[dd]; i++) {
          const p0 = pickAt(dd, i), r0 = relAt(dd, i);
          const a0 = ang(slots[i]);
          if (t >= p0 - 0.14 && t < p0) armA = lerp(70, a0, easeOut(seg(t, p0 - 0.14, p0)));
          else if (t >= p0 && t < r0) { armA = lerp(a0, 80, easeInOut(seg(t, p0 + 0.04, r0))); holding = true; }
          else if (t >= r0 && t < r0 + 0.12) armA = lerp(80, 70, easeOut(seg(t, r0, r0 + 0.12)));
        }
      }
      const finished = t > relAt(2, 0) + 0.15;
      const wiggle = finished ? Math.sin((t - 3.4) * 5) * 4 : 0;
      b.pose({ x: BX, y: BY, armR: armA + wiggle, armL: 8, look: 0.7, lean: 3, mood: t < 1.5 ? 'flat' : finished ? 'grin' : 'smile', blink: 0 });
      // 皿の上の角砂糖
      piles.forEach((arr, dd) => arr.forEach((c, i) => {
        const vis = t >= T0[dd] - 0.1 && t < pickAt(dd, i);
        const pop = Math.max(0.001, backOut(seg(t, T0[dd] - 0.1, T0[dd] + 0.15), 1.6));
        tf(c, slots[i], TY + 2 + (i === 1 ? 2 : 0), i * 8 - 8, pop, pop);
        c.setAttribute('opacity', vis ? 1 : 0);
      }));
      // 手にある角砂糖→カップへ落ちる
      let fx = 0, fy = 0, fo = 0, fs = 1;
      for (let dd = 0; dd < 3; dd++) {
        for (let i = 0; i < NUM[dd]; i++) {
          const p0 = pickAt(dd, i), r0 = relAt(dd, i);
          if (t >= p0 && t < r0) { const h = HAND(armA); fx = h.x + 4; fy = h.y - 2; fo = 1; }
          else if (t >= r0 && t < r0 + 0.16) { const q = seg(t, r0, r0 + 0.16); fx = CX; fy = lerp(SYS + 22, TY - 14, easeIn(q)); fs = 1 - 0.6 * q; fo = q < 0.9 ? 1 : 0; }
        }
      }
      tf(flying, fx, fy, 10, fs, fs);
      flying.setAttribute('opacity', fo);
      // 水面のさざ波
      let rp = 0;
      for (let dd = 0; dd < 3; dd++) for (let i = 0; i < NUM[dd]; i++) { const q = seg(t, relAt(dd, i) + 0.12, relAt(dd, i) + 0.5); if (q > 0 && q < 1) rp = q; }
      ripple.setAttribute('opacity', rp > 0 ? 1 - rp : 0);
      k.set(ripple, { rx: 6 + rp * 12, ry: 2 + rp * 3 });
      steam.forEach((s, i) => s.setAttribute('opacity', 0.5 + 0.4 * Math.sin(t * 5 + i * 2)));
      // グラフ：落とすたびに1つ積み上がる
      stacks.forEach((arr, dd) => arr.forEach((c, i) => {
        const q = Math.max(0.001, backOut(seg(t, relAt(dd, i) + 0.14, relAt(dd, i) + 0.4), 1.7));
        const x = BXS[dd];
        tf(c, x, 122 - 8.5 - i * 17, 0, 1.25 * q, 1.25 * q);
        c.setAttribute('opacity', t >= relAt(dd, i) + 0.14 ? 1 : 0);
      }));
      const tr = easeOut(seg(t, 3.35, 4.0));
      trend.setAttribute('stroke-dasharray', `${tr} 2`);
      trend.setAttribute('opacity', tr > 0.01 ? 1 : 0);
      arrow.setAttribute('opacity', tr > 0.95 ? 1 : 0);
    }
  };
}
