// notice：まめが書類の計算を上から順に確かめ、小さなミスに気づいて赤ペンで丸をつける（例文 I noticed a small mistake.）
import { seg, lerp, easeInOut, easeOut, backOut, hump } from '../ease.js';
import { officeBg } from './get-on-with.js';
import { hp, reach } from './dig.js';
import { mark } from './so-far-so-good.js';

export const meta = { duration: 4.2, beats: [[0, '書類を見る'], [1.9, 'あれ？'], [2.8, 'ミスに気づく']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 0.9;
  const FY = officeBg(k, 236, 40);
  // 書類を立てかけた書見台
  el('rect', { x: 196, y: 196, width: 8, height: 40, fill: pal.woodDark });
  k.shadow(200, FY + 1, 40, 4);
  el('rect', { x: 150, y: 228, width: 100, height: 8, rx: 3, fill: pal.woodDark });
  const doc = g({}); tf(doc, 200, 150);
  el('rect', { x: -60, y: -78, width: 120, height: 136, rx: 6, fill: '#fff', stroke: pal.line, 'stroke-width': 2 }, doc);
  el('rect', { x: -60, y: -78, width: 120, height: 16, rx: 6, fill: '#E9F1FA' }, doc);
  const scan = el('rect', { x: -54, y: -54, width: 108, height: 24, rx: 6, fill: pal.yellow, opacity: 0.35 }, doc);
  const ys = [-42, -14, 14, 42];
  ['2+3=5', '4+1=5', '3+3=7', '1+5=6'].forEach((r, i) => k.text(-2, ys[i], r, { 'font-size': 18, fill: pal.ink, 'letter-spacing': 2 }, doc));
  const ring = el('ellipse', { cx: 237, cy: 164, rx: 13, ry: 12, fill: 'none', stroke: pal.red, 'stroke-width': 3.5, 'stroke-dasharray': 100, 'stroke-dashoffset': 100 });
  const b = k.buddy({ x: 300, y: FY, scale: S, facing: -1 });
  const pen = el('line', { stroke: pal.red, 'stroke-width': 6, 'stroke-linecap': 'round' });
  const nib = el('circle', { r: 2.4, fill: pal.ink });
  const bang = mark(k, 'bang');
  return {
    update(t) {
      // 目線：行を1つずつ下へ（3行目で止まる）
      const r = t < 0.5 ? 0 : t < 1.1 ? easeInOut(seg(t, 0.5, 0.9)) : 1 + easeInOut(seg(t, 1.1, 1.5));
      const i0 = Math.floor(r), sy = lerp(ys[i0], ys[Math.min(3, i0 + 1)], r - i0);
      k.set(scan, { y: sy - 12 });
      const st = easeOut(seg(t, 1.8, 2.1)), go = easeInOut(seg(t, 2.4, 2.8)), circ = easeInOut(seg(t, 2.8, 3.6));
      const jump = hump(seg(t, 1.8, 2.25));
      b.pose({ x: 300, armL: 8, armR: 30, lean: 6 + 12 * go - 4 * jump, look: lerp(0.5, 0.9, st), mood: st > 0.3 && t < 3.4 ? 'open' : 'smile', lift: 7 * jump, squash: 1 + 0.04 * jump });
      const a = circ * Math.PI * 2 - 1.2;
      const tip = { x: 237 + Math.cos(a) * 13, y: 164 + Math.sin(a) * 12 };
      const rest = hp(b, S, 'R', 28);
      const tx = lerp(rest.x - 14, tip.x, go), ty = lerp(rest.y - 8, tip.y, go);
      b.pose({ armR: lerp(30, reach(b, S, 'R', tx, ty), go) });
      const h = hp(b, S, 'R', 28);
      const L = Math.hypot(tx - h.x, ty - h.y) || 1, ex = go > 0.02 ? tx : h.x - 14, ey = go > 0.02 ? ty : h.y - 8;
      const sx = go > 0.02 ? h.x + (h.x - tx) / L * 6 : h.x + 4;
      k.set(pen, { x1: sx, y1: go > 0.02 ? h.y + (h.y - ty) / L * 6 : h.y + 2, x2: ex, y2: ey });
      k.set(nib, { cx: ex, cy: ey });
      tf(bang, 300, FY - 116 * S, 0, st > 0 ? backOut(st) * (1 - seg(t, 2.6, 2.9)) + 0.001 : 0.001);
      ring.setAttribute('stroke-dashoffset', 100 * (1 - circ));
    }
  };
}
