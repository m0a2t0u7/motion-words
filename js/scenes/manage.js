// manage：まめが小さな花屋を開け、花束を作ってお客さんに売り、店を切り盛りする（例文 She manages a small flower shop.）
import { seg, lerp, easeInOut, easeOut, hump, wobble } from '../ease.js';
import { P, walkTo, coin } from './run-after.js';
import { hp } from './dig.js';

export const meta = { duration: 4.4, beats: [[0, '店を開ける'], [1.5, '花束を渡す'], [3.2, '代金を受け取る']] };

function bouquet(k, parent) {
  const g = k.g({}, parent), pal = k.pal;
  k.el('path', { d: 'M -10 -10 L 10 -10 L 2 16 L -2 16 Z', fill: '#BFE3C6', stroke: '#8FCB9C', 'stroke-width': 1.5 }, g);
  [[-6, -14, pal.red], [0, -19, pal.yellow], [6, -14, pal.violet], [-2, -12, pal.coral]].forEach(([x, y, c]) => k.el('circle', { cx: x, cy: y, r: 5, fill: c }, g));
  return g;
}
const bucket = (k, x, y, c) => { k.shadow(x, y + 1, 16, 3); k.el('path', { d: `M ${x - 13} ${y - 22} L ${x + 13} ${y - 22} L ${x + 10} ${y} L ${x - 10} ${y} Z`, fill: '#9FB4CC' });
  [-8, -2, 4, 9].forEach((dx, i) => { k.el('line', { x1: x + dx * 0.6, y1: y - 22, x2: x + dx, y2: y - 40 - (i % 2) * 6, stroke: k.pal.green, 'stroke-width': 2 }); k.el('circle', { cx: x + dx, cy: y - 42 - (i % 2) * 6, r: 5, fill: c }); }); };

export function create(k) {
  const { el, g, tf, pal } = k, S = 0.82;
  const FY = k.backdrop({ floorY: 236, mood: 'outdoor' });
  // 小さな花屋（日よけ・ガラス戸・花の棚）
  el('rect', { x: 20, y: 70, width: 260, height: 166, fill: '#F3F8EE' });
  el('path', { d: 'M 10 64 L 290 64 L 290 92 L 10 92 Z', fill: pal.green });
  for (let x = 10; x < 290; x += 28) el('path', { d: `M ${x} 92 q 14 12 28 0`, fill: (x / 28) % 2 < 1 ? '#fff' : pal.green });
  el('rect', { x: 36, y: 112, width: 90, height: 70, rx: 4, fill: '#DDEFFA', stroke: '#fff', 'stroke-width': 4 });
  el('rect', { x: 160, y: 120, width: 64, height: 116, fill: '#CDE7D3', stroke: '#fff', 'stroke-width': 4 });
  bucket(k, 60, FY, pal.red); bucket(k, 96, FY, pal.yellow); bucket(k, 250, FY, pal.violet);
  // OPEN / CLOSED の札（扉にかかる、まめが裏返す）
  const tag = g({}); tf(tag, 192, 170);
  el('line', { x1: -8, y1: -14, x2: 0, y2: -22, stroke: pal.sub, 'stroke-width': 1.5 }); 
  const face = g({}, tag);
  const fb = el('rect', { x: -22, y: -10, width: 44, height: 20, rx: 4, fill: pal.sub }, face);
  const ft = k.text(0, 1, 'CLOSED', { 'font-size': 9, fill: '#fff' }, face);
  const me = k.buddy({ x: 160, y: FY, scale: S });
  el('path', { d: 'M -22 -40 L 22 -40 L 26 -4 L -26 -4 Z', fill: '#F7E7B5' }, me.body);
  const cust = k.buddy({ x: 430, y: FY, scale: S, facing: -1, color: pal.coral, dark: pal.coralDark });
  const bq = bouquet(k), cn = coin(k);
  const mx = (t) => lerp(160, 266, easeInOut(seg(t, 1.0, 1.7)));
  const cx = (t) => lerp(430, 346, easeInOut(seg(t, 0.8, 1.9)));
  return {
    update(t) {
      // 札を裏返す
      const flip = seg(t, 0.35, 0.8);
      tf(face, 0, 0, 0, Math.max(0.05, Math.abs(Math.cos(flip * Math.PI))), 1);
      const open = flip > 0.5;
      fb.setAttribute('fill', open ? pal.green : pal.sub); ft.textContent = open ? 'OPEN' : 'CLOSED';
      tf(tag, 192, 170, 4 * wobble(seg(t, 0.8, 1.6), 2, 4));
      const w = walkTo(mx, t, 160, 1);
      const give = easeInOut(seg(t, 1.9, 2.3)) * (1 - easeInOut(seg(t, 2.6, 2.9)));
      const take = easeInOut(seg(t, 3.0, 3.3)) * (1 - easeInOut(seg(t, 3.6, 4.0)));
      P(me, { x: w.x, walk: w.walk, armL: 8, armR: t < 0.9 ? 150 * hump(seg(t, 0.2, 0.9)) : lerp(lerp(w.armR, 60, seg(t, 1.6, 1.8)), 92, Math.max(give, take)), lean: w.lean + 6 * Math.max(give, take), look: t < 0.9 ? 0.8 : 1, mood: t > 1.8 ? 'grin' : 'smile' });
      const cw = walkTo(cx, t, 430, -1);
      const cg = easeInOut(seg(t, 2.1, 2.4)) * (1 - easeInOut(seg(t, 2.6, 2.9)));
      const cpay = easeInOut(seg(t, 2.9, 3.2)) * (1 - easeInOut(seg(t, 3.4, 3.7)));
      P(cust, { x: cw.x, walk: cw.walk, armL: cw.armL, armR: lerp(lerp(cw.armR, 50, seg(t, 1.9, 2.0)), 92, Math.max(cg, cpay)), lean: cw.lean + 5 * Math.max(cg, cpay), facing: -1, look: -0.5, mood: t > 2.5 ? 'grin' : 'smile' });
      const mh = hp(me, S, 'R', 30), ch = hp(cust, S, 'R', 30);
      const bqC = t > 2.4;
      tf(bq, bqC ? ch.x - 2 : mh.x + 4, (bqC ? ch.y : mh.y) - 12, 0, t > 1.65 ? 1 : 0.001);
      const coinM = t > 3.25;
      tf(cn, coinM ? mh.x + 2 : ch.x - 2, (coinM ? mh.y : ch.y) - 4, 0, t > 2.85 ? 1 : 0.001);
    }
  };
}
