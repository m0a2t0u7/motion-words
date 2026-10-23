// deadline：まめがカレンダーの来週の金曜日を指し、赤い丸がつく（例文 The deadline is next Friday.）
import { seg, lerp, easeOut, easeInOut, backOut, hump } from '../ease.js';
import { P, blinkAt } from './run-after.js';
import { roomBg } from './look-over.js';
import { reach } from './weigh.js';

export const meta = { duration: 4.0, beats: [[0, '今日を指す'], [1.4, '来週へ'], [2.8, '金曜に赤丸']] };

export function create(k) {
  const { el, pal } = k, S = 0.95;
  const FY = roomBg(k, 'office', 240);
  const cx = 165, cy = 40, cw = 40, ch = 34;
  el('rect', { x: cx - 8, y: cy - 8, width: cw * 5 + 16, height: ch * 3 + 40, rx: 8, fill: '#fff', stroke: pal.line, 'stroke-width': 3 });
  el('rect', { x: cx - 8, y: cy - 8, width: cw * 5 + 16, height: 26, rx: 8, fill: pal.coral });
  ['月', '火', '水', '木', '金'].forEach((d, i) => k.text(cx + i * cw + cw / 2, cy + 11, d, { 'font-size': 12, fill: '#fff', 'text-anchor': 'middle' }));
  for (let r = 0; r < 3; r++) for (let c = 0; c < 5; c++) {
    el('rect', { x: cx + c * cw + 2, y: cy + 24 + r * ch, width: cw - 4, height: ch - 4, rx: 4, fill: r === 0 ? '#F4F1EA' : '#F9F7F2' });
    k.text(cx + c * cw + cw / 2, cy + 24 + r * ch + 21, String(c + 1 + r * 7), { 'font-size': 12, fill: pal.sub, 'text-anchor': 'middle' });
  }
  const today = el('circle', { cx: cx + cw / 2, cy: cy + 24 + ch / 2 - 2, r: 7, fill: 'none', stroke: pal.blue, 'stroke-width': 3 });
  const ring = el('ellipse', { cx: cx + 4 * cw + cw / 2, cy: cy + 24 + 2 * ch + ch / 2 - 2, rx: 18, ry: 14, fill: 'rgba(235,87,87,0.12)', stroke: pal.red, 'stroke-width': 4 });
  const b = k.buddy({ x: 100, y: FY, scale: S });
  const pts = [[cx + cw / 2, cy + 24 + ch / 2], [cx + 4 * cw + cw / 2, cy + 24 + 2 * ch + ch / 2]];
  return {
    update(t) {
      const m = easeInOut(seg(t, 1.3, 2.6)), tx = lerp(pts[0][0], pts[1][0], m), ty = lerp(pts[0][1], pts[1][1], m);
      P(b, { armL: 8, armR: 90, look: 0.5, mood: t > 2.8 ? 'grin' : 'smile', blink: blinkAt(t), lean: 3 });
      b.pose({ armR: lerp(60, reach(b, S, 'R', tx - 6, ty + 6), easeOut(seg(t, 0.2, 0.9))) });
      today.setAttribute('opacity', 1 - seg(t, 2.4, 2.6));
      const p = backOut(seg(t, 2.7, 3.2));
      k.tf(ring, 0, 0, 0, 1, 1); ring.setAttribute('opacity', p > 0 ? 1 : 0);
      ring.setAttribute('stroke-dasharray', '120'); ring.setAttribute('stroke-dashoffset', String(120 * (1 - seg(t, 2.7, 3.3))));
    }
  };
}
