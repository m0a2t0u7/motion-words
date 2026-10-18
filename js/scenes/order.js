// order：カフェのカウンター。客がサンドイッチとコーヒーを頼み、店員がメモに書き取る（例文 I ordered a sandwich and coffee.）
import { seg, lerp, easeInOut, easeOut, backOut } from '../ease.js';
import { hp, reach, gait } from './dig.js';
import { bubble } from './weigh.js';

export const meta = { duration: 4.4, beats: [[0, '店に着く'], [1.4, '注文する'], [3.4, '書き取った']] };

function sandwich(k, p, s = 1) {
  const n = k.g({}, p); k.tf(n, 0, 0, 0, s);
  k.el('rect', { x: -12, y: -3, width: 24, height: 6, rx: 3, fill: '#F2A9A0' }, n);
  k.el('path', { d: 'M -13 -3 q 3 -4 6 0 q 3 -4 6 0 q 3 -4 6 0 q 3 -4 6 0 v 2 h -24 Z', fill: '#59C27A' }, n);
  k.el('path', { d: 'M -13 0 Q -14 -13 0 -13 Q 14 -13 13 0 Z', fill: '#E9BE7C' }, n);
  k.el('rect', { x: -13, y: 4, width: 26, height: 6, rx: 3, fill: '#E9BE7C' }, n);
  return n;
}
function cup(k, p, s = 1) {
  const n = k.g({}, p); k.tf(n, 0, 0, 0, s);
  k.el('path', { d: 'M 10 -2 q 9 0 8 7 q -1 6 -9 6', fill: 'none', stroke: '#fff', 'stroke-width': 3.4 }, n);
  k.el('path', { d: 'M 10 -2 q 9 0 8 7 q -1 6 -9 6', fill: 'none', stroke: k.pal.line, 'stroke-width': 1, opacity: 0.8 }, n);
  k.el('path', { d: 'M -11 -4 H 11 L 8 14 Q 0 18 -8 14 Z', fill: '#fff', stroke: k.pal.line, 'stroke-width': 1.6 }, n);
  k.el('ellipse', { cx: 0, cy: -4, rx: 11, ry: 3, fill: k.pal.coffee }, n);
  return n;
}

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 240, mood: 'indoor' });
  el('rect', { x: 244, y: 36, width: 130, height: 76, rx: 8, fill: '#3E5A52', stroke: pal.woodDark, 'stroke-width': 4 });
  const m1 = g({}); tf(m1, 281, 66); sandwich(k, m1, 1.1);
  const m2 = g({}); tf(m2, 336, 64); cup(k, m2, 1.1);
  [281, 336].forEach((x) => el('rect', { x: x - 14, y: 92, width: 28, height: 4, rx: 2, fill: '#fff', opacity: 0.7 }));
  el('rect', { x: 30, y: 52, width: 70, height: 64, rx: 6, fill: '#DDEFFA', stroke: '#fff', 'stroke-width': 5 });
  const bar = k.buddy({ x: 316, y: 232, scale: 0.92, facing: -1, color: pal.coral, dark: pal.coralDark });
  const pad = g({});
  el('rect', { x: -11, y: -14, width: 22, height: 28, rx: 3, fill: '#fff', stroke: pal.line, 'stroke-width': 2 }, pad);
  const lines = [-7, -1, 5].map((y) => el('line', { x1: -6, y1: y, x2: -6, y2: y, stroke: pal.blue, 'stroke-width': 2, 'stroke-linecap': 'round' }, pad));
  const slip = g({}); const sg = g({}, slip);
  el('rect', { x: -15, y: -19, width: 30, height: 38, rx: 3, fill: '#fff', stroke: pal.line, 'stroke-width': 2 }, sg);
  const si = g({}, sg); tf(si, -1, -6, 0, 0.5); sandwich(k, si);
  const si2 = g({}, sg); tf(si2, 0, 8, 0, 0.5); cup(k, si2);
  // カウンター
  el('rect', { x: 196, y: 200, width: 204, height: 8, fill: pal.wood });
  el('rect', { x: 196, y: 208, width: 204, height: 36, fill: '#F6D9B3' });
  el('rect', { x: 196, y: 208, width: 204, height: 3, fill: pal.woodDark, opacity: 0.4 });
  const cu = g({}); tf(cu, 218, 189); cup(k, cu, 0.75);
  const cus = k.buddy({ x: 60, y: FY });
  const bub = bubble(k, 78, 40);
  const bs = g({}, bub), bc = g({}, bub); tf(bs, -18, 0, 0, 0.9); tf(bc, 20, -1, 0, 0.9); sandwich(k, bs); cup(k, bc);
  const xf = (t) => lerp(50, 130, easeInOut(seg(t, 0.1, 1.2)));
  return {
    update(t) {
      const p = gait(xf, t, 50, 18);
      const say = t > 1.5 && t < 3.0 ? (Math.sin(t * 14) > 0 ? 'open' : 'smile') : t >= 3.0 ? 'grin' : 'smile';
      const pt = easeOut(seg(t, 1.3, 1.8)) * (1 - seg(t, 2.7, 3.1));
      cus.pose({ x: p.x, walk: p.walk, armL: p.armL, armR: p.armR + (140 - p.armR) * pt, lean: p.lean, mood: say, look: 0.6, squash: 1 });
      const pop = backOut(seg(t, 1.6, 2.1), 1.4) * (1 - seg(t, 3.3, 3.6));
      tf(bub, cus.state.x + 40, 118 - 4 * Math.sin(t * 4), 0, pop, pop);
      bub.setAttribute('opacity', pop > 0.01 ? 1 : 0);
      // 店員：うなずきながらメモに書く → 注文票を見せる
      const nod = Math.sin(t * 6) * 3 * seg(t, 1.7, 3.2) * (1 - seg(t, 3.0, 3.3));
      const show = easeOut(seg(t, 3.3, 3.8)), pw = seg(t, 1.7, 3.2);
      bar.pose({ armL: 78, armR: 78, lean: nod + 2, mood: show > 0.5 ? 'grin' : 'smile', look: 0.6, squash: 1 });
      const ph = hp(bar, 0.92, 'L');
      bar.pose({ armR: reach(bar, 0.92, 'R', ph.x + 2, ph.y + 3) });
      tf(pad, ph.x + 2, ph.y - 8, -8, 0.92, 0.92);
      lines.forEach((l, i) => k.set(l, { x2: -6 + 12 * Math.max(0, Math.min(1, pw * 3 - i)) }));
      pad.setAttribute('opacity', show > 0 ? 0 : 1);
      const ss = Math.max(0.001, lerp(0.9, 1.3, show) * (show > 0 ? 1 : 0));
      tf(slip, lerp(ph.x, 284, show), lerp(ph.y - 8, 150, show), 0, ss, ss);
    }
  };
}
