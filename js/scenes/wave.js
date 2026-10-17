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
// wave：家の前で、彼女が帰る私たちに手を振る。私たちは歩いて離れ、振り返って手を振り返す（例文 She waved goodbye to us.）
export const meta = { duration: 4.2, beats: [[0, '見送り'], [1.5, '手を振る'], [3.5, '遠ざかる']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 0.85;
  const FY = k.backdrop({ floorY: 236 });
  // 家（右）
  el('rect', { x: 262, y: 92, width: 134, height: FY - 92, rx: 6, fill: '#FBE9DC' });
  el('path', { d: 'M 254 100 L 329 46 L 404 100 Z', fill: pal.coral, stroke: pal.coral, 'stroke-width': 6, 'stroke-linejoin': 'round' });
  el('rect', { x: 356, y: 122, width: 28, height: 30, rx: 4, fill: '#CFE9F7' });
  el('rect', { x: 286, y: FY - 88, width: 54, height: 88, rx: 4, fill: pal.blue });
  el('rect', { x: 294, y: FY - 78, width: 38, height: 30, rx: 3, fill: '#fff', opacity: 0.3 });
  el('circle', { cx: 330, cy: FY - 42, r: 3.5, fill: pal.yellow });
  el('rect', { x: 280, y: FY - 4, width: 66, height: 8, rx: 3, fill: pal.woodDark });
  // 低木
  [[36, 0], [62, 6]].forEach(([x, d]) => el('circle', { cx: x, cy: FY - 12 + d, r: 18 - d, fill: d ? '#6BC48F' : '#7FD3A0' }));
  const her = k.buddy({ x: 318, y: FY, scale: S, facing: -1, color: pal.coral, dark: pal.coralDark });
  const us = [
    { x0: 256, x1: 168, d: 0.9, c: pal.mint, dk: pal.mintDark },
    { x0: 196, x1: 70, d: 1.1, c: pal.blue, dk: pal.blueDark }
  ].map((o) => ({ ...o, b: k.buddy({ x: o.x0, y: FY, scale: S, facing: -1, color: o.c, dark: o.dk }) }));
  const bub = bubble(k, 'Bye!', 56);

  return {
    update(t) {
      const up = easeOut(seg(t, 0.6, 1.2));
      const w = seg(t, 1.2, 1.4) * Math.sin((t - 1.2) * 12) * 24;
      her.pose({ armR: lerp(8, 150, up) + w, mood: t < 0.6 ? 'smile' : 'open', look: 0.6, squash: 1 + 0.012 * Math.sin(t * 5) });
      const sb = backOut(seg(t, 1.0, 1.25)) * (1 - seg(t, 2.6, 2.8));
      tf(bub, 300, FY - 118, 0, Math.max(sb, 0.001));
      us.forEach((o, i) => {
        const xf = (tt) => lerp(o.x0, o.x1, easeInOut(seg(tt, o.d, 2.9 + i * 0.1)));
        const p = gait(xf, t, o.x0);
        const back = t > 3.0 + i * 0.1;
        const wv = Math.sin((t - 3.0) * 11 + i) * 24;
        o.b.pose({
          x: p.x, walk: back ? 0 : p.walk, facing: back ? 1 : -1,
          armL: 8, armR: back ? lerp(8, 150, easeOut(seg(t, 3.0 + i * 0.1, 3.4))) + wv * seg(t, 3.3, 3.5) : p.armR,
          lean: back ? 0 : p.lean, mood: back ? 'open' : 'smile', look: 0.5
        });
      });
    }
  };
}
