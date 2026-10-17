// in hot water：上司に呼び出されて叱られ、湯気の立つ桶の中で縮こまる＝まずい立場（He is in hot water with his boss.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';

export const meta = { duration: 4.2, beats: [[0, '呼び出し'], [1.2, '叱られる'], [3.0, '縮こまる']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 244, mood: 'indoor' });
  el('rect', { x: 40, y: 50, width: 70, height: 58, rx: 8, fill: '#DDEFFA' });
  el('line', { x1: 75, y1: 50, x2: 75, y2: 108, stroke: '#fff', 'stroke-width': 4 });
  // 上司の机
  const boss = k.buddy({ x: 330, y: FY - 6, color: pal.coral, dark: pal.coralDark, facing: -1 });
  el('rect', { x: 262, y: 204, width: 138, height: 12, rx: 4, fill: pal.wood });
  el('rect', { x: 270, y: 216, width: 126, height: FY - 216, fill: pal.woodDark });
  const paper = g({});
  el('rect', { x: -12, y: -16, width: 24, height: 32, rx: 2, fill: '#fff', stroke: '#CBD3DF', 'stroke-width': 2 }, paper);
  el('path', { d: 'M -6 -8 L 6 6 M 6 -8 L -6 6', stroke: pal.red, 'stroke-width': 3, 'stroke-linecap': 'round' }, paper);
  // 本人：桶の中
  const mint = k.buddy({ x: 140, y: FY - 8 });
  k.shadow(140, FY + 2, 40, 7);
  const tubBack = el('ellipse', { cx: 140, cy: FY - 26, rx: 34, ry: 7, fill: '#B8E4F7' });
  el('path', { d: `M 104 ${FY - 26} L 108 ${FY} Q 140 ${FY + 8} 172 ${FY} L 176 ${FY - 26} Q 140 ${FY - 18} 104 ${FY - 26} Z`, fill: pal.blueDark });
  el('rect', { x: 106, y: FY - 16, width: 68, height: 4, fill: '#fff', opacity: 0.4 });
  const steam = [0, 1, 2].map(() => el('path', { d: 'M 0 0 q -5 -8 0 -16 t 0 -16', fill: 'none', stroke: '#B5C3D3', 'stroke-width': 3.5, 'stroke-linecap': 'round' }));
  const bub = [0, 1, 2].map(() => el('circle', { r: 3, fill: '#fff', opacity: 0.9, stroke: '#8FD3F4', 'stroke-width': 1.5 }));
  const shout = el('path', { d: 'M 0 0 L -18 -6 M 0 6 L -20 8 M 0 -10 L -14 -20', stroke: pal.red, 'stroke-width': 3, 'stroke-linecap': 'round', fill: 'none' });
  const vein = el('path', { d: 'M 0 -8 L 4 -2 L 8 -8 M 0 8 L 4 2 L 8 8', stroke: pal.red, 'stroke-width': 3, fill: 'none', 'stroke-linecap': 'round' });
  const sweat = el('path', { d: 'M 0 -7 Q 5 0 0 5 Q -5 0 0 -7 Z', fill: pal.water });
  return {
    update(t) {
      const ang = easeOut(seg(t, 1.0, 1.4)), shake = ang * Math.sin(t * 22);
      const cow = easeInOut(seg(t, 2.6, 3.4));
      boss.pose({
        armR: lerp(8, 100, ang) + 6 * shake, armL: lerp(8, 70, ang) + 4 * shake, lean: 6 * ang, look: -0.5,
        mood: ang > 0.3 ? (Math.sin(t * 16) > 0 ? 'open' : 'grin') : 'flat', squash: 1 + 0.02 * shake
      });
      const hold = t > 1.0 ? 1 : 0;
      tf(paper, 300, 196 - 4 * ang * Math.abs(Math.sin(t * 8)), 0, 1);
      mint.pose({
        lean: lerp(2, 14, cow) - 3 * ang * hump(seg(t, 1.0, 1.4)), squash: lerp(1, 0.9, cow), look: 0.6,
        armL: lerp(10, 22, cow), armR: lerp(10, 22, cow), mood: t < 1.1 ? 'flat' : 'sad', blink: 0
      });
      steam.forEach((s, i) => { const p = ((t * 0.5 + i / 3) % 1); tf(s, 100 + i * 34, FY - 28 - 30 * p, 0, 1); s.setAttribute('opacity', 0.8 * Math.sin(p * Math.PI)); });
      bub.forEach((b, i) => { const p = ((t * 0.9 + i * 0.37) % 1); k.set(b, { cx: 124 + i * 16 + 2 * Math.sin(t * 6 + i), cy: FY - 27 - 4 * p, r: 2 + 2 * p, opacity: 1 - p }); });
      tf(shout, 280, FY - 98, 0, ang * (1 + 0.15 * Math.sin(t * 16)));
      shout.setAttribute('opacity', ang > 0 && t < 3.4 ? 1 : 0);
      tf(vein, 322, FY - 108, 0, ang);
      const s = (t * 1.2) % 1;
      tf(sweat, 112, FY - 100 + 22 * s, 0, 1);
      sweat.setAttribute('opacity', t > 1.4 ? 1 - 0.5 * s : 0);
    }
  };
}
