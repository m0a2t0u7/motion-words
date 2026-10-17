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
// hug：弟が駆け寄り、お姉さんが両腕で包んで抱きしめる（例文 She hugged her little brother.）
export const meta = { duration: 4.2, beats: [[0, '腕を広げる'], [1.8, '駆け寄る'], [3.0, '抱きしめた']] };

export function create(k) {
  const { el, g, tf, pal } = k, S1 = 0.98, S2 = 0.62;
  const FY = k.backdrop({ floorY: 240, mood: 'indoor' });
  el('rect', { x: 150, y: 46, width: 80, height: 60, rx: 6, fill: '#DDEFFA', stroke: '#fff', 'stroke-width': 5 });
  el('line', { x1: 190, y1: 46, x2: 190, y2: 106, stroke: '#fff', 'stroke-width': 4 });
  el('ellipse', { cx: 220, cy: 262, rx: 130, ry: 16, fill: '#F1D9CF' });
  const her = k.buddy({ x: 150, y: FY, scale: S1, facing: 1, color: pal.coral, dark: pal.coralDark });
  const bro = k.buddy({ x: 340, y: FY, scale: S2, facing: -1 });
  // 前側の腕（弟の上に重ねて描く）
  const arm = el('line', { stroke: pal.coralDark, 'stroke-width': 9 * S1, 'stroke-linecap': 'round' });
  const hand = el('circle', { r: 6.5 * S1, fill: pal.coral, stroke: pal.coralDark, 'stroke-width': 2.5 * S1 });
  her.armR.a.setAttribute('display', 'none');
  const hearts = [0, 1, 2].map(() => el('path', { d: HEART, fill: pal.red }));
  const bx = (t) => lerp(340, 214, easeInOut(seg(t, 1.5, 2.8)));

  return {
    update(t) {
      const op = easeOut(seg(t, 0.4, 1.1)), hg = easeInOut(seg(t, 2.6, 3.2));
      const bxx = bx(t);
      const p = gait(bx, t, 340, 14, 0.2);
      her.pose({ armL: lerp(8, -95, op) + 18 * hg, lean: 4 * op + 10 * hg, squash: 1 - 0.07 * hg, mood: 'grin', blink: hg, look: 0.4, armR: lerp(8, 100, op) });
      const sh = hp(her, S1, 'R', 0), open = hp(her, S1, 'R', 27);
      const tgt = { x: bxx + 15, y: FY - 56 * S2 - 6 };
      const e = { x: lerp(open.x, tgt.x, hg), y: lerp(open.y, tgt.y, hg) };
      k.set(arm, { x1: sh.x, y1: sh.y, x2: e.x, y2: e.y });
      k.set(hand, { cx: e.x, cy: e.y });
      bro.pose({ x: bxx, walk: p.walk, armL: p.armL, armR: lerp(p.armR, 115, hg), lean: p.lean + 6 * hg, blink: hg, look: 0.6, mood: 'grin' });
      hearts.forEach((h, i) => {
        const q = seg(t, 3.2 + i * 0.2, 4.1 + i * 0.1);
        tf(h, 168 + i * 22, FY - 150 - 20 * q + (i % 2) * 8, 0, hump(q) * 1.1 + 0.001);
      });
    }
  };
}
