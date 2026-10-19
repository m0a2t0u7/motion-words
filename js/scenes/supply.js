// supply：牧場のまめが、しぼりたての牛乳を台車で近くの店へ運び、空いた棚を満たす（例文 The farm supplies fresh milk to local stores.）
import { seg, lerp, easeInOut, easeOut, hump, wobble } from '../ease.js';
import { P, blinkAt } from './run-after.js';
import { walk, path } from './queue-up.js';

// 牛乳びん（原点＝底中央）
export function milk(k, parent) {
  const g = k.g({}, parent), pal = k.pal;
  k.el('path', { d: 'M -5 0 L -5 -14 Q -5 -18 -3 -20 L -3 -24 L 3 -24 L 3 -20 Q 5 -18 5 -14 L 5 0 Z', fill: '#fff', stroke: '#C9D6E3', 'stroke-width': 1.5 }, g);
  k.el('rect', { x: -3.5, y: -26, width: 7, height: 3, rx: 1, fill: pal.blue }, g);
  k.el('rect', { x: -5, y: -12, width: 10, height: 6, fill: pal.blue, opacity: 0.7 }, g);
  return g;
}

export const meta = { duration: 4.4, beats: [[0, '牧場の牛乳'], [1.0, '店へ運ぶ'], [3.3, '棚がいっぱい']] };

export function create(k) {
  const { el, g, tf, pal } = k, FY = 236;
  k.backdrop({ floorY: FY, mood: 'outdoor' });
  el('rect', { x: 0, y: FY - 6, width: 400, height: 6, fill: '#E3E8EE' });
  // 牧場：赤い納屋・柵・牛
  el('path', { d: 'M 6 230 L 6 140 L 46 110 L 86 140 L 86 230 Z', fill: pal.red });
  el('rect', { x: 30, y: 176, width: 32, height: 54, fill: '#fff', opacity: 0.85 });
  el('path', { d: 'M 30 176 L 62 230 M 62 176 L 30 230', stroke: pal.red, 'stroke-width': 3 });
  el('rect', { x: 92, y: 206, width: 56, height: 4, fill: pal.woodDark }); el('rect', { x: 92, y: 218, width: 56, height: 4, fill: pal.woodDark });
  [96, 120, 144].forEach((x) => el('rect', { x, y: 200, width: 4, height: 30, fill: pal.woodDark }));
  const cow = g({}); tf(cow, 118, 196);
  el('ellipse', { cx: 0, cy: 0, rx: 18, ry: 10, fill: '#fff', stroke: pal.ink, 'stroke-width': 1.5 }, cow);
  el('circle', { cx: -4, cy: -3, r: 4, fill: pal.ink }, cow); el('circle', { cx: 8, cy: 3, r: 3, fill: pal.ink }, cow);
  el('ellipse', { cx: 20, cy: -8, rx: 7, ry: 6, fill: '#fff', stroke: pal.ink, 'stroke-width': 1.5 }, cow);
  // 店：ひさし・冷蔵棚
  el('rect', { x: 286, y: 100, width: 114, height: 136, fill: '#FFF7EC' });
  [0, 1, 2, 3, 4].forEach((i) => el('path', { d: `M ${282 + i * 24} 92 h 24 v 18 q -12 8 -24 0 Z`, fill: i % 2 ? '#fff' : pal.blue }));
  el('rect', { x: 300, y: 128, width: 86, height: 108, rx: 4, fill: '#DCEFF8', stroke: '#B7CEDD', 'stroke-width': 2 });
  const shelves = [176, 216];
  shelves.forEach((y) => el('rect', { x: 302, y, width: 82, height: 3, fill: '#B7CEDD' }));
  tf(milk(k), 312, 176); // 残りは1本だけ
  const placed = [];
  for (let r = 0; r < 2; r++) for (let i = 0; i < 6; i++) { if (r === 0 && i === 0) continue; const m = milk(k); placed.push({ m, x: 312 + i * 12.5, y: shelves[r] }); }
  // 台車と牛乳かご
  const cart = g({});
  k.shadow(0, 0, 34, 4, cart);
  el('rect', { x: -32, y: -30, width: 64, height: 6, rx: 2, fill: pal.sub }, cart);
  [-22, 22].forEach((x) => el('circle', { cx: x, cy: -6, r: 6, fill: pal.ink }, cart));
  el('path', { d: 'M -32 -30 L -40 -60', stroke: pal.sub, 'stroke-width': 4, 'stroke-linecap': 'round' }, cart);
  el('rect', { x: -28, y: -50, width: 56, height: 20, rx: 2, fill: pal.yellow, stroke: pal.yellowDark, 'stroke-width': 1.5 }, cart);
  const load = [];
  for (let i = 0; i < 6; i++) { const m = milk(k, cart); tf(m, -22 + i * 8.8, -46); load.push(m); }
  const me = k.buddy({ x: 60, y: FY, scale: 0.9, facing: 1 });
  const cx = path([[0.3, 120], [2.3, 238]]);
  return {
    update(t) {
      // まめは台車の後ろを押して進む
      const x = cx(t);
      walk(me, (u) => cx(u) - 70, t, { facing: 1, armR: 60, armL: 60, lean: 10, look: 0.5, blink: blinkAt(t) });
      tf(cart, x, FY + 1, 0, 1, 1);
      // 店に着いたら、かごから棚へ並べていく（1本ずつ）
      const fill = seg(t, 2.8, 3.8);
      placed.forEach((p, i) => {
        const on = fill * placed.length > i;
        tf(p.m, p.x, p.y, 0, on ? 1 : 0.001, on ? 1 + 0.04 * wobble(seg(fill * placed.length - i, 0, 2), 1, 4) : 0.001);
      });
      load.forEach((m, i) => m.setAttribute('opacity', fill * 6 > i + 0.5 ? 0 : 1));
      if (t > 2.3) {
        const wx = path([[2.3, 168], [2.8, 282]]);
        walk(me, wx, t, { facing: 1, look: 0.8, blink: blinkAt(t) });
        if (t > 2.8) P(me, { x: 282, facing: 1, armR: 70 + 60 * Math.abs(Math.sin((t - 2.8) * 6)) * (t < 3.8 ? 1 : 0), armL: 20, lean: 4, look: 0.9, mood: t > 3.8 ? 'grin' : 'smile', blink: blinkAt(t) });
      }
    }
  };
}
