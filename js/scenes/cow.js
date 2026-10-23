// cow：まめが牛の乳をしぼると、白い牛乳がバケツにたまっていく（例文 The cow gives us milk.）
import { seg, lerp, easeInOut, easeOut, hump, clamp } from '../ease.js';
import { P, blinkAt } from './run-after.js';
import { scene, hills, cloudG } from './nature.js';
import { beast, heartG } from './animal.js';
import { rails } from './field.js';

export const meta = { duration: 4.4, beats: [[0, '牛のそば'], [1.0, '乳をしぼる'], [3.4, '牛乳がとれた']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const { FY } = scene(k, { FY: 230, top: '#CDE9FA', bot: '#F2FAFE', ground: '#BFE3A4', edge: '#A9D690' });
  tf(cloudG(k, 80, 30), 80, 50); hills(k, FY);
  // 牛小屋の板壁
  el('rect', { x: 0, y: 90, width: 400, height: FY - 90, fill: '#E9C99A' });
  for (let x = 0; x < 400; x += 26) el('rect', { x, y: 90, width: 2, height: FY - 90, fill: '#D4AF7C' });
  el('rect', { x: 0, y: 84, width: 400, height: 10, fill: '#C9A577' });
  el('rect', { x: 0, y: FY, width: 400, height: 70, fill: '#E6D2A8' });
  [[60, 262], [340, 270]].forEach(([x, y]) => el('path', { d: `M ${x - 20} ${y} q 10 -10 20 -2 q 10 -8 20 2 Z`, fill: '#F2D27A' }));
  const cw = beast(k, 'cow');
  const S = 1.5, CX = 236, CY = FY + 22;
  // 小さないす・バケツ
  el('rect', { x: 158, y: CY - 20, width: 34, height: 6, rx: 2, fill: pal.woodDark }); el('rect', { x: 164, y: CY - 14, width: 5, height: 14, fill: pal.woodDark }); el('rect', { x: 181, y: CY - 14, width: 5, height: 14, fill: pal.woodDark });
  const me = k.buddy({ x: 176, y: CY - 14, scale: 0.75 });
  const BX = 238, BYb = CY;
  k.shadow(BX, BYb, 22, 4);
  const milk = el('rect', { x: BX - 15, y: BYb - 4, width: 30, height: 0, fill: '#fff' });
  el('path', { d: `M ${BX - 18} ${BYb - 30} L ${BX + 18} ${BYb - 30} L ${BX + 14} ${BYb} L ${BX - 14} ${BYb} Z`, fill: 'none', stroke: '#9AA3B2', 'stroke-width': 3 });
  el('path', { d: `M ${BX - 18} ${BYb - 30} L ${BX + 18} ${BYb - 30} L ${BX + 14} ${BYb} L ${BX - 14} ${BYb} Z`, fill: '#C7CED8', opacity: 0.55 });
  el('ellipse', { cx: BX, cy: BYb - 30, rx: 18, ry: 3.5, fill: 'none', stroke: '#9AA3B2', 'stroke-width': 2.5 });
  const sb = [0, 1].map(() => el('path', { stroke: '#B9C4D2', 'stroke-width': 6, fill: 'none', 'stroke-linecap': 'round' }));
  const streams = [0, 1].map(() => el('path', { stroke: '#fff', 'stroke-width': 3.4, fill: 'none', 'stroke-linecap': 'round' }));
  const moo = k.text(0, 0, 'MOO', { 'font-size': 14, fill: pal.sub });
  const hs = [0, 1].map(() => heartG(k));
  return {
    update(t) {
      cw.set({ x: CX, y: CY, s: S, tail: Math.sin(t * 2.4) * 14, head: Math.sin(t * 1.3) * 3 });
      const on = t > 1.0 && t < 3.6, sq = on ? Math.sin(t * 12) : 0;
      const ud = { x: CX + 10 * S, y: CY - (26 + 21 * 0.55 - 21 + 2) * S };
      P(me, { x: 176, y: CY - 14, squash: 0.9, armR: lerp(8, 70, easeOut(seg(t, 0.4, 0.9))) + 10 * Math.max(0, sq), armL: -lerp(-8, 64, easeOut(seg(t, 0.4, 0.9))) - 10 * Math.max(0, -sq), lean: 10, look: 0.8, mood: t > 3.5 ? 'grin' : 'smile', blink: blinkAt(t) });
      const fill = easeInOut(seg(t, 1.1, 3.6));
      streams.forEach((n, i) => { const a = i ? sq : -sq; const x0 = ud.x - 6 + i * 10; k.set(n, { d: `M ${x0} ${ud.y + 6} Q ${x0 - 4} ${(ud.y + BYb) / 2} ${BX - 4 + i * 8} ${BYb - 6 - 22 * fill}`, opacity: on && a > -0.2 ? 0.95 : 0 }); k.set(sb[i], { d: n.getAttribute('d'), opacity: n.getAttribute('opacity') }); });
      const mh = 26 * fill; k.set(milk, { y: BYb - 3 - mh, height: mh });
      const mp = seg(t, 3.6, 4.2); tf(moo, CX + 74 * S, CY - 74 * S - 10 * mp, 0, Math.max(0.001, easeOut(mp))); moo.setAttribute('opacity', hump(mp) * 1.2);
      hs.forEach((h, i) => { const p = seg(t, 3.5 + i * 0.25, 4.4); tf(h, 160 + i * 20, CY - 90 - 20 * p, 0, Math.max(0.001, hump(p))); });
    }
  };
}
