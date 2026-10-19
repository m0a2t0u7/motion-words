// root：地面の断面図。木の根が土の中へ、深く深くのびていく。まめが「こんなに深い」と下を指さす（例文 The tree's roots go deep.）
import { seg, lerp, easeInOut, easeOut } from '../ease.js';
import { scene, treeG, P, blinkAt, point } from './nature.js';

export const meta = { duration: 4.4, beats: [[0, '木と地面'], [1.0, '根がのびる'], [3.0, '根が深い']] };

export function create(k) {
  const { el, tf, pal } = k, S = 0.8;
  const FY = 130;
  scene(k, { FY, top: '#BFE0F7', bot: '#EEF8FD', ground: '#8E6B4E', edge: '#6FA36F' });
  el('rect', { x: 0, y: FY, width: 400, height: 8, fill: '#7FBF7F' });
  el('rect', { x: 0, y: FY + 60, width: 400, height: 60, fill: '#7E5D42' });
  el('rect', { x: 0, y: FY + 120, width: 400, height: 60, fill: '#6E5038' });
  [[40, 170], [330, 200], [80, 260], [300, 280]].forEach(([x, y]) => el('ellipse', { cx: x, cy: y, rx: 10, ry: 6, fill: '#A08A74' }));
  const RX = 230;
  const roots = [
    `M ${RX} ${FY} Q ${RX - 4} ${FY + 60} ${RX + 6} ${FY + 120} Q ${RX + 10} ${FY + 150} ${RX} ${FY + 168}`,
    `M ${RX} ${FY + 4} Q ${RX - 40} ${FY + 40} ${RX - 70} ${FY + 110} Q ${RX - 80} ${FY + 130} ${RX - 76} ${FY + 150}`,
    `M ${RX} ${FY + 4} Q ${RX + 50} ${FY + 30} ${RX + 80} ${FY + 100} Q ${RX + 92} ${FY + 126} ${RX + 110} ${FY + 140}`,
    `M ${RX - 30} ${FY + 50} Q ${RX - 70} ${FY + 60} ${RX - 110} ${FY + 70}`,
    `M ${RX + 40} ${FY + 50} Q ${RX + 60} ${FY + 80} ${RX + 40} ${FY + 120}`
  ].map((d, i) => el('path', { d, stroke: '#D9B892', 'stroke-width': i < 3 ? 7 - i : 3, fill: 'none', 'stroke-linecap': 'round', 'stroke-dasharray': '400', 'stroke-dashoffset': 400 }));
  const tr = treeG(k, 1.1); tf(tr.g, RX, FY + 2);
  const arrow = el('path', { d: '', stroke: pal.coral, 'stroke-width': 3, fill: 'none', 'stroke-linecap': 'round' });
  const b = k.buddy({ x: 100, y: FY, scale: S });
  return {
    update(t) {
      roots.forEach((r, i) => r.setAttribute('stroke-dashoffset', (400 - 400 * easeOut(seg(t, 0.6 + i * 0.25, 3.0 + i * 0.15))).toFixed(1)));
      const a = easeOut(seg(t, 2.8, 3.4));
      arrow.setAttribute('d', a > 0 ? `M 330 ${FY + 6} V ${FY + 6 + 160 * a} M 322 ${FY - 2 + 160 * a} L 330 ${FY + 8 + 160 * a} L 338 ${FY - 2 + 160 * a}` : '');
      const pt = easeOut(seg(t, 1.2, 1.7));
      P(b, { look: 0.5, mood: t > 3 ? 'open' : 'smile', blink: blinkAt(t), armL: 12, lean: 6 * pt });
      b.body.children[3].setAttribute('transform', `translate(4 ${(3 * pt).toFixed(1)})`);
      b.pose({ armR: lerp(8, point(b, S, 'R', RX - 20, lerp(FY + 30, FY + 150, easeInOut(seg(t, 1.4, 3.2)))), pt) });
    }
  };
}
