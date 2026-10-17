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
// catch：友だちが投げたボールを、まめが片手でパシッとつかむ（例文 I caught the ball with one hand.）
export const meta = { duration: 4.0, beats: [[0, '投げられる'], [1.7, '片手でつかむ'], [2.8, '持ち上げる']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 0.95;
  const FY = k.backdrop({ floorY: 238 });
  el('rect', { x: 0, y: FY, width: 400, height: 62, fill: '#CDEBC5' });
  el('rect', { x: 0, y: FY, width: 400, height: 2, fill: '#A9D49C' });
  [[330, 40], [372, 30]].forEach(([x, h], i) => { el('rect', { x: x - 4, y: FY - h - 20, width: 8, height: h + 20, rx: 3, fill: pal.woodDark }); el('circle', { cx: x, cy: FY - h - 30, r: 24 - i * 4, fill: '#7FD3A0' }); });
  const fr = k.buddy({ x: 62, y: FY, scale: S, facing: 1, color: pal.coral, dark: pal.coralDark });
  const b = k.buddy({ x: 250, y: FY, scale: S, facing: -1 });
  const ball = g({});
  const bsh = k.shadow(0, FY, 9, 2.4);
  el('circle', { r: 9, fill: pal.red }, ball);
  el('path', { d: 'M -9 0 Q 0 -5 9 0 M -6 -6 Q 0 0 -6 6', stroke: '#fff', 'stroke-width': 1.6, fill: 'none' }, ball);
  const grip = el('circle', { r: 6.5 * S, fill: pal.mint, stroke: pal.mintDark, 'stroke-width': 2.5 * S });
  const pop = el('path', { d: 'M 0 -14 L 3 -5 L 12 -9 L 7 -1 L 15 4 L 5 4 L 4 13 L -2 6 L -10 12 L -8 3 L -16 -2 L -7 -4 Z', fill: pal.yellow, stroke: pal.yellowDark, 'stroke-width': 1.5 });
  const L = 1.0, C = 1.95;
  const prep = (t) => easeOut(seg(t, 0.7, 1.4));
  const ang = (t) => t < C ? lerp(8, 82, prep(t)) : lerp(82 - 14, 150, easeInOut(seg(t, 2.5, 3.2))) * 1 + (t < 2.5 ? 0 : 0);
  const pose = (t) => {
    const rec = t > C ? 14 * hump(seg(t, C, C + 0.35)) : 0;
    const up = easeInOut(seg(t, 2.5, 3.2));
    return { armR: t < C ? lerp(8, 82, prep(t)) : lerp(82 - rec, 150, up), lean: -3 * prep(t) + 5 * hump(seg(t, C, C + 0.3)), mood: t < C ? 'open' : 'grin', look: 0.8, armL: 8, squash: 1 - 0.03 * hump(seg(t, C, C + 0.25)) };
  };
  b.pose(pose(C - 0.0001));
  const Cp = hp(b, S, 'R', 33);
  const Lp = { x: 80, y: FY - 62 };

  return {
    update(t) {
      const th = easeInOut(seg(t, 0.5, 1.0)), rl = seg(t, 0.95, 1.05);
      fr.pose({ armR: t < L ? lerp(8, 160, th) : lerp(160, 40, easeOut(seg(t, L, 1.3))), lean: -5 * th + 12 * seg(t, 0.95, 1.3), mood: 'grin', look: 0.8 });
      b.pose(pose(t));
      const hand = hp(b, S, 'R');
      let pos = null;
      if (t >= L && t < C) { const q = seg(t, L, C); pos = { x: lerp(Lp.x, Cp.x, q), y: lerp(Lp.y, Cp.y, q) - 56 * Math.sin(q * Math.PI) }; }
      else if (t >= C) pos = { x: hand.x - 6, y: hand.y - 2 };
      ball.setAttribute('opacity', pos ? 1 : 0);
      if (pos) tf(ball, pos.x, pos.y, t * 500 * (t < C ? 1 : 0));
      bsh.setAttribute('opacity', 0);
      k.set(grip, { cx: hand.x, cy: hand.y });
      grip.setAttribute('opacity', t >= C ? 1 : 0);
      const pp = seg(t, C, C + 0.35);
      tf(pop, Cp.x - 4, Cp.y, 0, hump(pp) * 1.1 + 0.001);
    }
  };
}
