// get：誕生日の部屋に、親がリボン付きの新しい自転車を押して来る。まめがハンドルを握って受け取り、跳んで喜ぶ（例文 I got a new bike for my birthday.）
import { seg, lerp, easeInOut, easeOut, hump, wobble, clamp } from '../ease.js';
import { hp, reach } from './dig.js';
import { P, blinkAt } from './run-after.js';
import { roomBg } from './look-over.js';
import { path, walk } from './queue-up.js';
import { cake } from './so-far-so-good.js';

// 自転車（原点＝地面中央、前輪が -x 側）。set(x, spin)
export function bike(k, color, parent) {
  const { el, g, pal } = k;
  const o = g({}, parent); k.shadow(0, 0, 50, 5, o);
  const wheels = [-30, 30].map((wx) => { const w = g({}, o); el('circle', { r: 17, fill: 'none', stroke: pal.ink, 'stroke-width': 4.5 }, w); [0, 60, 120].forEach((a) => el('line', { x1: 0, y1: -14, x2: 0, y2: 14, stroke: '#B9C3D0', 'stroke-width': 1.5, transform: `rotate(${a})` }, w)); el('circle', { r: 2.5, fill: pal.sub }, w); return [w, wx]; });
  const fr = { stroke: color, 'stroke-width': 5, fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' };
  el('path', { d: 'M 30 -17 L 6 -17 L -10 -42 L 12 -42 Z M 6 -17 L 14 -48 M -30 -17 L -14 -52', ...fr }, o);
  el('rect', { x: 4, y: -53, width: 20, height: 6, rx: 3, fill: pal.ink }, o);
  el('path', { d: 'M -22 -54 L -8 -54', stroke: pal.ink, 'stroke-width': 4.5, 'stroke-linecap': 'round' }, o);
  el('circle', { cx: 6, cy: -17, r: 5, fill: 'none', stroke: pal.sub, 'stroke-width': 2 }, o);
  // リボン
  const bow = g({}, o);
  el('path', { d: 'M -4 -42 Q -18 -54 -16 -38 Z M 4 -42 Q 18 -54 16 -38 Z', fill: pal.red, transform: 'translate(0 2)' }, bow);
  el('circle', { cx: 0, cy: -41, r: 4, fill: pal.red }, bow);
  return { g: o, bow, handle: (x) => ({ x: x - 18, y: -54 }), set(x, spin, y) { k.tf(o, x, y); wheels.forEach(([w, wx]) => k.tf(w, wx, -17, spin)); } };
}

export const meta = { duration: 4.2, beats: [[0, '誕生日'], [1.3, '自転車が来る'], [2.8, 'もらった！']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = roomBg(k, 'home', 240);
  // 旗の飾り
  el('path', { d: 'M 150 30 Q 270 60 390 30', stroke: pal.sub, 'stroke-width': 1.5, fill: 'none' });
  for (let i = 0; i < 9; i++) { const x = 160 + i * 25, y = 30 + Math.sin((i + 0.5) / 9 * Math.PI) * 22; el('path', { d: `M ${x - 9} ${y} L ${x + 9} ${y + 1} L ${x} ${y + 18} Z`, fill: [pal.coral, pal.yellow, pal.blue][i % 3] }); }
  // 小机とケーキ
  k.shadow(40, FY + 1, 36, 4);
  el('rect', { x: 6, y: FY - 54, width: 70, height: 7, rx: 3, fill: pal.wood });
  el('rect', { x: 14, y: FY - 47, width: 6, height: 47, fill: pal.woodDark });
  el('rect', { x: 62, y: FY - 47, width: 6, height: 47, fill: pal.woodDark });
  const ck = cake(k); tf(ck, 40, FY - 55, 0, 1.2);
  el('rect', { x: 38, y: FY - 100, width: 4, height: 14, rx: 1, fill: pal.blue });
  const flame = el('ellipse', { cx: 40, cy: FY - 104, rx: 3, ry: 5, fill: pal.yellow });
  const me = k.buddy({ x: 130, y: FY, scale: 0.9 });
  const hat = g({}, me.body);
  el('path', { d: 'M -12 -78 L 0 -104 L 12 -78 Z', fill: pal.violet }, hat);
  el('circle', { cx: 0, cy: -105, r: 4, fill: pal.yellow }, hat);
  const par = k.buddy({ x: 470, y: FY, scale: 1, facing: -1, color: pal.coral, dark: pal.coralDark });
  const bk = bike(k, pal.blue);
  const xf = path([[0.2, 470], [1.9, 300]]);
  return {
    update(t) {
      k.set(flame, { rx: 3 + 0.4 * Math.sin(t * 17), ry: 5 + 0.8 * Math.sin(t * 13) });
      const p = walk(par, xf, t, { facing: -1, mood: 'grin', look: 0.4 });
      const bx = p.x - 64;
      bk.set(bx, ((470 - p.x) / 17) * (-180 / Math.PI), FY);
      // 親の手：サドルを持って押す → 着いたら手を離して「どうぞ」
      const rel = easeInOut(seg(t, 2.0, 2.4));
      const seat = { x: bx + 14, y: FY - 52 };
      P(par, { x: p.x, walk: p.walk, facing: -1, armL: 10, armR: lerp(reach(par, 1, 'R', seat.x, seat.y + 30), 60, rel), lean: p.lean + 4, mood: 'grin', look: 0.4, blink: blinkAt(t, 0.8) });
      // まめ：見つけて驚く → ハンドルを握る → 跳ねる
      const gr = easeInOut(seg(t, 2.3, 2.8)), hop = hump(seg(t, 3.0, 3.45)) + 0.6 * hump(seg(t, 3.45, 3.8));
      const hb = bk.handle(bx);
      const xme = lerp(130, 150, gr);
      P(me, { x: xme, look: 0.7, mood: t > 1.0 ? (t > 2.8 ? 'grin' : 'open') : 'smile', armR: lerp(8, reach(me, 0.9, 'R', hb.x + 4, FY - 54 + 24), gr), armL: 8 + 140 * hump(seg(t, 3.0, 3.8)), lift: 10 * hop, squash: 1 + 0.05 * hump(seg(t, 2.85, 3.0)), lean: 4 * gr, blink: blinkAt(t, 0.2) });
      const b0 = seg(t, 2.8, 3.1);
      tf(bk.bow, 0, 0, 0, 1);
      bk.g.setAttribute('opacity', 1);
    }
  };
}
