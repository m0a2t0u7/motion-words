// cover：鍋にふたをかぶせる（例文 Cover the pot with a lid.）
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
export const meta = { duration: 3.8, beats: [[0, 'ふたを持つ'], [1.2, 'かぶせる'], [2.6, '覆った']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  const S = 1.3;
  // キッチン壁と窓
  el('rect', { x: 250, y: 40, width: 110, height: 70, rx: 6, fill: '#DDEFFA' });
  el('line', { x1: 305, y1: 40, x2: 305, y2: 110, stroke: '#fff', 'stroke-width': 4 });
  el('rect', { x: 190, y: 214, width: 100, height: 22, fill: pal.woodDark });
  el('rect', { x: 186, y: 210, width: 108, height: 6, rx: 3, fill: '#AEB8C6' });
  el('ellipse', { cx: 242, cy: 232, rx: 30, ry: 4, fill: pal.shadow });
  // 火
  [-14, 0, 14].forEach((dx) => el('path', { d: `M ${242 + dx} 210 q -4 -6 0 -12 q 4 6 0 12`, fill: pal.yellow }));
  // 鍋（本体）
  const px = 242, rimY = 184;
  el('rect', { x: px - 30, y: rimY, width: 60, height: 26, rx: 5, fill: '#8A94A6' });
  el('rect', { x: px - 30, y: rimY, width: 60, height: 8, fill: '#A2ACBC' });
  el('rect', { x: px + 28, y: rimY + 6, width: 12, height: 6, rx: 3, fill: '#6F7A8E' });
  el('rect', { x: px - 40, y: rimY + 6, width: 12, height: 6, rx: 3, fill: '#6F7A8E' });
  const inside = el('ellipse', { cx: px, cy: rimY, rx: 28, ry: 5.5, fill: '#C98B52' });
  // 湯気
  const steam = g({});
  [-12, 0, 12].forEach((dx, i) => el('path', { d: `M ${dx} 0 q 6 -10 0 -20 q -6 -10 0 -20`, fill: 'none', stroke: '#C4CCD8', 'stroke-width': 3.5, 'stroke-linecap': 'round' }, steam));
  // ふた
  const lid = g({});
  el('path', { d: 'M -31 0 Q -30 -20 0 -20 Q 30 -20 31 0 Z', fill: '#B7C0CE', stroke: '#8E99AB', 'stroke-width': 2 }, lid);
  el('rect', { x: -33, y: -2, width: 66, height: 5, rx: 2.5, fill: '#8E99AB' }, lid);
  el('rect', { x: -5, y: -30, width: 10, height: 11, rx: 4, fill: pal.coral }, lid);
  const puff = g({});
  [-1, 1].forEach((s) => el('path', { d: `M ${s * 30} 0 q ${s * 10} -4 ${s * 14} -12`, fill: 'none', stroke: '#C4CCD8', 'stroke-width': 3, 'stroke-linecap': 'round' }, puff));
  const b = k.buddy({ x: 150, y: FY, scale: S });

  return {
    update(t) {
      const dn = easeInOut(seg(t, 0.5, 1.5));
      const rel = easeInOut(seg(t, 2.0, 2.7));
      let phi = lerp(140, 92, dn);
      b.pose({ armR: phi, armL: 10, lean: 3 + 3 * dn, look: 0.5, mood: t > 2.0 ? 'grin' : 'smile', squash: 1 });
      const h = hp(b, S, 'R', 28);
      const landed = t >= 1.5;
      const bounce = landed ? 2 * wobble(seg(t, 1.5, 2.1), 2, 4) : 0;
      let lx = lerp(h.x, px, seg(t, 0.5, 1.5)), ly = Math.min(h.y + 26, rimY);
      if (landed) { lx = px; ly = rimY - bounce; }
      tf(lid, lx, ly, landed ? 0 : -4 * (1 - dn), 1, 1 + 0.03 * bounce);
      b.pose({ armR: landed ? lerp(phi, 20, rel) : phi });
      // 湯気：ふたが乗るまで立ちのぼる／ふたの後は止まる
      const live = 1 - seg(t, 1.2, 1.6);
      steam.setAttribute('opacity', 0.9 * live);
      tf(steam, px, rimY - 4 - 8 * ((t * 1.2) % 1) * live);
      puff.setAttribute('opacity', t > 1.5 && t < 1.9 ? 1 - seg(t, 1.5, 1.9) : 0);
      tf(puff, px, rimY - 2);
    }
  };
}
