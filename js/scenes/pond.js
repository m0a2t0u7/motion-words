// pond：池のふちに来たまめがのぞきこむと、水の中を魚が泳いでいる（例文 There are fish in the pond.）
// このファイルは魚のヘルパーも書き出す（fishG）
import { seg, lerp, easeInOut, easeOut, hump, clamp } from '../ease.js';
import { P, blinkAt, walkTo } from './run-after.js';
import { scene, hills, treeG, tufts } from './nature.js';
import { reach } from './dig.js';

// 魚（右向き、原点＝体の中心）。set(x, y, 向き, 尾の振り, 拡大)
export function fishG(k, col = '#FF9A4D', parent, belly = '#FFD2A8') {
  const g = k.g({}, parent), f = k.g({}, g), tail = k.g({}, f);
  k.el('path', { d: 'M 0 0 L -10 -7 L -10 7 Z', fill: col }, tail);
  k.el('ellipse', { cx: 0, cy: 0, rx: 13, ry: 7, fill: col }, f);
  k.el('path', { d: 'M -6 2 Q 2 7 10 2', fill: belly, opacity: 0.7 }, f);
  k.el('path', { d: 'M -2 -6 L 3 -10 L 6 -5 Z', fill: col }, f);
  k.el('circle', { cx: 7, cy: -1.5, r: 1.7, fill: k.pal.ink }, f);
  return { g, set(x, y, face = 1, wag = 0, s = 1) { k.tf(g, x, y, 0, s); k.tf(f, 0, 0, 0, face, 1); k.tf(tail, -11, 0, wag * 22); } };
}

export const meta = { duration: 4.2, beats: [[0, '池に近づく'], [1.4, 'のぞきこむ'], [2.8, '魚がいる！']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 0.95;
  const { FY } = scene(k, { FY: 200, top: '#CDE9FA', bot: '#F2FAFE', ground: '#BFE3C4' });
  hills(k, FY);
  [[40, 0.8], [360, 0.9]].forEach(([x, s]) => tf(treeG(k, s).g, x, FY + 2));
  // 池（地面に開いた水面）
  const PX = 250, PY = 252, RX = 128, RY = 34;
  el('ellipse', { cx: PX, cy: PY + 3, rx: RX + 8, ry: RY + 6, fill: '#A8D6A0' });
  el('ellipse', { cx: PX, cy: PY, rx: RX, ry: RY, fill: '#5DB3E0' });
  const wg = g({}); wg.setAttribute('clip-path', k.clip((c) => el('ellipse', { cx: PX, cy: PY, rx: RX - 2, ry: RY - 2 }, c)));
  el('ellipse', { cx: PX, cy: PY + 10, rx: RX, ry: RY, fill: '#4A9FD0' }, wg);
  const fish = [['#FF9A4D', 0, 0.9], ['#F2685B', 1.8, 0.75], ['#FFCF5C', 3.6, 0.7]].map(([c, ph, s]) => ({ f: fishG(k, c, wg), ph, s }));
  const rip = [0, 1].map(() => el('ellipse', { rx: 1, ry: 1, fill: 'none', stroke: '#fff', 'stroke-width': 1.5 }, wg));
  el('path', { d: `M ${PX - 70} ${PY - 18} q 30 -6 60 0`, stroke: '#fff', 'stroke-width': 2, opacity: 0.5, fill: 'none' }, wg);
  // 葉っぱと草
  el('ellipse', { cx: PX + 70, cy: PY + 14, rx: 16, ry: 5, fill: '#6BC48F' }); el('path', { d: `M ${PX + 70} ${PY + 14} l 14 -3 l -2 5 Z`, fill: '#5DB3E0' });
  [[PX + 110, 0], [PX + 118, 6], [PX - 118, 3]].forEach(([x, d]) => el('path', { d: `M ${x} ${PY + 4} q ${-4 + d} -26 ${2 + d} -40`, stroke: '#5DB36F', 'stroke-width': 3, fill: 'none' }));
  tufts(k, FY, 0, 400, '#A9D6B0', 8);
  const me = k.buddy({ x: 60, y: FY + 18, scale: S });
  const xf = (t) => lerp(60, 140, easeInOut(seg(t, 0.2, 1.3)));
  return {
    update(t) {
      fish.forEach(({ f, ph, s }, i) => {
        const a = t * 1.3 + ph, x = PX + Math.sin(a) * (70 - i * 14), y = PY + 4 + i * 7 + Math.sin(a * 2) * 3;
        f.set(x, y, Math.cos(a) >= 0 ? 1 : -1, Math.sin(t * 12 + i), s);
      });
      rip.forEach((r, i) => { const p = ((t + i * 1.1) % 2.2) / 2.2; k.set(r, { cx: PX - 30 + i * 70, cy: PY - 6 + i * 6, rx: 4 + 20 * p, ry: 1.5 + 5 * p, opacity: 0.7 * (1 - p) }); });
      const w = walkTo(xf, t, 60), lk = easeInOut(seg(t, 1.4, 2.0)), pt = easeOut(seg(t, 2.8, 3.2));
      P(me, { x: w.x, y: FY + 18, walk: w.walk, armL: w.armL, armR: w.armR, lean: w.lean + 16 * lk - 6 * pt, look: 0.6, mood: t > 2.8 ? 'open' : 'smile', blink: blinkAt(t), lift: 5 * hump(seg(t, 2.8, 3.2)) });
      if (pt > 0) me.pose({ armR: lerp(w.armR, reach(me, S, 'R', PX - 20, PY), pt) });
    }
  };
}
