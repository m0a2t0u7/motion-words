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
// listen：先生の話に、まめが身を乗り出して耳を向ける（例文 Listen to your teacher carefully.）
export const meta = { duration: 4.2, beats: [[0, '先生が話す'], [1.6, '耳を向ける'], [3.2, 'じっと聞く']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 0.9;
  const FY = k.backdrop({ floorY: 240, mood: 'indoor' });
  // 黒板
  el('rect', { x: 226, y: 40, width: 160, height: 100, rx: 5, fill: pal.woodDark });
  el('rect', { x: 232, y: 46, width: 148, height: 88, rx: 3, fill: '#3C5A52' });
  el('rect', { x: 232, y: 134, width: 148, height: 5, fill: pal.wood });
  k.text(268, 74, 'A B C', { 'font-size': 22, fill: '#E9F3EF' });
  el('path', { d: 'M 246 98 Q 270 90 290 100 T 330 98', stroke: '#E9F3EF', 'stroke-width': 2.5, fill: 'none', opacity: 0.8, 'stroke-linecap': 'round' });
  el('rect', { x: 0, y: FY - 6, width: 400, height: 6, fill: pal.line });
  const tc = k.buddy({ x: 320, y: FY, scale: S, facing: -1, color: pal.coral, dark: pal.coralDark });
  const stick = el('line', { stroke: pal.woodDark, 'stroke-width': 3.5, 'stroke-linecap': 'round' });
  const b = k.buddy({ x: 110, y: FY, scale: S });
  // 耳マーク
  const ear = g({});
  el('path', { d: 'M 0 -14 C -14 -14 -16 6 -6 10 C -2 12 -4 20 2 20 C 8 20 14 14 14 2 C 14 -8 8 -14 0 -14 Z', fill: pal.yellow, stroke: pal.yellowDark, 'stroke-width': 3, 'stroke-linejoin': 'round' }, ear);
  el('path', { d: 'M -1 -6 C -8 -6 -8 4 -2 5', fill: 'none', stroke: pal.yellowDark, 'stroke-width': 2.4, 'stroke-linecap': 'round' }, ear);
  const waves = [0, 1, 2].map(() => el('path', { d: 'M 0 -12 Q -9 0 0 12', fill: 'none', stroke: pal.blue, 'stroke-width': 3.5, 'stroke-linecap': 'round' }));

  return {
    update(t) {
      const talk = Math.sin(t * 15) > 0 ? 'open' : 'smile';
      const pt = easeInOut(seg(t, 0.4, 1.0)) * (1 - easeInOut(seg(t, 3.4, 3.9)) * 0.5);
      tc.pose({ mood: talk, look: 0.7, armR: lerp(8, 100, pt) + 4 * Math.sin(t * 3) * pt, lean: 2 * Math.sin(t * 3) });
      const hnd = hp(tc, S, 'R');
      k.set(stick, { x1: hnd.x, y1: hnd.y, x2: hnd.x - 44, y2: hnd.y - 22 - 6 * Math.sin(t * 3) });
      stick.setAttribute('opacity', pt > 0 ? 1 : 0);
      const lv = easeInOut(seg(t, 1.4, 2.2));
      b.pose({ lean: 12 * lv + 2 * Math.sin(t * 2.2) * lv, look: 1, mood: 'smile', squash: 1 - 0.02 * lv, blink: 0 });
      const ep = backOut(seg(t, 1.5, 1.9));
      tf(ear, 128 + 12 * lv, FY - 112, 0, Math.max(ep, 0.001));
      waves.forEach((w, i) => {
        const p = (t * 0.7 + i / 3) % 1;
        tf(w, lerp(268, 162, p), lerp(FY - 84, FY - 100, p), 0, 0.6 + p * 0.9);
        w.setAttribute('opacity', hump(p) * seg(t, 0.2, 0.6));
      });
    }
  };
}
