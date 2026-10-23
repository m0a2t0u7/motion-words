// contract：まめが1年間の契約書にペンで署名する（例文 He signed a one-year contract.）
import { seg, lerp, easeOut, easeInOut, backOut } from '../ease.js';
import { P, blinkAt } from './run-after.js';
import { roomBg, desk } from './look-over.js';
import { reach } from './weigh.js';

export const meta = { duration: 4.0, beats: [[0, '契約書'], [0.9, '署名する'], [3.0, '署名完了']] };

export function create(k) {
  const { el, g, pal } = k, S = 0.95;
  const FY = roomBg(k, 'office', 240);
  const boss = k.buddy({ x: 320, y: FY, scale: 0.85, facing: -1, color: pal.coral, dark: pal.coralDark });
  const b = k.buddy({ x: 130, y: FY, scale: S });
  desk(k, 160, 200, 200);
  const px = 205, py = 150;
  el('rect', { x: px, y: py, width: 110, height: 50, rx: 3, fill: '#fff', stroke: pal.line, 'stroke-width': 2 });
  el('rect', { x: px + 10, y: py + 8, width: 36, height: 7, rx: 3, fill: pal.blue });
  k.text(px + 92, py + 15, '1年', { 'font-size': 11, fill: pal.coralDark, 'text-anchor': 'end' });
  [22, 30].forEach((y) => el('line', { x1: px + 10, x2: px + 100, y1: py + y, y2: py + y, stroke: pal.line, 'stroke-width': 2.4, 'stroke-linecap': 'round' }));
  el('line', { x1: px + 14, x2: px + 70, y1: py + 44, y2: py + 44, stroke: pal.sub, 'stroke-width': 1.5 });
  const sig = el('path', { d: `M ${px + 18} ${py + 40} q 6 -16 10 0 t 10 -2 q 6 -12 10 0 q 4 6 14 -6 l 10 4`, fill: 'none', stroke: pal.blueDark, 'stroke-width': 2.4, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', pathLength: 100, 'stroke-dasharray': 100 });
  const pen = el('line', { stroke: pal.ink, 'stroke-width': 4, 'stroke-linecap': 'round' });
  const ok = g({}); el('circle', { r: 13, fill: pal.green }, ok); el('path', { d: 'M -6 0 l 4 5 l 9 -10', fill: 'none', stroke: '#fff', 'stroke-width': 3.4, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, ok);
  return {
    update(t) {
      const w = seg(t, 1.0, 2.9), len = easeInOut(w) * 100;
      const pt = sig.getPointAtLength(len * sig.getTotalLength() / 100);
      const wr = w > 0 && w < 1 ? 1 : 0, bob = w >= 1 ? 1 : 0;
      const tx = lerp(px + 16, pt.x, seg(t, 0.4, 1.0)), ty = lerp(py - 14, pt.y, seg(t, 0.4, 1.0));
      P(b, { armL: 8, armR: 8, look: 0.4, lean: 5 * seg(t, 0.5, 1.0), mood: t > 3.0 ? 'grin' : 'flat', blink: blinkAt(t) });
      b.pose({ armR: lerp(25, reach(b, S, 'R', tx - 12, ty - 14), easeOut(seg(t, 0.2, 0.9))) });
      const hx = tx - 12 + 12 * 0, hy = ty - 14;
      k.set(pen, { x1: tx, y1: ty, x2: tx - 12, y2: ty - 14 });
      pen.setAttribute('opacity', seg(t, 0.55, 0.65));
      sig.setAttribute('stroke-dashoffset', String(100 - len));
      P(boss, { facing: -1, look: 0.7, mood: 'smile', blink: blinkAt(t, 1) });
      k.tf(ok, px + 94, py + 36, 0, backOut(seg(t, 3.0, 3.5)) + 0.001, backOut(seg(t, 3.0, 3.5)) + 0.001);
    }
  };
}
