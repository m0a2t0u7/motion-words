// out of date：古い地図ではまっすぐ進めば小さな店があるはずが、実際は新しいビルが建っていて道が違う（This map is out of date.）
import { seg, lerp, easeInOut, easeOut, hump, clamp, backOut } from '../ease.js';
import { gait, hp } from './dig.js';
import { P, blinkAt, mark } from './so-far-so-good.js';

export const meta = { duration: 4.4, beats: [[0, '地図を見て歩く'], [1.6, '地図と違う'], [3.0, '地図が古い']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236 });
  el('rect', { x: 0, y: FY, width: 400, height: 12, fill: '#E3E8EE' });
  // 新しいビル（クレーン付き）
  k.shadow(310, FY + 1, 70, 5);
  el('rect', { x: 246, y: 40, width: 130, height: FY - 40, rx: 4, fill: '#A9C6E8' });
  for (let r = 0; r < 5; r++) for (let c = 0; c < 4; c++) el('rect', { x: 256 + c * 30, y: 52 + r * 30, width: 22, height: 20, rx: 2, fill: '#DCEBFA' });
  el('rect', { x: 290, y: FY - 44, width: 40, height: 44, fill: '#6F8FB8' });
  el('line', { x1: 352, y1: 40, x2: 352, y2: 6, stroke: pal.yellowDark, 'stroke-width': 4 });
  el('line', { x1: 300, y1: 8, x2: 396, y2: 8, stroke: pal.yellowDark, 'stroke-width': 4 });
  el('rect', { x: 0, y: 150, width: 60, height: FY - 150, fill: '#F2E1CC' });
  el('rect', { x: 12, y: 168, width: 34, height: 26, rx: 3, fill: '#CFE9F7' });
  // 地図（拡大の小窓）
  const ins = g({});
  el('rect', { x: -62, y: -44, width: 124, height: 88, rx: 6, fill: '#F2E3BF', stroke: '#C9A577', 'stroke-width': 3 }, ins);
  el('path', { d: 'M -50 -32 L -40 -36 M 40 30 L 50 34', stroke: '#C9A577', 'stroke-width': 2 }, ins);
  el('line', { x1: -50, y1: 10, x2: 40, y2: 10, stroke: '#B79A6A', 'stroke-width': 8, 'stroke-linecap': 'round' }, ins);
  el('circle', { cx: -40, cy: 10, r: 5, fill: pal.blue }, ins);
  el('path', { d: 'M 36 -2 L 48 -14 L 60 -2 Z', fill: pal.coral, transform: 'translate(-8 0)' }, ins);
  el('rect', { x: 30, y: -2, width: 20, height: 14, fill: '#E6C79A', stroke: pal.coffee, 'stroke-width': 1.5 }, ins);
  k.text(-30, -26, '1990', { 'font-size': 12, fill: pal.coffee }, ins);
  const G = k.buddy({ x: 50, y: FY });
  const map = g({});
  el('rect', { x: -14, y: -11, width: 28, height: 22, rx: 2, fill: '#F2E3BF', stroke: '#C9A577', 'stroke-width': 2 }, map);
  el('line', { x1: -9, y1: 2, x2: 9, y2: 2, stroke: '#B79A6A', 'stroke-width': 3 }, map);
  const q = mark(k, 'q');
  const xf = (t) => lerp(50, 196, easeInOut(seg(t, 0.1, 1.5)));
  return {
    update(t) {
      const p = gait(xf, t, 50);
      const look = t < 1.6 ? 0.2 : t < 3 ? (Math.sin(t * 5) > 0 ? 0.8 : -0.1) : 0.9;
      P(G, { x: p.x, walk: p.walk, armR: 72, armL: p.armL, lean: p.lean - 6 * hump(seg(t, 1.45, 1.8)), look, mood: t > 1.6 ? 'flat' : 'smile',
        squash: 1 - 0.04 * hump(seg(t, 1.45, 1.75)), blink: blinkAt(t) });
      const h = hp(G, 1, 'R');
      tf(map, h.x + 4, h.y - 8, 0, 1);
      const sh = seg(t, 1.7, 2.1);
      tf(ins, 100, 70, 0, Math.max(0.001, backOut(sh)));
      ins.setAttribute('opacity', sh > 0 ? 1 : 0);
      tf(q, 236, 120 - 3 * Math.sin(t * 4), 0, Math.max(0.001, backOut(seg(t, 2.6, 2.9))));
    }
  };
}
