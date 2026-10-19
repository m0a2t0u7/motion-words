// fever：学校に行かず家のベッドで寝ている子。体温計がぐんぐん上がり、母がおでこに手を当てる（例文 The child stayed home from school because he had a high fever.）
import { seg, lerp, easeInOut, easeOut, hump, clamp, wobble } from '../ease.js';
import { P, reach, thermo, lying, bed } from './hospital.js';

export const meta = { duration: 4.4, beats: [[0, '家で寝ている'], [1.2, '熱が上がる'], [3.0, '高い熱']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 246, mood: 'indoor' });
  // 窓の外に学校
  el('rect', { x: 26, y: 40, width: 110, height: 78, rx: 6, fill: '#DDEFFA' });
  el('rect', { x: 50, y: 74, width: 64, height: 44, fill: '#F6E3C8' });
  el('path', { d: 'M 46 76 L 82 58 L 118 76 Z', fill: pal.coral });
  el('circle', { cx: 82, cy: 70, r: 5, fill: '#fff', stroke: pal.ink, 'stroke-width': 1.5 });
  [58, 76, 94].forEach((x) => el('rect', { x, y: 86, width: 10, height: 10, fill: '#CFE9F7' }));
  el('rect', { x: 26, y: 40, width: 110, height: 78, rx: 6, fill: 'none', stroke: '#fff', 'stroke-width': 5 });
  el('line', { x1: 81, y1: 40, x2: 81, y2: 118, stroke: '#fff', 'stroke-width': 4 });
  // かかったままのランドセル
  el('circle', { cx: 170, cy: 60, r: 3, fill: pal.woodDark });
  el('path', { d: 'M 162 66 Q 170 58 178 66', fill: 'none', stroke: pal.ink, 'stroke-width': 2 });
  el('rect', { x: 156, y: 64, width: 28, height: 32, rx: 7, fill: pal.red });
  el('rect', { x: 156, y: 64, width: 28, height: 14, rx: 7, fill: '#D85448' });
  const X0 = 120, B = bed(k, X0, FY, 200, '#9CC7F2');
  const S = 0.62, gx = X0 + 76, gy = B.MT - 15;
  const L = lying(k, {});
  tf(L.grp, gx, gy, 90, S);
  const flush = [0, 1].map(() => el('ellipse', { rx: 4, ry: 3.2, fill: pal.red }));
  B.front(X0 + 6, gx + 26, gy - 16);
  const th = thermo(k);

  const heat = [0, 1, 2].map(() => el('path', { d: 'M 0 0 q 5 -6 0 -12 q -5 -6 0 -12', fill: 'none', stroke: pal.coral, 'stroke-width': 2.6, 'stroke-linecap': 'round' }));
  const mom = k.buddy({ x: 368, y: FY, scale: 0.86, facing: -1, color: pal.coral, dark: pal.coralDark });
  // 顔の位置（寝ている向きに合わせて）
  const mouth = { x: gx + 53 * S, y: gy }, brow = { x: gx + 76 * S, y: gy };
  return {
    update(t) {
      const lv = easeInOut(seg(t, 0.6, 2.8));
      const hot = 0.5 + 0.5 * Math.sin(t * 7);
      P(L.b, { mood: t > 1.6 ? 'sad' : 'flat', blink: 0.55 + 0.2 * hot * lv, squash: 1 + 0.01 * Math.sin(t * 3) });
      flush.forEach((f, i) => { k.set(f, { cx: gx + 44 * S, cy: gy + (i ? 18 : -18) * S, opacity: 0.25 + 0.6 * lv * (0.7 + 0.3 * hot) }); });
      tf(th.g, mouth.x + 1, mouth.y - 2, 64, 0.8);
      th.set(0.15 + 0.82 * lv);
      // 母が来て、おでこに手を当てる
      const come = easeInOut(seg(t, 2.2, 3.1)), touch = easeOut(seg(t, 3.1, 3.6));
      P(mom, { x: lerp(368, 300, come), walk: come * 9, facing: -1, mood: t > 3.2 ? 'sad' : 'flat', look: 0.3, lean: 6 * touch });
      P(mom, { ...mom.state, armR: lerp(8, reach(mom, 0.86, 'R', brow.x + 4, brow.y - 10), touch) });


      heat.forEach((h, i) => {
        const q = ((t * 0.9 + i / 3) % 1);
        tf(h, gx + (44 + i * 12) * S, gy - 22 - 26 * q);
        h.setAttribute('opacity', lv * Math.sin(q * Math.PI) * 0.9);
      });
    }
  };
}
