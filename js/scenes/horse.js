// horse：週末、牧場で友だち（彼女）が馬に乗ってパカパカ歩く。まめはカレンダーの土日の札の横で手をふる（例文 She rides a horse on weekends.）
import { seg, lerp, easeInOut, easeOut, hump, clamp } from '../ease.js';
import { P, blinkAt } from './run-after.js';
import { scene, hills, cloudG, treeG } from './nature.js';
import { beast } from './animal.js';
import { rails } from './field.js';

export const meta = { duration: 4.4, beats: [[0, '週末'], [1.0, '馬に乗る'], [3.2, 'パカパカ']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const { FY } = scene(k, { FY: 236, top: '#CDE9FA', bot: '#F2FAFE', ground: '#BFE3A4', edge: '#A9D690' });
  tf(cloudG(k, 70, 26), 300, 44); hills(k, FY, '#D5EBB8', '#C6E3A6');
  tf(treeG(k, 0.7).g, 360, FY - 20);
  rails(k, 0, 400, FY - 30, 30, 70);
  // 週末カレンダー（SAT・SUN に丸）
  const cal = g({}); tf(cal, 54, 70);
  el('rect', { x: -40, y: -26, width: 80, height: 54, rx: 5, fill: '#fff', stroke: pal.line, 'stroke-width': 2 }, cal);
  el('rect', { x: -40, y: -26, width: 80, height: 12, rx: 4, fill: pal.red }, cal);
  ['M', 'T', 'W', 'T', 'F', 'S', 'S'].forEach((d, i) => k.text(-33 + i * 11, 0, d, { 'font-size': 9, fill: i > 4 ? pal.coralDark : pal.sub }, cal));
  const ring = el('ellipse', { cx: 27, cy: 0, rx: 13, ry: 9, fill: 'none', stroke: pal.coral, 'stroke-width': 2.4 }, cal);
  el('rect', { x: 52, y: 97, width: 4, height: 30, fill: pal.woodDark });
  const S = 0.62;
  const rider = k.buddy({ x: 0, y: 0, scale: S, color: pal.coral, dark: pal.coralDark });
  const hat = g({}, rider.body); el('path', { d: 'M -26 -70 Q -24 -96 0 -96 Q 24 -96 26 -70 Z', fill: '#2A3242' }, hat); el('rect', { x: -30, y: -72, width: 60, height: 6, rx: 3, fill: '#2A3242' }, hat);
  const h = beast(k, 'horse');
  const saddle = el('path', { d: 'M -16 0 Q 0 8 16 0 L 14 10 L -14 10 Z', fill: pal.red });
  const rein = el('path', { stroke: '#5B3B24', 'stroke-width': 1.8, fill: 'none' });
  const me = k.buddy({ x: 70, y: 280, scale: 0.85 });
  const xf = (t) => lerp(120, 300, easeInOut(seg(t, 0.6, 4.2)));
  return {
    update(t) {
      ring.setAttribute('stroke-dasharray', `${90 * easeOut(seg(t, 0.2, 0.9))} 200`);
      const x = xf(t), v = seg(t, 0.6, 4.2) > 0 && t < 4.1 ? 1 : 0, ph = (x - 120) * 0.12;
      const bob = Math.abs(Math.sin(ph)) * 3 * v, HY = FY + 10;
      h.set({ x, y: HY, ph, m: v, head: Math.sin(ph) * 3, tail: Math.sin(t * 6) * 8 });
      const back = HY - 0.0 - (h.c.L + h.c.by * 0.55 + h.c.by - 4) - bob;
      tf(saddle, x - 4, back - 2);
      P(rider, { x: x - 6, y: back + 22, armR: 70, armL: 70, lean: 4 + 3 * Math.sin(ph * 2) * v, mood: 'grin', blink: blinkAt(t, 1), look: 0.6 });
      const hd = h.headAt({ x, y: HY - bob });
      const rh = rider.handPos('R');
      k.set(rein, { d: `M ${rh.x} ${rh.y} Q ${(rh.x + hd.x) / 2 + 8} ${rh.y + 12} ${hd.x + 18} ${hd.y + 4}` });
      P(me, { x: 70, y: 280, armR: 150 + Math.sin(t * 9) * 18, look: 0.6, mood: 'grin', blink: blinkAt(t) });
    }
  };
}
