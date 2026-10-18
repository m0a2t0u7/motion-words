// produce：工場。作業員がボタンを押すとプレス機が動き、金属の板から自動車部品（歯車）が次々できて箱に入る（例文 The factory produces car parts.）
import { seg, lerp, easeInOut, easeOut, easeIn, backOut } from '../ease.js';
import { reach } from './dig.js';

export const meta = { duration: 4.4, beats: [[0, '材料の板'], [1.4, 'プレスする'], [3.4, '部品の山']] };

function gear(k, p, r, c) {
  const n = k.g({}, p);
  for (let i = 0; i < 8; i++) k.el('rect', { x: -r * 0.2, y: -r * 1.15, width: r * 0.4, height: r * 0.4, fill: c, transform: `rotate(${i * 45})` }, n);
  k.el('circle', { r, fill: c }, n); k.el('circle', { r: r * 0.35, fill: '#fff', opacity: 0.85 }, n);
  return n;
}
export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 240, mood: 'indoor' });
  el('rect', { x: 0, y: 0, width: 400, height: 150, fill: '#E9EEF3' });
  for (let x = 20; x < 400; x += 70) el('rect', { x, y: 26, width: 44, height: 18, rx: 3, fill: '#fff', opacity: 0.8 });
  // 壁の車のシルエット（自動車部品）
  const car = g({}); tf(car, 330, 74);
  el('path', { d: 'M -34 12 L -30 -2 L -14 -12 L 12 -12 L 28 -2 L 34 12 Z', fill: '#C5CFDB' }, car);
  [-20, 20].forEach((x) => el('circle', { cx: x, cy: 13, r: 7, fill: '#9AA6B6' }, car));
  // ベルトコンベア
  el('rect', { x: 0, y: 190, width: 400, height: 16, fill: '#7A8597' });
  el('rect', { x: 0, y: 206, width: 400, height: 4, fill: '#5C6678' });
  for (let x = 20; x < 400; x += 60) el('rect', { x, y: 210, width: 6, height: 30, fill: '#7A8597' });
  const ticks = Array.from({ length: 26 }, (_, i) => el('rect', { y: 192, width: 4, height: 12, fill: '#5C6678', opacity: 0.6 }));
  // プレス機
  el('rect', { x: 128, y: 70, width: 14, height: 120, fill: '#8EA0B6' }); el('rect', { x: 238, y: 70, width: 14, height: 120, fill: '#8EA0B6' });
  el('rect', { x: 120, y: 56, width: 140, height: 22, rx: 6, fill: '#6E839B' });
  const ram = g({});
  el('rect', { x: 185, y: 78, width: 10, height: 40, fill: '#B7C3D2' }, ram); el('rect', { x: 164, y: 112, width: 52, height: 26, rx: 4, fill: pal.yellowDark }, ram);
  const lamp = el('circle', { cx: 190, cy: 67, r: 5, fill: pal.red });
  // 板と部品
  const items = Array.from({ length: 5 }, () => { const n = g({}); const s = el('rect', { x: -17, y: -9, width: 34, height: 9, rx: 3, fill: '#9FB0C4', stroke: '#6E839B', 'stroke-width': 1.5 }, n); const gr = gear(k, n, 11, pal.blueDark); gr.setAttribute('transform', 'translate(0 -11)'); return { n, s, gr }; });
  const crate = g({}); tf(crate, 340, 176);
  el('rect', { x: -30, y: 0, width: 60, height: 30, rx: 3, fill: pal.wood, stroke: pal.woodDark, 'stroke-width': 2 }, crate);
  const pile = [[-14, 2], [0, 0], [14, 3], [-6, -10], [8, -11]].map(([x, y]) => { const q = g({}, crate); tf(q, x, y); gear(k, q, 8, pal.blueDark); return q; });
  el('rect', { x: -30, y: 8, width: 60, height: 22, rx: 3, fill: pal.wood, stroke: pal.woodDark, 'stroke-width': 2 }, crate);
  const w = k.buddy({ x: 44, y: FY, scale: 0.95, color: pal.mint });
  const btn = el('circle', { cx: 94, cy: 178, r: 6, fill: pal.red, stroke: '#fff', 'stroke-width': 2 });
  el('rect', { x: 90, y: 184, width: 8, height: 40, fill: '#8EA0B6' });
  const CY = 190, PX = 190;
  return {
    update(t) {
      const run = Math.max(0, t - 1.0), push = easeOut(seg(t, 0.5, 1.0)) * (1 - seg(t, 1.1, 1.5));
      w.pose({ armR: lerp(8, reach(w, 0.95, 'R', 94, 178), push), lean: 6 * push, mood: t > 3.4 ? 'grin' : 'smile', look: 0.6, squash: 1 });
      k.set(btn, { r: 6 - 2 * push });
      k.set(lamp, { fill: t > 1.0 ? pal.green : pal.red });
      const xs = items.map((it, i) => 30 + (run * 50 + i * 57) % 285), tot = run * 50 + 0;
      let dmin = 99;
      xs.forEach((x, i) => { const vis = x < PX + 5 && i * 57 + 30 < PX + 5 ? 1 : (run * 50 + i * 57 >= 285 ? 1 : 0); if (vis) dmin = Math.min(dmin, Math.abs(x - PX)); });
      tf(ram, 0, t > 1.0 ? 40 * Math.max(0, 1 - dmin / 16) : 0);
      ticks.forEach((q, i) => k.set(q, { x: ((i * 16 + run * 50) % 416) - 8 }));
      items.forEach((it, i) => {
        const x = xs[i], vis = (i * 57 + 30 < PX - 20 || run * 50 + i * 57 >= 285);
        tf(it.n, x, CY); it.n.setAttribute('opacity', vis ? 1 : 0);
        const pr = x > PX + 8 && run * 50 + i * 57 >= 30 + 0 && (run > 0 || i * 57 + 30 > PX);
        const proc = x > PX + 8 && (run > 0);
        it.s.setAttribute('display', proc ? 'none' : ''); it.gr.setAttribute('display', proc ? '' : 'none');
      });
      pile.forEach((q, i) => q.setAttribute('opacity', seg(t, 2.4 + i * 0.3, 2.6 + i * 0.3)));
    }
  };
}
