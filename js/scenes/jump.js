// jump：ねこが床からテーブルの上へ跳び乗る（例文 The cat jumped onto the table.）
import { seg, lerp, easeInOut, easeOut, easeIn, wobble, clamp } from '../ease.js';
const rad = (d) => (d * Math.PI) / 180;
const deg = (r) => (r * 180) / Math.PI;
// 手先の座標（体の傾き・つぶれ・向きを反映）
function hp(b, s, side = 'R', len = 28) {
  const st = b.state, a = rad(side === 'R' ? -st.armR : st.armL);
  let x = (side === 'R' ? 27 : -27) - len * Math.sin(a), y = -46 + len * Math.cos(a);
  x *= 2 - st.squash; y *= st.squash;
  const l = rad(st.lean), c = Math.cos(l), sn = Math.sin(l);
  return { x: st.x + (x * c - y * sn) * st.facing * s, y: st.y + (x * sn + y * c - 10 - st.lift) * s };
}
// 目標点へ腕を向ける角度
function reach(b, s, side, tx, ty) {
  const st = b.state, o = hp(b, s, side, 0);
  const phi = deg(Math.atan2(-(tx - o.x) * st.facing, ty - o.y));
  return side === 'R' ? st.lean - phi : phi - st.lean;
}
const mix = (a, b, p) => { const f = (h, i) => parseInt(h.slice(1 + i * 2, 3 + i * 2), 16); return '#' + [0, 1, 2].map((i) => Math.round(f(a, i) + (f(b, i) - f(a, i)) * p).toString(16).padStart(2, '0')).join(''); };
function gait(xf, t, x0, amp = 18, kf = 0.107) {
  const x = xf(t), v = Math.abs(xf(t + 0.02) - xf(t - 0.02)) / 0.04;
  const ph = Math.abs(x - x0) * kf, m = clamp(v / 25);
  const w = lerp(Math.round(ph / Math.PI) * Math.PI, ph, m);
  return { x, walk: w, armL: 8 + Math.sin(w) * amp * m, armR: 8 - Math.sin(w) * amp * m, lean: 3 * m, m };
}
export const meta = { duration: 3.8, beats: [[0, 'ためる'], [1.3, '跳ぶ'], [2.5, '乗った']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  el('rect', { x: 40, y: 50, width: 70, height: 60, rx: 6, fill: '#DDEFFA' });
  // テーブル
  const TY = 168;
  k.shadow(300, FY + 2, 62, 6);
  [250, 342].forEach((x) => el('rect', { x, y: TY + 8, width: 8, height: FY - TY - 8, fill: pal.woodDark }));
  el('rect', { x: 236, y: TY, width: 128, height: 10, rx: 4, fill: pal.wood });
  el('rect', { x: 236, y: TY + 6, width: 128, height: 4, fill: pal.woodDark });
  // 花びん（テーブル上の静物）
  el('rect', { x: 338, y: TY - 20, width: 12, height: 20, rx: 4, fill: pal.blue });
  el('circle', { cx: 344, cy: TY - 26, r: 7, fill: pal.coral });
  const sh = k.shadow(0, 0, 20, 4);
  // ねこ（原点＝足元中央、右向き）
  const cat = g({});
  const body = g({}, cat);
  const fur = '#F4B26A', furD = '#D88F45';
  const tail = el('path', { d: 'M -18 -16 Q -40 -14 -34 -36 Q -32 -42 -28 -38', fill: 'none', stroke: furD, 'stroke-width': 6, 'stroke-linecap': 'round' }, body);
  const legs = [[-12, 0], [-6, 1], [10, 0], [16, 1]].map(([x, d]) => { const l = g({}, body); tf(l, x, -12); el('line', { x1: 0, y1: 0, x2: 0, y2: 12, stroke: d ? furD : fur, 'stroke-width': 5, 'stroke-linecap': 'round' }, l); return l; });
  el('ellipse', { cx: 0, cy: -20, rx: 21, ry: 11, fill: fur }, body);
  [-10, 0, 10].forEach((x) => el('line', { x1: x, y1: -30, x2: x + 2, y2: -22, stroke: furD, 'stroke-width': 3, 'stroke-linecap': 'round' }, body));
  const head = g({}, body); tf(head, 22, -28);
  el('polygon', { points: '-9,-6 -6,-17 0,-9', fill: fur }, head);
  el('polygon', { points: '9,-6 6,-17 0,-9', fill: furD }, head);
  el('circle', { cx: 0, cy: 0, r: 11, fill: fur }, head);
  el('ellipse', { cx: -4, cy: -2, rx: 1.8, ry: 2.8, fill: pal.ink }, head);
  el('ellipse', { cx: 5, cy: -2, rx: 1.8, ry: 2.8, fill: pal.ink }, head);
  el('circle', { cx: 8, cy: 3, r: 1.8, fill: pal.coralDark }, head);
  // 見守る人
  const b = k.buddy({ x: 70, y: FY, color: pal.coral, dark: pal.coralDark });
  const X0 = 150, X1 = 296;
  return {
    update(t) {
      const crouch = easeInOut(seg(t, 0.4, 1.1)) * (1 - easeOut(seg(t, 1.35, 1.5)));
      const u = seg(t, 1.4, 2.4);
      const land = Math.sin(seg(t, 2.4, 2.9) * Math.PI) * 0.8;
      const wig = t > 1.0 && t < 1.35 ? Math.sin(t * 40) * 1.5 : 0;
      const ux = lerp(X0, X1, u), arcY = 70 * 4 * u * (1 - u);
      const gy = lerp(FY, TY, easeIn(u) * 0.5 + u * 0.5);
      const cy = (u > 0 && u < 1 ? lerp(FY, TY, u) - arcY : u >= 1 ? TY : FY);
      const x = u >= 1 ? X1 : ux;
      const rot = u > 0 && u < 1 ? lerp(-28, 22, u) : 0;
      const air = u > 0 && u < 1 ? Math.sin(u * Math.PI) : 0;
      cat.setAttribute('transform', `translate(${x.toFixed(2)} ${cy.toFixed(2)}) rotate(${rot.toFixed(2)}) scale(${(1 + 0.1 * land + 0.1 * crouch - 0.05 * air).toFixed(3)} ${(1 - 0.28 * crouch - 0.2 * land + 0.08 * air).toFixed(3)})`);
      body.setAttribute('transform', `translate(${wig} 0)`);
      const ext = air;
      legs.forEach((l, i) => tf(l, [-12, -6, 10, 16][i], -12, i < 2 ? 70 * ext - 15 * crouch : -70 * ext + 15 * crouch));
      tf(head, 22 + 3 * crouch, -28 + 4 * crouch + (u > 0 && u < 1 ? -3 : 0), -10 * crouch);
      tail.setAttribute('transform', `rotate(${air * 14 - 6 * land + 6 * Math.sin(t * 3)} -18 -16)`);
      const sy = u >= 1 ? TY : FY;
      tf(sh, x, sy + 1, 0, 1 - 0.4 * air, 1);
      sh.setAttribute('opacity', 1 - 0.4 * air);
      const look = u < 0.15 ? 0.7 : 0.7;
      b.pose({ look, mood: t < 1.4 ? 'smile' : 'open', armL: 8 + 90 * seg(t, 1.7, 2.4) * (1 - seg(t, 3.0, 3.6)), armR: 8 + 100 * seg(t, 2.4, 2.9) * (1 - seg(t, 3.0, 3.6)), squash: 1 + 0.02 * Math.sin(t * 3) });
    }
  };
}
