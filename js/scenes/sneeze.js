// sneeze：春、花粉や花びらが舞うなかで、何度もくしゃみをする（例文 I sneeze a lot in spring.）
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
export const meta = { duration: 4.2, beats: [[0, '春の花粉'], [1.1, 'くしゃみ'], [2.9, 'また出る']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'outdoor' });
  // 桜の木（左）
  el('rect', { x: 52, y: 120, width: 14, height: 116, rx: 5, fill: pal.woodDark });
  [[58, 90, 46], [30, 108, 32], [88, 106, 34], [48, 74, 28], [74, 72, 26]].forEach(([x, y, r]) => el('circle', { cx: x, cy: y, r, fill: '#FFC9D6' }));
  [[40, 96, 8], [70, 88, 6], [90, 112, 7]].forEach(([x, y, r]) => el('circle', { cx: x, cy: y, r, fill: '#FFB0C4' }));
  const petals = [...Array(10)].map((_, i) => el('ellipse', { rx: 4, ry: 2.4, fill: i % 2 ? '#FFC9D6' : '#FFB0C4' }));
  const poll = [...Array(14)].map(() => el('circle', { r: 2.2, fill: pal.yellow, opacity: 0.85 }));
  const burst = g({});
  [-30, -10, 10, 30].forEach((a) => el('line', { x1: 8, y1: 0, x2: 24, y2: 0, stroke: pal.sub, 'stroke-width': 3, 'stroke-linecap': 'round', transform: `rotate(${a})` }, burst));
  const drops = [0, 1, 2, 3].map(() => el('circle', { r: 2.6, fill: pal.water }));
  const b = k.buddy({ x: 220, y: FY });
  const S = [1.15, 2.2, 3.1];
  const insp = (t) => S.reduce((m, s) => Math.max(m, clamp(1 - Math.abs((t - (s - 0.4)) / 0.4)) * (t < s ? 1 : 0)), 0);
  const blast = (t) => S.reduce((m, s) => Math.max(m, clamp(1 - (t - s) / 0.35) * (t >= s ? 1 : 0)), 0);
  return {
    update(t) {
      const a = insp(t), c = blast(t);
      const lean = -10 * a + 22 * c + 4 * wobble(clamp(t - 3.1, 0, 1), 3, 4);
      b.pose({ lean, squash: 1 + 0.06 * a - 0.1 * c, mood: a > 0.3 || c > 0.15 ? 'open' : 'sad', blink: a > 0.2 || c > 0.1 ? 1 : 0, armR: 8 + 40 * a, armL: 8, look: 0.4, y: FY - 2 * a });
      burst.setAttribute('opacity', c > 0.1 ? c : 0);
      tf(burst, 250 + 6 * (1 - c), FY - 46 + 6 * lean / 22, 0, 0.6 + 0.8 * (1 - c));
      drops.forEach((d, i) => { const p = clamp((t - 0) , 0, 99); const ci = S.findIndex((s) => t >= s && t < s + 0.5); const u = ci >= 0 ? (t - S[ci]) / 0.5 : 2; d.setAttribute('opacity', u < 1 ? 1 - u : 0); d.setAttribute('cx', 256 + u * (26 + i * 8)); d.setAttribute('cy', FY - 44 + u * (8 + i * 6) - (3 - i) * 3 * Math.sin(u * Math.PI)); });
      petals.forEach((pt, i) => { const p = ((t * 0.28 + i * 0.173) % 1); pt.setAttribute('cx', 90 + p * 290 + Math.sin(p * 11 + i) * 14); pt.setAttribute('cy', 60 + p * 190 + Math.sin(p * 7 + i * 2) * 10); pt.setAttribute('transform', `rotate(${p * 540 + i * 30} ${90 + p * 290} ${60 + p * 190})`); });
      poll.forEach((d, i) => { const p = ((t * 0.18 + i * 0.131) % 1); d.setAttribute('cx', 130 + ((i * 53) % 220) + Math.sin(t * 2 + i) * 12); d.setAttribute('cy', 70 + (i * 29) % 120 + p * 24 + Math.cos(t * 2.4 + i) * 8); });
    }
  };
}
