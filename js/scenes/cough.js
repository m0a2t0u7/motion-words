// cough：ベッドで体を起こし、夜通し何度もせきをする（例文 He coughed all night.）
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
export const meta = { duration: 4.4, beats: [[0, 'せきが出る'], [1.8, '何度も'], [3.6, '明け方']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 250, mood: 'indoor' });
  const win = el('rect', { x: 26, y: 38, width: 84, height: 70, rx: 8, fill: '#1F2A4D' });
  const stars = [[40, 52], [92, 60], [54, 90], [98, 90]].map(([x, y]) => el('circle', { cx: x, cy: y, r: 1.8, fill: '#fff' }));
  const moon = g({});
  el('circle', { r: 11, fill: '#FFF3C4' }, moon);
  el('circle', { cx: 5, cy: -3, r: 9, fill: '#1F2A4D' }, moon);
  el('line', { x1: 68, y1: 38, x2: 68, y2: 108, stroke: '#fff', 'stroke-width': 4 });
  el('line', { x1: 26, y1: 73, x2: 110, y2: 73, stroke: '#fff', 'stroke-width': 4 });
  el('rect', { x: 22, y: 106, width: 92, height: 6, rx: 3, fill: '#fff' });
  // 時計（時間の経過）
  const cl = g({}); tf(cl, 196, 62);
  el('circle', { r: 26, fill: '#fff', stroke: pal.ink, 'stroke-width': 4 }, cl);
  for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6; el('line', { x1: Math.sin(a) * 20, y1: -Math.cos(a) * 20, x2: Math.sin(a) * 23, y2: -Math.cos(a) * 23, stroke: pal.sub, 'stroke-width': 2 }, cl); }
  const hh = el('line', { x1: 0, y1: 0, x2: 0, y2: -13, stroke: pal.ink, 'stroke-width': 4, 'stroke-linecap': 'round' }, cl);
  const mh = el('line', { x1: 0, y1: 0, x2: 0, y2: -19, stroke: pal.ink, 'stroke-width': 2.6, 'stroke-linecap': 'round' }, cl);
  // ベッド
  el('rect', { x: 338, y: 120, width: 14, height: 112, rx: 5, fill: pal.woodDark });
  el('rect', { x: 120, y: 206, width: 230, height: 26, rx: 6, fill: pal.wood });
  el('rect', { x: 126, y: 232, width: 10, height: 18, fill: pal.woodDark });
  el('rect', { x: 332, y: 232, width: 10, height: 18, fill: pal.woodDark });
  el('rect', { x: 124, y: 190, width: 220, height: 20, rx: 8, fill: '#EAF2FA' });
  el('ellipse', { cx: 300, cy: 176, rx: 30, ry: 14, fill: '#fff', stroke: '#D5DBE5', 'stroke-width': 2 });
  const grp = g({});
  const b = k.buddy({ parent: grp, x: 0, y: 0 });
  b.g.firstChild.setAttribute('display', 'none');
  tf(grp, 230, 196);
  const bl = el('rect', { x: 150, y: 170, width: 150, height: 40, rx: 14, fill: pal.blue });
  el('rect', { x: 150, y: 170, width: 150, height: 9, rx: 4, fill: '#fff', opacity: 0.35 });
  const puff = g({});
  [0, 1, 2].forEach((i) => el('path', { d: `M ${i * 8} ${-i * 6} q 8 -3 12 -10`, fill: 'none', stroke: pal.sub, 'stroke-width': 2.6, 'stroke-linecap': 'round' }, puff));
  const sw = el('path', { d: 'M 0 -8 Q 6 2 0 6 Q -6 2 0 -8 Z', fill: pal.water });
  const C = [0.5, 0.9, 1.45, 1.85, 2.5, 2.85, 3.3, 3.65];
  const pulse = (t) => C.reduce((s, c) => s + clamp(1 - Math.abs((t - c - 0.1) / 0.22)), 0);
  return {
    update(t) {
      const c = clamp(pulse(t));
      const night = seg(t, 0, 4.2);
      k.set(win, { fill: mix('#1F2A4D', '#DDEFFA', easeInOut(seg(t, 1.0, 4.2))) });
      stars.forEach((s) => s.setAttribute('opacity', 1 - seg(t, 1.6, 3.2)));
      k.set(moon.children[1], { fill: win.getAttribute('fill') });
      tf(moon, lerp(46, 98, seg(t, 0, 3.4)), lerp(56, 98, seg(t, 0, 3.4)));
      mh.setAttribute('transform', `rotate(${t * 360 * 1.6})`);
      hh.setAttribute('transform', `rotate(${300 + t * 360 * 1.6 / 12 * 1.0 + 0})`);
      b.pose({ armR: -90, armL: 35, lean: 9 * c, squash: 1 - 0.07 * c, look: 0.2, mood: 'sad', blink: 0.3 + 0.7 * c, x: 0 });
      tf(grp, 230, 196 + 1.5 * c);
      const on = c > 0.3;
      puff.setAttribute('opacity', on ? 0.9 : 0);
      tf(puff, 230 + 26, 196 - 52 - 6 * c, 0, 1);
      tf(sw, 218, 112 + 14 * seg(t, 2.3, 3.0));
      sw.setAttribute('opacity', t > 2.2 && t < 3.4 ? 1 : 0);
    }
  };
}
