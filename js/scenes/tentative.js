// tentative：火曜の欄に、点線の枠と鉛筆書きの会議カードを仮置きする。最後まで確定しない（例文 We have a tentative meeting on Tuesday.）
import { seg, lerp, easeInOut, easeOut, backOut, wobble, hump } from '../ease.js';

export const meta = { duration: 4.2, beats: [[0, '予定を入れる'], [1.2, '鉛筆で仮置き'], [2.8, 'まだ未確定']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  k.backdrop({ floorY: 268, mood: 'indoor' });

  // 週カレンダー
  const BX = 112, BY = 40, COLW = 56, HEAD = 30, BW = COLW * 5, BH = 196;
  const days = ['MON', 'TUE', 'WED', 'THU', 'FRI'];
  const colX = (i) => BX + COLW * i + COLW / 2;
  el('rect', { x: BX + 3, y: BY + 5, width: BW, height: BH, rx: 14, fill: pal.shadow });
  el('rect', { x: BX, y: BY, width: BW, height: BH, rx: 14, fill: '#FFFFFF', stroke: '#E1E6EE', 'stroke-width': 2 });
  el('line', { x1: BX, y1: BY + HEAD, x2: BX + BW, y2: BY + HEAD, stroke: '#E4E9F0', 'stroke-width': 2 });
  for (let i = 1; i < 5; i++) el('line', { x1: BX + COLW * i, y1: BY + 4, x2: BX + COLW * i, y2: BY + BH - 4, stroke: '#EDF0F5', 'stroke-width': 2 });
  days.forEach((d, i) => { k.text(colX(i), BY + 16, d, { 'font-size': 13, fill: pal.sub }); k.text(BX + COLW * i + 12, BY + HEAD + 14, String(12 + i), { 'font-size': 10, fill: '#B3BCCA' }); });
  // ほかの確定した予定（ペン書き＝くっきり）
  [[0, 112, pal.mint, 34], [3, 110, pal.violet, 34], [3, 134, pal.yellow, 28], [4, 116, pal.mint, 34]].forEach(([c, y, col, w]) =>
    el('rect', { x: colX(c) - w / 2, y, width: w, height: 11, rx: 5.5, fill: col, opacity: 0.9 }));

  // 火曜のカード（点線の枠・薄い鉛筆書き）
  const CX = colX(1), CY = 164, CW = 44, CH = 46;
  const card = g({});
  tf(card, CX, CY);
  el('rect', { x: -CW / 2, y: -CH / 2, width: CW, height: CH, rx: 9, fill: '#F6F7F9' }, card);
  el('rect', { x: -CW / 2, y: -CH / 2, width: CW, height: CH, rx: 9, fill: 'none', stroke: '#8E99AB', 'stroke-width': 3, 'stroke-dasharray': '6 5', 'stroke-linecap': 'round' }, card);
  // 鉛筆の下書き（人のアイコンと線）
  const sk = g({}, card);
  el('circle', { cx: -7, cy: -9, r: 5, fill: 'none', stroke: '#A3ACBA', 'stroke-width': 2.4 }, sk);
  el('path', { d: 'M -16 8 Q -16 -1 -7 -1 Q 2 -1 2 8', fill: 'none', stroke: '#A3ACBA', 'stroke-width': 2.4, 'stroke-linecap': 'round' }, sk);
  el('circle', { cx: 10, cy: -6, r: 4, fill: 'none', stroke: '#A3ACBA', 'stroke-width': 2.2 }, sk);
  const sk2 = el('line', { x1: -14, y1: 15, x2: 14, y2: 15, stroke: '#A3ACBA', 'stroke-width': 2.6, 'stroke-linecap': 'round' }, card);
  // 「?」
  const q = g({});
  el('circle', { r: 12, fill: pal.yellow, stroke: '#FFFFFF', 'stroke-width': 3 }, q);
  k.text(0, 1, '?', { 'font-size': 17, fill: pal.ink }, q);

  // まめと鉛筆
  const b = k.buddy({ x: 142, y: 266, scale: 0.85 });
  const pencil = g({});
  el('rect', { x: -4, y: -3, width: 36, height: 6, rx: 3, fill: pal.yellow, stroke: pal.yellowDark, 'stroke-width': 1.5 }, pencil);
  el('rect', { x: -4, y: -3, width: 7, height: 6, rx: 3, fill: pal.coral }, pencil);
  el('path', { d: 'M 32 -3 L 41 0 L 32 3 Z', fill: '#F4D9B5' }, pencil);
  el('path', { d: 'M 38 -1.1 L 41 0 L 38 1.1 Z', fill: pal.ink }, pencil);
  // 考え吹き出し
  const th = g({});
  el('circle', { cx: 18, cy: 40, r: 4, fill: '#FFFFFF', stroke: '#CBD3DE', 'stroke-width': 2 }, th);
  el('circle', { cx: 8, cy: 24, r: 6, fill: '#FFFFFF', stroke: '#CBD3DE', 'stroke-width': 2 }, th);
  el('ellipse', { cx: -14, cy: 0, rx: 30, ry: 20, fill: '#FFFFFF', stroke: '#CBD3DE', 'stroke-width': 2.5 }, th);
  const dots = [-26, -14, -2].map((x) => el('circle', { cx: x, cy: 0, r: 3.4, fill: pal.sub }, th));

  return {
    update(t) {
      // ---- まめ：カレンダーを見て、鉛筆でカードを仮置きし、考え込む ----
      const reach = easeInOut(seg(t, 0.55, 1.2));
      const away = easeInOut(seg(t, 2.6, 3.1));
      const scribble = seg(t, 1.7, 2.5);
      const a = lerp(40, 125, reach) * (1 - away) + 70 * away + (scribble > 0 && scribble < 1 ? 6 * Math.sin(t * 22) : 0);
      const think = t > 2.9;
      b.pose({
        armR: t < 0.55 ? 40 : a,
        armL: think ? 85 : 8,
        look: think ? -0.6 : 0.9,
        lean: think ? -6 + 2 * Math.sin((t - 2.9) * 3) : 5 * reach,
        mood: think ? 'flat' : 'smile',
        squash: 1
      });
      const hp = b.handPos('R');
      tf(pencil, hp.x - 1, hp.y - 2, lerp(-70, -42, reach) * (1 - away) + -80 * away, 1, 1);

      // ---- カード ----
      const pop = t < 1.15 ? 0 : backOut(seg(t, 1.15, 1.55), 1.8);
      tf(card, CX, CY, 0, pop, pop);
      const sp = seg(t, 1.7, 2.5);
      sk.setAttribute('opacity', sp);
      k.set(sk2, { x2: lerp(-14, 14, sp) });
      const qp = t < 2.5 ? 0 : backOut(seg(t, 2.5, 2.85), 2.2);
      tf(q, CX + 20, CY - 26 + 1.5 * Math.sin(t * 3), 0, qp, qp);

      // ---- 考え吹き出し ----
      const tp = t < 2.95 ? 0 : backOut(seg(t, 2.95, 3.3), 1.8);
      tf(th, 86, 150, 0, tp, tp);
      dots.forEach((d, i) => d.setAttribute('opacity', 0.35 + 0.65 * Math.max(0, Math.sin((t - 3.2) * 4 - i * 0.9))));
    }
  };
}
