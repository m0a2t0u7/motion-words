// out of curiosity：通りすがりに「？」の箱が気になって引き返し、首をかしげてから、ふたをそっと開けてのぞく（例文 I opened the box out of curiosity.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';
import { P, reach, walk, path } from './in-common.js';

export const meta = { duration: 4.4, beats: [[0, '通りすがり'], [1.4, '何だろう？'], [3.0, '開けてみた']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 240, mood: 'indoor' });
  el('rect', { x: 0, y: FY - 6, width: 400, height: 6, fill: pal.line });
  el('rect', { x: 250, y: 46, width: 90, height: 64, rx: 6, fill: '#DDEFFA', stroke: '#fff', 'stroke-width': 5 });
  // 台と箱
  k.shadow(200, FY, 50, 4);
  el('rect', { x: 160, y: 196, width: 80, height: FY - 196, rx: 4, fill: pal.wood });
  el('rect', { x: 156, y: 192, width: 88, height: 6, rx: 3, fill: pal.woodDark });
  const glow = el('path', { d: 'M 182 170 L 160 110 L 240 110 L 218 170 Z', fill: '#FFF3C4', opacity: 0 });
  el('rect', { x: 178, y: 162, width: 44, height: 30, rx: 3, fill: pal.violet });
  el('rect', { x: 196, y: 162, width: 8, height: 30, fill: pal.yellow });
  const qm = k.text(200, 180, '?', { 'font-size': 16, fill: '#fff' });
  const lid = g({});
  el('rect', { x: 0, y: -8, width: 50, height: 9, rx: 3, fill: '#8C70DD' }, lid);
  el('rect', { x: 21, y: -8, width: 8, height: 9, fill: pal.yellowDark }, lid);
  const A = k.buddy({ x: -40, y: FY, scale: 0.88 });
  const think = k.text(0, 0, '?', { 'font-size': 26, fill: pal.violet });
  const xa = path([[0.0, -40], [1.1, 290], [1.3, 290], [2.1, 246]]);
  return {
    update(t) {
      walk(A, xa, t, { facing: t < 1.2 ? 1 : -1, look: t > 0.7 && t < 1.2 ? -0.9 : 0.6, mood: t > 3.4 ? 'open' : 'smile' });
      // 気になる：首をかしげる
      const tilt = hump(seg(t, 2.1, 2.8));
      const open = easeInOut(seg(t, 2.8, 3.4));
      const peek = easeOut(seg(t, 3.4, 3.9));
      if (t > 2.1) A.pose({ lean: -10 * tilt + 18 * peek, look: 0.7 });
      if (t > 2.7) A.pose({ armR: reach(A, 0.88, 'R', lerp(226, 200, open), lerp(172, 138, open)), armL: 20 });
      tf(think, A.state.x + (t < 1.2 ? 0 : -6), FY - 120 - 4 * Math.sin(t * 5), 0, t > 0.8 && t < 2.9 ? easeOut(seg(t, 0.8, 1.1)) : 0.001);
      // ふた：右の端を蝶番にして持ち上がる（まめの手で）
      tf(lid, 172, 162, -110 * open, 1);
      tf(lid, 222, 162, 0); lid.setAttribute('transform', `translate(222 162) rotate(${(110 * open).toFixed(1)}) translate(-50 0)`);
      glow.setAttribute('opacity', 0.8 * open);
    }
  };
}
