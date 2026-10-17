// leak：雨の日、天井の割れ目から水がぽたぽた漏れ、置いたバケツにたまる（例文 The roof leaks when it rains.）
import { seg, lerp, easeInOut, easeOut, smooth, wobble, clamp } from '../ease.js';
import { hp, gait } from './dig.js';

export const meta = { duration: 4.6, beats: [[0.2, '雨の日'], [1.5, '天井から漏れる'], [4.0, '水がたまる']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  k.backdrop({ floorY: 236, mood: 'indoor' });
  const b = k.buddy({ x: -30, y: 236 });
  b.pose({ x: 209, armR: 30, lean: 10, armL: 8 });
  const CX = Math.round(hp(b, 1, 'R', 28).x);
  // 天井と染み
  el('rect', { x: 0, y: 0, width: 400, height: 40, fill: '#DCD3C4' });
  el('rect', { x: 0, y: 38, width: 400, height: 4, fill: '#C9BEAC' });
  const stain = el('ellipse', { cx: CX, cy: 41, rx: 4, ry: 2, fill: '#A89F8E', opacity: 0.8 });
  el('path', { d: `M ${CX - 14} 40 l 6 -3 l 4 3 l 4 -4 l 6 4 l 5 -2`, fill: 'none', stroke: '#6E6558', 'stroke-width': 2, 'stroke-linecap': 'round', transform: 'translate(8 1)' });
  // 窓の外の雨
  el('rect', { x: 36, y: 64, width: 94, height: 80, rx: 6, fill: '#B5C3D3' });
  const cl = k.clip((c) => el('rect', { x: 36, y: 64, width: 94, height: 80, rx: 6 }, c));
  const cloud = g({ 'clip-path': cl });
  [[56, 74, 18], [78, 70, 22], [102, 76, 18]].forEach(([x, y, r]) => el('circle', { cx: x, cy: y, r, fill: '#8896A8' }, cloud));
  const rain = [];
  for (let i = 0; i < 14; i++) rain.push(el('line', { stroke: '#EAF3FB', 'stroke-width': 2, 'stroke-linecap': 'round', 'clip-path': cl }));
  el('line', { x1: 83, y1: 64, x2: 83, y2: 144, stroke: '#fff', 'stroke-width': 4 });
  el('line', { x1: 36, y1: 104, x2: 130, y2: 104, stroke: '#fff', 'stroke-width': 4 });
  // 床の水たまり
  const pud = el('ellipse', { cx: CX, cy: 233, rx: 2, ry: 1, fill: '#8FD3F4', opacity: 0.8 });
  // バケツ
  const bk = g({});
  let wr;
  const wc2 = k.clip((c) => { wr = el('rect', { x: -14, y: -4, width: 28, height: 4 }, c); });
  el('path', { d: 'M -13 -26 L 13 -26 L 10 0 L -10 0 Z', fill: '#9AA6B6' }, bk);
  const wat = el('rect', { x: -12, y: -4, width: 24, height: 4, fill: '#8FD3F4', 'clip-path': wc2 }, bk);
  el('path', { d: 'M -13 -26 L 13 -26 L 12 -22 L -12 -22 Z', fill: '#7A8597' }, bk);
  el('path', { d: 'M -12 -26 Q 0 -46 12 -26', fill: 'none', stroke: '#7A8597', 'stroke-width': 2.4 }, bk);
  const rip = el('ellipse', { rx: 2, ry: 1, fill: 'none', stroke: '#fff', 'stroke-width': 1.5 });
  const drops = [];
  for (let i = 0; i < 8; i++) drops.push(el('path', { d: 'M 0 -5 Q 3.5 1 0 3.5 Q -3.5 1 0 -5 Z', fill: '#6AA8F7' }));
  const TP = 2.5; // バケツが置かれる時刻
  const xf = (t) => lerp(-30, 209, easeInOut(seg(t, 0.2, 2.0)));
  const TS = (i) => 0.9 + 0.6 * i; // 各しずくが落ち始める時刻
  return {
    update(t) {
      const p = gait(xf, t, -30, 14);
      const set = easeInOut(seg(t, 2.0, 2.5)), back = easeInOut(seg(t, 2.7, 3.2));
      b.pose({ x: p.x, walk: p.walk, armL: p.m > 0.1 ? p.armL : 8, armR: t < 2.0 ? 52 : t < 2.6 ? lerp(52, 30, set) : lerp(30, 8, back), lean: p.lean + 10 * set * (1 - back), look: t > 2.7 ? 0 : 0.5, mood: t > 3.0 ? 'sad' : 'smile', squash: 1 });
      const h = hp(b, 1, 'R', 28);
      const placed = t >= TP;
      tf(bk, placed ? CX : h.x, placed ? 236 : h.y + 22 - 0);
      bk.setAttribute('transform', `translate(${(placed ? CX : h.x).toFixed(1)} ${(placed ? 236 : Math.min(236, h.y + 24)).toFixed(1)})`);
      // 雨
      const wet = smooth(seg(t, 0, 0.6));
      rain.forEach((l, i) => { const sp = 120 + (i % 3) * 20, y = ((t * sp + i * 29) % 100) + 56, x = 40 + ((i * 41) % 90) + (y - 60) * 0.1; k.set(l, { x1: x, y1: y, x2: x - 3, y2: y + 11, opacity: wet }); });
      tf(cloud, Math.sin(t) * 2, 0);
      // しずく
      let landedBucket = 0, landedFloor = 0;
      drops.forEach((d, i) => {
        const ts = TS(i), q = (t - ts) / 0.55;
        const inB = ts + 0.55 > TP;
        const ly = inB ? 206 : 233;
        if (inB && ts + 0.55 <= t) landedBucket++; if (!inB && ts + 0.55 <= t) landedFloor++;
        const hang = clamp((t - (ts - 0.35)) / 0.35);
        if (q < 0) k.set(d, { opacity: hang > 0 ? 1 : 0, transform: `translate(${CX + 4} ${(42 + 2 * hang).toFixed(1)}) scale(${(0.3 + 0.7 * hang).toFixed(2)})` });
        else if (q < 1) k.set(d, { opacity: 1, transform: `translate(${CX + 4} ${lerp(44, ly, q * q).toFixed(1)}) scale(1)` });
        else k.set(d, { opacity: 0 });
      });
      // 着水の波紋（直近のしずく）
      let rr = 0, ry = 233;
      drops.forEach((d, i) => { const ts = TS(i) + 0.55, u = (t - ts) / 0.4; if (u > 0 && u < 1) { rr = u; ry = ts > TP ? 206 : 233; } });
      k.set(rip, { cx: CX + 4, cy: ry, rx: 3 + 12 * rr, ry: 1 + 3 * rr, opacity: rr > 0 ? 1 - rr : 0 });
      k.set(pud, { rx: 2 + 5 * landedFloor, ry: 1 + 1 * landedFloor });
      k.set(stain, { rx: 4 + 20 * smooth(seg(t, 0.4, 3.6)), ry: 2 + 3 * smooth(seg(t, 0.4, 3.6)) });
      const lvl = Math.min(14, landedBucket * 3.2);
      k.set(wat, { y: -4 - lvl, height: 4 + lvl }); k.set(wr, { y: -4 - lvl, height: 4 + lvl });
    }
  };
}
