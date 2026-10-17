// move away：引っ越しのトラックの荷台に荷物を積み、運転席の友だちが手を振って走り去る。まめは家の前で見送る（例文 My best friend moved away last year.）
import { seg, lerp, easeInOut, easeOut, easeIn, backOut, smooth, wobble, hump, clamp } from '../ease.js';
const rad = (d) => (d * Math.PI) / 180;
const deg = (r) => (r * 180) / Math.PI;
// 手先（腕の先）の正確な座標。体の傾き・つぶれ・向きを反映する
function hp(b, s, side = 'R', len = 28) {
  const st = b.state, a = rad(side === 'R' ? -st.armR : st.armL);
  let x = (side === 'R' ? 27 : -27) - len * Math.sin(a), y = -46 + len * Math.cos(a);
  x *= 2 - st.squash; y *= st.squash;
  const l = rad(st.lean), c = Math.cos(l), sn = Math.sin(l);
  return { x: st.x + (x * c - y * sn) * st.facing * s, y: st.y + (x * sn + y * c - 10 - st.lift) * s };
}
// 指定の点へ手を伸ばすための腕の角度
function reach(b, s, side, tx, ty) {
  const st = b.state, o = hp(b, s, side, 0);
  const phi = deg(Math.atan2(-(tx - o.x) * st.facing, ty - o.y));
  return side === 'R' ? st.lean - phi : phi - st.lean;
}
const faceAt = (b, dx, dy = 0) => b.body.children[3].setAttribute('transform', `translate(${dx.toFixed(2)} ${dy.toFixed(2)})`);
const legsOf = (b) => b.g.children[1].children;
// 位置の関数 xf(t) から歩行の位相と腕振りを作る（止まると脚をそろえる）
function gait(xf, t, x0, amp = 18, kf = 0.107) {
  const x = xf(t), v = Math.abs(xf(t + 0.02) - xf(t - 0.02)) / 0.04;
  const ph = Math.abs(x - x0) * kf, m = clamp(v / 25);
  const w = lerp(Math.round(ph / Math.PI) * Math.PI, ph, m);
  return { x, walk: w, armL: 8 + Math.sin(w) * amp * m, armR: 8 - Math.sin(w) * amp * m, lean: 3 * m, m };
}
function clockFace(k, x, y, r, h, m, parent) {
  const c = k.g({}, parent); k.tf(c, x, y);
  k.el('circle', { r, fill: '#fff', stroke: k.pal.ink, 'stroke-width': 3 }, c);
  for (let i = 0; i < 12; i++) { const a = rad(i * 30); k.el('line', { x1: Math.sin(a) * (r - 5), y1: -Math.cos(a) * (r - 5), x2: Math.sin(a) * (r - 2.5), y2: -Math.cos(a) * (r - 2.5), stroke: k.pal.sub, 'stroke-width': 1.8 }, c); }
  const hand = (ang, len, w) => { const a = rad(ang); k.el('line', { x1: 0, y1: 0, x2: Math.sin(a) * len, y2: -Math.cos(a) * len, stroke: k.pal.ink, 'stroke-width': w, 'stroke-linecap': 'round' }, c); };
  hand((h % 12) * 30 + m * 0.5, r * 0.5, 3.2); hand(m * 6, r * 0.75, 2.2);
  return c;
}
function tree(k, x, y, s = 1, parent) {
  const t = k.g({}, parent); k.tf(t, x, y, 0, s);
  k.shadow(0, 0, 26, 5, t);
  k.el('rect', { x: -5, y: -44, width: 10, height: 44, rx: 4, fill: k.pal.woodDark }, t);
  k.el('circle', { cx: 0, cy: -62, r: 30, fill: '#7FD3A0' }, t);
  k.el('circle', { cx: -16, cy: -48, r: 20, fill: '#6BC48F' }, t);
  k.el('circle', { cx: 18, cy: -50, r: 21, fill: '#6BC48F' }, t);
  return t;
}

export const meta = { duration: 4.4, beats: [[0, '荷物を積んだ'], [1.2, '出発する'], [3.4, '遠ざかる']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236 });
  el('rect', { x: 0, y: FY + 6, width: 400, height: 22, fill: '#E3E8EE' });
  // 友だちが住んでいた家
  el('rect', { x: -20, y: 110, width: 96, height: FY - 110, rx: 5, fill: '#FBE9DC' });
  el('path', { d: 'M -30 116 L 28 70 L 86 116 Z', fill: pal.coral, stroke: pal.coral, 'stroke-width': 7, 'stroke-linejoin': 'round' });
  el('rect', { x: 36, y: 168, width: 30, height: FY - 168, rx: 3, fill: pal.blue });
  el('rect', { x: 0, y: 132, width: 26, height: 28, rx: 3, fill: '#CFE9F7' });
  // トラック（原点＝後ろ端の地面）
  const T = g({});
  k.shadow(72, 2, 78, 6, T);
  el('rect', { x: 0, y: -34, width: 94, height: 9, rx: 3, fill: pal.woodDark }, T);
  [[6, -60, 30, 26, '#E3C49B'], [36, -52, 24, 18, '#EBD2AE'], [62, -74, 28, 40, '#E3C49B'], [8, -80, 24, 20, '#EBD2AE']].forEach(([x, y, w, h, c]) => { el('rect', { x, y: y + (y === -60 ? 0 : 0), width: w, height: h, rx: 2, fill: c, stroke: '#C9A577', 'stroke-width': 1.5 }, T); el('line', { x1: x + w / 2, y1: y, x2: x + w / 2, y2: y + h, stroke: '#C9A577', 'stroke-width': 2 }, T); });
  el('path', { d: 'M 40 -34 q 0 -22 -9 -22', stroke: pal.green, 'stroke-width': 4, fill: 'none' }, T);
  el('path', { d: 'M 94 -25 V -68 Q 94 -74 100 -74 H 124 L 144 -46 V -25 Z', fill: pal.blue }, T);
  el('path', { d: 'M 102 -68 H 122 L 135 -49 H 102 Z', fill: '#D4EBF8' }, T);
  el('rect', { x: 140, y: -40, width: 6, height: 8, rx: 2, fill: pal.yellow }, T);
  const clipUrl = k.clip((cp) => el('path', { d: 'M 102 -68 H 122 L 135 -49 H 102 Z' }, cp));
  const cg = g({ 'clip-path': clipUrl }, T);
  const fr = k.buddy({ parent: cg, x: 116, y: -47, scale: 0.4, color: pal.coral, dark: pal.coralDark });
  fr.g.children[0].setAttribute('display', 'none');
  const wheels = [24, 118].map((cx) => { const w = g({}, T); tf(w, cx, -14); el('circle', { r: 14, fill: '#39414F' }, w); el('circle', { r: 6, fill: '#C9D1DC' }, w); el('line', { x1: -6, y1: 0, x2: 6, y2: 0, stroke: '#39414F', 'stroke-width': 2 }, w); el('line', { x1: 0, y1: -6, x2: 0, y2: 6, stroke: '#39414F', 'stroke-width': 2 }, w); return w; });
  const b = k.buddy({ x: 118, y: FY + 6, scale: 0.9 });
  return {
    update(t) {
      const e = easeInOut(seg(t, 1.1, 4.1));
      const xl = lerp(170, 316, e), s = lerp(1, 0.48, e);
      tf(T, xl, FY + 3 - 12 * e, 0, s, s);
      wheels.forEach((w, i) => tf(w, i ? 118 : 24, -14, (xl - 170) / 14 * 57.3 / s));
      fr.pose({ x: 116, armR: 100 + 30 * Math.sin(t * 8), armL: 8, mood: 'smile', look: 0.5, facing: 1 });
      const wv = seg(t, 0.2, 0.6);
      b.pose({ x: 118, armR: 8 + (115 + 25 * Math.sin(t * 8)) * wv, armL: 8, mood: t < 1.1 ? 'smile' : 'sad', look: 0.7, squash: 1 });
    }
  };
}
