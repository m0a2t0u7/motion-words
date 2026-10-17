// find：かがんでソファの下をのぞき、奥の鍵に気づいて取り出す（例文 I found my keys under the sofa.）
import { seg, lerp, easeInOut, easeOut, backOut, wobble, clamp } from '../ease.js';
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
export const meta = { duration: 4.2, beats: [[0, 'のぞきこむ'], [1.8, '手を伸ばす'], [3.3, '見つけた']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  el('rect', { x: 40, y: 50, width: 70, height: 60, rx: 6, fill: '#DDEFFA' });
  // ソファの下は少し暗く
  el('rect', { x: 200, y: 212, width: 180, height: 24, fill: '#8C93A8', opacity: 0.22 });
  // 鍵（ソファの下の床）
  const keys = g({});
  el('circle', { cx: 0, cy: 0, r: 6, fill: 'none', stroke: '#7F8AA0', 'stroke-width': 3 }, keys);
  [[-12, 8, '#B4BDCC'], [12, 8, pal.yellowDark]].forEach(([dx, dy, c]) => {
    el('line', { x1: 0, y1: 4, x2: dx, y2: dy + 12, stroke: c, 'stroke-width': 4, 'stroke-linecap': 'round' }, keys);
  });
  const glint = g({});
  [0, 60, 120].forEach((a) => el('line', { x1: 0, y1: -9, x2: 0, y2: -16, stroke: pal.yellowDark, 'stroke-width': 2.4, 'stroke-linecap': 'round', transform: `rotate(${a})` }, glint));
  [180, 240, 300].forEach((a) => el('line', { x1: 0, y1: -9, x2: 0, y2: -16, stroke: pal.yellowDark, 'stroke-width': 2.4, 'stroke-linecap': 'round', transform: `rotate(${a})` }, glint));
  const b = k.buddy({ x: 120, y: FY });
  // ソファ（鍵と手の上に重なる）
  el('rect', { x: 196, y: 186, width: 184, height: 26, rx: 8, fill: pal.violet });
  el('rect', { x: 340, y: 130, width: 40, height: 62, rx: 12, fill: '#8F74E0' });
  el('rect', { x: 196, y: 168, width: 20, height: 36, rx: 8, fill: '#8F74E0' });
  el('rect', { x: 206, y: 212, width: 8, height: 24, fill: pal.woodDark });
  el('rect', { x: 362, y: 212, width: 8, height: 24, fill: pal.woodDark });
  const ex = k.text(160, 90, '!', { 'font-size': 28, fill: pal.red });
  [keys, glint, b.g, ex].forEach((n) => k.root.appendChild(n));
  return {
    update(t) {
      const bend = easeInOut(seg(t, 0.7, 1.5)), rise = easeInOut(seg(t, 2.5, 3.3));
      const lean = 48 * bend * (1 - rise) + 4 * rise;
      const look = t < 0.7 ? Math.sin(t * 5) * 0.8 : 0.6;
      b.pose({ lean, squash: 1 - 0.06 * bend * (1 - rise), look, mood: t < 1.5 ? 'flat' : t < 3.2 ? 'open' : 'grin', armL: 8, armR: 8, x: 120 + 30 * bend * (1 - rise) + 8 * rise, lift: 0 });
      const grab = easeInOut(seg(t, 1.8, 2.3));
      const kx = 232, ky = 227;
      let ang;
      if (t < 1.8) ang = lerp(8, reach(b, 1, 'R', kx, ky), seg(t, 1.0, 1.8) * 0.5);
      else if (t < 2.5) ang = reach(b, 1, 'R', kx, ky);
      else ang = lerp(reach(b, 1, 'R', kx, ky), 135, rise);
      b.pose({ armR: ang });
      const h = hp(b, 1, 'R', 28);
      const held = t >= 2.3;
      const sw = held ? 12 * wobble(seg(t, 2.5, 3.8), 2, 2.5) : 0;
      tf(keys, held ? h.x : kx, held ? h.y + 6 : ky, held ? sw : 0);
      glint.setAttribute('opacity', !held && t > 1.3 ? 0.5 + 0.5 * Math.sin(t * 14) : 0);
      tf(glint, kx, ky - 1);
      const ep = seg(t, 1.5, 1.8);
      ex.setAttribute('opacity', ep > 0 && t < 2.8 ? 1 : 0);
      tf(ex, 150, 100 - 8 * easeOut(ep), 0, 1);
    }
  };
}
