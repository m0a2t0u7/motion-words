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
// ride：リュックのまめが自転車をこいで、学校の前まで走って止まる（例文 I ride my bike to school.）
export const meta = { duration: 4.4, beats: [[0, '出発'], [2.0, 'こいで進む'], [3.8, '学校に着く']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 0.78;
  const FY = k.backdrop({ floorY: 238 });
  // 学校（右）
  el('rect', { x: 258, y: 96, width: 140, height: FY - 96, rx: 4, fill: '#F8E8C8' });
  el('rect', { x: 306, y: 60, width: 44, height: 42, fill: '#F2D9A4' });
  el('path', { d: 'M 300 62 L 328 34 L 356 62 Z', fill: pal.coral, stroke: pal.coral, 'stroke-width': 4, 'stroke-linejoin': 'round' });
  el('circle', { cx: 328, cy: 80, r: 11, fill: '#fff', stroke: pal.ink, 'stroke-width': 2.5 });
  el('path', { d: 'M 328 80 V 73 M 328 80 L 333 83', stroke: pal.ink, 'stroke-width': 2.2, 'stroke-linecap': 'round', fill: 'none' });
  el('line', { x1: 328, y1: 34, x2: 328, y2: 16, stroke: pal.sub, 'stroke-width': 2 });
  el('path', { d: 'M 328 16 L 346 21 L 328 27 Z', fill: pal.red });
  [[272, 118], [358, 118], [272, 164], [358, 164]].forEach(([x, y]) => el('rect', { x, y, width: 26, height: 30, rx: 3, fill: '#CFE9F7' }));
  el('rect', { x: 312, y: FY - 56, width: 32, height: 56, rx: 3, fill: pal.blue });
  el('rect', { x: 0, y: FY - 4, width: 400, height: 4, fill: pal.line });
  // 自転車
  const bike = g({});
  const R = 22, WB = 31;
  const sh = k.shadow(0, FY, 52, 4, bike);
  const wheel = (cx) => { const w = g({}, bike); el('circle', { r: R, fill: 'none', stroke: pal.ink, 'stroke-width': 4 }, w); el('circle', { r: R - 2, fill: 'none', stroke: pal.line, 'stroke-width': 1 }, w);
    [0, 60, 120].forEach((a) => el('line', { x1: 0, y1: -R + 3, x2: 0, y2: R - 3, stroke: pal.sub, 'stroke-width': 1.6, transform: `rotate(${a})` }, w)); el('circle', { r: 3, fill: pal.sub }, w); return w; };
  const wr = wheel(), wf = wheel();
  const frame = el('path', { fill: 'none', stroke: pal.red, 'stroke-width': 5, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, bike);
  const fork = el('line', { stroke: pal.sub, 'stroke-width': 4, 'stroke-linecap': 'round' }, bike);
  const bar = el('line', { stroke: pal.ink, 'stroke-width': 5, 'stroke-linecap': 'round' }, bike);
  const saddle = el('rect', { width: 20, height: 6, rx: 3, fill: pal.ink }, bike);
  const cr = [0, 1].map(() => el('line', { stroke: pal.sub, 'stroke-width': 3, 'stroke-linecap': 'round' }, bike));
  const b = k.buddy({ parent: bike, x: 0, y: 0, scale: S });
  b.g.firstChild.setAttribute('display', 'none');
  // リュック
  const pk = g({}, b.body);
  el('rect', { x: -40, y: -66, width: 18, height: 38, rx: 7, fill: pal.yellow, stroke: pal.yellowDark, 'stroke-width': 2.5 }, pk);
  const fw = g({});
  const X = (t) => lerp(24, 214, easeOut(seg(t, 0.5, 4.0)));

  return {
    update(t) {
      const x = X(t), spd = Math.abs(X(t + 0.02) - X(t - 0.02)) / 0.04;
      const ph = (x / 7.5) * 1, ground = FY;
      const hipY = ground - 32;
      tf(bike, x, 0);
      tf(wr, -WB, ground - R, x / R * 57.3);
      tf(wf, WB, ground - R, x / R * 57.3);
      const stopP = seg(t, 3.7, 4.2);
      const m = clamp(spd / 20);
      b.pose({ x: 0, y: hipY - 4, walk: 0, armL: 8, armR: 8, facing: 1, lean: 5 * m, look: 0.7, mood: t > 3.9 ? 'smile' : 'open', squash: 1 - 0.02 * Math.sin(ph * 2) * m });
      const hand = hp(b, S, 'R');
      b.pose({ armR: reach(b, S, 'R', hand.x + 6, hand.y + 3), armL: reach(b, S, 'L', hand.x + 3, hand.y + 3) });
      const hnd = hp(b, S, 'R');
      // 脚：ペダルをこぐ（止まると地面に足をつく）
      const a0 = Math.sin(ph) * 32 * m, a1 = -a0;
      leg(b, 0, a0 + 10 * (1 - m)); leg(b, 1, a1 - 6 * (1 - m));
      const hyp = hipY - 4 - 14 * S - 10 * S;
      // フレーム
      const bb = { x: 1, y: hipY + 6 };
      k.set(frame, { d: `M ${-WB} ${ground - R} L ${bb.x} ${bb.y} L ${-7} ${hipY + 2} M ${-WB} ${ground - R} L ${-7} ${hipY + 2} M ${bb.x} ${bb.y} L ${hnd.x - 4} ${hnd.y + 12} L ${-7} ${hipY + 2}` });
      k.set(fork, { x1: WB, y1: ground - R, x2: hnd.x - 2, y2: hnd.y + 6 });
      k.set(bar, { x1: hnd.x - 5, y1: hnd.y + 4, x2: hnd.x + 7, y2: hnd.y + 6 });
      k.set(saddle, { x: -17, y: hipY + 1 });
      const tips = [0, 1].map((i) => { const ang = rad(i ? a1 : a0); const hx = (i ? 12 : -12) * S; return { x: hx - Math.sin(ang) * 15 * S, y: hipY - 4 - 14 * S + 3 + Math.cos(ang) * 15 * S }; });
      cr.forEach((c, i) => k.set(c, { x1: bb.x, y1: bb.y, x2: tips[i].x, y2: tips[i].y }));
      sh.setAttribute('transform', `translate(${0} 0)`);
    }
  };
}
