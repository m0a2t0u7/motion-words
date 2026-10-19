// parking：駐車場の料金看板。カレンダーが日曜になると料金が「FREE」に変わり、まめは払わずに車を止めてにっこり（例文 Parking is free on Sundays.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';
import { auto, blinkAt, popIn, mark } from './vehicle.js';

export const meta = { duration: 4.4, beats: [[0, 'ふだんは有料'], [1.3, '日曜日'], [2.6, '駐車が無料']] };

export function create(k) {
  const { el, g, pal } = k;
  const FY = 170;
  k.backdrop({ floorY: FY });
  el('rect', { x: 0, y: FY, width: 400, height: 130, fill: '#B9C2CF' });
  [40, 170, 300].forEach((x) => el('path', { d: `M ${x} ${FY + 14} L ${x - 16} 290`, stroke: '#fff', 'stroke-width': 4 }));
  // 料金看板
  el('rect', { x: 26, y: 34, width: 150, height: 110, rx: 10, fill: '#fff', stroke: pal.line, 'stroke-width': 3 });
  el('rect', { x: 38, y: 46, width: 40, height: 44, rx: 6, fill: pal.blue }); k.text(58, 69, 'P', { 'font-size': 30, fill: '#fff' });
  const fee = k.text(128, 70, '$5', { 'font-size': 26 });
  const free = g({}); el('rect', { x: 86, y: 52, width: 82, height: 34, rx: 8, fill: pal.green }, free); k.text(127, 70, 'FREE', { 'font-size': 20, fill: '#fff' }, free);
  el('rect', { x: 98, y: 144, width: 6, height: FY - 144, fill: pal.sub });
  // 曜日カレンダー（MON〜SUN）
  const days = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
  el('rect', { x: 216, y: 40, width: 160, height: 68, rx: 8, fill: '#fff', stroke: pal.line, 'stroke-width': 3 });
  const day = k.text(296, 82, 'FRI', { 'font-size': 26 });
  el('rect', { x: 216, y: 40, width: 160, height: 18, rx: 8, fill: pal.red });
  const car = auto(k, { color: pal.mint, dark: pal.mintDark, driver: { color: pal.mint, dark: pal.mintDark }, ds: 0.52 });
  const ok = mark(k, 'check');
  return {
    update(t) {
      const di = Math.min(6, 4 + Math.floor(seg(t, 0.4, 1.4) * 2.99));
      day.textContent = days[di]; k.set(day, { fill: di === 6 ? pal.red : pal.ink });
      const fp = seg(t, 1.6, 2.0);
      fee.setAttribute('opacity', 1 - fp); k.tf(free, 127, 69, 0, popIn(fp) + 0.001); free.setAttribute('transform', `translate(127 69) scale(${(popIn(fp) + 0.001).toFixed(3)}) translate(-127 -69)`);
      const x = lerp(-120, 250, easeOut(seg(t, 2.0, 3.4)));
      car.set(x, 250, x * 3, 0, -1.5 * hump(seg(t, 3.0, 3.6)), 1.25);
      car.d.pose({ look: t > 3.4 ? -0.6 : 0.6, mood: t > 3.2 ? 'grin' : 'smile', blink: blinkAt(t) });
      k.tf(ok, 180, 70, 0, popIn(seg(t, 3.5, 3.8)) * 1.6 + 0.001);
      void easeInOut;
    }
  };
}
