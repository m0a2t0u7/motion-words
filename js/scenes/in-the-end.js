// in the end：青い車と赤い車の間で長いこと迷い（時計が進む）、最後に2人で赤い車に決める（例文 In the end, we chose the red car.）
import { seg, lerp, easeInOut, easeOut, hump, wobble } from '../ease.js';
import { P, car, clock, popIn } from './in-common.js';

export const meta = { duration: 4.4, beats: [[0, 'どっちにする？'], [1.4, '迷い続ける'], [3.2, '結局、赤']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  el('rect', { x: 0, y: FY - 8, width: 400, height: 8, fill: '#E6E1D8' });
  [[20, 30], [300, 30]].forEach(([x, y]) => el('rect', { x, y, width: 80, height: 70, rx: 6, fill: '#DDEFFA', stroke: '#fff', 'stroke-width': 5 }));
  const ck = clock(k, 200, 54, 22);
  el('ellipse', { cx: 80, cy: FY + 2, rx: 84, ry: 9, fill: '#E3E7EC' });
  el('ellipse', { cx: 320, cy: FY + 2, rx: 84, ry: 9, fill: '#E3E7EC' });
  const blue = car(k, pal.blue, pal.blueDark, true), red = car(k, pal.red, '#C8473C', true);
  const A = k.buddy({ x: 170, y: FY + 14, scale: 0.78 });
  const C = k.buddy({ x: 232, y: FY + 14, scale: 0.78, color: pal.coral, dark: pal.coralDark, facing: -1 });
  const qs = [0, 1].map(() => { const q = k.text(0, 0, '?', { 'font-size': 22, fill: pal.sub }); return q; });
  const badge = g({}); el('circle', { r: 15, fill: pal.green }, badge); el('path', { d: 'M -7 0 L -2 5 L 7 -5', stroke: '#fff', 'stroke-width': 3.5, fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, badge);
  return {
    update(t) {
      // 時計が速く進む＝長いあいだ迷った
      const m = 600 * easeInOut(seg(t, 0.2, 3.0));
      ck.set(10 + m / 60, m % 60);
      // 左右を見比べる（だんだん…最後は赤）
      const sw = t < 3.0 ? Math.sin(t * 4.2) : 1;
      const dec = easeOut(seg(t, 3.0, 3.4));
      const lookDir = lerp(sw, 1, dec);
      const fA = lookDir < 0 ? -1 : 1;
      const fC = lookDir < 0 ? -1 : 1;
      const dz = t < 3.0 ? 1 : 0;
      P(A, { facing: fA, look: 0.6, mood: t > 3.2 ? 'grin' : 'flat', armR: lerp(8, 95, dec), lean: -3 * dz, squash: 1 + 0.01 * Math.sin(t * 6) });
      P(C, { facing: fC, look: 0.6, mood: t > 3.25 ? 'grin' : 'flat', armR: lerp(8, 95, easeOut(seg(t, 3.1, 3.5))) });
      qs.forEach((q, i) => { const x = i ? 232 : 170; const vis = t > 0.3 && t < 3.0; tf(q, x + Math.sin(t * 3 + i) * 3, 132 - 4 * Math.abs(Math.sin(t * 4 + i)), 0, vis ? 1 : 0.001); });
      blue.set(80, 0, FY);
      red.set(320, 0, FY);
      tf(badge, 320, 140, 0, popIn(seg(t, 3.4, 3.8)));
    }
  };
}
