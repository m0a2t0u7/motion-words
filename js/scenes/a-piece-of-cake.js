// a piece of cake：テストをすらすら解いて100点、まめが余裕でのけぞる（例文 The test was a piece of cake.）
import { seg, lerp, easeInOut, easeOut, easeIn, backOut, smooth, wobble, hump, clamp } from '../ease.js';

export const meta = { duration: 4.2, beats: [[0, 'テスト'], [1.0, 'すらすら解く'], [2.5, '楽勝']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 252, mood: 'indoor' });
  el('rect', { x: 36, y: 36, width: 70, height: 60, rx: 8, fill: '#DDEFFA' });
  el('line', { x1: 71, y1: 36, x2: 71, y2: 96, stroke: '#FFFFFF', 'stroke-width': 4 });

  const S = 1.15, MX = 138;
  const b = k.buddy({ x: MX, y: FY, scale: S });

  // 机
  el('rect', { x: 206, y: 240, width: 12, height: 22, rx: 3, fill: pal.woodDark });
  el('rect', { x: 370, y: 240, width: 12, height: 22, rx: 3, fill: pal.woodDark });
  el('rect', { x: 190, y: 226, width: 204, height: 14, rx: 5, fill: pal.wood });
  el('rect', { x: 190, y: 238, width: 204, height: 5, rx: 2, fill: pal.woodDark });
  k.shadow(292, 264, 100, 5);

  // テスト用紙
  const PXL = 214, PXR = 350, PT = 90;
  el('rect', { x: PXL + 3, y: PT + 4, width: PXR - PXL, height: 136, rx: 6, fill: pal.shadow });
  el('rect', { x: PXL, y: PT, width: PXR - PXL, height: 136, rx: 6, fill: '#FFFFFF', stroke: '#D5DBE5', 'stroke-width': 2 });
  el('rect', { x: PXL + 12, y: PT + 12, width: 54, height: 12, rx: 4, fill: pal.blue });
  k.text(PXL + 40, PT + 18.5, 'TEST', { 'font-size': 9, fill: '#FFFFFF' });
  el('line', { x1: PXL + 76, y1: PT + 18, x2: PXR - 60, y2: PT + 18, stroke: '#D5DBE5', 'stroke-width': 3, 'stroke-linecap': 'round' });
  const ROWS = [164, 181, 198, 215];
  const ticks = ROWS.map((y, i) => {
    k.text(PXL + 14, y, String(i + 1), { 'font-size': 11, fill: pal.sub });
    el('rect', { x: PXL + 24, y: y - 7, width: 18, height: 14, rx: 3, fill: 'none', stroke: '#D5DBE5', 'stroke-width': 2 });
    el('line', { x1: PXL + 52, y1: y, x2: PXR - 22 - (i % 2) * 22, y2: y, stroke: '#DCE2EB', 'stroke-width': 4, 'stroke-linecap': 'round' });
    return el('path', { d: `M ${PXL + 27} ${y} L ${PXL + 32} ${y + 5} L ${PXL + 40} ${y - 7}`, fill: 'none', stroke: pal.green, 'stroke-width': 3.6, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', pathLength: 1, 'stroke-dasharray': 1, 'stroke-dashoffset': 1 });
  });
  // 100点の丸
  const score = g({});
  el('ellipse', { rx: 26, ry: 24, fill: 'none', stroke: pal.red, 'stroke-width': 4 }, score);
  el('ellipse', { rx: 22, ry: 26, fill: 'none', stroke: pal.red, 'stroke-width': 3, opacity: 0.6, transform: 'rotate(30)' }, score);
  k.text(0, 1, '100', { 'font-size': 22, fill: pal.red }, score);

  // ペン
  const pen = g({});
  el('line', { x1: -22, y1: 0, x2: 18, y2: 0, stroke: pal.coralDark, 'stroke-width': 6, 'stroke-linecap': 'round' }, pen);
  el('path', { d: 'M 18 -3 L 26 0 L 18 3 Z', fill: '#F4D9B5' }, pen);
  el('path', { d: 'M 23.5 -1.2 L 26 0 L 23.5 1.2 Z', fill: pal.ink }, pen);

  // 考え吹き出し（小さなケーキ）
  const think = g({});
  el('circle', { cx: 24, cy: 52, r: 4, fill: '#FFFFFF', stroke: '#CBD3DE', 'stroke-width': 2 }, think);
  el('circle', { cx: 12, cy: 34, r: 6.5, fill: '#FFFFFF', stroke: '#CBD3DE', 'stroke-width': 2 }, think);
  el('ellipse', { cx: -14, cy: 0, rx: 40, ry: 28, fill: '#FFFFFF', stroke: '#CBD3DE', 'stroke-width': 2.5 }, think);
  const cake = g({ transform: 'translate(-14 2) scale(0.95)' }, think);
  el('ellipse', { cx: 0, cy: 15, rx: 24, ry: 4.5, fill: '#E4E9F0' }, cake);
  el('path', { d: 'M -17 13 L -17 0 L 17 0 L 17 13 Z', fill: '#FFE3A6' }, cake);
  el('rect', { x: -17, y: 5, width: 34, height: 3.5, fill: '#FFFFFF' }, cake);
  el('path', { d: 'M -19 1 Q -19 -7 -10 -7 L 10 -7 Q 19 -7 19 1 Q 14 4 9 1 Q 4 4 0 1 Q -5 4 -9 1 Q -14 4 -19 1 Z', fill: '#FFC0C8' }, cake);
  el('circle', { cx: 3, cy: -11, r: 5.5, fill: pal.red }, cake);
  el('path', { d: 'M 3 -16 Q 8 -20 11 -16 Q 7 -15 3 -16 Z', fill: pal.green }, cake);

  return {
    update(t) {
      // ---- 答え合わせのリズム：行ごとに ✓ ----
      const T = (i) => 1.05 + 0.34 * i;
      let idx = 0;
      for (let i = 1; i < 4; i++) idx += smooth(seg(t, T(i) - 0.15, T(i)));
      let cur = 0;
      ticks.forEach((tk, i) => {
        const p = seg(t, T(i), T(i) + 0.17);
        k.set(tk, { 'stroke-dashoffset': 1 - p });
        if (t >= T(i)) cur = i;
      });
      const wp = seg(t, T(cur), T(cur) + 0.17);
      const rowY = lerp(ROWS[0], ROWS[3], idx / 3);
      const writing = t < 2.55;

      // ---- まめ：腕の角度をペン先の高さから解く ----
      const hy = rowY + 4;
      const c = clamp(((hy - FY) / S + 56) / 26, -1, 1);
      const ang = (Math.acos(c) * 180) / Math.PI;
      const sinA = Math.sin((ang * Math.PI) / 180);
      const hx = MX + (27 + sinA * 26) * S;
      const leaning = easeOut(seg(t, 2.55, 3.1));
      const lean = writing ? 5 : lerp(5, -13, leaning);
      const armR = writing ? ang : lerp(ang, 150, easeOut(seg(t, 2.55, 3.0)));
      b.pose({
        armR,
        armL: writing ? 8 : lerp(8, 125, easeOut(seg(t, 2.55, 3.0))),
        lean,
        look: writing ? 0.9 : 0.3,
        mood: writing ? 'smile' : 'grin',
        blink: writing ? 0 : 0.55 * leaning,
        squash: 1 - 0.025 * leaning,
        lift: 0
      });

      // ---- ペン：書いている間は手に、終わったら机へ ----
      if (writing) {
        const tipX = PXL + 27 + 13 * wp;
        const tipY = rowY - 2 * (1 - wp) + 4 * wp * 0;
        const bx = hx - 4, by = hy + 3;
        const dx = tipX - bx, dy = tipY - by;
        const len = Math.hypot(dx, dy) + 6;
        tf(pen, (bx + tipX) / 2 - 3, (by + tipY) / 2, (Math.atan2(dy, dx) * 180) / Math.PI, len / 48, 1);
      } else {
        const p = seg(t, 2.55, 2.95);
        const bounce = 3.5 * Math.abs(wobble(seg(t, 2.85, 3.3), 2, 5));
        tf(pen, lerp(hx + 20, 300, easeOut(p)), lerp(hy - 6, 233, easeIn(p)) - bounce, lerp(-20, 6, easeOut(p)), 1, 1);
      }

      // ---- 100点：ぽんと押される ----
      const sp = seg(t, 2.3, 2.6);
      const sc = sp <= 0 ? 0 : backOut(sp, 2.2);
      tf(score, 318, 130, -12 + 8 * (1 - sp), sc, sc);

      // ---- 考え吹き出し ----
      const tp = backOut(seg(t, 2.9, 3.3), 1.8);
      tf(think, 78, 70, 0, tp, tp);
      think.setAttribute('opacity', t < 2.9 ? 0 : 1);
    }
  };
}
