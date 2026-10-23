// document：台の上に立てた書類の署名欄に、まめがペンで名前を書く（例文 Please sign this document.）
import { seg, lerp, easeInOut, easeOut, backOut, hump } from '../ease.js';
import { P, blinkAt } from './run-after.js';
import { roomBg, desk, hp, reach } from './look-over.js';
import { grip } from './hand-over.js';

export const meta = { duration: 4.2, beats: [[0, '署名欄'], [1.2, '署名する'], [3.4, '署名済み']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 0.95;
  const FY = roomBg(k, 'office', 240);
  const b = k.buddy({ x: 208, y: FY, scale: S });
  desk(k, 240, 150, 200);
  const doc = g({}); tf(doc, 285, 152);
  el('rect', { x: -38, y: -50, width: 76, height: 98, rx: 4, fill: '#fff', stroke: pal.line, 'stroke-width': 2 }, doc);
  el('rect', { x: -38, y: 48, width: 76, height: 3, fill: pal.shadow, opacity: 0.4 }, doc);
  el('rect', { x: -28, y: -40, width: 30, height: 5, rx: 2, fill: pal.blue }, doc);
  [-28, -20, -12, -4].forEach((y) => el('line', { x1: -28, x2: 28, y1: y, y2: y, stroke: pal.line, 'stroke-width': 3, 'stroke-linecap': 'round' }, doc));
  el('line', { x1: -30, x2: 26, y1: 34, y2: 34, stroke: pal.sub, 'stroke-width': 2 }, doc);
  k.text(-30, 24, 'x', { 'font-size': 12, 'font-weight': 800, fill: pal.coralDark, 'text-anchor': 'start' }, doc);
  // 署名：折れ線をだんだん伸ばす
  const pts = []; for (let i = 0; i <= 24; i++) { const u = i / 24; pts.push([-20 + u * 42, 30 + Math.sin(u * 17) * 5 * (1 - u * 0.4)]); }
  const sig = el('polyline', { fill: 'none', stroke: pal.blueDark, 'stroke-width': 2.2, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, doc);
  const ok = g({}, doc); tf(ok, 26, -42);
  el('circle', { r: 9, fill: pal.green }, ok);
  el('path', { d: 'M -4 0 l 3 3 l 6 -6', fill: 'none', stroke: '#fff', 'stroke-width': 2.4, 'stroke-linecap': 'round' }, ok);
  const pen = g({});
  el('rect', { x: -2, y: -16, width: 4, height: 16, rx: 1.5, fill: pal.ink }, pen);
  el('path', { d: 'M -2 0 L 0 5 L 2 0 Z', fill: pal.yellowDark }, pen);
  const gr = grip(k, pal.mint, pal.mintDark, S);
  return {
    update(t) {
      const w = easeInOut(seg(t, 1.2, 3.2)), n = Math.round(w * 24);
      const tx = 285 + pts[n][0] * 1, ty = 152 + pts[n][1];
      const lift = 1 - easeOut(seg(t, 0.2, 1.1));
      const px = lerp(262, tx, 1 - lift) , py = lerp(186, ty, 1 - lift);
      const px2 = t > 3.2 ? lerp(tx, 258, easeInOut(seg(t, 3.3, 4.0))) : px, py2 = t > 3.2 ? lerp(ty, 186, easeInOut(seg(t, 3.3, 4.0))) : py;
      P(b, { armR: reach(b, S, 'R', px2, py2), armL: 8, lean: 5, mood: t > 3.4 ? 'grin' : 'flat', blink: blinkAt(t), look: 4 });
      const hh = hp(b, S, 'R'); gr(hh);
      tf(pen, hh.x + 3, hh.y + 1, 28);
      k.set(sig, { points: pts.slice(0, n + 1).map((p) => p.join(',')).join(' ') });
      tf(ok, 26, -42, 0, backOut(seg(t, 3.3, 3.8)) + 0.001, backOut(seg(t, 3.3, 3.8)) + 0.001);
    }
  };
}
