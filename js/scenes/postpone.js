// postpone：火曜の会議カードが持ち上がり、金曜の欄へずれて着地する（例文 The meeting was postponed until Friday.）
import { seg, lerp, easeInOut, easeOut, easeIn, wobble, hump, backOut } from '../ease.js';

export const meta = { duration: 4.0, beats: [[0, '火曜の予定'], [1.0, '後ろへずらす'], [2.6, '金曜に移る']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  k.backdrop({ floorY: 270, mood: 'indoor' });

  // カレンダー（週）
  const BX = 20, BY = 44, COLW = 72, HEAD = 32, BW = COLW * 5, BH = 210;
  const days = ['MON', 'TUE', 'WED', 'THU', 'FRI'];
  const colX = (i) => BX + COLW * i + COLW / 2;
  [BX + 60, BX + 180, BX + 300].forEach((x) => el('rect', { x: x - 5, y: BY - 12, width: 10, height: 22, rx: 5, fill: '#B8C2D1' }));
  el('rect', { x: BX + 3, y: BY + 6, width: BW, height: BH, rx: 14, fill: pal.shadow });
  el('rect', { x: BX, y: BY, width: BW, height: BH, rx: 14, fill: '#FFFFFF', stroke: '#E1E6EE', 'stroke-width': 2 });
  // 金曜の欄の色（着地すると濃くなる）
  const friCol = el('rect', { x: BX + COLW * 4, y: BY + HEAD, width: COLW, height: BH - HEAD - 1, fill: '#FFEAE4', opacity: 0 });
  const friHead = el('path', { d: `M ${BX + COLW * 4} ${BY + HEAD} L ${BX + COLW * 4} ${BY + 14} Q ${BX + COLW * 4} ${BY} ${BX + COLW * 4 - 0 + 14} ${BY} L ${BX + BW - 14} ${BY} Q ${BX + BW} ${BY} ${BX + BW} ${BY + 14} L ${BX + BW} ${BY + HEAD} Z`, fill: pal.coral, opacity: 0 });
  el('line', { x1: BX, y1: BY + HEAD, x2: BX + BW, y2: BY + HEAD, stroke: '#E4E9F0', 'stroke-width': 2 });
  for (let i = 1; i < 5; i++) el('line', { x1: BX + COLW * i, y1: BY + 4, x2: BX + COLW * i, y2: BY + BH - 4, stroke: '#EDF0F5', 'stroke-width': 2 });
  const labels = days.map((d, i) => k.text(colX(i), BY + 17, d, { 'font-size': 14, fill: i === 4 ? pal.sub : pal.sub }));
  days.forEach((d, i) => k.text(BX + COLW * i + 14, BY + HEAD + 16, String(12 + i), { 'font-size': 11, fill: '#B3BCCA' }));
  // ほかの予定（小さな帯）
  [[0, 142, pal.mint, 40], [0, 176, '#D9DFE7', 30], [2, 176, pal.yellow, 44], [2, 214, '#D9DFE7', 30], [3, 150, pal.violet, 38], [3, 200, '#D9DFE7', 34], [4, 206, '#D9DFE7', 28]].forEach(([c, y, col, w]) =>
    el('rect', { x: colX(c) - w / 2, y, width: w, height: 12, rx: 6, fill: col, opacity: 0.85 }));

  // 元の場所の点線の枠
  const CW = 56, CH = 56, CY0 = 96;
  const ghost = el('rect', { x: colX(1) - CW / 2, y: CY0, width: CW, height: CH, rx: 10, fill: 'none', stroke: '#AEB9C9', 'stroke-width': 3, 'stroke-dasharray': '7 6', 'stroke-linecap': 'round', opacity: 0 });
  // 移動の道すじ（矢印）
  const path = `M ${colX(1) + 16} ${CY0 - 6} Q ${(colX(1) + colX(4)) / 2} ${CY0 - 62} ${colX(4) - 16} ${CY0 - 6}`;
  const trail = el('path', { d: path, fill: 'none', stroke: pal.coralDark, 'stroke-width': 4, 'stroke-dasharray': '1', 'stroke-linecap': 'round', opacity: 0, pathLength: 1 });
  const head = el('path', { d: 'M -9 -7 L 0 0 L -9 7', fill: 'none', stroke: pal.coralDark, 'stroke-width': 4, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', opacity: 0 });

  // 会議カード
  const sh = el('rect', { x: -CW / 2, y: -CH / 2, width: CW, height: CH, rx: 10, fill: 'rgba(40,52,70,0.2)' });
  const card = g({});
  const cb = g({}, card);
  el('rect', { x: -CW / 2, y: -CH / 2, width: CW, height: CH, rx: 10, fill: pal.blue }, cb);
  el('rect', { x: -CW / 2, y: -CH / 2, width: CW, height: 10, rx: 5, fill: pal.blueDark }, cb);
  // 人のアイコン（2人）
  el('circle', { cx: -9, cy: -6, r: 6, fill: '#FFFFFF' }, cb);
  el('path', { d: 'M -20 12 Q -20 1 -9 1 Q 2 1 2 12 Z', fill: '#FFFFFF' }, cb);
  el('circle', { cx: 10, cy: -3, r: 5, fill: '#FFFFFF', opacity: 0.85 }, cb);
  el('path', { d: 'M 2 12 Q 2 3 10 3 Q 19 3 19 12 Z', fill: '#FFFFFF', opacity: 0.85 }, cb);
  el('line', { x1: -16, y1: 19, x2: 16, y2: 19, stroke: '#FFFFFF', 'stroke-width': 3, 'stroke-linecap': 'round', opacity: 0.7 }, cb);

  const X0 = colX(1), X1 = colX(4);
  return {
    update(t) {
      const lift = easeOut(seg(t, 0.75, 1.1));
      const move = easeInOut(seg(t, 1.15, 2.4));
      const land = seg(t, 2.4, 3.0);
      const down = 1 - easeIn(seg(t, 2.25, 2.42));
      const x = lerp(X0, X1, move);
      const arcH = 38 * hump(move);
      const hgt = lift * down; // 持ち上がりの量
      const cy = CY0 + CH / 2 - arcH - 12 * hgt + (down < 1 ? 12 * (1 - down) * 0 : 0);
      const tilt = -5 * lift * (1 - move) + 7 * Math.sin(Math.PI * move) * 0.8 * (move < 1 ? 1 : 0) - 0;
      let sx = 1 + 0.1 * hgt, sy = 1 + 0.1 * hgt;
      if (t >= 2.4) {
        const w = wobble(land, 2.5, 5);
        sx = 1 + 0.07 * w;
        sy = 1 - 0.1 * w;
      }
      tf(card, x, cy, tilt * (1 - seg(t, 2.25, 2.45)), sx, sy);
      // 影：持ち上がると小さく薄く、ずれる
      const shy = CY0 + CH / 2 + 3 + 5 * hgt;
      const hh = hump(move);
      sh.setAttribute('opacity', (0.55 + 0.4 * hgt) * (1 - Math.min(1, arcH / 14)));
      tf(sh, x + 3 * hgt, shy, 0, 1 - 0.04 * hgt - 0.2 * hh, 1 - 0.04 * hgt - 0.2 * hh);

      // 元の位置の点線の枠
      k.set(ghost, { opacity: seg(t, 0.85, 1.25) });
      // 道すじ
      const tp = easeInOut(seg(t, 1.15, 2.4));
      k.set(trail, { 'stroke-dasharray': `${tp} 1`, opacity: tp > 0 ? 0.65 * (1 - 0.35 * seg(t, 2.6, 3.4)) : 0 });
      const ex = colX(4) - 16, ey = CY0 - 6;
      tf(head, ex + 2, ey + 1, 40);
      head.setAttribute('opacity', tp > 0.97 ? 0.65 : 0);

      // 金曜の欄が色づく
      const fp = easeOut(seg(t, 2.4, 2.8));
      k.set(friCol, { opacity: fp });
      k.set(friHead, { opacity: fp });
      labels[4].setAttribute('fill', fp > 0.5 ? '#FFFFFF' : pal.sub);
    }
  };
}
