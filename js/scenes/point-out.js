// point out：相手が持つ報告書の中の1行を指さし、間違い（2+2=5）を赤丸で示す（例文 She pointed out a mistake in the report.）
import { seg, lerp, easeInOut, easeOut, backOut, hump } from '../ease.js';
import { hp, reach, frontL } from './dig.js';
import { grip } from './hand-over.js';
import { drawOn } from './work-on.js';

export const meta = { duration: 4.2, beats: [[0, '報告書を見る'], [1.6, '指でさす'], [3.0, '間違いを示した']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  el('rect', { x: 150, y: 50, width: 100, height: 64, rx: 6, fill: '#DDEFFA', stroke: '#fff', 'stroke-width': 5 });
  el('rect', { x: 0, y: FY - 6, width: 400, height: 6, fill: pal.line });
  const S = 1.1;
  const C = k.buddy({ x: 96, y: FY, scale: S, color: pal.coral, dark: pal.coralDark });
  // 報告書（相手が胸の前で持つ）
  const rep = g({}); tf(rep, 168, 160);
  el('rect', { x: -32, y: -42, width: 64, height: 84, rx: 3, fill: '#fff', stroke: pal.line, 'stroke-width': 2 }, rep);
  el('rect', { x: -24, y: -34, width: 30, height: 6, rx: 3, fill: pal.blue }, rep);
  [-18, -8].forEach((y) => el('rect', { x: -24, y, width: 48, height: 4, rx: 2, fill: '#D9DFE7' }, rep));
  k.text(0, 8, '2+2=5', { 'font-size': 13, fill: pal.ink }, rep);
  [22, 30].forEach((y) => el('rect', { x: -24, y, width: 40, height: 4, rx: 2, fill: '#D9DFE7' }, rep));
  const ring = el('ellipse', { cx: 0, cy: 8, rx: 25, ry: 10, stroke: pal.red, 'stroke-width': 3, fill: 'none', transform: 'rotate(-4)' }, rep);
  const rOn = drawOn(ring);
  const bang = k.text(36, -2, '!', { 'font-size': 22, fill: pal.red }, rep);
  const gc = grip(k, pal.coral, pal.coralDark, S);
  const A = k.buddy({ x: 300, y: FY, scale: S, facing: -1 });
  return {
    update(t) {
      C.pose({ armR: 0, armL: 10, look: t > 2.4 ? 0.9 : 0.6, mood: t > 2.6 ? 'open' : 'smile', lean: -3 * hump(seg(t, 2.5, 3.0)) });
      C.pose({ armR: reach(C, S, 'R', 137, 168) });
      gc(hp(C, S, 'R'));
      const step = easeInOut(seg(t, 0.4, 1.3));
      const pt = easeInOut(seg(t, 1.4, 1.9)), tap = hump(seg(t, 2.0, 2.25)) + hump(seg(t, 2.25, 2.5));
      A.pose({ x: lerp(300, 252, step), walk: step > 0 && step < 1 ? (t - 0.4) * 9 : 0, lean: 6 * pt, look: 0.7, mood: t > 2.4 ? 'flat' : 'smile', armL: 10 });
      const tx = lerp(240, 186, pt) + 3 * tap, ty = lerp(220, 160, pt);
      A.pose({ armR: lerp(10, reach(A, S, 'R', tx, ty), pt) });
      rOn(easeOut(seg(t, 2.5, 3.1)));
      bang.setAttribute('opacity', seg(t, 3.0, 3.05));
    }
  };
}
