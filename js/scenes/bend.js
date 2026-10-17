// bend：ひざを深く曲げてためを作り、そこから跳ぶ（例文 Bend your knees and jump.）
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
export const meta = { duration: 3.8, beats: [[0, '立つ'], [1.2, 'ひざを曲げる'], [2.4, '跳ぶ']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  el('rect', { x: 40, y: 50, width: 70, height: 60, rx: 6, fill: '#DDEFFA' });
  el('rect', { x: 296, y: 60, width: 64, height: 6, rx: 3, fill: pal.woodDark });
  el('rect', { x: 120, y: 236, width: 160, height: 8, rx: 4, fill: '#BFD9F7' });
  const legG = g({});
  const mk = () => el('path', { fill: 'none', stroke: pal.mintDark, 'stroke-width': 10, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, legG);
  const legs = [mk(), mk()];
  const b = k.buddy({ x: 200, y: FY });
  [0, 1].forEach((i) => b.g.children[1].children[i].setAttribute('opacity', 0));
  const arcs = g({});
  [-1, 1].forEach((s) => el('path', { d: `M ${s * 22} -12 q ${s * 12} 8 0 22`, fill: 'none', stroke: pal.yellowDark, 'stroke-width': 3, 'stroke-linecap': 'round' }, arcs));
  tf(arcs, 200, FY - 4);
  const mark = g({});
  el('line', { x1: -40, y1: 0, x2: 40, y2: 0, stroke: pal.line, 'stroke-width': 3, 'stroke-dasharray': '6 6' }, mark);
  tf(mark, 200, FY - 150);

  return {
    update(t) {
      const down = easeInOut(seg(t, 0.5, 1.4));
      const hold = 0.12 * Math.sin(seg(t, 1.4, 1.8) * Math.PI);
      const up = seg(t, 1.8, 2.0);
      const u = seg(t, 1.95, 2.85);
      const h = 58 * 4 * u * (1 - u);
      const land = Math.sin(seg(t, 2.85, 3.35) * Math.PI);
      let c = (down + hold) * (1 - easeOut(up)) + 0.65 * land;
      if (u > 0 && u < 1) c = 0.35 * Math.sin(u * Math.PI);
      const L = h - 9 * c;
      const arm = t < 1.8 ? lerp(8, 35, down) : t < 2.35 ? lerp(35, 172, easeOut(seg(t, 1.8, 2.3))) : lerp(172, 8, easeInOut(seg(t, 2.9, 3.4)));
      b.pose({ lift: L, squash: 1 - 0.22 * c + (u > 0 && u < 1 ? 0.1 * Math.sin(u * Math.PI) : 0), armR: t < 1.8 ? -arm : arm, armL: arm, lean: 5 * c, mood: t < 1.9 ? 'flat' : t < 2.9 ? 'open' : 'smile', look: 0.2 });
      const d = 9 * c, lift = Math.max(h, 0);
      [-1, 1].forEach((s, i) => {
        const hx = 200 + s * 12, hy = FY - 14 + d - h, fy = FY + 1 - lift;
        const kx = hx + 14 * c;
        legs[i].setAttribute('d', `M ${hx} ${hy} L ${kx} ${(hy + fy) / 2 + 2} L ${hx + 2 * c} ${fy}`);
      });
      arcs.setAttribute('opacity', clamp((c - 0.5) * 3) * (u > 0 ? 0 : 1));
      mark.setAttribute('opacity', h > 40 ? 0.9 : 0);
      tf(arcs, 200 + 8, FY - 4 + d * 0.3);
    }
  };
}
