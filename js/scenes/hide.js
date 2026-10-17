// hide：子どもがベッドの下にもぐりこみ、奥でじっと隠れる（例文 The child hid under the bed.）
import { seg, lerp, easeInOut, easeOut, wobble, clamp } from '../ease.js';
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
export const meta = { duration: 4.2, beats: [[0, '歩いてくる'], [1.7, 'もぐる'], [3.5, '隠れた']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  el('rect', { x: 28, y: 44, width: 76, height: 66, rx: 6, fill: '#DDEFFA' });
  el('line', { x1: 66, y1: 44, x2: 66, y2: 110, stroke: '#fff', 'stroke-width': 4 });
  // ベッドの足とすき間（奥に濃い影）
  el('rect', { x: 150, y: 184, width: 200, height: 52, fill: '#8C93A8', opacity: 0.18 });
  el('rect', { x: 340, y: 118, width: 14, height: 118, rx: 4, fill: pal.woodDark });
  const S = 0.6;
  const child = k.buddy({ x: 40, y: FY, scale: S, color: pal.yellow, dark: pal.yellowDark });
  // ベッド本体（子どもの手前ではなく上）
  el('rect', { x: 150, y: 148, width: 196, height: 28, rx: 8, fill: '#EAF2FA' });
  el('rect', { x: 150, y: 148, width: 130, height: 28, rx: 8, fill: pal.blue });
  el('rect', { x: 150, y: 176, width: 196, height: 8, fill: pal.wood });
  el('rect', { x: 156, y: 184, width: 8, height: 52, fill: pal.woodDark });
  el('rect', { x: 330, y: 184, width: 8, height: 52, fill: pal.woodDark });
  el('ellipse', { cx: 318, cy: 142, rx: 22, ry: 10, fill: '#fff', stroke: '#D5DBE5', 'stroke-width': 2 });
  // 下の暗がり（子どもが入ると暗く隠す）
  const dark = el('rect', { x: 166, y: 184, width: 164, height: 52, fill: '#2B3046', opacity: 0 });
  const eyes = g({});
  [-1, 1].forEach((s) => el('ellipse', { cx: s * 6, cy: 0, rx: 3.2, ry: 4.4, fill: '#fff' }, eyes));
  const xf = (t) => t < 1.5 ? lerp(40, 148, easeInOut(seg(t, 0.2, 1.5))) : t < 3.0 ? lerp(148, 262, easeInOut(seg(t, 1.9, 3.0))) : 262;

  return {
    update(t) {
      const p = gait(xf, t, 40, 18, 0.2);
      const crouch = easeInOut(seg(t, 1.3, 1.8));
      const turn = easeInOut(seg(t, 3.0, 3.4));
      const sq = 1 - 0.32 * crouch;
      child.pose({ x: p.x, walk: p.walk, armL: lerp(p.armL, 30, crouch), armR: lerp(p.armR, 30, crouch), lean: lerp(p.lean, 14, crouch) * (1 - turn), squash: sq, facing: lerp(1, -1, turn), look: 0.6 * (1 - turn) - 0.8 * turn, mood: t > 3.0 ? 'flat' : 'smile', blink: t > 3.8 && t < 3.95 ? 1 : 0 });
      const ins = seg(p.x, 150, 190);
      dark.setAttribute('opacity', 0.62 * ins * (t > 1.5 ? 1 : 0));
      eyes.setAttribute('opacity', seg(t, 3.3, 3.5) * (t > 3.8 && t < 3.95 ? 0 : 1));
      tf(eyes, p.x - 4 * (1 - turn) + 5 * turn - 5 * turn, FY + (-10 - 54 * sq) * S);
    }
  };
}
