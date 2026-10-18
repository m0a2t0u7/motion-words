// run after：公園で、逃げる犬のあとを子どもたちが走って追いかける（例文 The kids ran after the dog in the park.）
// このファイルは pb5 系シーンの共通ヘルパーも書き出す（P / run / walkTo / dog / tree / clock / win / car / star / coin / sofa）
import { seg, lerp, easeInOut, easeOut, hump, clamp, wobble } from '../ease.js';
import { gait } from './weigh.js';

// 毎フレーム全項目を指定する pose（前フレームの値を残さない）
export function P(b, o) {
  b.pose({ armL: 8, armR: 8, lean: 0, squash: 1, walk: 0, look: 0, mood: 'smile', blink: 0, lift: 0, ...o });
}
export const blinkAt = (t, off = 0) => hump(seg((t + off) % 2.7, 2.5, 2.66));
// 歩く：位置関数 xf から pose 値（進む向きに facing を合わせる。止まっている間は f0）
export function walkTo(xf, t, x0, f0 = 1) {
  const g = gait(xf, t, x0), d = xf(t + 0.03) - xf(t - 0.03);
  return { x: g.x, walk: g.walk, armL: g.armL, armR: g.armR, lean: g.lean, facing: Math.abs(d) > 0.05 ? Math.sign(d) : f0, m: g.m };
}
// 走る：大きな腕振り・前傾・小さな跳ね
export function run(xf, t, x0, f0 = 1) {
  const g = gait(xf, t, x0, 50, 0.12), d = xf(t + 0.03) - xf(t - 0.03);
  return { x: g.x, walk: g.walk, armL: 8 + (g.armL - 8), armR: 8 + (g.armR - 8), lean: 11 * g.m, lift: Math.abs(Math.sin(g.walk)) * 5 * g.m,
    facing: Math.abs(d) > 0.05 ? Math.sign(d) : f0, m: g.m };
}
export function tree(k, x, y, s = 1, leaf = '#7FD3A0', leaf2 = '#6BC48F') {
  const t = k.g({}); k.tf(t, x, y, 0, s);
  k.shadow(0, 0, 26, 5, t);
  k.el('rect', { x: -5, y: -44, width: 10, height: 44, rx: 4, fill: k.pal.woodDark }, t);
  const c = [k.el('circle', { cx: 0, cy: -62, r: 30, fill: leaf }, t), k.el('circle', { cx: -16, cy: -48, r: 20, fill: leaf2 }, t), k.el('circle', { cx: 18, cy: -50, r: 21, fill: leaf2 }, t)];
  return { t, c };
}
export function parkBg(k, FY = 236) {
  k.backdrop({ floorY: FY });
  k.el('rect', { x: 0, y: FY, width: 400, height: 64, fill: '#DCEFD9' });
  k.el('rect', { x: 0, y: FY, width: 400, height: 2, fill: '#C3E2BE' });
  k.el('path', { d: `M 0 ${FY - 30} Q 100 ${FY - 70} 200 ${FY - 34} T 400 ${FY - 40} V ${FY} H 0 Z`, fill: '#E3F2E0' });
  return FY;
}
// 犬（右向き、原点＝足元）。set(x, y, 走る位相, 向き, 走り具合)
export function dog(k, col = '#D9A46C', dark = '#B07C47') {
  const { el, g } = k;
  const o = g({}), sh = k.shadow(0, 0, 24, 4, o), f = g({}, o);
  const legs = [-14, -8, 10, 16].map((x) => { const l = g({}, f); el('line', { x1: 0, y1: 0, x2: 0, y2: 13, stroke: dark, 'stroke-width': 5, 'stroke-linecap': 'round' }, l); return [l, x]; });
  const tail = g({}, f); el('path', { d: 'M 0 0 Q -10 -6 -14 -14', stroke: col, 'stroke-width': 5, fill: 'none', 'stroke-linecap': 'round' }, tail);
  el('ellipse', { cx: 0, cy: -20, rx: 22, ry: 11, fill: col }, f);
  const head = g({}, f);
  el('circle', { cx: 0, cy: 0, r: 11, fill: col }, head);
  el('ellipse', { cx: 10, cy: 3, rx: 7, ry: 5, fill: '#F2D2AE' }, head);
  el('circle', { cx: 15, cy: 1, r: 2.6, fill: k.pal.ink }, head);
  el('circle', { cx: 3, cy: -3, r: 2, fill: k.pal.ink }, head);
  const ear = el('ellipse', { cx: -4, cy: -4, rx: 4, ry: 8, fill: dark }, head);
  return {
    g: o,
    set(x, y, ph, face = 1, m = 1) {
      k.tf(o, x, y); k.tf(f, 0, -Math.abs(Math.sin(ph)) * 4 * m, 0, face, 1);
      legs.forEach(([l, lx], i) => k.tf(l, lx, -14, Math.sin(ph + (i < 2 ? 0 : Math.PI)) * 32 * m));
      k.tf(tail, -20, -24, Math.sin(ph * 2.2) * 18);
      k.tf(head, 20, -32, Math.sin(ph) * 4 * m);
      ear.setAttribute('transform', `rotate(${(-20 * m * Math.abs(Math.sin(ph))).toFixed(1)} -4 -10)`);
    }
  };
}
// 壁かけ時計。set(時, 分)
export function clock(k, x, y, r = 22, parent) {
  const c = k.g({}, parent); k.tf(c, x, y);
  k.el('circle', { r, fill: '#fff', stroke: k.pal.ink, 'stroke-width': 3 }, c);
  for (let i = 0; i < 12; i++) { const a = (i * Math.PI) / 6; k.el('line', { x1: Math.sin(a) * (r - 6), y1: -Math.cos(a) * (r - 6), x2: Math.sin(a) * (r - 3), y2: -Math.cos(a) * (r - 3), stroke: k.pal.sub, 'stroke-width': i % 3 ? 1.4 : 2.4 }, c); }
  const hh = k.el('line', { x1: 0, y1: 0, x2: 0, y2: -r * 0.5, stroke: k.pal.ink, 'stroke-width': 3.4, 'stroke-linecap': 'round' }, c);
  const mh = k.el('line', { x1: 0, y1: 0, x2: 0, y2: -r * 0.78, stroke: k.pal.coralDark, 'stroke-width': 2.2, 'stroke-linecap': 'round' }, c);
  k.el('circle', { r: 2.6, fill: k.pal.ink }, c);
  return { g: c, set(h, m) { hh.setAttribute('transform', `rotate(${((h % 12) * 30 + m * 0.5).toFixed(2)})`); mh.setAttribute('transform', `rotate(${(m * 6).toFixed(2)})`); } };
}
// 窓（空の色を変えられる）
export function win(k, x, y, w, h, sky = '#DDEFFA') {
  const s = k.el('rect', { x, y, width: w, height: h, rx: 6, fill: sky, stroke: '#fff', 'stroke-width': 5 });
  const inner = k.g({}); const cp = k.clip((c) => k.el('rect', { x, y, width: w, height: h }, c)); inner.setAttribute('clip-path', cp);
  const frame = () => { k.el('rect', { x, y, width: w, height: h, rx: 6, fill: 'none', stroke: '#fff', 'stroke-width': 5 }); k.el('line', { x1: x + w / 2, y1: y, x2: x + w / 2, y2: y + h, stroke: '#fff', 'stroke-width': 4 }); };
  return { sky: s, inner, frame };
}
// 横向きの車（右向き、原点＝前後中央の地面）。set(x, 車輪回転度)
export function car(k, color = k.pal.blue, dark = k.pal.blueDark, shine = false) {
  const { el, g } = k;
  const o = g({}); k.shadow(0, 0, 62, 6, o);
  const body = g({}, o);
  el('path', { d: 'M -64 -14 Q -66 -38 -48 -40 L -30 -42 Q -18 -66 6 -66 L 24 -66 Q 40 -64 50 -42 Q 66 -40 66 -24 L 66 -14 Z', fill: color }, body);
  el('path', { d: 'M -24 -44 Q -14 -60 2 -60 L 6 -60 L 6 -44 Z', fill: '#CFE9F7' }, body);
  el('path', { d: 'M 12 -60 L 22 -60 Q 34 -58 42 -44 L 12 -44 Z', fill: '#CFE9F7' }, body);
  el('rect', { x: -64, y: -22, width: 130, height: 6, fill: dark, opacity: 0.45 }, body);
  el('circle', { cx: 60, cy: -32, r: 4, fill: k.pal.yellow }, body);
  el('rect', { x: -66, y: -34, width: 5, height: 7, rx: 2, fill: k.pal.red }, body);
  if (shine) el('path', { d: 'M -40 -36 Q -10 -40 40 -36', stroke: '#fff', 'stroke-width': 3, opacity: 0.6, fill: 'none', 'stroke-linecap': 'round' }, body);
  const wheels = [-38, 38].map((wx) => { const w = g({}, o); el('circle', { r: 13, fill: k.pal.ink }, w); el('circle', { r: 6, fill: '#C9D1DC' }, w); el('rect', { x: -1.5, y: -6, width: 3, height: 12, fill: k.pal.sub }, w); return [w, wx]; });
  return { g: o, body, set(x, rot = 0, y = 0, bob = 0) { k.tf(o, x, y); k.tf(body, 0, bob); wheels.forEach(([w, wx]) => k.tf(w, wx, -13, rot)); } };
}
export function star(k, c) {
  const s = k.g({}); k.el('path', { d: 'M 0 -9 L 3 -3 L 9 0 L 3 3 L 0 9 L -3 3 L -9 0 L -3 -3 Z', fill: c || k.pal.yellow }, s);
  return { g: s, set(x, y, p) { k.tf(s, x, y - 8 * p, p * 80, 0.2 + hump(p)); s.setAttribute('opacity', p > 0 && p < 1 ? 1 : 0); } };
}
export function coin(k, parent) {
  const c = k.g({}, parent);
  k.el('circle', { r: 7, fill: k.pal.yellow, stroke: k.pal.yellowDark, 'stroke-width': 2 }, c);
  k.el('circle', { r: 3.5, fill: 'none', stroke: k.pal.yellowDark, 'stroke-width': 1.4 }, c);
  return c;
}
export function bill(k, parent) {
  const c = k.g({}, parent);
  k.el('rect', { x: -14, y: -8, width: 28, height: 16, rx: 2, fill: '#BFE8C9', stroke: '#59C27A', 'stroke-width': 1.6 }, c);
  k.el('circle', { r: 4.5, fill: 'none', stroke: '#59C27A', 'stroke-width': 1.6 }, c);
  return c;
}
export function sofa(k, x, y, w = 150, col = '#A58BF3', dark = '#8C70DD') {
  const s = k.g({}); k.shadow(x, y, w / 2 + 6, 5, s);
  k.el('rect', { x: x - w / 2, y: y - 74, width: w, height: 46, rx: 14, fill: dark }, s);
  k.el('rect', { x: x - w / 2 - 10, y: y - 44, width: 22, height: 40, rx: 9, fill: col }, s);
  k.el('rect', { x: x + w / 2 - 12, y: y - 44, width: 22, height: 40, rx: 9, fill: col }, s);
  return { back: s, front() { k.el('rect', { x: x - w / 2 + 8, y: y - 34, width: w - 16, height: 26, rx: 8, fill: col }); k.el('rect', { x: x - w / 2 - 10, y: y - 44, width: 22, height: 40, rx: 9, fill: col }); k.el('rect', { x: x + w / 2 - 12, y: y - 44, width: 22, height: 40, rx: 9, fill: col }); k.el('rect', { x: x - w / 2, y: y - 10, width: w, height: 8, rx: 3, fill: dark }); } };
}

export const meta = { duration: 3.8, beats: [[0, '犬が逃げる'], [1.0, '走って追う'], [3.1, 'まだ追っている']] };

export function create(k) {
  const { el, pal } = k;
  const FY = parkBg(k, 238);
  tree(k, 70, FY - 4, 0.9); tree(k, 350, FY - 6, 0.7);
  el('rect', { x: 180, y: FY - 30, width: 60, height: 6, rx: 3, fill: pal.wood }); el('rect', { x: 186, y: FY - 24, width: 5, height: 20, fill: pal.woodDark }); el('rect', { x: 229, y: FY - 24, width: 5, height: 20, fill: pal.woodDark });
  const d = dog(k);
  const a = k.buddy({ scale: 0.66, y: FY + 6 });
  const c = k.buddy({ scale: 0.6, y: FY + 2, color: pal.coral, dark: pal.coralDark });
  const dx = (t) => lerp(190, 372, easeInOut(seg(t, 0.25, 3.6)));
  const ax = (t) => lerp(26, 212, easeInOut(seg(t, 0.55, 3.7)));
  const cx = (t) => lerp(84, 266, easeInOut(seg(t, 0.75, 3.75)));
  return {
    update(t) {
      const dm = clamp((dx(t + 0.03) - dx(t - 0.03)) / 3);
      d.set(dx(t), FY + 4, (dx(t) - 190) * 0.11, 1, Math.max(dm, 0.15));
      const ra = run(ax, t, 26), rc = run(cx, t, 84);
      P(a, { ...ra, armR: ra.m > 0.2 ? ra.armR : lerp(8, 100, hump(seg(t, 0.1, 0.6))), mood: 'open', look: 0.8, blink: blinkAt(t) });
      P(c, { ...rc, mood: 'grin', look: 0.8, blink: blinkAt(t, 1) });
    }
  };
}
