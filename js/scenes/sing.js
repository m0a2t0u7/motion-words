// sing：学校の合唱団で、指揮に合わせて彼女（コーラル）が口を開けて歌う（例文 She sings in the school choir.）
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
export const meta = { duration: 4.2, beats: [[0, '整列'], [1.2, '歌い出す'], [2.6, '合唱']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  // 壁の飾り（学校の音楽室）
  el('rect', { x: 130, y: 40, width: 140, height: 18, rx: 5, fill: pal.violet, opacity: 0.35 });
  [0, 1, 2, 3, 4].forEach((i) => el('line', { x1: 150 + i * 25, y1: 66, x2: 250 - (4 - i) * 25 + 0, y2: 66, stroke: pal.line, 'stroke-width': 2 }));
  // ひな壇
  el('rect', { x: 90, y: 204, width: 230, height: 32, fill: pal.wood });
  el('rect', { x: 90, y: 204, width: 230, height: 5, fill: pal.woodDark });
  const back = [[150, pal.yellow, pal.yellowDark], [250, pal.violet, '#8467DB']].map(([x, c, d]) => k.buddy({ x, y: 206, scale: 0.72, color: c, dark: d }));
  const front = [[120, pal.blue, pal.blueDark, 0.9], [200, pal.coral, pal.coralDark, 1.0], [280, pal.mint, pal.mintDark, 0.9]].map(([x, c, d, s]) => k.buddy({ x, y: FY, scale: s, color: c, dark: d }));
  const teacher = k.buddy({ x: 40, y: FY, scale: 0.9, color: '#F4A261', dark: '#D9823F' });
  const baton = el('line', { stroke: pal.ink, 'stroke-width': 2.6, 'stroke-linecap': 'round' });
  const notes = [...Array(7)].map((_, i) => {
    const n = g({});
    el('ellipse', { cx: 0, cy: 0, rx: 5, ry: 3.8, fill: [pal.coral, pal.blue, pal.violet, pal.mintDark][i % 4], transform: 'rotate(-20)' }, n);
    el('line', { x1: 4.5, y1: -1, x2: 4.5, y2: -17, stroke: [pal.coral, pal.blue, pal.violet, pal.mintDark][i % 4], 'stroke-width': 2.2 }, n);
    el('path', { d: 'M 4.5 -17 q 7 2 6 9', fill: 'none', stroke: [pal.coral, pal.blue, pal.violet, pal.mintDark][i % 4], 'stroke-width': 2.2, 'stroke-linecap': 'round' }, n);
    return n;
  });
  const NX = [120, 150, 200, 250, 280, 200, 175];
  const all = [...back, ...front];
  return {
    update(t) {
      const sing = seg(t, 1.2, 1.35);
      const beat = t * 11.4;
      // 指揮：構えて、振り下ろして、拍をとる
      const raise = easeOut(seg(t, 0.4, 1.0));
      const arm = t < 1.2 ? lerp(8, 150, raise) : 110 + 38 * Math.sin(beat);
      teacher.pose({ armR: arm, armL: 8, look: 0.7, mood: 'smile', lean: 2 * Math.sin(beat) * sing, squash: 1 + 0.01 * Math.sin(t * 3) });
      const tip = hp(teacher, 0.9, 'R', 54);
      const hnd = hp(teacher, 0.9, 'R', 28);
      baton.setAttribute('x1', hnd.x); baton.setAttribute('y1', hnd.y); baton.setAttribute('x2', tip.x); baton.setAttribute('y2', tip.y);
      all.forEach((b, i) => {
        const open = sing * (Math.sin(beat + i * 0.9) > -0.2 ? 1 : 0);
        b.pose({ mood: open ? (i === 3 ? 'grin' : 'open') : 'smile', lean: 3 * Math.sin(beat / 2 + i) * sing, squash: 1 + 0.025 * Math.sin(beat + i * 0.5) * sing, look: i % 2 ? -0.6 : 0.6, armL: 8 + 10 * sing, armR: 8 + 10 * sing, y: b.state.y });
      });
      notes.forEach((n, i) => {
        const p = (((t - 1.2) * 0.55 + i / 7) % 1 + 1) % 1;
        tf(n, NX[i] + Math.sin(p * 6 + i) * 10, 140 - p * 80, 0, 1);
        n.setAttribute('opacity', t < 1.25 ? 0 : Math.sin(p * Math.PI) * sing);
      });
    }
  };
}
