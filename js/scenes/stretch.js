// stretch：朝、目覚めて両腕を上へぐーっと伸ばす。毎朝のしるし（例文 I stretch my arms every morning.）
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
export const meta = { duration: 3.8, beats: [[0, 'ねむい'], [1.3, '伸ばす'], [3.0, '毎朝の印']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  // 窓と朝日、床に落ちる光
  el('polygon', { points: '60,236 150,236 120,150 60,100', fill: '#FFF3C4', opacity: 0.45 });
  el('rect', { x: 30, y: 40, width: 90, height: 76, rx: 8, fill: '#DDEFFA' });
  const sun = el('circle', { cx: 75, cy: 110, r: 15, fill: pal.yellow });
  el('rect', { x: 26, y: 112, width: 98, height: 6, fill: '#fff' });
  el('line', { x1: 75, y1: 40, x2: 75, y2: 116, stroke: '#fff', 'stroke-width': 4 });
  // 壁かけカレンダー（毎朝＝印が増える）
  el('rect', { x: 290, y: 52, width: 84, height: 70, rx: 6, fill: '#fff', stroke: pal.line, 'stroke-width': 2 });
  el('rect', { x: 290, y: 52, width: 84, height: 16, rx: 6, fill: pal.red });
  const checks = [0, 1, 2].map((i) => {
    const c = el('path', { d: `M ${302 + i * 24} 90 l 5 6 l 10 -12`, fill: 'none', stroke: pal.green, 'stroke-width': 4, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-dasharray': 24, 'stroke-dashoffset': 24 });
    el('rect', { x: 298 + i * 24, y: 78, width: 22, height: 26, rx: 4, fill: 'none', stroke: pal.line, 'stroke-width': 1.5 });
    return c;
  });
  const lines = g({});
  [-1, 1].forEach((s) => [0, 1, 2].forEach((j) => el('line', { x1: s * (28 + j * 9), y1: -10 - j * 3, x2: s * (30 + j * 9), y2: -24 - j * 3, stroke: pal.yellowDark, 'stroke-width': 2.6, 'stroke-linecap': 'round' }, lines)));
  const b = k.buddy({ x: 200, y: FY });

  return {
    update(t) {
      const up = easeInOut(seg(t, 0.6, 1.7));
      const dn = easeInOut(seg(t, 2.5, 3.3));
      const e = up * (1 - dn);
      const trem = seg(t, 1.7, 2.5) * (1 - seg(t, 2.4, 2.5)) * Math.sin(t * 40) * 1.5;
      const arm = 8 + 172 * e + trem;
      b.pose({ armR: arm, armL: arm, lean: -7 * e, lift: 4 * e, squash: 1 + 0.1 * e + 0.015 * Math.sin(t * 2), blink: t < 0.7 ? 0.55 : 0, mood: e > 0.5 ? 'open' : t > 3.1 ? 'smile' : 'flat', look: 0 });
      tf(lines, 200, FY - 84 - 4 * e + 0, 0, 1);
      lines.setAttribute('opacity', clamp((e - 0.8) * 5) * (t > 2.4 ? 0 : 0.6 + 0.4 * Math.sin(t * 20)));
      sun.setAttribute('cy', lerp(112, 82, easeOut(seg(t, 0, 3.4))));
      checks.forEach((c, i) => c.setAttribute('stroke-dashoffset', 24 * (1 - easeOut(seg(t, 2.6 + i * 0.35, 2.9 + i * 0.35)))));
    }
  };
}
