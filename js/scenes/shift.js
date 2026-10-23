// shift：今週は夜勤のシフト。壁のカレンダーの平日に月のマークが並び、まめは夜の窓の前で働く（例文 I work the night shift this week.）
import { seg, lerp, easeInOut, easeOut, backOut, hump } from '../ease.js';
import { P, blinkAt, star } from './run-after.js';
import { desk } from './look-over.js';
import { held } from './dig.js';

export const meta = { duration: 4.2, beats: [[0, '昼の職場'], [1.2, '今週の予定'], [3.0, '夜勤の週']] };
const EF = '"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif';

export function create(k) {
  const { el, g, tf, pal } = k, S = 0.95;
  const FY = k.backdrop({ floorY: 240, mood: 'indoor' });
  el('rect', { x: 30, y: 40, width: 100, height: 80, rx: 6, fill: '#DDEFFA', stroke: '#fff', 'stroke-width': 5 });
  const nite = el('rect', { x: 33, y: 43, width: 94, height: 74, rx: 4, fill: '#2B3A66', opacity: 0 });
  const mn = g({}); tf(mn, 100, 66); k.text(0, 0, '🌙', { 'font-size': 22, 'font-family': EF, 'text-anchor': 'middle', 'dominant-baseline': 'central' }, mn);
  el('rect', { x: 160, y: 34, width: 220, height: 72, rx: 8, fill: '#fff', stroke: pal.line, 'stroke-width': 3 });
  el('rect', { x: 160, y: 34, width: 220, height: 16, rx: 8, fill: pal.coral });
  const days = ['M', 'T', 'W', 'T', 'F'].map((d, i) => {
    const x = 184 + i * 40;
    k.text(x, 66, d, { 'font-size': 13, fill: pal.sub, 'text-anchor': 'middle' });
    el('rect', { x: x - 16, y: 72, width: 32, height: 28, rx: 5, fill: '#F1F4F8' });
    const m = g({}); k.text(0, 0, '🌙', { 'font-size': 18, 'font-family': EF, 'text-anchor': 'middle', 'dominant-baseline': 'central' }, m);
    return { m, x };
  });
  desk(k, 120, 150, 190);
  const bx = g({}); el('rect', { x: -14, y: -12, width: 28, height: 24, rx: 3, fill: '#D9A46C', stroke: '#B07C47', 'stroke-width': 2 }, bx);
  const b = k.buddy({ x: 90, y: FY, scale: S });
  return {
    update(t) {
      const dk = easeInOut(seg(t, 0.5, 2.2));
      nite.setAttribute('opacity', dk); tf(mn, 100, 66, 0, backOut(seg(t, 1.6, 2.2)));
      days.forEach((d, i) => tf(d.m, d.x, 86, 0, backOut(seg(t, 1.4 + i * 0.25, 1.8 + i * 0.25))));
      const c = Math.abs(Math.sin(t * 2.6)) ;
      P(b, { armR: 60 + 25 * c, armL: 8, lean: 4, mood: t > 3 ? 'smile' : 'flat', look: 0.6, blink: blinkAt(t) });
      held(k, b, S, bx, 'R', 0, 22);
    }
  };
}
