// lean：壁のほうへ歩き、向きを変えて背中を壁にあずける（例文 He leaned against the wall.）
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
export const meta = { duration: 4.0, beats: [[0, '壁へ歩く'], [1.6, '向きを変える'], [2.8, 'もたれる']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  el('rect', { x: 30, y: 50, width: 76, height: 66, rx: 6, fill: '#DDEFFA' });
  // 壁（右側にせり出す壁面）
  el('rect', { x: 302, y: 36, width: 98, height: 200, fill: '#E9DFCF' });
  el('rect', { x: 302, y: 36, width: 5, height: 200, fill: '#D3C6B0' });
  el('rect', { x: 302, y: 222, width: 98, height: 14, fill: '#D3C6B0' });
  el('rect', { x: 330, y: 70, width: 50, height: 40, rx: 4, fill: '#fff', stroke: '#D3C6B0', 'stroke-width': 3 });
  el('circle', { cx: 355, cy: 90, r: 10, fill: pal.mint, opacity: 0.6 });
  const b = k.buddy({ x: 50, y: FY });
  const X1 = 257;
  const xf = (t) => lerp(50, X1, easeInOut(seg(t, 0.2, 1.6)));
  return {
    update(t) {
      const p = gait(xf, t, 50);
      const turn = easeInOut(seg(t, 1.7, 2.2));
      const L = easeOut(seg(t, 2.5, 3.1));
      const settle = 0.8 * wobble(seg(t, 3.0, 3.8), 2, 4) * seg(t, 3.0, 3.1);
      const lean = lerp(p.lean, -14, L) + settle;
      const relax = easeInOut(seg(t, 3.0, 3.6));
      b.pose({ x: p.x + 1 * L, walk: p.walk, facing: lerp(1, -1, turn), lean, armL: lerp(p.armL, 22, relax), armR: lerp(p.armR, 14, relax), look: 0.3 * (1 - turn) - 0.5 * turn, mood: t > 2.9 ? 'smile' : 'flat', squash: 1 - 0.015 * seg(t, 3.0, 3.2) });
    }
  };
}
