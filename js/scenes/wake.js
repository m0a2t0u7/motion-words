// wake：時計が6時を指す→ぱっと目が開き、体を起こす。毎朝（例文 I wake at six every morning.）
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
export const meta = { duration: 4.2, beats: [[0, '眠っている'], [2.0, '6時に起きる'], [3.4, '毎朝の印']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 250, mood: 'indoor' });
  const win = el('rect', { x: 26, y: 38, width: 84, height: 70, rx: 8, fill: '#9FB3D9' });
  const sun = el('circle', { cx: 68, cy: 104, r: 14, fill: pal.yellow });
  el('line', { x1: 68, y1: 38, x2: 68, y2: 108, stroke: '#fff', 'stroke-width': 4 });
  el('line', { x1: 26, y1: 73, x2: 110, y2: 73, stroke: '#fff', 'stroke-width': 4 });
  el('rect', { x: 22, y: 106, width: 92, height: 6, rx: 3, fill: '#fff' });
  // 壁かけ時計（6時）
  const cl = g({}); tf(cl, 196, 62);
  el('circle', { r: 26, fill: '#fff', stroke: pal.ink, 'stroke-width': 4 }, cl);
  for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6; el('line', { x1: Math.sin(a) * 20, y1: -Math.cos(a) * 20, x2: Math.sin(a) * 23, y2: -Math.cos(a) * 23, stroke: pal.sub, 'stroke-width': 2 }, cl); }
  const hh = el('line', { x1: 0, y1: 0, x2: 0, y2: -13, stroke: pal.ink, 'stroke-width': 4, 'stroke-linecap': 'round' }, cl);
  const mh = el('line', { x1: 0, y1: 0, x2: 0, y2: -19, stroke: pal.ink, 'stroke-width': 2.6, 'stroke-linecap': 'round' }, cl);
  k.text(196, 102, '6:00', { 'font-size': 15, fill: pal.red });
  // ベッド
  el('rect', { x: 338, y: 120, width: 14, height: 112, rx: 5, fill: pal.woodDark });
  el('rect', { x: 120, y: 206, width: 230, height: 26, rx: 6, fill: pal.wood });
  el('rect', { x: 126, y: 232, width: 10, height: 18, fill: pal.woodDark });
  el('rect', { x: 332, y: 232, width: 10, height: 18, fill: pal.woodDark });
  el('rect', { x: 124, y: 190, width: 220, height: 20, rx: 8, fill: '#EAF2FA' });
  el('ellipse', { cx: 300, cy: 170, rx: 34, ry: 15, fill: '#fff', stroke: '#D5DBE5', 'stroke-width': 2 });
  const grp = g({});
  const b = k.buddy({ parent: grp, x: 0, y: 0 });
  b.g.firstChild.setAttribute('display', 'none');
  const bl = el('rect', { x: 150, y: 164, width: 112, height: 42, rx: 14, fill: pal.blue });
  el('rect', { x: 150, y: 164, width: 112, height: 9, rx: 4, fill: '#fff', opacity: 0.35 });
  // カレンダー（毎朝）
  el('rect', { x: 290, y: 42, width: 84, height: 62, rx: 6, fill: '#fff', stroke: pal.line, 'stroke-width': 2 });
  el('rect', { x: 290, y: 42, width: 84, height: 14, rx: 6, fill: pal.red });
  const checks = [0, 1, 2].map((i) => { el('rect', { x: 298 + i * 24, y: 64, width: 22, height: 28, rx: 4, fill: 'none', stroke: pal.line, 'stroke-width': 1.5 }); return el('path', { d: `M ${302 + i * 24} 78 l 5 6 l 10 -12`, fill: 'none', stroke: pal.green, 'stroke-width': 4, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-dasharray': 24, 'stroke-dashoffset': 24 }); });
  const zz = g({}); ['Z', 'z'].forEach((s, i) => k.text(i * 14, -i * 16, s, { 'font-size': 18 - i * 4, fill: pal.sub }, zz));
  const ring = g({}); [-1, 1].forEach((s) => [0, 1].forEach((j) => el('line', { x1: s * (32 + j * 8), y1: -6 - j * 5, x2: s * (38 + j * 8), y2: -10 - j * 6, stroke: pal.red, 'stroke-width': 2.6, 'stroke-linecap': 'round' }, ring)));
  return {
    update(t) {
      const m = lerp(50, 60, easeInOut(seg(t, 0.2, 2.0)));
      mh.setAttribute('transform', `rotate(${m * 6})`);
      hh.setAttribute('transform', `rotate(${180 + (m - 60) * 0.5})`);
      const dawn = seg(t, 0, 2.4);
      k.set(win, { fill: mix('#9FB3D9', '#DDEFFA', dawn) });
      sun.setAttribute('cy', lerp(112, 82, easeOut(dawn)));
      const open = seg(t, 1.95, 2.1);
      const sp = easeInOut(seg(t, 2.4, 3.1));
      tf(grp, 190, lerp(160, 192, sp), lerp(90, 0, sp));
      const arm = lerp(8, 160, easeOut(seg(t, 3.0, 3.6)));
      b.pose({ blink: 1 - open, mood: t < 2.0 ? 'flat' : sp < 0.5 ? 'smile' : 'open', armL: sp > 0 ? arm : 8, armR: sp > 0 ? arm : 8, squash: 1 + 0.03 * Math.sin(t * 2) * (1 - open), look: 0.2 });
      const pull = seg(t, 2.9, 3.4);
      bl.setAttribute('y', 164 + 14 * pull); bl.setAttribute('height', 42 - 14 * pull);
      zz.setAttribute('opacity', t < 1.9 ? 1 : 0); tf(zz, 296, 110 - 6 * Math.sin(t * 3));
      const rg = t > 1.9 && t < 2.4;
      ring.setAttribute('opacity', rg ? (Math.sin(t * 50) > 0 ? 1 : 0.3) : 0); tf(ring, 196, 62);
      checks.forEach((c, i) => c.setAttribute('stroke-dashoffset', 24 * (1 - easeOut(seg(t, 3.5 + i * 0.22, 3.75 + i * 0.22)))));
    }
  };
}
