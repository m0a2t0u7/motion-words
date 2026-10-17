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
// hit：ピッチャーが投げたボールを、バッターがバットでとらえて打ち返す（例文 He hit the ball with a bat.）
export const meta = { duration: 4.0, beats: [[0, '構える'], [1.8, 'バットで打つ'], [3.0, '飛んでいく']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 0.95, S2 = 0.55;
  const FY = k.backdrop({ floorY: 236 });
  el('rect', { x: 0, y: FY, width: 400, height: 64, fill: '#CDEBC5' });
  el('rect', { x: 0, y: FY, width: 400, height: 2, fill: '#A9D49C' });
  el('path', { d: 'M 108 ' + (FY + 10) + ' L 130 ' + (FY + 10) + ' L 136 ' + (FY + 18) + ' L 102 ' + (FY + 18) + ' Z', fill: '#fff' });
  el('ellipse', { cx: 346, cy: FY + 4, rx: 34, ry: 6, fill: '#D9C29E' });
  const pit = k.buddy({ x: 346, y: FY - 2, scale: S2, facing: -1, color: pal.coral, dark: pal.coralDark });
  const b = k.buddy({ x: 118, y: FY, scale: S });
  // バット（手元が原点、腕の向きにのびる）
  const bat = g({});
  el('path', { d: 'M -3 -8 L 3 -8 L 3.5 18 L 6.5 40 Q 7 60 0 62 Q -7 60 -6.5 40 L -3.5 18 Z', fill: pal.wood, stroke: pal.woodDark, 'stroke-width': 2, 'stroke-linejoin': 'round' }, bat);
  el('rect', { x: -3.2, y: -9, width: 6.4, height: 3.5, rx: 1.5, fill: pal.woodDark }, bat);
  const grip = el('circle', { r: 6.5 * S, fill: pal.mint, stroke: pal.mintDark, 'stroke-width': 2.5 * S });
  const ball = g({});
  el('circle', { r: 6.5, fill: '#fff', stroke: pal.red, 'stroke-width': 1.5 }, ball);
  el('path', { d: 'M -4 -3 Q 0 0 -4 3 M 4 -3 Q 0 0 4 3', stroke: pal.red, 'stroke-width': 1.2, fill: 'none' }, ball);
  const bsh = k.shadow(0, FY + 4, 6, 1.6);
  const star = g({});
  el('path', { d: 'M 0 -16 L 4 -5 L 16 -8 L 8 0 L 16 8 L 4 5 L 0 16 L -4 5 L -16 8 L -8 0 L -16 -8 L -4 -5 Z', fill: pal.yellow, stroke: pal.yellowDark, 'stroke-width': 2 }, star);
  const tc = 2.0, rel = 0.95;
  const armAt = (t) => t < 1.2 ? 180 + 14 * easeInOut(seg(t, 0.7, 1.2)) : t < 2.0 ? lerp(194, 98, easeIn(seg(t, 1.55, 2.0))) : lerp(98, 30, easeOut(seg(t, 2.0, 2.7)));
  const leanAt = (t) => -5 * easeInOut(seg(t, 0.7, 1.2)) + 15 * easeOut(seg(t, 1.6, 2.05)) - 8 * seg(t, 2.6, 3.4);
  const stance = (t) => ({ armR: armAt(t), lean: leanAt(t), mood: t > 1.9 ? 'open' : 'flat', look: 0.9, armL: 8 });
  b.pose(stance(tc));
  const hh = hp(b, S, 'R'), ang = rad(b.state.lean - b.state.armR);
  const P = { x: hh.x + 40 * Math.sin(-ang), y: hh.y + 40 * Math.cos(-ang) };
  b.pose(stance(0));
  const rpos = (t) => { const p = seg(t, rel, tc); const q = pit.state; return { x: lerp(318, P.x, p), y: lerp(FY - 40, P.y, p) - 14 * Math.sin(p * Math.PI) }; };

  return {
    update(t) {
      b.pose(stance(t));
      const st = b.state, hand = hp(b, S, 'R');
      b.pose({ armL: reach(b, S, 'L', hand.x, hand.y) * seg(t, 0.2, 0.6) + 8 * (1 - seg(t, 0.2, 0.6)) });
      tf(bat, hand.x, hand.y, st.lean - st.armR);
      k.set(grip, { cx: hand.x, cy: hand.y });
      const pw = easeInOut(seg(t, 0.5, 0.95));
      pit.pose({ armR: t < rel ? lerp(8, 175, pw) : lerp(175, 40, easeOut(seg(t, rel, 1.3))), lean: -6 * pw + 12 * seg(t, 0.9, 1.3), mood: 'flat', look: 0.6 });
      let pos;
      if (t < rel) pos = null;
      else if (t < tc) pos = rpos(t);
      else { const u = t - tc; pos = { x: P.x + 80 * u, y: P.y - 125 * u + 52 * u * u }; }
      ball.setAttribute('opacity', pos ? 1 : 0);
      if (pos) tf(ball, pos.x, pos.y, t * 600);
      bsh.setAttribute('opacity', 0);
      const sp = seg(t, tc, tc + 0.3);
      tf(star, P.x, P.y, 0, hump(sp) * 1.1 + 0.001);
    }
  };
}
