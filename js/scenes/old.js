// old：新しかった家が、年月を経て色あせ、ひびとつたの古い家になる（例文 This is an old house.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';
import { P, blinkAt } from './run-after.js';

export const meta = { duration: 4.0, beats: [[0, '新しい家'], [1.3, '年月がたつ'], [3.0, '古い家']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 244, mood: 'outdoor' });
  const HX = 140, HW = 220;
  // 新しい家
  const fresh = g({});
  el('rect', { x: HX, y: 100, width: HW, height: FY - 100, rx: 4, fill: '#FFF1D2' }, fresh);
  el('path', { d: `M ${HX - 12} 106 L ${HX + HW / 2} 40 L ${HX + HW + 12} 106 Z`, fill: pal.coral, stroke: pal.coral, 'stroke-width': 6, 'stroke-linejoin': 'round' }, fresh);
  el('rect', { x: HX + HW - 54, y: 50, width: 20, height: 36, fill: pal.coralDark }, fresh);
  // 古びた家（上に重ねて徐々に出す）
  const aged = g({ opacity: 0 });
  el('rect', { x: HX, y: 100, width: HW, height: FY - 100, rx: 4, fill: '#CDBFA8' }, aged);
  el('path', { d: `M ${HX - 12} 108 L ${HX + HW / 2} 46 L ${HX + HW + 12} 108 Z`, fill: '#8F7A6A', stroke: '#8F7A6A', 'stroke-width': 6, 'stroke-linejoin': 'round' }, aged);
  el('rect', { x: HX + HW - 52, y: 54, width: 20, height: 36, fill: '#6F5E52', transform: `rotate(8 ${HX + HW - 42} 90)` }, aged);
  el('path', { d: `M ${HX + 30} 120 L ${HX + 44} 144 L ${HX + 36} 160 L ${HX + 50} 190 M ${HX + 170} 118 L ${HX + 160} 146 L ${HX + 172} 170`, stroke: '#7A6A58', 'stroke-width': 3, fill: 'none', 'stroke-linecap': 'round' }, aged);
  [[HX + 8, FY - 6], [HX + 28, FY - 4], [HX + 190, FY - 8], [HX + 208, FY - 5]].forEach(([x, y]) => { el('circle', { cx: x, cy: y - 14, r: 11, fill: '#6FA67E' }, aged); el('circle', { cx: x + 6, cy: y - 34, r: 9, fill: '#5C9470' }, aged); });
  // 窓とドア（共通）
  [HX + 26, HX + 130].forEach((x) => { el('rect', { x, y: 118, width: 50, height: 44, rx: 4, fill: '#CFE9F7', stroke: '#fff', 'stroke-width': 4 }); el('line', { x1: x + 25, y1: 118, x2: x + 25, y2: 162, stroke: '#fff', 'stroke-width': 3 }); });
  el('rect', { x: HX + 86, y: FY - 66, width: 36, height: 66, rx: 3, fill: pal.woodDark });
  // 年月の経過を示す日めくり（数字だけ）
  const cal = k.text(60, 70, '1', { 'font-size': 40, 'font-weight': 800, fill: pal.sub, 'text-anchor': 'middle' });
  const b = k.buddy({ x: 66, y: FY + 4, scale: 0.85 });
  return {
    update(t) {
      const p = easeInOut(seg(t, 1.0, 3.0));
      aged.setAttribute('opacity', p);
      fresh.setAttribute('opacity', 1 - p);
      cal.textContent = String(1 + Math.round(p * 79));
      cal.setAttribute('opacity', seg(t, 0.8, 1.1));
      const pt = easeOut(seg(t, 2.9, 3.4));
      P(b, { y: FY + 4, armR: lerp(8, 100, pt) + Math.sin(t * 10) * 4 * pt, lean: -3 * pt, mood: pt > 0.5 ? 'open' : 'smile', look: 0.7, blink: blinkAt(t) });
    }
  };
}
