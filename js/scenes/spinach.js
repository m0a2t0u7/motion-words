// spinach：まめがお皿のホウレンソウをフォークで食べると、体じゅうに元気がわいて力こぶ（例文 Spinach is good for your health.）
// このファイルは食卓のヘルパーも書き出す（cloth：テーブルクロス / eatAt：フォークで口へ運ぶ / leafPile）
import { seg, lerp, easeInOut, easeOut, hump, clamp } from '../ease.js';
import { P, blinkAt } from './run-after.js';
import { hp, reach } from './dig.js';
import { fork, aim, tipOf } from './restaurant.js';
import { plateG } from './flour.js';
import { twinkle } from './body.js';
import { heartG } from './animal.js';

// テーブル（クロスが床近くまでたれる。人物より後に呼ぶと腰から下を隠す）
export function cloth(k, x0, x1, TY, FY, col = '#FFFFFF', dot = '#F7B5C0') {
  const { el } = k, g = k.g({});
  k.shadow((x0 + x1) / 2, FY + 2, (x1 - x0) / 2, 5, g);
  el('rect', { x: x0 + 14, y: TY, width: 10, height: FY - TY, fill: k.pal.woodDark }, g); el('rect', { x: x1 - 24, y: TY, width: 10, height: FY - TY, fill: k.pal.woodDark }, g);
  let d = `M ${x0} ${TY} H ${x1} V ${TY + 44}`;
  for (let x = x1; x > x0; x -= 20) d += ` Q ${x - 10} ${TY + 52} ${x - 20} ${TY + 44}`;
  el('path', { d: d + ' Z', fill: col, stroke: '#E3E8EE', 'stroke-width': 1.5 }, g);
  for (let x = x0 + 12; x < x1; x += 24) el('circle', { cx: x, cy: TY + 24, r: 3, fill: dot }, g);
  el('rect', { x: x0 - 4, y: TY - 4, width: x1 - x0 + 8, height: 6, rx: 3, fill: '#E9DCC8' }, g);
  return g;
}
// 口もとの座標（顔の向き・目線ぶん）
export const mouthOf = (b, s) => ({ x: b.state.x + (b.state.look * 6 + 2) * s * b.state.facing, y: b.state.y - (10 + 42 + b.state.lift) * s });
// フォークを皿→口へ。m=0 で皿、1 で口。food（ノード）をフォークの先に付ける
export function eatAt(k, b, s, fk, m, plate, food, mood) {
  const mo = mouthOf(b, s);
  const tg = { x: lerp(plate.x, mo.x, m), y: lerp(plate.y, mo.y, m) };
  b.pose({ armR: reach(b, s, 'R', tg.x, tg.y) });
  const h = hp(b, s, 'R', 27);
  aim(k, fk, h, tg, s);
  if (food) { const tip = tipOf(h, tg, 21 * s); k.tf(food, tip.x, tip.y, 0, s); }
  return h;
}
// 葉物の山（原点＝皿の上の中央）。set(残り 0..1)
export function leafPile(k, parent, col = '#3E8E4A', col2 = '#59A85F') {
  const g = k.g({}, parent), ls = [];
  [[-16, -4, -20], [-6, -8, 10], [6, -6, -10], [16, -3, 20], [0, -12, 0], [-10, -12, 30], [10, -12, -30]].forEach(([x, y, r], i) => ls.push(k.el('ellipse', { cx: x, cy: y, rx: 9, ry: 5, fill: i % 2 ? col2 : col, transform: `rotate(${r} ${x} ${y})` }, g)));
  return { g, set(left) { ls.forEach((l, i) => l.setAttribute('opacity', i / ls.length < left ? 1 : 0)); } };
}

export const meta = { duration: 4.4, beats: [[0, 'ホウレンソウ'], [1.0, 'もぐもぐ'], [2.8, '元気いっぱい']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 1.0;
  const FY = k.backdrop({ floorY: 240, mood: 'indoor' });
  el('rect', { x: 250, y: 50, width: 110, height: 76, rx: 6, fill: '#DDEFFA', stroke: '#fff', 'stroke-width': 5 });
  const me = k.buddy({ x: 150, y: FY - 2, scale: S });
  const TY = 212; cloth(k, 60, 340, TY, FY);
  const pl = g({}); tf(pl, 222, TY); plateG(k, pl, 76);
  const pile = leafPile(k, pl); tf(pile.g, 0, -2);
  const fk = fork(k);
  const bite = g({}); el('ellipse', { cx: 0, cy: 0, rx: 6, ry: 3.5, fill: '#3E8E4A' }, bite);
  const tw = [0, 1, 2, 3].map(() => twinkle(k, undefined, pal.yellow));
  const hs = heartG(k);
  return {
    update(t) {
      const e1 = hump(seg(t, 0.6, 1.5)), e2 = hump(seg(t, 1.5, 2.4));
      const m = Math.max(e1, e2), chew = (t > 1.0 && t < 1.6) || (t > 1.9 && t < 2.6);
      const flex = easeOut(seg(t, 2.7, 3.1));
      P(me, { x: 150, y: FY - 2, look: 0.6, mood: chew && Math.sin(t * 22) > 0 ? 'open' : t > 2.7 ? 'grin' : 'smile', blink: blinkAt(t), lift: 6 * hump(seg(t, 2.7, 3.1)), squash: 1 + 0.04 * flex });
      pile.set(1 - 0.3 * seg(t, 0.9, 1.0) - 0.3 * seg(t, 1.8, 1.9));
      if (flex <= 0) eatAt(k, me, S, fk, m, { x: 222, y: TY - 8 }, bite);
      else { me.pose({ armR: 150 + 10 * Math.sin(t * 8), armL: 150 - 10 * Math.sin(t * 8) }); const h = hp(me, S, 'R', 27); aim(k, fk, h, { x: h.x + 10, y: h.y - 20 }, S); }
      bite.setAttribute('opacity', (m > 0.05 && ((t > 0.6 && t < 1.05) || (t > 1.5 && t < 1.95))) ? 1 : 0);
      tw.forEach((n, i) => { const q = seg(t, 2.8 + i * 0.12, 3.6 + i * 0.12); const a = i * 1.6; tf(n, 150 + Math.cos(a) * 60, FY - 110 + Math.sin(a) * 40, q * 90, Math.max(0.001, hump(q) * 1.2)); });
      const hq = seg(t, 3.2, 4.2); tf(hs, 200, FY - 150 - 16 * hq, 0, Math.max(0.001, hump(hq) * 1.6));
    }
  };
}
