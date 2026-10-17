import { seg, lerp, easeInOut, easeOut, easeIn, backOut, smooth, wobble, hump, clamp } from '../ease.js';
const rad = (d) => (d * Math.PI) / 180;
const deg = (r) => (r * 180) / Math.PI;
// 手先（len=0 で肩）のワールド座標。体の傾き・つぶれ・向きを反映
function hp(b, s, side = 'R', len = 27) {
  const st = b.state, a = rad(side === 'R' ? -st.armR : st.armL);
  let x = (side === 'R' ? 27 : -27) - len * Math.sin(a), y = -46 + len * Math.cos(a);
  x *= 2 - st.squash; y *= st.squash;
  const l = rad(st.lean), c = Math.cos(l), sn = Math.sin(l);
  return { x: st.x + (x * c - y * sn) * st.facing * s, y: st.y + (x * sn + y * c - 10 - st.lift) * s };
}
// 指定の点の方向へ腕を向ける角度
function reach(b, s, side, tx, ty) {
  const st = b.state, o = hp(b, s, side, 0);
  const phi = deg(Math.atan2(-(tx - o.x) * st.facing, ty - o.y));
  return side === 'R' ? st.lean - phi : phi - st.lean;
}
// 位置の関数から歩行の位相と腕振りを作る（止まると脚をそろえる）
function gait(xf, t, x0, amp = 18, kf = 0.107) {
  const x = xf(t), v = Math.abs(xf(t + 0.02) - xf(t - 0.02)) / 0.04;
  const ph = Math.abs(x - x0) * kf, m = clamp(v / 25);
  const w = lerp(Math.round(ph / Math.PI) * Math.PI, ph, m);
  return { x, walk: w, armL: 8 + Math.sin(w) * amp * m, armR: 8 - Math.sin(w) * amp * m, lean: 3 * m, m };
}
// 脚を個別に回す（pose の後に呼ぶ。i=0 奥脚 / 1 手前脚、正で後ろ）
function leg(b, i, ang) {
  const g = b.g.children[1].children[i];
  g.setAttribute('transform', `translate(${i ? 12 : -12} ${-14 - b.state.lift}) rotate(${ang.toFixed(2)})`);
}
function bubble(k, txt, w = 54) {
  const n = k.g();
  k.el('rect', { x: -w / 2, y: -14, width: w, height: 26, rx: 13, fill: '#fff', stroke: k.pal.line, 'stroke-width': 2 }, n);
  k.el('path', { d: 'M -5 11 L 0 21 L 7 11 Z', fill: '#fff', stroke: k.pal.line, 'stroke-width': 2, 'stroke-linejoin': 'round' }, n);
  k.el('rect', { x: -6, y: 9, width: 16, height: 4, fill: '#fff' }, n);
  k.text(0, 0, txt, { 'font-size': 14 }, n);
  return n;
}
const HEART = 'M 0 6 C -12 -2 -8 -12 0 -5 C 8 -12 12 -2 0 6 Z';
// touch：熱いフライパンに手を伸ばすが、友だちが止めて、触る前に手を引く（例文 Don't touch the hot pan.）
export const meta = { duration: 4.2, beats: [[0, '熱い鍋'], [1.5, '手を伸ばす'], [3.2, '触らない']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 0.95;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  // コンロ台
  el('rect', { x: 268, y: 176, width: 132, height: 62, rx: 4, fill: '#C9CFD9' });
  el('rect', { x: 262, y: 168, width: 138, height: 10, rx: 3, fill: '#8F98A8' });
  el('rect', { x: 284, y: 188, width: 60, height: 30, rx: 4, fill: '#B3BAC7' });
  el('circle', { cx: 372, cy: 198, r: 5, fill: pal.red });
  k.shadow(334, FY + 1, 70, 4);
  const hxP = 280, hyP = 160;
  // フライパン（取っ手は左へ）
  const glow = el('ellipse', { cx: 322, cy: 166, rx: 36, ry: 6, fill: pal.red, opacity: 0 });
  el('rect', { x: hxP - 2, y: 157, width: 34, height: 7, rx: 3.5, fill: '#4B5365' });
  el('path', { d: 'M 296 150 L 350 150 L 346 168 L 300 168 Z', fill: '#3A4152', 'stroke-linejoin': 'round', stroke: '#3A4152', 'stroke-width': 4 });
  const heat = g({});
  [0, 1, 2].forEach((i) => el('path', { d: `M ${306 + i * 16} 140 q -6 -8 0 -16 q 6 -8 0 -16`, fill: 'none', stroke: pal.red, 'stroke-width': 3, 'stroke-linecap': 'round' }, heat));
  const no = g({});
  el('circle', { r: 17, fill: '#fff', stroke: pal.red, 'stroke-width': 6 }, no);
  el('line', { x1: -12, y1: 12, x2: 12, y2: -12, stroke: pal.red, 'stroke-width': 6, 'stroke-linecap': 'round' }, no);
  const mom = k.buddy({ x: 66, y: FY, scale: S, color: pal.coral, dark: pal.coralDark });
  const b = k.buddy({ x: 150, y: FY, scale: S });
  const ex = bubble(k, '!', 34);
  const xf = (t) => lerp(150, 212, easeInOut(seg(t, 0.2, 1.4)));

  return {
    update(t) {
      const p = gait(xf, t, 150);
      const rp = easeInOut(seg(t, 1.2, 2.0)), back = easeOut(seg(t, 2.7, 3.2));
      b.pose({ x: p.x, walk: p.walk, armL: p.armL, lean: p.lean + 6 * rp - 14 * back, look: 0.8, armR: 8, mood: back > 0 ? 'open' : 'smile' });
      const tgt = reach(b, S, 'R', hxP + 4, hyP + 4);
      const shake = Math.sin(t * 40) * 2 * seg(t, 2.1, 2.6) * (1 - back);
      b.pose({ armR: lerp(p.armR, tgt, rp) * (1 - back) + 12 * back + shake });
      const warn = easeOut(seg(t, 1.6, 2.2));
      mom.pose({ look: 0.7, mood: warn > 0 ? 'open' : 'smile', armR: lerp(8, 105, warn) + Math.sin(t * 12) * 6 * warn, armL: 8, lean: -4 * warn });
      tf(ex, 92, FY - 118, 0, Math.max(backOut(seg(t, 1.6, 1.9)), 0.001));
      glow.setAttribute('opacity', 0.28 + 0.1 * Math.sin(t * 5));
      tf(heat, 0, -2 * Math.sin(t * 4));
      heat.setAttribute('opacity', 0.5 + 0.4 * Math.sin(t * 6));
      tf(no, 322, 104, 0, Math.max(backOut(seg(t, 2.8, 3.2)), 0.001));
    }
  };
}
