// search：メガネを探して、引き出し・ソファのクッション・本棚と次々に見て回る。まだ見つからない（例文 I searched for my glasses everywhere.）
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
export const meta = { duration: 4.4, beats: [[0, '探し始める'], [1.7, 'あちこち'], [3.7, '見つからない']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  // 左：たんす
  el('rect', { x: 14, y: 150, width: 72, height: 86, rx: 5, fill: pal.wood });
  el('rect', { x: 14, y: 150, width: 72, height: 5, fill: pal.woodDark });
  const gap = el('rect', { x: 20, y: 168, width: 60, height: 0, fill: '#6B5A45' });
  const dr = g({});
  el('rect', { x: 0, y: 0, width: 60, height: 24, rx: 3, fill: '#EDD3AC', stroke: pal.woodDark, 'stroke-width': 2 }, dr);
  el('rect', { x: 22, y: 9, width: 16, height: 5, rx: 2.5, fill: pal.woodDark }, dr);
  el('rect', { x: 20, y: 196, width: 60, height: 32, rx: 3, fill: '#EDD3AC', stroke: pal.woodDark, 'stroke-width': 2 });
  // 中：ソファ
  el('rect', { x: 118, y: 140, width: 36, height: 60, rx: 12, fill: '#8F74E0' });
  el('rect', { x: 118, y: 182, width: 136, height: 30, rx: 8, fill: '#8F74E0' });
  el('rect', { x: 128, y: 212, width: 8, height: 24, fill: pal.woodDark });
  el('rect', { x: 236, y: 212, width: 8, height: 24, fill: pal.woodDark });
  el('rect', { x: 154, y: 182, width: 90, height: 12, fill: '#6F57C2' });
  const cush = g({}); tf(cush, 246, 182);
  el('rect', { x: -56, y: -14, width: 56, height: 14, rx: 6, fill: pal.violet }, cush);
  // 右：本棚
  el('rect', { x: 296, y: 80, width: 92, height: 156, rx: 4, fill: pal.wood });
  [[88, 128], [132, 172], [176, 216]].forEach(([a, b2]) => el('rect', { x: 302, y: a, width: 80, height: b2 - a - 4, fill: '#C9A577', opacity: 0.45 }));
  [[88, 'coral'], [132, 'blue'], [176, 'yellow']].forEach(([y, c], r) => [0, 1, 2, 3, 4].forEach((i) => el('rect', { x: 306 + i * 14, y: y + 6 + (i % 2) * 4, width: 11, height: 32 - (i % 2) * 4, rx: 2, fill: [pal.coral, pal.blue, pal.yellow, pal.mint, pal.violet][(i + r) % 5] })));
  const book = el('rect', { x: 306, y: 138, width: 11, height: 32, rx: 2, fill: pal.blue });
  const b = k.buddy({ x: 108, y: FY, facing: -1 });
  // 吹き出し（探しているメガネ）
  const bub = g({});
  el('ellipse', { cx: 0, cy: 0, rx: 28, ry: 20, fill: '#fff', stroke: pal.line, 'stroke-width': 2 }, bub);
  el('circle', { cx: -22, cy: 22, r: 4, fill: '#fff', stroke: pal.line, 'stroke-width': 2 }, bub);
  [-1, 1].forEach((s) => el('circle', { cx: s * 10, cy: 0, r: 8, fill: 'none', stroke: pal.ink, 'stroke-width': 2.6 }, bub));
  el('line', { x1: -2, y1: 0, x2: 2, y2: 0, stroke: pal.ink, 'stroke-width': 2.6 }, bub);
  const q = k.text(0, 0, '?', { 'font-size': 28, fill: pal.red });
  const X1 = 108, X2 = 160, X3 = 258;
  const xf = (t) => t < 1.2 ? X1 : t < 1.7 ? lerp(X1, X2, easeInOut(seg(t, 1.2, 1.7))) : t < 2.4 ? X2 : t < 2.9 ? lerp(X2, X3, easeInOut(seg(t, 2.4, 2.9))) : X3;
  return {
    update(t) {
      const p = gait(xf, t, X1, 18, 0.2);
      const face = t < 1.2 ? -1 : t < 1.45 ? lerp(-1, 1, (t - 1.2) / 0.25) : 1;
      // たんす
      const o1 = easeInOut(seg(t, 0.55, 0.95));
      const rm = easeInOut(seg(t, 1.15, 1.4));
      // クッション
      const o2 = easeInOut(seg(t, 1.8, 2.2)) * (1 - 0.0 * seg(t, 2.35, 2.5));
      // 本棚
      const o3 = easeInOut(seg(t, 3.0, 3.4));
      const shrug = easeInOut(seg(t, 3.7, 4.1));
      let armR = p.armR, armL = p.armL, look = 0.6 * face, lean = p.lean;
      b.pose({ x: p.x, walk: p.walk, facing: face, lean, squash: 1, mood: 'flat' });
      const tgt = [];
      const dyr = 8 * o1;
      // 目標（手の位置）
      let aim = null;
      if (t < 1.2) aim = [54, 179 + dyr];
      else if (t > 1.7 && t < 2.45) { const a = -34 * o2; const cx = 246 + (-56) * Math.cos(rad(a)) + 14 * Math.sin(rad(a)); const cy = 182 + (-56) * Math.sin(rad(a)) - 14 * Math.cos(rad(a)); aim = [cx + 2, cy + 6]; }
      else if (t > 2.9) aim = [312 - 22 * o3 * 0 - 14 * o3, 154 + 0 * o3];
      if (aim) { armR = reach(b, 1, 'R', aim[0], aim[1]); }
      if (t >= 3.0 && t < 3.7) armR = reach(b, 1, 'R', 312, 154 + 12 * Math.sin((t - 3) * 8));
      lean = t < 1.2 ? 8 * o1 : t > 1.7 && t < 2.45 ? 14 * o2 : lean;
      look = t < 1.2 ? -0.8 : t < 2.45 ? 0.5 : 0.7;
      const sad = t > 3.7;
      b.pose({ armR: lerp(armR, 75, shrug), armL: lerp(armL, 75, shrug), lean: lean * (1 - shrug), look: sad ? lerp(0.7, 0, shrug) : look, mood: sad ? 'sad' : 'flat', squash: 1 - 0.02 * Math.sin(t * 6) });
      // 引き出し
      const open = o1;
      gap.setAttribute('height', 10 * open);
      tf(dr, 20, 170 + 8 * open, 0, 1 + 0.06 * open);
      // クッション持ち上げ
      tf(cush, 246, 182, -34 * o2 * (t < 2.6 ? 1 : 1));
      cush.setAttribute('transform', `translate(246 182) rotate(${(-34 * o2).toFixed(2)})`);
      // 本をちょっと引き出す
      k.set(book, { x: 306 - 12 * o3 });
      const bp = seg(t, 0, 0.3) * (1 - seg(t, 0.55, 0.8));
      bub.setAttribute('opacity', bp);
      tf(bub, p.x - 40, FY - 110);
      const qp = seg(t, 3.9, 4.2);
      q.setAttribute('opacity', qp);
      tf(q, p.x + 6, FY - 112 - 8 * easeOut(qp));
    }
  };
}
