// fold：平らな紙の右半分を中央の線で折って、左半分に重ねる（例文 Fold the paper in half.）
import { seg, lerp, easeInOut, hump, wobble } from '../ease.js';

export const meta = { duration: 3.6, beats: [[0, '広げた紙'], [1.0, '折る'], [2.5, '半分になる']] };

export function create(k) {
  const { el, g, pal } = k;
  // 机の上（真上から見た面）
  el('rect', { x: 0, y: 0, width: 400, height: 300, fill: k.gradient([[0, '#F3E5CD'], [1, '#EBD8BA']]) });
  [60, 120, 180, 240].forEach((y) => el('line', { x1: 0, y1: y, x2: 400, y2: y, stroke: '#E2CDAA', 'stroke-width': 2, opacity: 0.7 }));
  // 机の小物（鉛筆）
  const pen = g({ transform: 'translate(40 262) rotate(-8)' });
  el('rect', { x: 0, y: -5, width: 80, height: 10, rx: 4, fill: pal.yellow }, pen);
  el('path', { d: 'M 80 -5 L 98 0 L 80 5 Z', fill: '#F4D9B5' }, pen);
  el('path', { d: 'M 92 -1.5 L 98 0 L 92 1.5 Z', fill: pal.ink }, pen);
  el('rect', { x: 0, y: -5, width: 12, height: 10, rx: 4, fill: pal.coral }, pen);

  const CX = 200, CY = 150, HW = 110, HH = 90;
  // 紙の影
  el('rect', { x: CX - HW + 3, y: CY - HH + 6, width: HW, height: HH * 2, rx: 6, fill: pal.shadow });

  // 紙の内容（中央からの距離 u、縦位置 y、線の長さ範囲）。左右の半分に同じ形で描く
  const marks = [
    { u0: 0, u1: 94, y: -64, w: 12, c: pal.blue },
    { u0: 10, u1: 92, y: -34, w: 5, c: '#C8D2E0' },
    { u0: 10, u1: 80, y: -18, w: 5, c: '#C8D2E0' },
    { u0: 10, u1: 92, y: -2, w: 5, c: '#C8D2E0' },
    { u0: 10, u1: 60, y: 14, w: 5, c: '#C8D2E0' },
    { u0: 10, u1: 86, y: 52, w: 5, c: '#C8D2E0' },
    { u0: 10, u1: 70, y: 68, w: 5, c: '#C8D2E0' }
  ];

  // 左半分（動かない）
  const left = g({});
  el('path', { d: `M ${CX} ${CY - HH} L ${CX - HW + 6} ${CY - HH} Q ${CX - HW} ${CY - HH} ${CX - HW} ${CY - HH + 6} L ${CX - HW} ${CY + HH - 6} Q ${CX - HW} ${CY + HH} ${CX - HW + 6} ${CY + HH} L ${CX} ${CY + HH} Z`, fill: '#FFFFFF', stroke: '#D5DBE5', 'stroke-width': 2, 'stroke-linejoin': 'round' }, left);
  marks.forEach((m) => el('line', { x1: CX - m.u1, y1: CY + m.y, x2: CX - m.u0, y2: CY + m.y, stroke: m.c, 'stroke-width': m.w, 'stroke-linecap': m.u0 === 0 ? 'butt' : 'round' }, left));
  el('circle', { cx: CX - 56, cy: CY + 34, r: 14, fill: pal.mint }, left);

  // 中央の折り線（最初は点線の目印、最後は折り目）
  const guide = el('line', { x1: CX, y1: CY - HH, x2: CX, y2: CY + HH, stroke: '#B9C3D2', 'stroke-width': 2, 'stroke-dasharray': '6 6', 'stroke-linecap': 'round' });

  // 右半分（中央を軸に反転する）
  const rShadow = el('path', { d: '', fill: 'rgba(40,52,70,0.13)' });
  const right = el('path', { d: '', fill: '#FFFFFF', stroke: '#D5DBE5', 'stroke-width': 2, 'stroke-linejoin': 'round' });
  const rLines = marks.map((m) => el('line', { stroke: m.c, 'stroke-width': m.w, 'stroke-linecap': m.u0 === 0 ? 'butt' : 'round' }));
  const rDot = el('rect', { fill: pal.coral, rx: 4 });
  const crease = el('line', { x1: CX, y1: CY - HH + 2, x2: CX, y2: CY + HH - 2, stroke: '#AEB8C8', 'stroke-width': 3, 'stroke-linecap': 'round' });

  return {
    update(t) {
      const p = easeInOut(seg(t, 0.9, 2.3));
      const sx = Math.cos(Math.PI * p);
      const d = 0.16 * hump(p); // 持ち上がると自由な縁が手前に来て大きく見える
      const front = sx > 0;
      const mp = (u, y) => [CX + u * sx, CY + y * (1 + d * (u / HW))];
      const pts = [mp(0, -HH), mp(HW, -HH), mp(HW, HH), mp(0, HH)];
      const path = (o = 0) => 'M ' + pts.map(([x, y]) => `${(x + o * 0.6).toFixed(1)} ${(y + o).toFixed(1)}`).join(' L ') + ' Z';
      k.set(right, { d: path(), fill: front ? '#FFFFFF' : '#E6E9F1' });
      const lift = hump(p);
      k.set(rShadow, { d: path(6 + 14 * lift) });
      marks.forEach((m, i) => {
        const [x1, y1] = mp(m.u0, m.y), [x2, y2] = mp(m.u1, m.y);
        k.set(rLines[i], { x1, y1, x2, y2, opacity: front ? 1 : 0 });
      });
      const [dx, dy] = mp(56, 34), [dx2, dy2] = mp(84, 34);
      k.set(rDot, { x: Math.min(dx, dx2), y: dy - 14, width: Math.abs(dx2 - dx), height: 28, opacity: front ? 1 : 0 });
      // 最後に着地して少しだけ弾み、折り目が見える
      const settle = 1 + 0.012 * wobble(seg(t, 2.3, 3.0), 2, 4);
      right.setAttribute('transform', `translate(${CX} 0) scale(${settle} 1) translate(${-CX} 0)`);
      k.set(guide, { opacity: 1 - seg(t, 0.9, 1.3) });
      k.set(crease, { opacity: seg(t, 2.2, 2.7) });
    }
  };
}
