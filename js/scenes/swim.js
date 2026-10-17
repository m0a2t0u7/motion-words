// swim：プールでクロールで泳ぐ。毎週土曜日の習慣（例文 I swim in the pool on Saturdays.）
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
export const meta = { duration: 4.2, beats: [[0, '土曜日'], [1.2, '泳ぎ出す'], [3.2, '泳いでいる']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  k.backdrop({ floorY: 118, mood: 'indoor' });
  const WY = 150;
  // 壁タイルと曜日ボード
  for (let i = 0; i < 20; i++) el('rect', { x: i * 20, y: 118, width: 19, height: 28, fill: '#DCEAF6' });
  const bd = g({}); tf(bd, 200, 40);
  el('rect', { x: -110, y: -20, width: 220, height: 56, rx: 8, fill: '#fff', stroke: pal.line, 'stroke-width': 2 }, bd);
  const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  days.forEach((d, i) => k.text(-90 + i * 30, 2, d, { 'font-size': 17, fill: i === 6 ? pal.red : pal.sub }, bd));
  const ring = el('circle', { cx: 90, cy: 2, r: 15, fill: 'none', stroke: pal.red, 'stroke-width': 3, 'stroke-dasharray': 95, 'stroke-dashoffset': 95 }, bd);
  k.text(0, 24, 'SAT', { 'font-size': 12, fill: pal.red }, bd);
  // プール本体（水）
  el('rect', { x: 0, y: WY - 4, width: 400, height: 6, fill: '#BFD9F7' });
  el('rect', { x: 0, y: WY, width: 400, height: 160, fill: k.gradient([[0, '#9ADAF7'], [1, '#5FB6E8']]) });
  const lines = g({});
  for (let i = 0; i < 9; i++) el('line', { x1: -60 + i * 56, y1: 262, x2: -20 + i * 56, y2: 262, stroke: '#fff', 'stroke-width': 3, opacity: 0.55 }, lines);
  // レーンロープ
  for (let i = 0; i < 14; i++) el('circle', { cx: 14 + i * 28, cy: WY + 1, r: 4.5, fill: i % 2 ? pal.red : pal.yellow });
  const sw = g({});
  const b = k.buddy({ parent: sw, x: 0, y: 0, color: pal.mint, dark: pal.mintDark });
  b.g.firstChild.setAttribute('display', 'none');
  // 水の前面（体の下半分を水中に）
  el('rect', { x: 0, y: WY + 12, width: 400, height: 160, fill: '#5FB6E8', opacity: 0.38 });
  const wave = el('path', { fill: 'none', stroke: '#fff', 'stroke-width': 2.4, opacity: 0.8 });
  const bubs = [0, 1, 2, 3, 4].map(() => el('circle', { r: 3, fill: '#fff', opacity: 0.7, stroke: '#CFEFFB', 'stroke-width': 1 }));
  const spl = [0, 1, 2].map(() => el('circle', { r: 3, fill: '#fff' }));
  const X0 = 40, X1 = 250;
  return {
    update(t) {
      const sp = easeInOut(seg(t, 0.8, 3.9));
      const x = lerp(X0, X1, sp);
      const stroke = seg(t, 0.8, 1.3);
      const w = t * 15 * stroke;
      ring.setAttribute('stroke-dashoffset', 95 * (1 - easeOut(seg(t, 0.1, 0.9))));
      const bob = Math.sin(t * 7) * 2 * stroke;
      tf(sw, x, WY + 4 + bob, 80 + 4 * Math.sin(t * 4));
      const ph = t * 6.5 * stroke;
      b.pose({ walk: w, armR: (ph * 57.3) % 360, armL: (ph * 57.3 + 180) % 360, mood: 'smile', look: 0.8, blink: 0 });
      let d = `M -10 ${WY}`;
      for (let i = 0; i <= 40; i++) { const xx = i * 10; d += ` L ${xx} ${WY + Math.sin(xx * 0.09 - t * 4) * 2.4}`; }
      wave.setAttribute('d', d);
      lines.setAttribute('transform', `translate(${(t * 6) % 56} 0)`);
      bubs.forEach((c, i) => { const p = ((t * 0.6 + i * 0.21) % 1); c.setAttribute('cx', x - 40 + i * 14 + Math.sin(p * 9 + i) * 4); c.setAttribute('cy', WY + 60 - p * 48); c.setAttribute('opacity', stroke * (1 - p) * 0.8); c.setAttribute('r', 2 + 2 * ((i * 37) % 3) / 2); });
      spl.forEach((c, i) => { const p = ((t * 3 + i * 0.33) % 1); c.setAttribute('cx', x + 36 - i * 8 + p * 8); c.setAttribute('cy', WY - 6 - Math.sin(p * Math.PI) * 14); c.setAttribute('opacity', stroke * (1 - p) * 0.9); });
    }
  };
}
