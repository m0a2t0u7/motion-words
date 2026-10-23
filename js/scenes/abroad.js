// abroad：まめが飛行機で海をこえ、海外の学校の前に着く（例文 She wants to study abroad next year.）
import { seg, lerp, easeInOut, easeOut, hump, clamp } from '../ease.js';
import { P, blinkAt, walkTo } from './run-after.js';

export const meta = { duration: 4.4, beats: [[0, '自国の島'], [1.4, '飛行機で海外へ'], [3.6, '海外の学校']] };

export function create(k) {
  const { el, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'outdoor' });
  el('rect', { x: 0, y: FY, width: 400, height: 64, fill: '#DCEFD9' });
  el('rect', { x: 150, y: FY - 2, width: 112, height: 70, fill: pal.water });
  [0, 1, 2].forEach((i) => el('path', { d: `M ${168 + i * 34} ${FY + 18 + (i % 2) * 14} q 8 -6 16 0 t 16 0`, fill: 'none', stroke: '#fff', 'stroke-width': 2.4, 'stroke-linecap': 'round', opacity: 0.8 }));
  // 左：家
  el('rect', { x: 20, y: FY - 62, width: 62, height: 62, fill: '#F6E3C2' });
  el('path', { d: `M 12 ${FY - 60} L 51 ${FY - 92} L 90 ${FY - 60} Z`, fill: pal.coral });
  el('rect', { x: 42, y: FY - 34, width: 18, height: 34, rx: 3, fill: pal.woodDark });
  // 右：学校（旗と本のマーク）
  el('rect', { x: 296, y: FY - 70, width: 88, height: 70, fill: '#EBD7FF' });
  el('rect', { x: 290, y: FY - 78, width: 100, height: 10, rx: 3, fill: pal.violet });
  el('rect', { x: 332, y: FY - 38, width: 18, height: 38, rx: 3, fill: pal.woodDark });
  [306, 362].forEach((x) => el('rect', { x, y: FY - 54, width: 14, height: 16, rx: 2, fill: '#DDEFFA' }));
  el('line', { x1: 340, y1: FY - 78, x2: 340, y2: FY - 106, stroke: pal.sub, 'stroke-width': 3 });
  el('path', { d: `M 340 ${FY - 106} h 22 v 14 h -22 Z`, fill: pal.yellow });
  // 飛行機（右向き、原点＝機体の中心）
  const pl = k.g({});
  el('ellipse', { rx: 30, ry: 9, fill: '#fff', stroke: pal.line, 'stroke-width': 2 }, pl);
  el('path', { d: 'M -8 0 L -22 -22 L -12 -22 L 8 0 Z', fill: pal.blue }, pl);
  el('path', { d: 'M -8 2 L -20 18 L -10 18 L 8 2 Z', fill: pal.blueDark }, pl);
  el('path', { d: 'M -26 -4 L -34 -16 L -27 -16 L -18 -4 Z', fill: pal.blue }, pl);
  [8, 14, 20].forEach((x) => el('circle', { cx: x - 8, cy: -2, r: 2.2, fill: pal.blue }, pl));
  const b = k.buddy({ x: 40, y: FY + 4, scale: 0.8 });
  const b2 = k.buddy({ x: 300, y: FY + 4, scale: 0.8, color: pal.coral, dark: pal.coralDark });
  const px = (t) => lerp(122, 330, easeInOut(seg(t, 1.5, 3.4)));
  const bxf = (tt) => lerp(40, 92, easeInOut(seg(tt, 0.3, 1.1)));
  return {
    update(t) {
      const fly = clamp(seg(t, 1.5, 3.4)), land = seg(t, 3.3, 3.8);
      const o = walkTo(bxf, t, 40);
      P(b, { ...o, armR: o.m > 0.2 ? o.armR : 8, mood: 'grin', blink: blinkAt(t), y: t > 1.15 ? 1000 : FY + 4 });
      const arc = Math.sin(Math.PI * fly);
      k.tf(pl, px(t), FY - 10 - 100 * arc, -12 * Math.cos(Math.PI * fly) * (arc > 0.02 ? 1 : 0));
      pl.setAttribute('opacity', 1 - clamp((t - 3.55) / 0.35));
      P(b2, { y: t > 3.5 ? FY + 4 : 1000, armR: 8 + 150 * hump(seg(t, 3.6, 4.2)), mood: 'grin', look: 0.2, blink: blinkAt(t, 1), squash: 1 + 0.04 * hump(seg(t, 3.5, 3.8)) });
    }
  };
}
