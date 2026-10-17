// make ends meet：給料（コイン）と出費（請求書）の両端を引き寄せようと必死だが、なかなか届かない（It's hard to make ends meet these days.）
import { seg, lerp, easeInOut, easeOut, wobble, hump } from '../ease.js';
import { hp } from './get-something-off-ones-chest.js';

export const meta = { duration: 4.4, beats: [[0, '両端を持つ'], [1.5, '引き寄せる'], [3.2, '届かない']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 242, mood: 'indoor' });
  el('ellipse', { cx: 200, cy: FY + 16, rx: 160, ry: 10, fill: '#EDE5D8' });
  // 足元：左に軽い財布、右に請求書の山
  const wal = g({}); tf(wal, 78, FY - 4);
  k.shadow(0, 4, 32, 5, wal);
  el('rect', { x: -28, y: -22, width: 56, height: 26, rx: 7, fill: pal.coffee }, wal);
  el('rect', { x: -28, y: -22, width: 56, height: 8, rx: 4, fill: '#A97654' }, wal);
  el('circle', { cx: 18, cy: -6, r: 4, fill: pal.yellow }, wal);
  [0, 1].forEach((i) => el('circle', { cx: -4 + i * 12, cy: 10 - i, r: 6, fill: pal.yellow, stroke: pal.yellowDark, 'stroke-width': 2 }, wal));
  const bills = g({}); tf(bills, 322, FY - 2);
  k.shadow(0, 4, 38, 5, bills);
  for (let i = 0; i < 5; i++) {
    el('rect', { x: -26 + (i % 2) * 4, y: -10 - i * 13, width: 52, height: 13, rx: 2, fill: '#fff', stroke: '#CBD3DF', 'stroke-width': 2 }, bills);
    el('line', { x1: -16, y1: -4 - i * 13, x2: 14, y2: -4 - i * 13, stroke: i % 2 ? pal.red : '#CBD3DF', 'stroke-width': 2.4 }, bills);
  }
  const mint = k.buddy({ x: 200, y: FY });
  // 紐（財布→左手、請求書→右手）
  const cordL = el('path', { d: '', fill: 'none', stroke: pal.ink, 'stroke-width': 2.4, 'stroke-linecap': 'round' });
  const cordR = el('path', { d: '', fill: 'none', stroke: pal.ink, 'stroke-width': 2.4, 'stroke-linecap': 'round' });
  const tagL = g({}); el('circle', { r: 12, fill: pal.yellow, stroke: pal.yellowDark, 'stroke-width': 3 }, tagL); el('path', { d: 'M -4 -5 q 4 -3 8 0 M -4 5 q 4 3 8 0 M 0 -7 v 14', stroke: pal.yellowDark, 'stroke-width': 2.2, fill: 'none' }, tagL);
  const tagR = g({}); el('rect', { x: -11, y: -13, width: 22, height: 26, rx: 3, fill: '#fff', stroke: pal.red, 'stroke-width': 3 }, tagR); el('path', { d: 'M -5 -6 h 10 M -5 0 h 10 M -5 6 h 6', stroke: pal.red, 'stroke-width': 2.2, 'stroke-linecap': 'round' }, tagR);
  const gap = el('path', { d: '', stroke: pal.red, 'stroke-width': 2.5, fill: 'none', 'stroke-dasharray': '3 3' });
  const sweat = [0, 1].map(() => el('path', { d: 'M 0 -7 Q 5 0 0 5 Q -5 0 0 -7 Z', fill: pal.water }));
  return {
    update(t) {
      const pull = easeInOut(seg(t, 0.8, 2.0)), strain = seg(t, 1.8, 3.2), sag = easeOut(seg(t, 3.3, 3.9));
      const tug = Math.sin(t * 13) * 3 * strain * (1 - sag);
      const a = lerp(110, 168, pull) + tug - 22 * sag;
      mint.pose({ armL: a, armR: a - tug * 2, lean: -4 * pull + 3 * Math.sin(t * 13) * strain * (1 - sag) + 10 * sag, squash: 1 - 0.04 * strain - 0.04 * sag, look: 0, mood: t < 1.5 ? 'flat' : t < 3.3 ? 'open' : 'sad', blink: 0 });
      const hl = hp(mint, 1, 'L', 30), hr = hp(mint, 1, 'R', 30);
      tf(tagL, hl.x, hl.y - 2, 0, 1); tf(tagR, hr.x, hr.y - 2, 0, 1);
      const mid = (hl.x + hr.x) / 2;
      cordL.setAttribute('d', `M 80 ${FY - 26} Q ${hl.x - 20} ${(FY + hl.y) / 2 + 10} ${hl.x} ${hl.y + 8}`);
      cordR.setAttribute('d', `M 322 ${FY - 70} Q ${hr.x + 20} ${(FY + hr.y) / 2} ${hr.x} ${hr.y + 12}`);
      gap.setAttribute('d', `M ${hl.x + 14} ${hl.y} L ${hr.x - 14} ${hr.y}`);
      gap.setAttribute('opacity', pull > 0.5 ? 1 : 0);
      sweat.forEach((s, i) => { const p = (t * 1.3 + i * 0.5) % 1; tf(s, 200 + (i ? 34 : -34), FY - 100 + 24 * p, 0, 1); s.setAttribute('opacity', strain > 0.2 ? 1 - 0.5 * p : 0); });
      tf(bills, 322 + wobble(seg(t, 3.3, 4.0), 2, 4), FY - 2, 0, 1);
    }
  };
}
