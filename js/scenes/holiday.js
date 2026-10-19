// holiday：壁のカレンダーの月曜日が赤くなり旗のマークが付く。祝日と気づいたまめが大喜び（例文 Monday is a national holiday.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';
import { P, blinkAt, reach, popIn } from './vehicle.js';

export const meta = { duration: 4.2, beats: [[0, 'カレンダー'], [1.2, '月曜日は…'], [2.6, '祝日だ！']] };

export function create(k) {
  const { el, g, pal } = k;
  const FY = 240;
  k.backdrop({ floorY: FY, mood: 'indoor' });
  // 週のカレンダー
  const X0 = 150, W = 34;
  el('rect', { x: X0 - 10, y: 40, width: W * 7 + 20, height: 140, rx: 8, fill: '#fff', stroke: pal.line, 'stroke-width': 3 });
  el('rect', { x: X0 - 10, y: 40, width: W * 7 + 20, height: 22, rx: 8, fill: pal.blue });
  ['S', 'M', 'T', 'W', 'T', 'F', 'S'].forEach((d, i) => { k.text(X0 + W * i + W / 2, 78, d, { 'font-size': 12, fill: i === 0 ? pal.red : pal.sub }); k.text(X0 + W * i + W / 2, 106, String(10 + i), { 'font-size': 15, fill: i === 0 ? pal.red : pal.ink }); });
  const mon = g({}); el('circle', { cx: X0 + W * 1.5, cy: 106, r: 14, fill: pal.red }, mon); k.text(X0 + W * 1.5, 106, '11', { 'font-size': 15, fill: '#fff' }, mon);
  // 旗（架空の旗）
  const flag = g({}); el('line', { x1: 0, y1: 0, x2: 0, y2: 30, stroke: pal.ink, 'stroke-width': 2.5 }, flag); el('rect', { x: 0, y: 0, width: 24, height: 16, fill: pal.green }, flag); el('rect', { x: 0, y: 5, width: 24, height: 6, fill: pal.yellow }, flag);
  const me = k.buddy({ x: 90, y: FY + 4, scale: 0.95 });
  return {
    update(t) {
      const pt = easeOut(seg(t, 0.5, 1.0)) * (1 - easeInOut(seg(t, 2.4, 2.7)));
      const mp = seg(t, 1.4, 1.8);
      mon.setAttribute('opacity', mp); k.tf(flag, X0 + W * 1.5 - 8, 128, 0, popIn(seg(t, 1.8, 2.2)) + 0.001);
      const joy = seg(t, 2.6, 4.2);
      P(me, { look: 0.7, mood: t > 2.4 ? 'grin' : t > 1.6 ? 'open' : 'smile', blink: blinkAt(t), lift: 18 * Math.abs(Math.sin(joy * Math.PI * 3)) * (joy > 0 && joy < 1 ? 1 : 0), armL: 8 + 150 * easeOut(seg(t, 2.6, 2.9)) });
      me.pose({ armR: t < 2.6 ? lerp(10, reach(me, 0.95, 'R', X0 + W * 1.5, 112), pt) : 8 + 150 * easeOut(seg(t, 2.6, 2.9)) });
      void hump;
    }
  };
}
