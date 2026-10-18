// owe：友だちが手を差し出して待ち、「私」は借用メモ($10)を持って頭をかく。まだ返していない（例文 I owe my friend ten dollars.）
import { seg, lerp, easeOut, backOut, wobble } from '../ease.js';
import { hp, reach } from './dig.js';

export const meta = { duration: 4.0, beats: [[0, '向かい合う'], [1.3, '10ドルの借り'], [3.0, 'まだ返せない']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  el('rect', { x: 150, y: 48, width: 100, height: 66, rx: 6, fill: '#DDEFFA', stroke: '#fff', 'stroke-width': 5 });
  el('rect', { x: 0, y: FY - 4, width: 400, height: 4, fill: pal.line });
  const me = k.buddy({ x: 120, y: FY });
  const fr = k.buddy({ x: 290, y: FY, facing: -1, color: pal.coral, dark: pal.coralDark });
  const slip = g({});
  el('rect', { x: -15, y: -11, width: 30, height: 22, rx: 3, fill: '#FFF8D6', stroke: pal.yellowDark, 'stroke-width': 1.6 }, slip);
  k.text(0, 0, '$10', { 'font-size': 12, fill: pal.red }, slip);
  const arr = el('path', { d: '', fill: 'none', stroke: pal.red, 'stroke-width': 3, 'stroke-dasharray': '7 6', 'stroke-linecap': 'round' });
  const head = el('path', { d: 'M -8 -6 L 2 0 L -8 6', fill: 'none', stroke: pal.red, 'stroke-width': 3, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' });
  const sweat = el('path', { d: 'M 0 -6 Q 5 2 0 6 Q -5 2 0 -6 Z', fill: pal.water });
  return {
    update(t) {
      const out = easeOut(seg(t, 0.5, 1.2)), sc = easeOut(seg(t, 2.6, 3.2));
      me.pose({ armR: lerp(8, 75, out), armL: lerp(8, 150, sc), lean: -3 * sc, mood: t > 2.6 ? 'sad' : 'smile', look: 0.6, squash: 1 + 0.01 * Math.sin(t * 4) });
      fr.pose({ armR: lerp(8, 95, out) + 4 * wobble(seg(t, 1.2, 3.8), 3, 1), mood: 'flat', look: 0.6 });
      const h = hp(me, 1, 'R');
      tf(slip, h.x + 10, h.y - 6, -8 + 3 * Math.sin(t * 3));
      // 友だち→私へ戻すべき10ドルを示す矢印（私から友だちへ）
      const a = seg(t, 1.3, 2.0), x0 = 150, x1 = 150 + 100 * a;
      k.set(arr, { d: `M ${x0} 150 Q 205 ${118 - 10 * a} ${x1} 150`, opacity: a > 0 ? 1 : 0 });
      k.set(arr, { 'stroke-dashoffset': -t * 16 });
      tf(head, x1 + 2, 150, 0); head.setAttribute('opacity', a > 0.9 ? 1 : 0);
      tf(sweat, 112, 150, 0, backOut(sc, 1.2), backOut(sc, 1.2));
    }
  };
}
