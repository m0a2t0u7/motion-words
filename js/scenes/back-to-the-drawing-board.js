// back to the drawing board：設計図がだめになって捨て、新しい紙でもう一度描き直す（It didn't work, so it's back to the drawing board.）
import { seg, lerp, easeInOut, easeOut, easeIn, backOut, smooth, wobble, hump, clamp } from '../ease.js';

export const meta = { duration: 4.4, beats: [[0, '設計図を描く'], [1.6, '失敗して捨てる'], [3.4, '描き直す']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 246, mood: 'indoor' });
  // 製図板
  const BX = 292, BY = 160;
  el('rect', { x: BX - 36, y: BY + 40, width: 8, height: 46, fill: pal.woodDark });
  el('rect', { x: BX + 28, y: BY + 40, width: 8, height: 46, fill: pal.woodDark });
  el('line', { x1: BX - 32, y1: BY + 70, x2: BX + 32, y2: BY + 70, stroke: pal.woodDark, 'stroke-width': 5 });
  el('rect', { x: BX - 62, y: BY - 46, width: 124, height: 92, rx: 6, fill: pal.wood, stroke: pal.woodDark, 'stroke-width': 3 });
  k.shadow(BX, FY, 60, 5);
  // ゴミ箱（奥側と手前側で紙を隠す）
  const BinX = 372;
  const sheet = g({});
  const ss = g({}, sheet);
  el('rect', { x: -44, y: -34, width: 88, height: 68, rx: 3, fill: '#fff', stroke: '#C5CCD8', 'stroke-width': 2 }, ss);
  const lines = [
    'M -30 22 L -30 -4 L 0 -26 L 30 -4 L 30 22 Z', 'M -8 22 L -8 6 L 8 6 L 8 22', 'M -22 2 L -12 2 L -12 12 L -22 12 Z'
  ].map((d) => el('path', { d, fill: 'none', stroke: pal.blueDark, 'stroke-width': 2.4, 'stroke-linejoin': 'round', 'stroke-linecap': 'round', pathLength: 1, 'stroke-dasharray': 1, 'stroke-dashoffset': 1 }, ss));
  const x = g({});
  el('line', { x1: -20, y1: -20, x2: 20, y2: 20, stroke: pal.red, 'stroke-width': 8, 'stroke-linecap': 'round' }, x);
  el('line', { x1: 20, y1: -20, x2: -20, y2: 20, stroke: pal.red, 'stroke-width': 8, 'stroke-linecap': 'round' }, x);
  const ball = el('circle', { r: 14, fill: '#EEF0F4', stroke: '#B6BDC9', 'stroke-width': 2 });
  const bin = g({});
  el('path', { d: 'M -22 -34 L 22 -34 L 17 0 L -17 0 Z', fill: '#B9C2D0', stroke: '#8E99AB', 'stroke-width': 2 }, bin);
  el('rect', { x: -26, y: -40, width: 52, height: 8, rx: 3, fill: '#8E99AB' }, bin);
  [-8, 0, 8].forEach((xx) => el('line', { x1: xx, y1: -26, x2: xx * 0.8, y2: -6, stroke: '#8E99AB', 'stroke-width': 2 }, bin));
  tf(bin, BinX, FY);
  k.shadow(BinX, FY + 1, 24, 4);
  const sheet2 = g({});
  el('rect', { x: -44, y: -34, width: 88, height: 68, rx: 3, fill: '#fff', stroke: '#C5CCD8', 'stroke-width': 2 }, sheet2);
  const nl = el('path', { d: 'M -32 18 L -2 18', fill: 'none', stroke: pal.blueDark, 'stroke-width': 2.6, 'stroke-linecap': 'round', pathLength: 1, 'stroke-dasharray': 1, 'stroke-dashoffset': 1 }, sheet2);
  const nl2 = el('path', { d: 'M -32 18 L -32 -10', fill: 'none', stroke: pal.blueDark, 'stroke-width': 2.6, 'stroke-linecap': 'round', pathLength: 1, 'stroke-dasharray': 1, 'stroke-dashoffset': 1 }, sheet2);
  const pen = g({});
  el('line', { x1: -30, y1: 0, x2: 0, y2: 0, stroke: pal.yellowDark, 'stroke-width': 5, 'stroke-linecap': 'round' }, pen);
  el('path', { d: 'M 0 -2.5 L 7 0 L 0 2.5 Z', fill: '#F4D9B5' }, pen);
  const b = k.buddy({ x: 190, y: FY, scale: 0.95 });
  const penTip = (px, py) => {
    const h = b.handPos('R');
    const dx = px - h.x, dy = py - h.y, L = Math.hypot(dx, dy);
    tf(pen, (px + h.x) / 2 - 2, (py + h.y) / 2, (Math.atan2(dy, dx) * 180) / Math.PI, (L + 10) / 36, 1);
  };
  return {
    update(t) {
      // 1枚目の描画
      lines.forEach((l, i) => k.set(l, { 'stroke-dashoffset': 1 - seg(t, 0.2 + i * 0.4, 0.6 + i * 0.4) }));
      const xp = backOut(seg(t, 1.4, 1.75), 2);
      tf(x, BX, BY, 0, xp, xp);
      x.setAttribute('opacity', t < 1.4 ? 0 : t < 2.0 ? 1 : 0);
      // くしゃくしゃ → 投げる
      const cr = easeIn(seg(t, 2.0, 2.3));
      const th = seg(t, 2.35, 3.0);
      const sx = BX, sy = BY;
      sheet.setAttribute('opacity', t < 2.3 ? 1 : 0);
      tf(sheet, sx, sy, 0, lerp(1, 0.3, cr), lerp(1, 0.3, cr));
      ball.setAttribute('opacity', t >= 2.3 && t < 3.0 ? 1 : 0);
      const bx = lerp(sx, BinX, th), by = lerp(sy, FY - 26, th * th) - 90 * 4 * th * (1 - th) * 0.8;
      tf(ball, bx, by, th * 500);
      // 2枚目
      const sl = easeOut(seg(t, 2.8, 3.3));
      tf(sheet2, BX, BY, 0, 1, 1);
      sheet2.setAttribute('opacity', t < 2.8 ? 0 : 1);
      tf(sheet2, lerp(BX + 90, BX, sl), BY);
      k.set(nl, { 'stroke-dashoffset': 1 - seg(t, 3.5, 3.85) });
      k.set(nl2, { 'stroke-dashoffset': 1 - seg(t, 3.85, 4.2) });
      // まめ
      const draw1 = t < 1.4, toss = t >= 2.0 && t < 2.9, redraw = t >= 3.4;
      const w = Math.sin(t * 14) * 3;
      let tipX = BX - 40, tipY = BY + 10;
      if (draw1) { tipX = BX - 44 + 20 * seg(t, 0.2, 1.3); tipY = BY - 10 + 18 * Math.sin(seg(t, 0.2, 1.3) * 9) + 0; }
      if (redraw) { const q = seg(t, 3.5, 4.2); tipX = q < 0.5 ? BX - 32 + 30 * (q / 0.5) : BX - 32; tipY = q < 0.5 ? BY + 18 : BY + 18 - 28 * ((q - 0.5) / 0.5); }
      b.pose({
        armR: draw1 || redraw ? 84 + 0 * w : toss ? lerp(84, 100, hump(seg(t, 2.0, 2.9))) : 60,
        armL: toss ? lerp(8, 70, hump(seg(t, 2.1, 2.9))) : 8,
        look: 0.8, lean: redraw ? 5 : 2, squash: 1 - 0.04 * hump(seg(t, 1.4, 1.9)),
        mood: t < 1.4 ? 'smile' : t < 3.3 ? 'sad' : 'grin'
      });
      pen.setAttribute('opacity', toss ? 0 : 1);
      if (!toss) penTip(draw1 || redraw ? tipX : BX - 50, draw1 || redraw ? tipY : BY + 40);
    }
  };
}
