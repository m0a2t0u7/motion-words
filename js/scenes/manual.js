import { seg, lerp, easeInOut, easeOut, backOut, hump, clamp } from '../ease.js';
import { P, blinkAt, walkTo } from './run-after.js';
import { hp } from './dig.js';
import { grip } from './hand-over.js';
import { roomBg, say, desk } from './look-over.js';
// manual：車の運転席で、まめが自分の手でシフトレバーを動かしてギアを替える（例文 This is a manual car, not an automatic.）
export const meta = { duration: 4.0, beats: [[0, 'ハンドル'], [1.0, 'レバーを握る'], [2.4, '自分で変速']] };
export function create(k) {
  const { el, g, tf, pal, text } = k, S = 1.0;
  const FY = 236;
  k.backdrop({ floorY: FY, mood: 'indoor' });
  el('rect', { x: 0, y: 70, width: 400, height: 80, fill: '#DDEFFA' });
  el('rect', { x: 0, y: 150, width: 400, height: 150, fill: '#6C7480' });
  const b = k.buddy({ x: 120, y: FY - 14, scale: S });
  el('rect', { x: 170, y: 188, width: 210, height: 70, rx: 12, fill: '#4B535E' });
  const wh = g({}); tf(wh, 270, 162, -25);
  el('ellipse', { rx: 10, ry: 40, fill: 'none', stroke: pal.ink, 'stroke-width': 7 }, wh);
  const gate = el('rect', { x: 178, y: 196, width: 70, height: 28, rx: 8, fill: '#2F353D' });
  [0, 1, 2].forEach((i) => text(192 + i * 22, 214, String(i + 1), { 'font-size': 13, fill: '#9AA4B0', 'text-anchor': 'middle', 'font-weight': 700 }));
  const lv = g({}); tf(lv, 200, 214);
  el('line', { x1: 0, y1: 0, x2: 0, y2: -34, stroke: '#AEB6C0', 'stroke-width': 6, 'stroke-linecap': 'round' }, lv);
  const kn = el('circle', { cx: 0, cy: -38, r: 9, fill: pal.coral }, lv);
  const gr = grip(k, pal.mint, pal.mintDark, S);
  return {
    update(t) {
      const sh = easeInOut(seg(t, 1.8, 3.0)), grab = easeOut(seg(t, 0.8, 1.6));
      P(b, { x: 120, armR: lerp(60, 80, grab), armL: 60, lean: lerp(4, 16, sh), look: 0.5, mood: t > 3 ? 'grin' : 'smile', blink: blinkAt(t) });
      const h = hp(b, S, 'R'), r = lerp(-14, 14, sh) * Math.PI / 180;
      tf(lv, h.x - 38 * Math.sin(r), h.y + 38 * Math.cos(r), r * 57.3);
      gr(h);
      tf(wh, 270, 162, -25 + 4 * Math.sin(t * 2));
    }
  };
}
