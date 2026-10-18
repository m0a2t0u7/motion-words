// visit：家族が夏にそろって祖母の家を訪ね、玄関で迎えられる（例文 We visit my grandmother every summer.）
import { seg, lerp, easeInOut, hump, wobble } from '../ease.js';
import { gait } from './dig.js';
import { heart } from './weigh.js';

export const meta = { duration: 4.4, beats: [[0, '夏の道'], [1.8, '家に着く'], [3.5, '出迎え']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 240, mood: 'outdoor' });
  // 太陽（夏）
  const sun = g({}); tf(sun, 54, 56);
  el('circle', { r: 20, fill: pal.yellow }, sun);
  for (let i = 0; i < 8; i++) el('line', { x1: 0, y1: -27, x2: 0, y2: -35, stroke: pal.yellowDark, 'stroke-width': 4, 'stroke-linecap': 'round', transform: `rotate(${i * 45})` }, sun);
  // 祖母の家
  el('rect', { x: 250, y: 100, width: 130, height: 140, rx: 4, fill: '#F6E2C6' });
  el('path', { d: 'M 236 104 L 315 50 L 394 104 Z', fill: pal.coralDark });
  el('rect', { x: 262, y: 128, width: 30, height: 34, rx: 4, fill: '#CFE9F7', stroke: '#fff', 'stroke-width': 3 });
  el('rect', { x: 338, y: 128, width: 30, height: 34, rx: 4, fill: '#CFE9F7', stroke: '#fff', 'stroke-width': 3 });
  el('rect', { x: 287, y: 154, width: 56, height: 86, rx: 5, fill: '#6F5A4A' });
  el('rect', { x: 292, y: 159, width: 46, height: 81, rx: 3, fill: '#FFF4E0' });
  // ひまわり
  [240, 392].forEach((x) => {
    el('line', { x1: x, y1: FY, x2: x, y2: FY - 38, stroke: pal.green, 'stroke-width': 3 });
    el('circle', { cx: x, cy: FY - 42, r: 10, fill: pal.yellow });
    el('circle', { cx: x, cy: FY - 42, r: 5, fill: pal.coffee });
  });
  el('rect', { x: 0, y: FY - 4, width: 400, height: 4, fill: pal.floorEdge });
  // 祖母（白髪のまとめ髪と眼鏡）
  const gm = k.buddy({ x: 318, y: FY, facing: -1, scale: 0.92, color: pal.violet, dark: '#8670D6' });
  const hair = k.g({});
  el('ellipse', { cx: 0, cy: -78, rx: 29, ry: 11, fill: '#E7E9EE' }, hair);
  el('circle', { cx: 0, cy: -88, r: 12, fill: '#E7E9EE' }, hair);
  gm.body.insertBefore(hair, gm.body.children[2]);
  [-10, 10].forEach((x) => el('circle', { cx: x, cy: -54, r: 7, fill: 'none', stroke: pal.ink, 'stroke-width': 1.8 }, gm.body.children[3]));
  const me = k.buddy({ x: -60, y: FY, facing: 1 });
  const kid = k.buddy({ x: -110, y: FY, facing: 1, scale: 0.7, color: pal.coral, dark: pal.coralDark });
  // お土産
  const gift = g({});
  el('rect', { x: -9, y: -8, width: 18, height: 16, rx: 3, fill: pal.red }, gift);
  el('rect', { x: -9, y: -2, width: 18, height: 4, fill: '#fff', opacity: 0.8 }, gift);
  const hg = [0, 1, 2].map(() => { const h = g({}); heart(k, h); return h; });
  const mx = (t) => lerp(-60, 236, easeInOut(seg(t, 0.2, 2.6)));
  const kx = (t) => lerp(-110, 190, easeInOut(seg(t, 0.2, 2.7)));
  return {
    update(t) {
      const a = gait(mx, t, -60, 16), c = gait(kx, t, -110, 14, 0.15);
      const arr = seg(t, 2.5, 3.0);
      me.pose({ x: a.x, walk: a.walk, armL: a.armL, armR: lerp(a.armR, 60, arr), lean: a.lean, look: 0.5, mood: 'grin' });
      kid.pose({ x: c.x, walk: c.walk, armL: c.armL, armR: lerp(c.armR, 150 + 20 * Math.sin(t * 10), seg(t, 2.6, 3.0)), lean: c.lean, mood: 'grin' });
      tf(gift, a.x + 40, FY - 36 - 3 * Math.abs(Math.sin(a.walk)) - 5 * arr, 0, a.x > -10 ? 1 : 0.001);
      const w = seg(t, 2.6, 3.0);
      gm.pose({ armL: lerp(8, -150, w) + 18 * Math.sin(t * 9) * w, mood: 'grin', look: -0.5, squash: 1 - 0.03 * Math.abs(wobble(seg(t, 2.4, 3.2), 2, 3)) });
      hg.forEach((h, i) => {
        const q = seg(t, 3.4 + i * 0.18, 4.3);
        tf(h, 250 + i * 24, FY - 130 - 20 * q, 0, hump(q) * 1.1 + 0.001);
      });
    }
  };
}
