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
// pack：棚の荷物をひとつずつ取って、向きを変えてかばんに入れ、ふたを閉じる（例文 I packed my bag for the trip.）
export const meta = { duration: 4.4, beats: [[0, '棚に荷物'], [1.4, 'かばんに入れる'], [3.5, 'ふたを閉じた']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 0.95, PACK = true;
  const FY = k.backdrop({ floorY: 240, mood: 'indoor' });
  el('rect', { x: 0, y: FY - 6, width: 400, height: 6, fill: pal.line });
  el('rect', { x: 150, y: 44, width: 76, height: 64, rx: 6, fill: '#DDEFFA', stroke: '#fff', 'stroke-width': 5 });
  el('line', { x1: 188, y1: 44, x2: 188, y2: 108, stroke: '#fff', 'stroke-width': 4 });
  // 旅行のポスター（飛行機）とカレンダー
  el('rect', { x: 20, y: 52, width: 62, height: 78, rx: 4, fill: '#fff', stroke: pal.woodDark, 'stroke-width': 3 });
  el('rect', { x: 26, y: 58, width: 50, height: 46, rx: 2, fill: '#CFE9F7' });
  el('path', { d: 'M 36 90 L 62 70 L 64 74 L 52 90 L 56 98 L 50 98 L 44 92 Z', fill: pal.blue });
  el('circle', { cx: 66, cy: 66, r: 7, fill: pal.yellow });
  el('rect', { x: 30, y: 110, width: 42, height: 12, rx: 2, fill: pal.line });
  // 棚（右）：3段、各段に荷物の定位置
  el('rect', { x: 254, y: 140, width: 56, height: FY - 140, rx: 4, fill: pal.wood });
  el('rect', { x: 259, y: 145, width: 46, height: FY - 150, rx: 2, fill: '#F6E7CC' });
  const SH = [{ x: 280, y: 156 }, { x: 280, y: 184 }, { x: 280, y: 210 }];
  [162, 190, 216].forEach((y) => el('rect', { x: 259, y, width: 46, height: 5, fill: pal.woodDark }));
  k.shadow(282, FY + 1, 34, 3.5);
  // かばん（左）
  const BX = 82, BW = 88, RIM = 190;
  const BS = [{ x: BX + 62, y: RIM - 2 }, { x: BX + 38, y: RIM - 1 }, { x: BX + 16, y: RIM - 2 }];
  const BD = { x: BX + BW - 14, y: RIM - 20 };
  const lidB = g({});
  tf(lidB, BX, RIM);
  el('rect', { x: 0, y: -34, width: BW, height: 36, rx: 6, fill: '#E8845F', stroke: '#C96A47', 'stroke-width': 2.5 }, lidB);
  el('rect', { x: 8, y: -27, width: BW - 16, height: 22, rx: 4, fill: '#F7D2BE' }, lidB);
  el('rect', { x: BX - 2, y: RIM - 4, width: BW + 4, height: 10, rx: 4, fill: '#7A4B38' });
  k.shadow(BX + BW / 2, FY + 1, 54, 4);
  const layer1 = g({});
  const front = el('rect', { x: BX, y: RIM, width: BW, height: FY - RIM - 2, rx: 8, fill: '#E8845F', stroke: '#C96A47', 'stroke-width': 2.5 });
  el('rect', { x: BX + 8, y: RIM + 12, width: BW - 16, height: 5, rx: 2.5, fill: '#fff', opacity: 0.35 });
  el('circle', { cx: BX + 14, cy: FY - 8, r: 4, fill: '#7A4B38' });
  el('circle', { cx: BX + BW - 14, cy: FY - 8, r: 4, fill: '#7A4B38' });
  const layer2 = g({});
  // 閉じたふた（手前）とファスナー・持ち手
  const lidF = g({});
  el('rect', { x: BX - 3, y: RIM - 10, width: BW + 6, height: 16, rx: 6, fill: '#F08F6A', stroke: '#C96A47', 'stroke-width': 2.5 }, lidF);
  el('line', { x1: BX + 6, y1: RIM - 2, x2: BX + BW - 6, y2: RIM - 2, stroke: '#fff', 'stroke-width': 2.5, 'stroke-dasharray': '3 3' }, lidF);
  el('path', { d: `M ${BX + 30} ${RIM - 10} v -8 q 0 -5 5 -5 h 18 q 5 0 5 5 v 8`, fill: 'none', stroke: '#7A4B38', 'stroke-width': 4, 'stroke-linecap': 'round' }, lidF);
  // 荷物
  const shape = [
    (n) => { el('rect', { x: -13, y: -8, width: 26, height: 16, rx: 3, fill: pal.blue, stroke: pal.blueDark, 'stroke-width': 2 }, n); el('path', { d: 'M -5 -8 L 0 -2 L 5 -8', fill: '#fff', stroke: '#fff', 'stroke-width': 1.5 }, n); el('line', { x1: -13, y1: 3, x2: 13, y2: 3, stroke: '#fff', 'stroke-width': 1.5, opacity: 0.6 }, n); },
    (n) => { el('path', { d: 'M -13 6 L -13 -1 Q -8 -2 -4 -7 L 1 -5 Q 7 -2 13 2 L 13 6 Z', fill: pal.red, stroke: '#C8483C', 'stroke-width': 1.8, 'stroke-linejoin': 'round' }, n); el('rect', { x: -13, y: 4, width: 26, height: 4, rx: 2, fill: '#fff', stroke: pal.line, 'stroke-width': 1 }, n); },
    (n) => { el('path', { d: 'M -10 4 Q -10 -10 0 -10 Q 10 -10 10 4 Z', fill: pal.yellow, stroke: pal.yellowDark, 'stroke-width': 2 }, n); el('rect', { x: -16, y: 2, width: 32, height: 5, rx: 2.5, fill: pal.yellowDark }, n); }
  ];
  const items = shape.map((f, i) => { const n = g({}, layer1); f(n); return { n, i, par: 1 }; });
  const grip = el('circle', { r: 6.5 * S, fill: pal.mint, stroke: pal.mintDark, 'stroke-width': 2.5 * S });
  const b = k.buddy({ x: 224, y: FY, scale: S, facing: PACK ? 1 : -1 });
  const AF = PACK ? 1 : -1, BF = -AF;
  const T0 = 0.35, CYC = 1.0, N = 3;
  const A = (i) => (PACK ? SH[i] : BS[i]), B = (i) => (PACK ? BD : SH[i]), REST = (i) => (PACK ? BS[i] : SH[i]);
  const cyc = (t) => { const x = t - T0; if (x < 0 || x >= CYC * N) return { i: -1, u: 0 }; const i = Math.floor(x / CYC); return { i, u: x - i * CYC }; };
  function pz(t) {
    const { i, u } = cyc(t);
    if (i < 0) return { facing: AF, armR: 8, lean: 0, squash: 1, mood: 'smile', look: 0.5, armL: 8 };
    const f = u >= 0.47 && u < 0.93 ? BF : AF;
    const flip = u >= 0.42 && u < 0.52 ? 0.94 : 1;
    const p = { facing: f, armR: 8, lean: 0, squash: flip, mood: 'smile', look: 0.6, armL: 8 };
    const aim = (pt, face) => { b.pose({ facing: face, armR: 8, lean: 5, squash: 1 }); return reach(b, S, 'R', pt.x, pt.y); };
    if (u < 0.28) { p.lean = 5 * easeOut(u / 0.28); p.armR = lerp(8, aim(A(i), AF), easeOut(u / 0.28)); }
    else if (u < 0.52) { const e = easeInOut(seg(u, 0.28, 0.47)); p.lean = 5 * (1 - e); p.armR = lerp(aim(A(i), AF), 75, e); }
    else if (u < 0.8) { const e = easeOut(seg(u, 0.52, 0.76)); p.lean = 5 * e; p.armR = lerp(75, aim(B(i), BF), e); }
    else if (u < 0.93) { const e = easeInOut(seg(u, 0.8, 0.93)); p.lean = 5 * (1 - e); p.armR = lerp(aim(B(i), BF), 8, e); }
    return p;
  }
  const handAt = (tt) => { b.pose(pz(tt)); return hp(b, S, 'R', 25); };

  return {
    update(t) {
      const { i: ci, u } = cyc(t);
      b.pose(pz(t));
      const hand = hp(b, S, 'R', 25);
      let gripOn = false;
      items.forEach((it) => {
        const i = it.i;
        let pos = A(i), par = PACK ? 2 : 1;
        if (ci > i || t >= T0 + CYC * N) { pos = REST(i); par = PACK ? 1 : 2; }
        else if (ci === i) {
          const t0 = T0 + CYC * i;
          if (u < 0.28) { pos = A(i); par = PACK ? 2 : 1; }
          else if (u < 0.8) {
            par = 2; gripOn = true;
            if (u >= 0.47 && u < 0.52) { const a = handAt(t0 + 0.465), c = handAt(t0 + 0.525), e = seg(u, 0.47, 0.52); b.pose(pz(t)); pos = { x: lerp(a.x, c.x, e), y: lerp(a.y, c.y, e) - 8 * hump(e) }; }
            else pos = hand;
          } else {
            const r0 = handAt(t0 + 0.8); b.pose(pz(t));
            const e = easeIn(seg(u, 0.8, 0.97));
            pos = { x: lerp(r0.x, REST(i).x, e), y: lerp(r0.y, REST(i).y, e) };
            par = PACK ? (e > 0.75 ? 1 : 2) : 2;
          }
        }
        const lyr = par === 1 ? layer1 : layer2;
        if (it.n.parentNode !== lyr) lyr.appendChild(it.n);
        tf(it.n, pos.x, pos.y);
      });
      k.set(grip, { cx: hand.x, cy: hand.y });
      grip.setAttribute('opacity', gripOn ? 1 : 0);
      const cl = easeInOut(seg(t, 3.3, 3.8)), op = 0;
      tf(lidB, BX, RIM, 0, 1, Math.max(0.001, 1 - cl));
      lidB.setAttribute('opacity', cl >= 1 ? 0 : 1);
      lidF.setAttribute('opacity', cl > 0.7 ? 1 : 0);
      tf(lidF, 0, 3 * wobble(seg(t, 3.7, 4.2), 2, 5));
    }
  };
}
