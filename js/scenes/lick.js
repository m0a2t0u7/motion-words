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
// lick：ネコが前足を持ち上げ、頭を下げて舌でぺろぺろなめる（例文 The cat licked its paw.）
export const meta = { duration: 4.0, beats: [[0, 'ネコが座る'], [1.2, '前足を上げる'], [2.2, 'なめる']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 240, mood: 'indoor' });
  el('rect', { x: 250, y: 46, width: 96, height: 72, rx: 6, fill: '#DDEFFA', stroke: '#fff', 'stroke-width': 5 });
  el('line', { x1: 298, y1: 46, x2: 298, y2: 118, stroke: '#fff', 'stroke-width': 4 });
  el('ellipse', { cx: 200, cy: 262, rx: 130, ry: 18, fill: '#C9E4DA' });
  const OR = '#F4A94E', OD = '#DB8A2E', CR = '#FFF1DC';
  k.shadow(200, FY + 18, 78, 9);
  const cat = g({});
  tf(cat, 190, FY + 16, 0, 1.6);
  const tail = g({}, cat);
  el('path', { d: 'M 0 0 Q -34 -2 -38 -34 Q -38 -46 -30 -48', fill: 'none', stroke: OD, 'stroke-width': 10, 'stroke-linecap': 'round' }, tail);
  el('ellipse', { cx: -2, cy: -30, rx: 36, ry: 30, fill: OR }, cat);
  el('ellipse', { cx: -12, cy: -16, rx: 24, ry: 18, fill: OD }, cat);
  el('ellipse', { cx: -4, cy: -4, rx: 16, ry: 7, fill: CR }, cat);
  [-18, -6, 6].forEach((x) => el('path', { d: `M ${x} -56 q 3 8 0 14`, stroke: OD, 'stroke-width': 3.5, fill: 'none', 'stroke-linecap': 'round' }, cat));
  el('ellipse', { cx: 22, cy: -26, rx: 12, ry: 22, fill: CR }, cat);
  el('rect', { x: 20, y: -28, width: 12, height: 28, rx: 6, fill: OR }, cat);
  el('ellipse', { cx: 28, cy: -2, rx: 10, ry: 5.5, fill: CR }, cat);
  // 上げる前足
  const paw = g({}, cat);
  el('rect', { x: -6, y: 0, width: 12, height: 28, rx: 6, fill: OR }, paw);
  const pawTip = el('ellipse', { cx: 0, cy: 28, rx: 8.5, ry: 8, fill: CR }, paw);
  const wet = el('ellipse', { cx: 0, cy: 28, rx: 12, ry: 11, fill: pal.water, opacity: 0 }, paw);
  // 頭
  const head = g({}, cat);
  const hd = g({}, head);
  tf(hd, 14, -20);
  el('path', { d: 'M -16 -16 L -12 -34 L 0 -22 Z M 16 -16 L 12 -34 L 0 -22 Z', fill: OD, stroke: OD, 'stroke-width': 3, 'stroke-linejoin': 'round' }, hd);
  el('ellipse', { cx: 0, cy: 0, rx: 22, ry: 19, fill: OR }, hd);
  el('ellipse', { cx: 8, cy: 8, rx: 12, ry: 8, fill: CR }, hd);
  el('circle', { cx: 15, cy: 4, r: 2.6, fill: '#E87A7A' }, hd);
  const eyeO = g({}, hd), eyeC = el('path', { d: 'M 3 -4 q 4 4 8 0 M -13 -4 q 4 4 8 0', stroke: pal.ink, 'stroke-width': 2.6, fill: 'none', 'stroke-linecap': 'round' }, hd);
  [[7, -4], [-9, -4]].forEach(([x, y]) => el('ellipse', { cx: x, cy: y, rx: 2.6, ry: 3.6, fill: pal.ink }, eyeO));
  [[22, 6, 18, 8], [22, 9, 18, 12]].forEach(([x1, y1, x2, y2]) => el('line', { x1: x1 - 6, y1: y1 + 2, x2: x2 + 8, y2: y2 + 3, stroke: pal.sub, 'stroke-width': 1.3 }, hd));
  const tongue = el('ellipse', { cx: 0, cy: 0, rx: 4.5, ry: 3.2, fill: '#FF8FA0' }, hd);
  const sp = [0, 1, 2].map((i) => el('path', { d: 'M 0 -5 L 1.5 -1.5 L 5 0 L 1.5 1.5 L 0 5 L -1.5 1.5 L -5 0 L -1.5 -1.5 Z', fill: '#fff', stroke: pal.yellow, 'stroke-width': 1 }, cat));

  return {
    update(t) {
      const up = easeInOut(seg(t, 0.9, 1.7)), dn = easeInOut(seg(t, 1.5, 2.2));
      const lk = seg(t, 2.2, 3.8) * (1 - seg(t, 3.7, 3.95));
      tf(paw, 24, -36, lerp(0, -112, up) + 2 * Math.sin(t * 16) * lk);
      const hx = 14, hy = -52;
      tf(head, hx, hy, 26 * dn + 3 * Math.sin(t * 16) * lk, 1, 1);
      tf(hd, 0, -4 + 0 * dn);
      eyeO.setAttribute('opacity', dn > 0.5 ? 0 : 1);
      eyeC.setAttribute('opacity', dn > 0.5 ? 1 : 0);
      const lp = Math.max(0, Math.sin(t * 16)) * lk;
      tongue.setAttribute('opacity', lk > 0 ? 1 : 0);
      k.set(tongue, { cx: 14 + 7 * lp, cy: 12 + 3 * lp });
      tf(tail, -34, -8, 0, 1, 1);
      tail.setAttribute('transform', `translate(-34 -8) rotate(${(10 * Math.sin(t * 2.4)).toFixed(2)})`);
      wet.setAttribute('opacity', 0.6 * seg(t, 2.6, 3.6));
      sp.forEach((s, i) => {
        const q = seg(t, 3.0 + i * 0.25, 3.6 + i * 0.25);
        tf(s, 54 + i * 10, -62 - i * 6 - 6 * q, 0, hump(q) * 1.0 + 0.001);
      });
    }
  };
}
