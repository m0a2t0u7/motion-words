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
// kick：助走をつけてボールを蹴り、ボールがゴールのネットに入る（例文 He kicked the ball into the goal.）
export const meta = { duration: 4.2, beats: [[0, '助走'], [1.6, '蹴る'], [3.2, 'ゴール']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 0.9;
  const FY = k.backdrop({ floorY: 236 });
  el('rect', { x: 0, y: FY, width: 400, height: 64, fill: '#CDEBC5' });
  for (let i = 0; i < 5; i++) el('rect', { x: i * 90 - 20, y: FY + 2, width: 45, height: 62, fill: '#C2E4B9' });
  el('rect', { x: 0, y: FY, width: 400, height: 2, fill: '#A9D49C' });
  // ゴール：奥のネット
  const gx = 318, gy = 124, gw = 76, gh = FY - gy;
  const net = g({});
  el('rect', { x: gx, y: gy, width: gw, height: gh, fill: '#fff', opacity: 0.25 }, net);
  for (let i = 1; i < 8; i++) el('line', { x1: gx + i * gw / 8, y1: gy, x2: gx + i * gw / 8, y2: FY, stroke: '#fff', 'stroke-width': 1.4, opacity: 0.9 }, net);
  for (let i = 1; i < 6; i++) el('line', { x1: gx, y1: gy + i * gh / 6, x2: gx + gw, y2: gy + i * gh / 6, stroke: '#fff', 'stroke-width': 1.4, opacity: 0.9 }, net);
  k.shadow(358, FY + 4, 46, 5);
  const ball = g({});
  const bs = k.shadow(0, FY, 10, 2.6);
  const bb = g({}, ball);
  el('circle', { r: 10, fill: '#fff', stroke: pal.ink, 'stroke-width': 1.8 }, bb);
  [[0, 0], [-6, -6], [6, -5], [-6, 6], [6, 6]].forEach(([x, y]) => el('circle', { cx: x, cy: y, r: x || y ? 2.2 : 3, fill: pal.ink }, bb));
  // 手前のポスト
  el('rect', { x: gx - 3, y: gy - 3, width: 6, height: gh + 3, rx: 3, fill: '#fff', stroke: '#B4BFCD', 'stroke-width': 1.5 });
  el('rect', { x: gx + gw - 3, y: gy - 3, width: 6, height: gh + 3, rx: 3, fill: '#fff', stroke: '#B4BFCD', 'stroke-width': 1.5 });
  el('rect', { x: gx - 3, y: gy - 3, width: gw + 6, height: 6, rx: 3, fill: '#fff', stroke: '#B4BFCD', 'stroke-width': 1.5 });
  const b = k.buddy({ x: 70, y: FY, scale: S });
  const sx = 176, sy = FY - 10, tk = 1.58;
  const xf = (t) => lerp(60, 136, easeOut(seg(t, 0.3, 1.35)));

  return {
    update(t) {
      const p = gait(xf, t, 60, 18, 0.12);
      const wind = easeInOut(seg(t, 1.3, 1.55)), hit = easeOut(seg(t, 1.5, 1.64)), fol = easeInOut(seg(t, 1.8, 2.6));
      const cheer = easeOut(seg(t, 2.9, 3.5));
      b.pose({
        x: p.x, walk: p.walk, armL: lerp(p.armL, 50, wind) * (1 - fol) + cheer * 150 * fol, armR: lerp(p.armR, -30, wind) * (1 - fol) + cheer * 150 * fol,
        lean: p.lean - 8 * wind + 22 * hit - 22 * fol, mood: t > 1.6 ? (t > 2.9 ? 'grin' : 'open') : 'smile', look: 0.7,
        lift: 6 * hump(seg(t, 3.0, 3.6)) * cheer
      });
      if (t > 1.2 && t < 2.5 && !cheer) { /* 脚のみ個別 */ }
      const kick = lerp(0, 40, wind) * (1 - hit) + lerp(0, -88, hit) * (1 - fol);
      if (t > 1.25) leg(b, 1, lerp(0, 40, wind) * (1 - hit) - 88 * hit * (1 - fol));
      // ボール
      const q = seg(t, tk, 2.75), r = easeOut(seg(t, tk, 3.4));
      const bx = t < tk ? sx : lerp(sx, 366, r);
      const roll = t > 2.75 ? 0 : 1;
      let by = sy - 4 * 62 * q * (1 - q) * (q < 1 ? 1 : 0);
      if (t > 2.75) by = sy;
      tf(ball, bx, by);
      tf(bb, 0, 0, bx * 3.2);
      k.set(bs, { cx: 0, cy: sy + 10 - by + FY - sy - 10 + 0, rx: 10 * (1 - 0.4 * (sy - by) / 70), opacity: 1 });
      bs.setAttribute('cy', FY + 0 - by + by * 0); // 地面に固定
      bs.setAttribute('transform', `translate(0 ${(-by).toFixed(2)})`);
      // ネットのゆれ（ボールが入ったあと）
      const nw = seg(t, 2.55, 3.6);
      tf(net, gx + gw + 2, 0, 0, 1, 1);
      net.setAttribute('transform', `translate(${(wobble(nw, 2.5, 4) * 5).toFixed(2)} 0)`);
    }
  };
}
