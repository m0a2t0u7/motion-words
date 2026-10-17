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
// nod：友だちが「？」と尋ね、まめが2回うなずいて「Yes」と答える（例文 He nodded and said yes.）
export const meta = { duration: 4.0, beats: [[0, '尋ねられる'], [1.5, 'うなずく'], [3.0, 'Yesと答える']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 0.9;
  const FY = k.backdrop({ floorY: 240, mood: 'indoor' });
  el('rect', { x: 160, y: 50, width: 80, height: 60, rx: 6, fill: '#DDEFFA', stroke: '#fff', 'stroke-width': 5 });
  el('line', { x1: 200, y1: 50, x2: 200, y2: 110, stroke: '#fff', 'stroke-width': 4 });
  el('ellipse', { cx: 200, cy: 262, rx: 150, ry: 18, fill: '#F1D9CF' });
  const fr = k.buddy({ x: 105, y: FY, scale: S, facing: 1, color: pal.coral, dark: pal.coralDark });
  const he = k.buddy({ x: 290, y: FY, scale: S, facing: -1 });
  const q = bubble(k, '?', 40);
  const y = bubble(k, 'Yes', 58);
  const ck = g({});
  el('circle', { r: 11, fill: pal.green }, ck);
  el('path', { d: 'M -5 0 L -1.5 4 L 5.5 -4', stroke: '#fff', 'stroke-width': 3, fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, ck);

  return {
    update(t) {
      const n = seg(t, 1.5, 2.7) * 2;
      const nod = n < 2 ? hump(n % 1) : 0;
      const talk = t > 2.7 && t < 3.5 ? (Math.sin(t * 16) > 0 ? 'open' : 'smile') : 'smile';
      he.pose({ lean: 22 * nod, squash: 1 - 0.03 * nod, blink: 0.6 * nod, look: 0.5, mood: t > 2.65 ? talk : 'smile' });
      fr.pose({ look: 0.6, mood: t < 1.4 ? 'flat' : 'smile', armR: t > 3.2 ? lerp(8, 120, easeOut(seg(t, 3.2, 3.6))) : 8, lean: t < 1.4 ? 3 * hump(seg(t, 0.3, 1.2)) : 0, squash: 1 + 0.01 * Math.sin(t * 4) });
      tf(q, 118, FY - 112, 0, Math.max(backOut(seg(t, 0.4, 0.7)) * (1 - seg(t, 1.5, 1.8)), 0.001));
      tf(y, 270, FY - 118, 0, Math.max(backOut(seg(t, 2.7, 3.0)), 0.001));
      tf(ck, 304, FY - 122, 0, Math.max(backOut(seg(t, 3.0, 3.3)), 0.001));
    }
  };
}
