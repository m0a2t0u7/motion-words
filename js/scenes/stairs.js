import { seg, lerp, easeInOut, easeOut, easeIn, backOut, smooth, wobble, hump, clamp } from '../ease.js';
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
function reach(b, s, side, tx, ty) {
  const st = b.state, o = hp(b, s, side, 0);
  const phi = deg(Math.atan2(-(tx - o.x) * st.facing, ty - o.y));
  return side === 'R' ? st.lean - phi : phi - st.lean;
}
const faceAt = (b, dx, dy = 0) => b.body.children[3].setAttribute('transform', `translate(${dx.toFixed(2)} ${dy.toFixed(2)})`);
function gait(xf, t, x0, amp = 18, kf = 0.107) {
  const x = xf(t), v = Math.abs(xf(t + 0.02) - xf(t - 0.02)) / 0.04;
  const ph = Math.abs(x - x0) * kf, m = clamp(v / 25);
  const w = lerp(Math.round(ph / Math.PI) * Math.PI, ph, m);
  return { x, walk: w, armL: 8 + Math.sin(w) * amp * m, armR: 8 - Math.sin(w) * amp * m, lean: 3 * m, m };
}
function win(k, x, y, w, h, night) {
  const { el, pal } = k;
  el('rect', { x, y, width: w, height: h, rx: 6, fill: night ? '#2F3A5C' : '#DDEFFA', stroke: '#fff', 'stroke-width': 5 });
  el('line', { x1: x + w / 2, y1: y, x2: x + w / 2, y2: y + h, stroke: '#fff', 'stroke-width': 4 });
}
const tag = (n, on) => n.setAttribute('opacity', on ? 1 : 0);
// stairs：階段を駆け上がる（例文 He ran up the stairs.）
export const meta = { duration: 4.0, beats: [[0, '階段の下'], [1.8, '駆け上がる'], [3.5, '上に着く']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  const S = 0.78, X0 = 140, RUN = 38, RISE = 22, N = 6;
  win(k, 24, 40, 80, 62);
  // 上の階の床
  el('rect', { x: X0 + RUN * N, y: FY - RISE * N, width: 400, height: 8, fill: pal.woodDark });
  for (let i = 1; i <= N; i++) {
    const x = X0 + RUN * (i - 1), y = FY - RISE * i;
    el('rect', { x, y, width: i === N ? 400 - x : RUN, height: FY - y, fill: i % 2 ? pal.wood : '#E8CFA8' });
    el('rect', { x, y, width: i === N ? 400 - x : RUN, height: 5, fill: pal.woodDark });
  }
  el('rect', { x: X0, y: FY - 2, width: RUN * N, height: 2, fill: pal.floorEdge });
  const b = k.buddy({ x: 40, y: FY, scale: S });
  const sy = (x) => { const u = clamp((x - X0) / RUN, 0, N); const i = Math.min(Math.floor(u), N - 1); const f = u - i; return u >= N ? N : i + smooth(clamp(f / 0.45)); };
  const xf = (t) => lerp(34, 352, easeInOut(seg(t, 0.2, 3.4)));
  return {
    update(t) {
      const p = gait(xf, t, 34, 34, 0.16);
      const s = sy(p.x), up = s > 0 && s < N && Math.abs(s - Math.round(s)) > 0.02;
      const y = FY - RISE * s - 3 * Math.abs(Math.sin(p.walk)) * p.m;
      b.pose({ x: p.x, y, walk: p.walk, armL: p.armL, armR: p.armR, lean: 9 * p.m, mood: t > 3.5 ? 'grin' : 'smile', look: 0.5 });
    }
  };
}
