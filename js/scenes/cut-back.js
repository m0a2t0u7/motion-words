// cut back：会社の会議で、去年と同じ高さの今年の支出の棒を、まめが手で押し下げて低くする（例文 The company cut back its spending this year.）
import { seg, lerp, easeInOut, easeOut, wobble, hump } from '../ease.js';
import { hp, reach } from './dig.js';

export const meta = { duration: 4.4, beats: [[0, '支出が多い'], [1.6, '押し下げる'], [3.4, '今年は減った']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  el('rect', { x: 330, y: 50, width: 52, height: 64, rx: 6, fill: '#DDEFFA', stroke: '#fff', 'stroke-width': 5 });
  // グラフのパネル（床置きの大きなボード）
  el('rect', { x: 30, y: 46, width: 230, height: 174, rx: 6, fill: '#fff', stroke: '#B9C3D0', 'stroke-width': 4 });
  el('rect', { x: 60, y: 220, width: 6, height: 16, fill: '#B9C3D0' }); el('rect', { x: 224, y: 220, width: 6, height: 16, fill: '#B9C3D0' });
  k.shadow(145, FY, 110, 4);
  const BY = 200;
  el('line', { x1: 50, y1: BY, x2: 240, y2: BY, stroke: pal.sub, 'stroke-width': 2 });
  // 去年（左）・今年（右）。棒の上に硬貨の印
  const coin = (x, y) => { el('circle', { cx: x, cy: y, r: 9, fill: pal.yellow, stroke: pal.yellowDark, 'stroke-width': 2 }); el('rect', { x: x - 1.5, y: y - 5, width: 3, height: 10, rx: 1, fill: pal.yellowDark }); };
  el('rect', { x: 78, y: 70, width: 50, height: BY - 70, rx: 3, fill: '#C3CBD6' });
  coin(103, 60);
  const bar = el('rect', { x: 156, y: 70, width: 50, height: BY - 70, rx: 3, fill: pal.blue });
  const cg = g({}); el('circle', { r: 9, fill: pal.yellow, stroke: pal.yellowDark, 'stroke-width': 2 }, cg); el('rect', { x: -1.5, y: -5, width: 3, height: 10, rx: 1, fill: pal.yellowDark }, cg);
  const arr = el('path', { d: 'M 0 0 L 0 26 M -7 18 L 0 26 L 7 18', stroke: pal.red, 'stroke-width': 4, fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' });
  // 会社の人（ネクタイ）
  const S = 1.2;
  const b = k.buddy({ x: 300, y: FY, scale: S, facing: -1 });
  el('path', { d: 'M -4 -34 L 4 -34 L 6 -14 L 0 -8 L -6 -14 Z', fill: pal.red }, b.body);
  return {
    update(t) {
      const push = easeInOut(seg(t, 1.3, 2.9));
      const st = wobble(seg(t, 2.9, 3.5), 2, 6);
      const top = lerp(70, 130, push) + 2 * st;
      k.set(bar, { y: top, height: BY - top });
      tf(cg, 181, top - 10 * (1 - easeOut(seg(t, 0, 0.1))) - 10);
      // 手は棒の上端に乗って押し下げる
      const app = easeInOut(seg(t, 0.4, 1.2));
      const tx = 181, ty = top - 22;
      b.pose({ x: lerp(300, 252, app), walk: app > 0 && app < 1 ? (t - 0.4) * 9 : 0, lean: 10 * push * (1 - seg(t, 3.0, 3.4)), squash: 1 - 0.08 * hump(seg(t, 1.3, 2.9)), look: 0.6, mood: t > 3.1 ? 'grin' : 'flat', armL: 10 });
      const back = easeInOut(seg(t, 3.1, 3.5));
      b.pose({ armR: lerp(lerp(15, reach(b, S, 'R', tx + 8, ty), app), 20, back) });
      arr.setAttribute('opacity', seg(t, 3.3, 3.5));
      tf(arr, 228, 98 + 4 * Math.sin(t * 6) * seg(t, 3.5, 3.7));
    }
  };
}
