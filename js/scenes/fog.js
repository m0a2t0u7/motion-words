// fog：濃い霧で前が見えず、まめが両手を前に出して手さぐりで、そろそろ進む（例文 The fog was so thick I couldn't see.）
import { seg, lerp, easeInOut, easeOut, clamp, hump } from '../ease.js';
import { scene, treeG, gait, P, blinkAt, mark } from './nature.js';

export const meta = { duration: 4.4, beats: [[0, '霧が濃くなる'], [1.4, '何も見えない'], [3.0, '手さぐり']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 1;
  const { FY } = scene(k, { FY: 238, top: '#D9E0E6', bot: '#EEF1F3', ground: '#D2DBD3', edge: '#C3CEC5' });
  [[60, 0.9], [170, 1.1], [330, 1.2], [270, 0.8]].forEach(([x, s]) => tf(treeG(k, s, '#A9BFB0', '#9DB4A5').g, x, FY + 2));
  el('rect', { x: 352, y: FY - 70, width: 6, height: 70, fill: pal.woodDark });
  el('rect', { x: 334, y: FY - 80, width: 44, height: 22, rx: 3, fill: pal.wood });
  const back = el('rect', { x: 0, y: 0, width: 400, height: 300, fill: '#F2F4F6', opacity: 0 });
  const b = k.buddy({ x: 70, y: FY, scale: S });
  const layers = [0, 1, 2, 3, 4, 5].map(() => el('ellipse', { rx: 160, ry: 40, fill: '#F7F8FA', opacity: 0 }));
  const q = mark(k, '?', pal.sub);
  const xf = (t) => lerp(70, 210, easeInOut(seg(t, 0.8, 4.2)));
  return {
    update(t) {
      const th = easeInOut(seg(t, 0, 1.6));
      back.setAttribute('opacity', 0.75 * th);
      layers.forEach((n, i) => {
        const x = ((t * (12 + i * 5) + i * 130) % 640) - 120, y = 60 + i * 34;
        k.set(n, { cx: x, cy: y, opacity: (0.5 * th).toFixed(2) });
      });
      const w = gait(xf, t, 70, 4, 0.16);
      const fw = easeOut(seg(t, 1.0, 1.6));
      P(b, { x: w.x, walk: w.walk, lean: 6 * fw, armR: lerp(8, 92, fw) + 8 * Math.sin(t * 5), armL: lerp(8, 70, fw) - 8 * Math.sin(t * 5 + 1), look: 0.2 * Math.sin(t * 2.2), mood: 'flat', blink: Math.max(blinkAt(t), 0.5 * th) });
      q.show(seg(t, 1.8, 2.3), w.x + 30, FY - 128);
    }
  };
}
