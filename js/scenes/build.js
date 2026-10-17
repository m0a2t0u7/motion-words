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
// build：クレーンが壁と屋根を運んで、新しい校舎が組み上がっていく。作業員は誘導と金づちで作業中（例文 They are building a new school.）
export const meta = { duration: 4.4, beats: [[0, '基礎だけ'], [1.5, '壁を置く'], [3.4, '屋根をのせる']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 0.8;
  const FY = k.backdrop({ floorY: 240 });
  el('rect', { x: 0, y: FY, width: 400, height: 60, fill: '#E8DDC6' });
  el('rect', { x: 0, y: FY, width: 400, height: 2, fill: '#D2C4A6' });
  const bx = 196, bw = 132, pw = bw, ph = 78, PX = 14;
  const GY = FY - 8;
  // クレーン
  el('rect', { x: 380, y: 40, width: 10, height: FY - 40, fill: pal.yellowDark });
  for (let i = 0; i < 6; i++) el('path', { d: `M 380 ${FY - i * 33} L 390 ${FY - i * 33 - 33} M 390 ${FY - i * 33} L 380 ${FY - i * 33 - 33}`, stroke: pal.yellowDark, 'stroke-width': 2 });
  el('rect', { x: 6, y: 36, width: 392, height: 8, rx: 3, fill: pal.yellow });
  el('rect', { x: 372, y: 28, width: 26, height: 14, rx: 3, fill: pal.yellowDark });
  // 土台
  el('rect', { x: bx - 10, y: GY, width: bw + 20, height: 10, rx: 3, fill: '#B9B2A6' });
  // 道具：のこ台と板
  el('rect', { x: 340, y: FY - 24, width: 5, height: 24, fill: pal.woodDark });
  el('rect', { x: 362, y: FY - 24, width: 5, height: 24, fill: pal.woodDark });
  el('rect', { x: 334, y: FY - 30, width: 40, height: 7, rx: 2, fill: pal.wood });
  k.shadow(354, FY + 2, 30, 3);
  // 荷：壁（窓とドア付き）と屋根
  const wall = g({});
  el('rect', { width: pw, height: ph, rx: 3, fill: '#FBE9DC' }, wall);
  [[14, 14], [pw - 40, 14], [14, 44], [pw - 40, 44]].forEach(([x, y]) => el('rect', { x, y, width: 26, height: 22, rx: 2, fill: '#CFE9F7' }, wall));
  el('rect', { x: pw / 2 - 12, y: ph - 38, width: 24, height: 38, rx: 3, fill: pal.blue }, wall);
  el('circle', { cx: pw / 2 + 6, cy: ph - 18, r: 2.5, fill: pal.yellow }, wall);
  const roof = g({});
  el('path', { d: `M -8 0 L ${bw / 2} -52 L ${bw + 8} 0 Z`, fill: pal.coral, stroke: pal.coral, 'stroke-width': 5, 'stroke-linejoin': 'round' }, roof);
  el('circle', { cx: bw / 2, cy: -22, r: 8, fill: pal.yellow, stroke: pal.yellowDark, 'stroke-width': 2.5 }, roof);
  el('line', { x1: bw / 2, y1: -52, x2: bw / 2, y2: -70, stroke: pal.sub, 'stroke-width': 2 }, roof);
  el('path', { d: `M ${bw / 2} -70 L ${bw / 2 + 18} -65 L ${bw / 2} -59 Z`, fill: pal.red }, roof);
  const sling = el('path', { fill: 'none', stroke: pal.ink, 'stroke-width': 1.8 });
  const cable = el('line', { stroke: pal.ink, 'stroke-width': 2 });
  const trolley = el('rect', { width: 16, height: 9, rx: 2, fill: pal.ink });
  const hook = el('path', { d: 'M -5 0 Q -5 8 0 8 Q 5 8 5 0', fill: 'none', stroke: pal.ink, 'stroke-width': 3, 'stroke-linecap': 'round' });
  const w1 = k.buddy({ x: 170, y: FY, scale: S });
  const w2 = k.buddy({ x: 352, y: FY, scale: S, facing: -1, color: pal.coral, dark: pal.coralDark });
  [w1, w2].forEach((w) => { k.el('path', { d: 'M -24 -80 Q -24 -100 0 -100 Q 24 -100 24 -80 Z', fill: pal.yellow, stroke: pal.yellowDark, 'stroke-width': 2.5 }, w.body); k.el('rect', { x: -28, y: -82, width: 56, height: 6, rx: 3, fill: pal.yellowDark }, w.body); });
  const hammer = g({});
  el('rect', { x: -2, y: -26, width: 4, height: 28, rx: 2, fill: pal.woodDark }, hammer);
  el('rect', { x: -10, y: -34, width: 20, height: 10, rx: 2, fill: pal.sub }, hammer);
  const wy0 = FY - ph, wyT = GY - ph, wLift = wyT - 52;
  const ry0 = FY, ryT = wyT, rLift = ryT - 60;
  // 荷の位置（t だけで決まる）：[つかむ, 持ち上げ終わり, 運び終わり, 置き終わり]
  const W = [0.5, 0.8, 1.5, 1.9], R = [2.7, 3.0, 3.6, 4.0];
  const pos = (T, x0, y0, xT, yT, yL, t) => {
    const e = easeInOut(seg(t, T[1], T[2])), d = easeInOut(seg(t, T[2], T[3]));
    const y = t < T[1] ? lerp(y0, yL, easeInOut(seg(t, T[0], T[1]))) : t < T[2] ? yL : lerp(yL, yT, d);
    return { x: lerp(x0, xT, e) + (t > T[1] && t < T[2] ? 3 * Math.sin(e * Math.PI * 2) : 0), y: y + (t >= T[3] ? 2.5 * wobble(seg(t, T[3], T[3] + 0.5), 2, 5) : 0) };
  };

  return {
    update(t) {
      const wp = pos(W, PX, wy0, bx, wyT, wLift, t);
      const rp = pos(R, PX - 4, ry0, bx, ryT, rLift, t);
      tf(wall, wp.x, wp.y);
      tf(roof, rp.x, rp.y - 0, 0, 1, 1);
      tf(roof, rp.x, rp.y, 0, Math.max(backOut(seg(t, 1.2, 1.5)), 0.001) * (t >= 1.2 ? 1 : 0.001), Math.max(backOut(seg(t, 1.2, 1.5)), 0.001));
      if (t >= 1.5) tf(roof, rp.x, rp.y, 0, 1, 1);
      // フック：運ぶ間は荷の上、そのほかは次の荷へ
      let hx, hy, load = null;
      const wTop = (p) => ({ x: p.x + pw / 2, y: p.y });
      const rTop = (p) => ({ x: p.x + bw / 2, y: p.y - 52 });
      const home = { x: PX + pw / 2, y: 64 };
      if (t < W[0]) { const d = easeInOut(seg(t, 0.0, W[0])); hx = home.x; hy = lerp(64, wTop(wp).y - 12, d); load = 'w'; }
      else if (t < W[3]) { hx = wTop(wp).x; hy = wTop(wp).y - 12; load = 'w'; }
      else if (t < R[0]) {
        const q = easeInOut(seg(t, W[3], 2.4)), q2 = easeInOut(seg(t, 2.4, R[0]));
        const tgt = { x: PX - 4 + bw / 2, y: ry0 - 52 - 12 };
        hx = lerp(wTop(wp).x, tgt.x, q); hy = lerp(wTop(wp).y - 12, 64, q) ; hy = t < 2.4 ? hy : lerp(64, tgt.y, q2);
        load = t > 2.55 ? 'r' : null; if (t >= 2.4) load = 'r';
      } else if (t < R[3]) { hx = rTop(rp).x; hy = rTop(rp).y - 12; load = 'r'; }
      else { const u = easeOut(seg(t, R[3], R[3] + 0.4)); hx = rTop(rp).x; hy = rTop(rp).y - 12 - 22 * u; load = null; }
      tf(trolley, hx - 8, 44);
      k.set(cable, { x1: hx, y1: 53, x2: hx, y2: hy });
      tf(hook, hx, hy);
      const hold = (load === 'w' && t >= W[0] && t < W[3] + 0.0) ? { x0: wp.x, x1: wp.x + pw, y: wp.y } : (load === 'r' && t >= R[0] && t < R[3]) ? { x0: rp.x - 4, x1: rp.x + bw + 4, y: rp.y } : null;
      sling.setAttribute('d', hold ? `M ${hold.x0} ${hold.y + (load === 'r' ? 0 : 0)} L ${hx} ${hy + 8} L ${hold.x1} ${hold.y}` : '');
      // 作業員
      const gu = easeOut(seg(t, 0.3, 0.8));
      w1.pose({ armR: lerp(8, 135, gu) + 10 * Math.sin(t * 6) * gu, look: 0.6, mood: 'open', lean: 2 * Math.sin(t * 2) });
      const hm = Math.max(0, Math.sin(t * 9));
      w2.pose({ armR: 70 + 40 * hm, look: 0.8, mood: 'smile', lean: 3 * hm });
      const hh = hp(w2, S, 'R');
      tf(hammer, hh.x, hh.y, (w2.state.lean - w2.state.armR) * -1 + 90 + 0, 1);
      tf(hammer, hh.x, hh.y, 14 * hm - 10, 1);
    }
  };
}
