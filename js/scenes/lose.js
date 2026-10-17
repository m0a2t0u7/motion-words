// lose：電車の中で財布を落とし、気づかないまま降り口へ。あとで手元にないと気づく（例文 I lost my wallet on the train.）
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
export const meta = { duration: 4.4, beats: [[0, '財布を持つ'], [1.5, '落とす'], [3.3, '気づいた']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  // 車内：窓の帯、座席、つり革、ドア
  el('rect', { x: 0, y: 56, width: 400, height: 74, fill: '#CFE9F7' });
  [[20, 40, 38], [90, 70, 52], [190, 30, 30], [250, 56, 44]].forEach(([x, w, h]) => el('rect', { x, y: 130 - h, width: w, height: h, fill: '#B5D6EA' }));
  [0, 100, 200, 300].forEach((x) => el('rect', { x: x + 96, y: 56, width: 8, height: 74, fill: '#E6EAF0' }));
  el('rect', { x: 0, y: 130, width: 400, height: 8, fill: '#E6EAF0' });
  el('rect', { x: 14, y: 176, width: 96, height: 24, rx: 8, fill: pal.violet });
  el('rect', { x: 14, y: 150, width: 18, height: 40, rx: 8, fill: '#8F74E0' });
  el('rect', { x: 20, y: 200, width: 8, height: 36, fill: '#8C93A8' });
  el('rect', { x: 96, y: 200, width: 8, height: 36, fill: '#8C93A8' });
  const door = (x) => { el('rect', { x, y: 100, width: 40, height: 136, fill: '#E8EDF3', stroke: '#C5CCD8', 'stroke-width': 2 }); el('rect', { x: x + 6, y: 112, width: 28, height: 60, rx: 3, fill: '#CFE9F7' }); };
  door(310); door(350);
  [150, 220].forEach((x) => { el('line', { x1: x, y1: 138, x2: x, y2: 156, stroke: '#8C93A8', 'stroke-width': 2 }); el('circle', { cx: x, cy: 162, r: 7, fill: 'none', stroke: pal.yellowDark, 'stroke-width': 3 }); });
  // 財布
  const w = g({});
  el('rect', { x: -9, y: -6, width: 18, height: 12, rx: 3, fill: pal.coffee }, w);
  el('rect', { x: -9, y: -2, width: 18, height: 2.5, fill: '#6E432A' }, w);
  el('circle', { cx: 5, cy: 1, r: 1.8, fill: pal.yellow }, w);
  const q = k.text(0, 0, '?', { 'font-size': 28, fill: pal.red });
  const b = k.buddy({ x: 90, y: FY });
  const xf = (t) => t < 0.4 ? 90 : t < 3.0 ? lerp(90, 276, easeInOut(seg(t, 0.4, 3.0))) : 276;
  const T0 = 1.4;
  let rel = null;

  return {
    update(t) {
      const p = gait(xf, t, 90, 18);
      const wk = easeInOut(seg(t, 3.0, 3.5));
      // 右手で財布を持って歩く（T0で手を離す）
      const carry = t < T0;
      b.pose({ x: p.x, walk: p.walk, armL: p.armL, armR: carry ? 40 + p.m * 8 * Math.sin(p.walk) : lerp(p.armR, 80, wk) + 0, lean: p.lean * (1 - wk), look: t < 3.1 ? 0.6 : lerp(0.6, -0.9, seg(t, 3.2, 3.6)), mood: t < 3.1 ? 'smile' : 'open', squash: 1 });
      if (t >= 3.1) b.pose({ armL: lerp(p.armL, 70, wk), armR: lerp(p.armR, 70, wk) });
      // 手を離した瞬間の位置と速度から放物線
      b.pose({ armR: t < T0 ? 40 : b.state.armR });
      if (!rel) { const s = { ...b.state }; rel = { x: p.x + 24, y: FY - 36 }; }
      const hpos = hp(b, 1, 'R', 28);
      let wx, wy, wr = 0;
      if (carry) { wx = hpos.x + 4; wy = hpos.y; wr = 0; }
      else {
        const u = t - T0, g0 = 520, vx = 55;
        const fall = FY - 5;
        const y0 = rel.y;
        const tf0 = Math.sqrt((2 * (fall - y0)) / g0);
        if (u < tf0) { wy = y0 + 0.5 * g0 * u * u; wr = 160 * (u / tf0); }
        else { const v = g0 * tf0 * 0.3, uu = u - tf0, tb = 2 * v / g0; wy = uu < tb ? fall - (v * uu - 0.5 * g0 * uu * uu) : fall; wr = 160 + 20 * clamp(uu / tb); }
        wx = rel.x + vx * Math.min(u, tf0 + 0.25) * 0.9;
      }
      tf(w, wx, wy, wr);
      const qp = seg(t, 3.3, 3.6);
      q.setAttribute('opacity', qp);
      tf(q, p.x + 6, FY - 112 - 8 * easeOut(qp));
    }
  };
}
