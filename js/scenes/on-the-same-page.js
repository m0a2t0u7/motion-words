// on the same page：ページ数がずれていた2冊が、めくって同じページにそろう（例文 Let's make sure we're all on the same page.）
import { seg, lerp, easeInOut, easeOut, backOut, hump, wobble } from '../ease.js';

export const meta = { duration: 4.4, beats: [[0, 'ずれている'], [1.1, '合わせる'], [2.9, 'そろった']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 240, mood: 'indoor' });
  el('rect', { x: 150, y: 30, width: 100, height: 56, rx: 8, fill: '#DDEFFA', opacity: 0 });

  const HW = 44, BH = 64; // 本の片ページの幅、高さ
  const AX = 74, BX = 326, BY = FY - 59;
  const LINE = '#D3DAE5';

  // 本をつくる（原点＝背表紙の中央）
  const pageLines = (parent, x0, y0, n, w) => {
    for (let i = 0; i < n; i++) el('line', { x1: x0 + 5, y1: y0 + i * 8, x2: x0 + w - 5 - (i % 2) * 8, y2: y0 + i * 8, stroke: LINE, 'stroke-width': 3, 'stroke-linecap': 'round' }, parent);
  };
  const makeBook = (cx, cover, coverDark) => {
    const root = g({});
    tf(root, cx, BY);
    el('rect', { x: -HW - 4, y: -BH / 2 - 4, width: HW * 2 + 8, height: BH + 8, rx: 7, fill: cover }, root);
    el('rect', { x: -HW, y: -BH / 2, width: HW, height: BH, rx: 3, fill: '#FFFFFF' }, root);
    pageLines(root, -HW, -BH / 2 + 8, 4, HW);
    el('line', { x1: 0, y1: -BH / 2, x2: 0, y2: BH / 2, stroke: coverDark, 'stroke-width': 2, opacity: 0.5 }, root);
    return root;
  };
  const rightPage = (parent, label) => {
    const p = g({}, parent);
    el('rect', { x: 0, y: -BH / 2, width: HW, height: BH, rx: 3, fill: '#FFFFFF' }, p);
    pageLines(p, 0, -BH / 2 + 32, 3, HW);
    k.text(HW / 2, -BH / 2 + 17, label, { 'font-size': 19, fill: pal.ink }, p);
    return p;
  };

  // 本A：ページがめくれる
  const bookA = makeBook(AX, pal.blue, pal.blueDark);
  rightPage(bookA, 'p.30'); // めくった先のページ（下に隠れている）
  const flip = g({}, bookA);
  const flipFront = g({}, flip);
  el('rect', { x: 0, y: -BH / 2, width: HW, height: BH, rx: 3, fill: '#FFFFFF', stroke: '#E4E9F0', 'stroke-width': 1.5 }, flipFront);
  pageLines(flipFront, 0, -BH / 2 + 32, 3, HW);
  k.text(HW / 2, -BH / 2 + 17, 'p.12', { 'font-size': 19, fill: pal.ink }, flipFront);
  const flipBack = g({}, flip);
  el('rect', { x: 0, y: -BH / 2, width: HW, height: BH, rx: 3, fill: '#F1F4F9', stroke: '#E4E9F0', 'stroke-width': 1.5 }, flipBack);
  pageLines(flipBack, 0, -BH / 2 + 8, 4, HW);
  // 本B：p.30 で動かない
  const bookB = makeBook(BX, pal.violet, '#7F65D6');
  rightPage(bookB, 'p.30');

  // まめ2人
  const A = k.buddy({ x: 150, y: FY, scale: 0.85, facing: 1 });
  const B = k.buddy({ x: 250, y: FY, scale: 0.85, facing: -1, color: pal.coral, dark: pal.coralDark });

  // 「≠」（ずれている目印）
  const neq = g({});
  el('line', { x1: -11, y1: -5, x2: 11, y2: -5, stroke: pal.red, 'stroke-width': 4.5, 'stroke-linecap': 'round' }, neq);
  el('line', { x1: -11, y1: 5, x2: 11, y2: 5, stroke: pal.red, 'stroke-width': 4.5, 'stroke-linecap': 'round' }, neq);
  el('line', { x1: -7, y1: 13, x2: 7, y2: -13, stroke: pal.red, 'stroke-width': 4.5, 'stroke-linecap': 'round' }, neq);
  // 光の線と ✓
  const arc = 'M 124 142 Q 200 40 276 142';
  const glow = el('path', { d: arc, fill: 'none', stroke: pal.yellow, 'stroke-width': 12, 'stroke-linecap': 'round', opacity: 0.35, pathLength: 1, 'stroke-dasharray': 1, 'stroke-dashoffset': 1 });
  const beam = el('path', { d: arc, fill: 'none', stroke: pal.yellowDark, 'stroke-width': 4.5, 'stroke-linecap': 'round', pathLength: 1, 'stroke-dasharray': 1, 'stroke-dashoffset': 1 });
  const check = g({});
  el('circle', { r: 17, fill: pal.green }, check);
  el('path', { d: 'M -8 1 L -2 7 L 9 -7', fill: 'none', stroke: '#FFFFFF', 'stroke-width': 4.5, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, check);
  const sparks = [[150, 84], [250, 84], [200, 52]].map(([x, y], i) => {
    const s = g({});
    el('path', { d: 'M 0 -8 Q 1.5 -1.5 8 0 Q 1.5 1.5 0 8 Q -1.5 1.5 -8 0 Q -1.5 -1.5 0 -8 Z', fill: i === 2 ? pal.mint : pal.yellow }, s);
    return { s, x, y };
  });

  return {
    update(t) {
      // ---- ページをめくる（本A） ----
      const p = easeInOut(seg(t, 1.25, 2.05));
      const sx = Math.cos(Math.PI * p);
      tf(flip, 0, 0, 0, sx, 1 + 0.12 * hump(p));
      flipFront.setAttribute('opacity', sx > 0 ? 1 : 0);
      flipBack.setAttribute('opacity', sx > 0 ? 0 : 1);
      // 着地のちいさな弾み
      const landed = seg(t, 2.05, 2.6);
      tf(bookA, AX, BY - 2.5 * Math.abs(wobble(landed, 2, 5)));

      // ---- 気持ち：ずれている→そろう ----
      const done = t >= 2.1;
      const hop = seg(t, 2.9, 4.4);
      const bA = t >= 2.9 ? 12 * Math.abs(Math.sin((t - 2.9) * 6.5)) * (1 - hop * 0.4) : 0;
      const bB = t >= 3.05 ? 12 * Math.abs(Math.sin((t - 3.05) * 6.5)) * (1 - hop * 0.4) : 0;
      const turning = t > 1.1 && t < 2.1;
      A.pose({
        mood: t >= 2.9 ? 'grin' : done ? 'smile' : 'flat',
        look: -0.4,
        lean: turning ? 5 : 0,
        armL: 62 + (turning ? 6 * Math.sin(t * 14) : 0),
        armR: t >= 2.9 ? 100 : 12,
        lift: bA
      });
      B.pose({
        mood: t >= 2.9 ? 'grin' : 'smile',
        look: -0.2,
        armL: 62,
        armR: t >= 2.9 ? 100 : 12,
        lift: bB
      });
      tf(bookA, AX, BY - 2.5 * Math.abs(wobble(landed, 2, 5)) - bA);
      tf(bookB, BX, BY - bB);

      // ---- ≠ ----
      const np = seg(t, 0.35, 0.6) * (1 - seg(t, 1.9, 2.2));
      tf(neq, 200, 96 + 3 * Math.sin(t * 4), 0, np, np);
      neq.setAttribute('opacity', np > 0 ? 1 : 0);
      // ---- 光の線と ✓ ----
      const lp = easeOut(seg(t, 2.35, 3.0));
      k.set(glow, { 'stroke-dashoffset': 1 - lp });
      k.set(beam, { 'stroke-dashoffset': 1 - lp });
      const cp = seg(t, 2.85, 3.2);
      const cs = cp <= 0 ? 0 : backOut(cp, 2.2);
      tf(check, 200, 92, 0, cs, cs);
      sparks.forEach((q, i) => {
        const u = seg(t, 3.0 + i * 0.12, 3.5 + i * 0.12);
        const sc = u <= 0 ? 0 : u >= 1 ? 0.9 + 0.15 * Math.sin(t * 8 + i) : easeOut(u);
        tf(q.s, q.x, q.y, t * 40, sc, sc);
      });
    }
  };
}
