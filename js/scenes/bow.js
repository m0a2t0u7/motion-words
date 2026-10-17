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
// bow：向かい合った二人が、同時にゆっくりおじぎをして顔を上げる（例文 They bowed to each other.）
export const meta = { duration: 4.2, beats: [[0, '向かい合う'], [1.3, 'おじぎする'], [3.4, '顔を上げる']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 0.9;
  const FY = k.backdrop({ floorY: 240, mood: 'indoor' });
  // 和室ふうの壁：掛け軸と障子
  el('rect', { x: 40, y: 40, width: 74, height: 100, rx: 3, fill: '#fff', stroke: pal.woodDark, 'stroke-width': 4 });
  for (let i = 1; i < 3; i++) el('line', { x1: 40 + i * 24.7, y1: 40, x2: 40 + i * 24.7, y2: 140, stroke: pal.line, 'stroke-width': 2 });
  for (let i = 1; i < 4; i++) el('line', { x1: 40, y1: 40 + i * 25, x2: 114, y2: 40 + i * 25, stroke: pal.line, 'stroke-width': 2 });
  el('rect', { x: 300, y: 50, width: 36, height: 84, rx: 3, fill: '#FBF3DD', stroke: pal.woodDark, 'stroke-width': 3 });
  el('circle', { cx: 318, cy: 90, r: 11, fill: pal.red, opacity: 0.8 });
  el('rect', { x: 0, y: FY, width: 400, height: 60, fill: '#E8E0C8' });
  for (let i = 0; i < 8; i++) el('line', { x1: 0, y1: FY + 6 + i * 8, x2: 400, y2: FY + 6 + i * 8, stroke: '#D9CFB1', 'stroke-width': 1.5 });
  el('rect', { x: 0, y: FY, width: 400, height: 2, fill: pal.woodDark });
  const a = k.buddy({ x: 105, y: FY, scale: S, facing: 1 });
  const c = k.buddy({ x: 295, y: FY, scale: S, facing: -1, color: pal.coral, dark: pal.coralDark });
  const stars = [0, 1, 2].map(() => el('path', { d: 'M 0 -8 L 2 -2 L 8 0 L 2 2 L 0 8 L -2 2 L -8 0 L -2 -2 Z', fill: pal.yellow }));

  return {
    update(t) {
      const dn = easeInOut(seg(t, 1.2, 2.0)), up = easeInOut(seg(t, 2.9, 3.6));
      const bw = dn * (1 - up);
      [a, c].forEach((b, i) => b.pose({
        lean: 34 * bw, squash: 1 - 0.05 * bw, blink: clamp(bw * 2), mood: 'smile',
        armR: 8 - 6 * bw, armL: 8 - 6 * bw, look: lerp(0.5, 0, bw)
      }));
      stars.forEach((s, i) => {
        const p = seg(t, 3.5 + i * 0.12, 3.9 + i * 0.12);
        tf(s, 188 + i * 12 + (i - 1) * 6, FY - 118 - i * 8 - 10 * p, 0, hump(p) * 1.6 + 0.001);
      });
    }
  };
}
