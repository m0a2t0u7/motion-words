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
// win：試合終了間際に決勝点が入り、勝ったチームが跳びはねて喜び、負けた側はうなだれる（例文 Our team won the game.）
export const meta = { duration: 4.4, beats: [[0, '同点'], [1.6, '決勝点'], [3.2, '勝った']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 0.88;
  const FY = k.backdrop({ floorY: 240 });
  el('rect', { x: 0, y: FY, width: 400, height: 60, fill: '#CDEBC5' });
  el('rect', { x: 0, y: FY, width: 400, height: 2, fill: '#A9D49C' });
  // 相手のゴール（右）
  const gx = 338, gy = 150, gw = 56, gh = FY - gy;
  el('rect', { x: gx, y: gy, width: gw, height: gh, fill: '#fff', opacity: 0.3 });
  for (let i = 1; i < 6; i++) el('line', { x1: gx + i * gw / 6, y1: gy, x2: gx + i * gw / 6, y2: FY, stroke: '#fff', 'stroke-width': 1.3 });
  for (let i = 1; i < 5; i++) el('line', { x1: gx, y1: gy + i * gh / 5, x2: gx + gw, y2: gy + i * gh / 5, stroke: '#fff', 'stroke-width': 1.3 });
  const ball = el('circle', { r: 7, fill: '#fff', stroke: pal.ink, 'stroke-width': 1.8 });
  [gx - 2, gx + gw - 4].forEach((x) => el('rect', { x, y: gy - 3, width: 6, height: gh + 3, rx: 3, fill: '#fff', stroke: '#B4BFCD', 'stroke-width': 1.5 }));
  el('rect', { x: gx - 2, y: gy - 3, width: gw + 4, height: 6, rx: 3, fill: '#fff', stroke: '#B4BFCD', 'stroke-width': 1.5 });
  // スコアボード
  const sb = g({});
  tf(sb, 200, 52);
  el('rect', { x: -70, y: -30, width: 140, height: 60, rx: 10, fill: pal.ink }, sb);
  el('rect', { x: -64, y: -24, width: 56, height: 48, rx: 6, fill: pal.mintDark }, sb);
  el('rect', { x: 8, y: -24, width: 56, height: 48, rx: 6, fill: pal.coralDark }, sb);
  el('rect', { x: -3, y: -8, width: 6, height: 4, fill: '#fff' }, sb);
  el('rect', { x: -3, y: 4, width: 6, height: 4, fill: '#fff' }, sb);
  const sL = k.text(-36, 0, '1', { 'font-size': 34, fill: '#fff' }, sb);
  const sR = k.text(36, 0, '1', { 'font-size': 34, fill: '#fff' }, sb);
  const gl = el('rect', { x: -64, y: -24, width: 56, height: 48, rx: 6, fill: '#fff', opacity: 0 }, sb);
  // 選手
  const us = [[84, 0], [150, 0.35]].map(([x, d]) => ({ d, x, b: k.buddy({ x, y: FY, scale: S }) }));
  const foe = k.buddy({ x: 290, y: FY, scale: S, facing: -1, color: pal.coral, dark: pal.coralDark });
  const cf = Array.from({ length: 14 }, (_, i) => el('rect', { width: 7, height: 4, fill: [pal.yellow, pal.coral, pal.blue, pal.violet, pal.green][i % 5] }));

  return {
    update(t) {
      const goal = t >= 1.7;
      sL.textContent = goal ? '2' : '1';
      const bump = goal ? hump(seg(t, 1.7, 2.1)) : 0;
      tf(sL, 0, 0, 0, 1 + 0.4 * bump); k.set(sL, { x: -36, y: 0 });
      sL.setAttribute('transform', `translate(-36 0) scale(${1 + 0.4 * bump}) translate(36 0)`);
      gl.setAttribute('opacity', 0.5 * hump(seg(t, 1.7, 2.1)));
      us.forEach((o, i) => {
        const e = easeOut(seg(t, 1.9 + o.d * 0.4, 2.5 + o.d * 0.4));
        const jump = e > 0 && t > 2.3 ? Math.abs(Math.sin((t - 2.3 + o.d) * 5.5)) * 26 * seg(t, 2.3, 2.7) : 0;
        o.b.pose({
          armL: lerp(8, 160, e), armR: lerp(8, 160, e) + 8 * Math.sin(t * 9 + i) * e, lift: jump, squash: 1 + (jump < 2 && e > 0.9 ? -0.06 : 0),
          mood: e > 0.2 ? 'grin' : 'smile', look: 0.3, facing: 1
        });
      });
      const sd = easeInOut(seg(t, 2.0, 2.8)), kj = hump(seg(t, 1.3, 1.9));
      foe.pose({ lean: 16 * sd, squash: 1 - 0.05 * sd, mood: sd > 0.2 ? 'sad' : 'flat', look: -0.2, armL: 8 + 10 * sd + 150 * kj, armR: 8 + 10 * sd + 150 * kj, lift: 12 * kj });
      // 決勝点：ストライカーが蹴り、キーパーの頭上を越えてゴールへ
      const kw = easeInOut(seg(t, 0.7, 0.95)), kh = easeOut(seg(t, 0.95, 1.05));
      if (t < 2.0) { us[1].b.pose({ lean: 8 * kh * (1 - seg(t, 1.3, 1.8)) - 6 * kw * (1 - kh) }); leg(us[1].b, 1, 36 * kw * (1 - kh) - 85 * kh * (1 - seg(t, 1.3, 1.8))); }
      const q = seg(t, 1.0, 1.75), r2 = seg(t, 1.75, 2.15);
      const bx = lerp(190, 372, easeOut(q) * 0.6 + q * 0.4), by = FY - 8 - 92 * 4 * q * (1 - q) * 0.9 - 18 * q;
      tf(ball, t < 1.75 ? bx : 372, t < 1.75 ? by : lerp(FY - 26, FY - 8, easeIn(r2)) - 14 * Math.abs(wobble(r2, 1.5, 3)));
      ball.setAttribute('opacity', t >= 1.0 ? 1 : 0);

      cf.forEach((c, i) => {
        const s = seg(t, 2.0 + (i % 5) * 0.08, 4.4);
        const x = 60 + i * 21 + 16 * Math.sin(i * 3.1 + s * 7), y = 80 + s * 150 + (i % 3) * 14;
        tf(c, x, y - 40 + 40 * (1 - seg(t, 2.0, 2.2)) * 0, s * 600 + i * 40);
        c.setAttribute('opacity', s > 0 && s < 0.92 ? 1 : 0);
      });
    }
  };
}
