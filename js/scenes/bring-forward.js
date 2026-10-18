// bring forward：週のカレンダーで木曜にあった会議カードを、まめがつかんで前の月曜へ移す（早める）（例文 We brought the meeting forward to Monday.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';
import { hp, reach } from './dig.js';

export const meta = { duration: 4.2, beats: [[0, '会議は木曜'], [1.4, '前の日へ移す'], [3.2, '月曜になった']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  const X0 = 110, CW = 54;
  el('rect', { x: X0 - 8, y: 40, width: CW * 5 + 16, height: 130, rx: 8, fill: '#fff', stroke: pal.line, 'stroke-width': 3 });
  ['M', 'T', 'W', 'T', 'F'].forEach((d, i) => { el('rect', { x: X0 + i * CW + 2, y: 48, width: CW - 4, height: 22, rx: 4, fill: i === 0 ? '#DCEFE9' : '#F1F3F6' }); k.text(X0 + i * CW + CW / 2, 60, d, { 'font-size': 14, fill: pal.sub }); el('rect', { x: X0 + i * CW + 2, y: 74, width: CW - 4, height: 88, rx: 4, fill: '#FAFBFC' }); });
  const mark = el('rect', { x: X0 + 3 * CW + 4, y: 100, width: CW - 8, height: 34, rx: 5, fill: 'none', stroke: pal.line, 'stroke-width': 2, 'stroke-dasharray': '4 4', opacity: 0 });
  const card = g({});
  el('rect', { x: -22, y: -16, width: 44, height: 32, rx: 5, fill: pal.blue }, card);
  [[-10, -2], [0, -2], [10, -2]].forEach(([x, y]) => el('circle', { cx: x, cy: y, r: 4, fill: '#fff' }, card));
  el('rect', { x: -14, y: 5, width: 28, height: 6, rx: 3, fill: '#fff' }, card);
  const arrow = el('path', { d: 'M 0 0 L -100 0 M -92 -8 L -102 0 L -92 8', stroke: pal.mintDark, 'stroke-width': 3, fill: 'none', 'stroke-linecap': 'round', opacity: 0 });
  const b = k.buddy({ x: 330, y: FY, scale: 1.3, facing: -1 });
  const thuX = X0 + 3 * CW + CW / 2, monX = X0 + CW / 2;
  return {
    update(t) {
      const grab = easeOut(seg(t, 0.5, 1.0)), mv = easeInOut(seg(t, 1.2, 2.6)), rel = easeInOut(seg(t, 2.8, 3.2));
      const cx = lerp(thuX, monX, mv), cy = 117 - hump(mv) * 10, grab0 = 0;
      b.pose({ x: cx + 58 + 20 * (1 - grab), walk: mv > 0 && mv < 1 ? t * 9 : 0, facing: -1, armR: lerp(10, 160, grab) * (1 - rel) + 10 * rel, lean: 6 * grab * (1 - rel), look: 0.6, mood: t > 2.8 ? 'grin' : 'smile' });
      if (grab > 0 && rel < 1) b.pose({ armR: lerp(10, reach(b, 1.3, 'R', cx, cy + 10), grab * (1 - rel)) });
      const h = hp(b, 1.3);
      tf(card, t < 1.0 ? lerp(thuX, thuX, 0) : cx, t < 1.0 ? 117 : cy, -6 * hump(mv));
      mark.setAttribute('opacity', mv > 0.2 ? 1 : 0);
      tf(arrow, thuX - 8, 186); arrow.setAttribute('opacity', hump(seg(t, 1.2, 3.0)));
      void h;
    }
  };
}
