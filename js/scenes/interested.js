// interested：博物館で日本の歴史の展示（かぶと・お城の絵）を見つけ、まめが身を乗り出して目を輝かせる（例文 I'm interested in Japanese history.）
import { seg, lerp, easeInOut, easeOut, hump, clamp } from '../ease.js';
import { P, blinkAt, walkTo, path, sc, pop } from './member.js';
import { star } from './get-on-with.js';

export const meta = { duration: 4.4, beats: [[0, '博物館'], [1.4, '身を乗り出す'], [2.6, '興味しんしん']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 1, FY = 236;
  k.backdrop({ floorY: FY, mood: 'indoor' });
  el('rect', { x: 0, y: 0, width: 400, height: FY, fill: '#EFE8DE' });
  el('rect', { x: 0, y: FY - 10, width: 400, height: 10, fill: '#D8CBB8' });
  // お城の絵
  el('rect', { x: 20, y: 40, width: 110, height: 80, fill: '#F7F1E3', stroke: pal.woodDark, 'stroke-width': 6 });
  el('rect', { x: 50, y: 92, width: 50, height: 20, fill: '#fff' }); el('path', { d: 'M 42 94 L 75 80 L 108 94 Z', fill: '#5B6670' });
  el('rect', { x: 58, y: 66, width: 34, height: 16, fill: '#fff' }); el('path', { d: 'M 52 68 L 75 56 L 98 68 Z', fill: '#5B6670' });
  // 展示ケースとかぶと
  const CX = 270;
  el('rect', { x: CX - 40, y: FY - 70, width: 80, height: 70, fill: '#C9A577' });
  el('rect', { x: CX - 46, y: FY - 160, width: 92, height: 90, rx: 3, fill: '#DDEFFA', opacity: 0.55, stroke: '#B9CBDD', 'stroke-width': 3 });
  const kb = g({}); tf(kb, CX, FY - 86);
  el('path', { d: 'M -22 0 Q -24 -34 0 -36 Q 24 -34 22 0 Z', fill: '#3A3F4B' }, kb);
  el('path', { d: 'M -30 -2 L -18 -6 L -18 10 L -30 12 Z M 30 -2 L 18 -6 L 18 10 L 30 12 Z', fill: '#B8475A' }, kb);
  el('path', { d: 'M 0 -30 Q -24 -46 -26 -66 Q -14 -50 0 -42 Q 14 -50 26 -66 Q 24 -46 0 -30 Z', fill: pal.yellow, stroke: pal.yellowDark, 'stroke-width': 1.5 }, kb);
  el('circle', { cx: 0, cy: -26, r: 4, fill: pal.yellowDark }, kb);
  el('rect', { x: CX - 22, y: FY - 54, width: 44, height: 14, rx: 2, fill: '#fff' }); k.text(CX, FY - 47, 'EDO 1600', { 'font-size': 7, fill: pal.ink });
  const b = k.buddy({ x: -40, y: FY, scale: S, facing: 1 });
  const stars = [0, 1].map(() => star(k, k.root, 7));
  const bang = k.text(0, 0, '!', { 'font-size': 26, fill: pal.coralDark });
  const bx = path([[0.1, -40], [1.1, 130], [1.6, 130], [2.2, 182]]);
  return {
    update(t) {
      const w = walkTo(bx, t, -40, 1), stop = seg(t, 1.1, 1.3), lean = easeInOut(seg(t, 2.1, 2.6));
      P(b, { x: w.x, walk: w.walk, armL: w.armL, armR: w.armR, lean: w.lean + 16 * lean, look: lerp(0.4, 1, stop), blink: t > 2.4 ? 0 : blinkAt(t), mood: t > 1.2 ? (t > 2.4 ? 'grin' : 'open') : 'smile', lift: 8 * hump(seg(t, 1.2, 1.5)) });
      if (t > 2.4) b.pose({ armR: 60 + 4 * Math.sin(t * 6), armL: 50 });
      const sp = seg(t, 2.5, 2.8) * (1 + 0.15 * Math.sin(t * 10));
      // 目の上にきらきら
      stars.forEach((s, i) => tf(s, w.x + (i ? 24 : 6) + 14 * lean, FY - 84 + 6 * lean, t * 90, sc(sp) * 0.9));
      tf(bang, w.x + 16, FY - 124 - 6 * hump(seg(t, 1.2, 1.6)), 0, pop(seg(t, 1.2, 1.5)) * (1 - seg(t, 2.2, 2.4) * 0.999));
    }
  };
}
