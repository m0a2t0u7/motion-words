// belong：テニスクラブの旗の前に、おそろいの黄色いはちまきの仲間たち。まめも同じはちまきとラケットで加わり、一緒にラケットを掲げる（例文 I belong to the tennis club.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';
import { held } from './dig.js';
import { P, blinkAt } from './run-after.js';
import { walk, path } from './queue-up.js';

// テニスラケット（原点＝握り、+y が面）
export function racket(k, parent) {
  const g = k.g({}, parent), pal = k.pal;
  k.el('rect', { x: -2.5, y: -4, width: 5, height: 16, rx: 2, fill: pal.ink }, g);
  k.el('ellipse', { cx: 0, cy: 24, rx: 10, ry: 13, fill: 'rgba(255,255,255,0.5)', stroke: pal.red, 'stroke-width': 3 }, g);
  [-5, 0, 5].forEach((x) => k.el('line', { x1: x, y1: 13, x2: x, y2: 35, stroke: pal.sub, 'stroke-width': 0.8 }, g));
  return g;
}
// おそろいのはちまき（体のグループに付ける）
const band = (k, b) => { k.el('rect', { x: -30, y: -72, width: 60, height: 8, rx: 3, fill: k.pal.yellow }, b.body); k.el('circle', { cx: 0, cy: -68, r: 5, fill: k.pal.yellowDark }, b.body); };

export const meta = { duration: 4.4, beats: [[0, 'テニスクラブ'], [1.4, '仲間に加わる'], [3.0, 'クラブの一員']] };

export function create(k) {
  const { el, g, tf, pal } = k, FY = 236;
  k.backdrop({ floorY: FY, mood: 'outdoor' });
  // コートのネットとクラブの旗
  el('rect', { x: 0, y: FY - 4, width: 400, height: 70, fill: '#8FC7A0' });
  el('rect', { x: 0, y: FY - 4, width: 400, height: 3, fill: '#fff' });
  el('rect', { x: 300, y: 150, width: 4, height: 86, fill: pal.sub });
  el('rect', { x: 304, y: 160, width: 96, height: 40, fill: 'none', stroke: pal.sub, 'stroke-width': 1.5, 'stroke-dasharray': '3 3' });
  el('rect', { x: 304, y: 158, width: 96, height: 4, fill: '#fff' });
  el('rect', { x: 70, y: 30, width: 4, height: 90, fill: pal.sub });
  el('rect', { x: 74, y: 32, width: 150, height: 40, rx: 3, fill: pal.yellow });
  const icon = g({}); tf(icon, 96, 52, -30);
  el('ellipse', { cx: 0, cy: -4, rx: 7, ry: 9, fill: 'none', stroke: pal.red, 'stroke-width': 3 }, icon);
  el('rect', { x: -1.5, y: 4, width: 3, height: 9, fill: pal.ink }, icon);
  k.text(162, 53, 'TENNIS CLUB', { 'font-size': 12 });
  const mates = [[110, 1], [168, -1]].map(([x, f]) => { const b = k.buddy({ x, y: FY, scale: 0.9, facing: f, color: pal.coral, dark: pal.coralDark }); band(k, b); return { b, r: racket(k) }; });
  const me = k.buddy({ x: 430, y: FY, scale: 0.9, facing: -1 });
  band(k, me);
  const myR = racket(k);
  const xf = path([[0.4, 430], [1.8, 228]]);
  return {
    update(t) {
      walk(me, xf, t, { facing: -1, look: 0.4, armR: 30, blink: blinkAt(t) });
      const up = easeOut(seg(t, 2.8, 3.2));
      if (t > 1.8) P(me, { x: 228, facing: -1, look: 0.4, armL: 10, armR: lerp(30, 165, up), blink: blinkAt(t), mood: 'grin', lift: 8 * hump(seg(t, 3.2, 3.6)) });
      held(k, me, 0.9, myR, 'R', 0);
      mates.forEach((m, i) => {
        const wave = t > 1.4 && t < 2.6 ? Math.sin(t * 10) * 20 : 0;
        P(m.b, { facing: t > 1.2 ? (i ? 1 : 1) : i ? -1 : 1, look: t > 1.2 ? 0.7 : 0.4, blink: blinkAt(t, i + 1), mood: t > 1.3 ? 'grin' : 'smile', armL: i ? 10 + (t > 1.4 && t < 2.6 ? 140 + wave : 0) : 10, armR: lerp(30, 165, up), lift: 8 * hump(seg(t, 3.2 + i * 0.05, 3.6 + i * 0.05)) });
        held(k, m.b, 0.9, m.r, 'R', 0);
      });
    }
  };
}
