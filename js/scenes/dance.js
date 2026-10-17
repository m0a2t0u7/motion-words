// dance：パーティーで二人が夜通し踊る（時計が進み、窓の外が明るくなる）（例文 They danced all night at the party.）
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
export const meta = { duration: 4.4, beats: [[0, 'パーティー'], [1.4, '踊る'], [3.4, '明け方まで']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'evening' });
  // 窓（夜→朝）
  const win = el('rect', { x: 20, y: 70, width: 64, height: 70, rx: 6, fill: '#2B3560' });
  el('line', { x1: 52, y1: 70, x2: 52, y2: 140, stroke: '#fff', 'stroke-width': 3 });
  const moon = el('circle', { r: 8, fill: '#FFF3C4' });
  // 時計
  const cl = g({}); tf(cl, 346, 100);
  el('circle', { r: 24, fill: '#fff', stroke: pal.ink, 'stroke-width': 4 }, cl);
  for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6; el('line', { x1: Math.sin(a) * 18, y1: -Math.cos(a) * 18, x2: Math.sin(a) * 21, y2: -Math.cos(a) * 21, stroke: pal.sub, 'stroke-width': 2 }, cl); }
  const hh = el('line', { x1: 0, y1: 0, x2: 0, y2: -12, stroke: pal.ink, 'stroke-width': 4, 'stroke-linecap': 'round' }, cl);
  const mh = el('line', { x1: 0, y1: 0, x2: 0, y2: -17, stroke: pal.ink, 'stroke-width': 2.6, 'stroke-linecap': 'round' }, cl);
  // ガーランド
  el('path', { d: 'M 0 24 Q 100 56 200 24 Q 300 56 400 24', fill: 'none', stroke: pal.sub, 'stroke-width': 2 });
  [[40, 36, pal.coral], [90, 44, pal.yellow], [140, 42, pal.mint], [200, 30, pal.violet], [260, 42, pal.blue], [310, 44, pal.coral], [360, 36, pal.yellow]].forEach(([x, y, c]) => el('path', { d: `M ${x - 9} ${y - 4} L ${x + 9} ${y - 4} L ${x} ${y + 16} Z`, fill: c }));
  // ミラーボール
  const ball = g({}); tf(ball, 200, 80);
  el('line', { x1: 0, y1: -56, x2: 0, y2: -22, stroke: pal.sub, 'stroke-width': 2 }, ball);
  el('circle', { r: 22, fill: '#C9D3E3' }, ball);
  const facets = g({}, ball);
  for (let i = -2; i <= 2; i++) el('line', { x1: i * 8, y1: -20, x2: i * 8, y2: 20, stroke: '#fff', 'stroke-width': 1.4, opacity: 0.7 }, facets);
  [-12, 0, 12].forEach((y) => el('line', { x1: -22, y1: y, x2: 22, y2: y, stroke: '#fff', 'stroke-width': 1.4, opacity: 0.6 }, ball));
  const spots = [0, 1, 2, 3, 4].map((i) => el('circle', { r: 16 + (i % 3) * 5, fill: [pal.coral, pal.blue, pal.yellow, pal.mint, pal.violet][i], opacity: 0.25 }));
  // 風船
  const bal = [[30, pal.red], [372, pal.blue]].map(([x, c]) => { const gg = g({}); el('line', { x1: 0, y1: 0, x2: 0, y2: 52, stroke: pal.sub, 'stroke-width': 1.5 }, gg); el('ellipse', { cx: 0, cy: 0, rx: 14, ry: 17, fill: c }, gg); return [gg, x]; });
  const A = k.buddy({ x: 150, y: FY, color: pal.coral, dark: pal.coralDark });
  const B = k.buddy({ x: 255, y: FY, facing: -1 });
  const notes = [...Array(5)].map((_, i) => { const n = g({}); el('circle', { cx: 0, cy: 0, r: 4, fill: [pal.coral, pal.blue, pal.violet][i % 3] }, n); el('line', { x1: 3.5, y1: 0, x2: 3.5, y2: -14, stroke: [pal.coral, pal.blue, pal.violet][i % 3], 'stroke-width': 2.2 }, n); return n; });
  return {
    update(t) {
      const dawn = seg(t, 0.4, 4.4);
      k.set(win, { fill: mix('#2B3560', '#BFE3F5', easeInOut(seg(t, 2.4, 4.4))) });
      tf(moon, lerp(34, 70, dawn), lerp(86, 122, dawn)); moon.setAttribute('opacity', 1 - seg(t, 3.2, 4.0));
      mh.setAttribute('transform', `rotate(${t * 360 * 2})`);
      hh.setAttribute('transform', `rotate(${270 + t * 60})`);
      facets.setAttribute('transform', `translate(${(t * 14) % 8} 0)`);
      spots.forEach((s, i) => { s.setAttribute('cx', 200 + Math.sin(t * 1.6 + i * 1.7) * (80 + i * 14)); s.setAttribute('cy', 120 + Math.cos(t * 1.3 + i * 2.1) * 36 + i * 14); });
      bal.forEach(([gg, x], i) => tf(gg, x, 150 + 4 * Math.sin(t * 2 + i * 2)));
      const on = seg(t, 0.5, 1.0);
      const w = 6.9; // 拍
      const hopA = Math.abs(Math.sin(t * w / 2)) * 9 * on, hopB = Math.abs(Math.sin(t * w / 2 + 1.4)) * 9 * on;
      const spin = t > 2.2 && t < 3.4 ? Math.cos((t - 2.2) * 5.2) : 1;
      A.pose({ lift: hopA, facing: spin, armR: 100 + 75 * Math.sin(t * w) * on, armL: 100 + 75 * Math.sin(t * w + Math.PI) * on, lean: 8 * Math.sin(t * w / 2) * on, squash: 1 - 0.05 * Math.cos(t * w) * on, mood: 'grin', look: 0.4 });
      const up = t > 2.2 ? 1 : 0;
      B.pose({ lift: hopB, armR: up ? 150 + 20 * Math.sin(t * w) : 90 + 70 * Math.sin(t * w + 1.4) * on, armL: up ? 150 + 20 * Math.sin(t * w + Math.PI) : 90 + 70 * Math.sin(t * w + 1.4 + Math.PI) * on, lean: -8 * Math.sin(t * w / 2 + 1.4) * on, squash: 1 - 0.05 * Math.cos(t * w + 1.4) * on, mood: 'grin', look: 0.4 });
      notes.forEach((n, i) => { const p = ((t * 0.5 + i / 5) % 1); tf(n, 120 + i * 40 + Math.sin(p * 6 + i) * 8, 190 - p * 90); n.setAttribute('opacity', Math.sin(p * Math.PI) * on); });
    }
  };
}
