// indoors：雨の日、まめは外に出ず家の中のソファで過ごす（例文 We stayed indoors because of the rain.）
import { seg, lerp, easeInOut, easeOut, clamp } from '../ease.js';
import { P, blinkAt, sofa } from './run-after.js';
import { gait } from './weigh.js';
import { roomBg } from './look-over.js';

export const meta = { duration: 4.2, beats: [[0, '雨が降る'], [1.2, '家の中へ'], [3.3, '家で過ごす']] };

export function create(k) {
  const { el, pal } = k;
  const FY = roomBg(k, 'home', 240);
  // 雨の窓（roomBg の窓を灰色で上書き）
  const W = { x: 40, y: 46, w: 84, h: 70 };
  el('rect', { x: W.x, y: W.y, width: W.w, height: W.h, rx: 8, fill: '#B3BECE' });
  const cp = k.clip((c) => k.el('rect', { x: W.x, y: W.y, width: W.w, height: W.h, rx: 8 }, c));
  const rg = k.g({ 'clip-path': cp });
  el('ellipse', { cx: 70, cy: 62, rx: 26, ry: 10, fill: '#8E9BB0' }, rg);
  el('ellipse', { cx: 104, cy: 60, rx: 22, ry: 9, fill: '#8E9BB0' }, rg);
  const drops = [];
  for (let i = 0; i < 9; i++) drops.push(el('line', { x1: 0, y1: 0, x2: -3, y2: 10, stroke: '#fff', 'stroke-width': 2, 'stroke-linecap': 'round', opacity: 0.85 }, rg));
  el('rect', { x: W.x, y: W.y, width: W.w, height: W.h, rx: 8, fill: 'none', stroke: '#fff', 'stroke-width': 5 });
  el('line', { x1: 82, y1: W.y, x2: 82, y2: W.y + W.h, stroke: '#fff', 'stroke-width': 4 });
  const sx = 290, sf = sofa(k, sx, FY + 2, 150);
  const b = k.buddy({ x: 70, y: FY, scale: 0.82 });
  sf.front();
  const xf = (t) => lerp(70, 168, easeInOut(seg(t, 1.0, 2.6))) + lerp(0, sx - 168, easeInOut(seg(t, 2.9, 3.5)));
  return {
    update(t) {
      drops.forEach((d, i) => { const u = (t * 1.6 + i * 0.37) % 1; k.tf(d, W.x + 6 + ((i * 29) % (W.w - 12)), W.y - 8 + u * (W.h + 16)); });
      const p = gait(xf, t, 70, 28, 0.15), sit = easeOut(seg(t, 3.3, 3.6)), hop = Math.sin(Math.PI * seg(t, 2.9, 3.5));
      b.pose({ x: p.x, y: FY - 10 * sit - 26 * hop, walk: t > 2.9 ? 0 : p.walk, armL: p.armL, armR: p.armR, lean: 4 * p.m, squash: 1 - 0.14 * sit, look: 0.4, mood: sit > 0 ? 'smile' : 'sad', blink: blinkAt(t), facing: 1, lift: 0 });
    }
  };
}
