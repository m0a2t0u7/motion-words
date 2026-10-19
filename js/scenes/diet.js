// diet：まめがかごから野菜・果物・魚を一つずつ皿にのせ、バランスのよい食事の皿ができる（例文 A healthy diet includes plenty of vegetables, fruit, and fish.）
// 食べ物の小道具も書き出す（food(k, kind, parent)：broccoli / carrot / apple / orange / fish / egg / toast、plate）
import { seg, lerp, easeInOut, easeOut, wobble, backOut } from '../ease.js';
import { reach, hp } from './dig.js';
import { mark } from './so-far-so-good.js';

// 原点＝底の中央
export function food(k, kind, parent) {
  const { el, g, pal } = k;
  const o = g({}, parent || k.root);
  if (kind === 'broccoli') {
    el('rect', { x: -3, y: -10, width: 6, height: 10, rx: 2, fill: '#9BD37A' }, o);
    [[-6, -14, 6], [6, -14, 6], [0, -19, 7]].forEach(([x, y, r]) => el('circle', { cx: x, cy: y, r, fill: '#3E9E4F' }, o));
  } else if (kind === 'carrot') {
    el('path', { d: 'M -12 -5 L 12 -9 L 12 -1 Z', fill: '#F28C28' }, o);
    el('path', { d: 'M 12 -5 l 6 -5 M 12 -5 l 7 0 M 12 -5 l 6 4', stroke: pal.green, 'stroke-width': 2.4, 'stroke-linecap': 'round' }, o);
  } else if (kind === 'apple') {
    el('circle', { cx: 0, cy: -9, r: 9, fill: pal.red }, o);
    el('path', { d: 'M 0 -17 q 1 -5 3 -6', stroke: pal.coffee, 'stroke-width': 2, fill: 'none' }, o);
    el('ellipse', { cx: 5, cy: -20, rx: 4, ry: 2, fill: pal.green }, o);
    el('ellipse', { cx: -3, cy: -12, rx: 2.5, ry: 3.5, fill: '#fff', opacity: 0.35 }, o);
  } else if (kind === 'orange') {
    el('circle', { cx: 0, cy: -10, r: 10, fill: '#FFA53A' }, o);
    el('circle', { cx: 0, cy: -19, r: 1.6, fill: pal.green }, o);
    el('ellipse', { cx: -4, cy: -13, rx: 2.5, ry: 3.5, fill: '#fff', opacity: 0.35 }, o);
  } else if (kind === 'fish') {
    el('path', { d: 'M -16 -6 Q -2 -16 12 -6 Q -2 4 -16 -6 Z', fill: '#E3A76A' }, o);
    el('path', { d: 'M 10 -6 L 19 -12 L 19 0 Z', fill: '#C98A50' }, o);
    el('circle', { cx: -10, cy: -7, r: 1.6, fill: pal.ink }, o);
    [-4, 1, 6].forEach((x) => el('line', { x1: x, y1: -10, x2: x - 2, y2: -3, stroke: '#B07040', 'stroke-width': 1.4 }, o));
  } else if (kind === 'egg') {
    el('path', { d: 'M -13 -3 Q -15 -12 -5 -12 Q 0 -16 7 -12 Q 15 -10 12 -3 Q 6 1 -13 -3 Z', fill: '#fff', stroke: '#E6E0D4', 'stroke-width': 1 }, o);
    el('circle', { cx: 0, cy: -7, r: 4.5, fill: '#FFC93C' }, o);
  } else if (kind === 'toast') {
    el('path', { d: 'M -10 0 V -14 Q -12 -22 -4 -22 H 4 Q 12 -22 10 -14 V 0 Z', fill: '#E7B670', stroke: '#B7823F', 'stroke-width': 2 }, o);
  }
  return o;
}
export function plate(k, x, y, w = 64, parent) {
  const o = k.g({}, parent || k.root);
  k.el('ellipse', { cx: x, cy: y, rx: w / 2, ry: w * 0.11, fill: '#fff', stroke: k.pal.line, 'stroke-width': 2 }, o);
  k.el('ellipse', { cx: x, cy: y - 1, rx: w * 0.34, ry: w * 0.065, fill: '#F4F6F9' }, o);
  return o;
}

export const meta = { duration: 4.0, beats: [[0, '野菜'], [1.1, '果物'], [2.0, '魚'], [3.0, '健康的な食事']] };

// 腰から下を隠すカウンター（天板 y=CY）
export function counter(k, CY = 204) {
  const { el, pal } = k;
  el('rect', { x: 0, y: CY, width: 400, height: 6, fill: pal.wood });
  el('rect', { x: 0, y: CY + 6, width: 400, height: 300 - CY, fill: '#F6D9B3' });
  el('rect', { x: 0, y: CY + 6, width: 400, height: 3, fill: pal.woodDark, opacity: 0.4 });
  for (let x = 0; x <= 400; x += 100) el('rect', { x: x + 4, y: CY + 14, width: 92, height: 40, rx: 3, fill: 'none', stroke: pal.woodDark, 'stroke-width': 1.5, opacity: 0.5 });
}

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 250, mood: 'indoor' });
  el('rect', { x: 290, y: 40, width: 80, height: 60, rx: 6, fill: '#DDEFFA', stroke: '#fff', 'stroke-width': 5 });
  el('rect', { x: 40, y: 70, width: 110, height: 6, rx: 3, fill: pal.woodDark });
  [[50, pal.yellow], [80, pal.coral], [110, pal.violet]].forEach(([x, c]) => el('rect', { x, y: 50, width: 20, height: 20, rx: 4, fill: c, opacity: 0.8 }));
  const S = 1.15, b = k.buddy({ x: 150, y: 232, scale: S });
  counter(k, 212);
  const BX = 330, BY = 214;
  el('path', { d: `M ${BX - 40} ${BY - 30} L ${BX + 40} ${BY - 30} L ${BX + 32} ${BY} L ${BX - 32} ${BY} Z`, fill: '#D9A86A' });
  plate(k, 196, 214, 104);
  const kinds = ['broccoli', 'apple', 'fish'];
  const slots = [[174, 212], [200, 212], [224, 212]], src = [[312, 194], [332, 192], [350, 196]];
  const items = kinds.map((kd) => food(k, kd));
  el('path', { d: `M ${BX - 36} ${BY - 16} L ${BX + 36} ${BY - 16} L ${BX + 32} ${BY} L ${BX - 32} ${BY} Z`, fill: '#C99550' });
  const ok = mark(k, 'check', null, 2.4);
  const CYC = [0.2, 1.1, 2.0], D = 0.9;
  return {
    update(t) {
      let x = 156, tx = 200, ty = 170, w = 0;
      CYC.forEach((a, i) => {
        if (t < a || t > a + D) return;
        const u = (t - a) / D;
        x = u < 0.4 ? lerp(156, 262, easeInOut(seg(u, 0, 0.35))) : lerp(262, 156, easeInOut(seg(u, 0.45, 0.8)));
        const sl = slots[i], sr = src[i];
        if (u < 0.42) { tx = sr[0]; ty = sr[1] - 8; w = easeOut(seg(u, 0.1, 0.35)); }
        else { tx = sl[0]; ty = sl[1] - 14 - 18 * Math.sin(seg(u, 0.42, 0.85) * Math.PI); w = 1 - seg(u, 0.88, 1); }
      });
      b.pose({ x, walk: 0, lean: 8 + 8 * w, armL: 10, mood: t > 3.0 ? 'grin' : 'smile', look: 0.6, squash: 1 + 0.03 * wobble(seg(t, 3.0, 3.7), 2, 4) });
      b.pose({ armR: lerp(40, reach(b, S, 'R', tx, ty), w) });
      const h = hp(b, S, 'R', 30);
      items.forEach((it, i) => {
        const a = CYC[i], g0 = a + 0.4 * D, g1 = a + 0.86 * D;
        if (t <= g0) tf(it, src[i][0], src[i][1], 0, 1.5);
        else if (t < g1) tf(it, h.x, h.y + 10, 0, 1.5);
        else { const q = wobble(seg(t, g1, g1 + 0.5), 2, 5); tf(it, slots[i][0], slots[i][1], 0, 1.5 + 0.08 * q, 1.5 - 0.1 * q); }
      });
      const op = seg(t, 3.0, 3.3);
      tf(ok, 300, 130, 0, op <= 0 ? 0.001 : backOut(op) * 2.4);
    }
  };
}
