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
// kettle：やかんをコンロに置いて火をつけ、湯気が出る（例文 I put the kettle on for tea.）
export const meta = { duration: 4.4, beats: [[0, 'やかんを持つ'], [1.7, 'コンロに置く'], [3.4, '湯気が出る']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  const S = 0.85;
  win(k, 30, 40, 80, 62);
  // キッチンカウンター（床まで）
  el('rect', { x: 150, y: 190, width: 250, height: 46, fill: pal.wood });
  el('rect', { x: 146, y: 182, width: 260, height: 10, rx: 3, fill: pal.woodDark });
  el('line', { x1: 275, y1: 192, x2: 275, y2: 236, stroke: pal.woodDark, 'stroke-width': 2 });
  k.shadow(275, 238, 120, 4);
  // コンロ
  el('rect', { x: 262, y: 172, width: 100, height: 12, rx: 3, fill: '#8A93A6' });
  const BX = 312, BY = 172;
  el('rect', { x: BX - 26, y: BY - 2, width: 52, height: 5, rx: 2, fill: pal.ink });
  const flame = g({}); tf(flame, BX, BY);
  [-14, -5, 5, 14].forEach((x) => el('path', { d: `M ${x} 0 Q ${x - 4} -8 ${x} -14 Q ${x + 4} -8 ${x} 0`, fill: pal.yellow, stroke: pal.coral, 'stroke-width': 1.5 }, flame));
  const knob = g({}); tf(knob, 288, 211);
  el('circle', { r: 8, fill: '#fff', stroke: pal.sub, 'stroke-width': 2 }, knob);
  el('line', { x1: 0, y1: 0, x2: 0, y2: -7, stroke: pal.ink, 'stroke-width': 2.5, 'stroke-linecap': 'round' }, knob);
  // ティーカップ（左奥）
  const cup = g({}); tf(cup, 168, 182);
  el('path', { d: 'M -11 -16 H 11 Q 11 0 0 0 Q -11 0 -11 -16 Z', fill: '#fff', stroke: pal.line, 'stroke-width': 2 }, cup);
  el('path', { d: 'M 11 -12 q 9 1 0 9', fill: 'none', stroke: pal.line, 'stroke-width': 3 }, cup);
  el('rect', { x: -9, y: -16, width: 18, height: 3, fill: pal.coffee, opacity: 0.0 }, cup);
  // やかん
  const ket = g({});
  const ksh = k.shadow(0, 0, 18, 4, ket);
  const kb = g({}, ket);
  el('path', { d: 'M 12 -14 L 30 -26 L 33 -22 L 17 -8 Z', fill: pal.blueDark }, kb); // 注ぎ口
  el('ellipse', { cx: 0, cy: -14, rx: 20, ry: 15, fill: pal.blue }, kb);
  el('ellipse', { cx: -7, cy: -19, rx: 6, ry: 8, fill: '#fff', opacity: 0.3 }, kb);
  el('rect', { x: -10, y: -31, width: 20, height: 5, rx: 2, fill: pal.blueDark }, kb);
  el('circle', { cx: 0, cy: -34, r: 3, fill: pal.ink }, kb);
  el('path', { d: 'M -14 -27 Q 0 -52 14 -27', fill: 'none', stroke: pal.ink, 'stroke-width': 4, 'stroke-linecap': 'round' }, kb);
  const steam = [0, 1, 2].map((i) => el('path', { d: 'M 0 0 q 6 -8 0 -16 q -6 -8 0 -16', fill: 'none', stroke: '#C9D3E0', 'stroke-width': 3.5, 'stroke-linecap': 'round' }));
  const b = k.buddy({ x: 118, y: FY, scale: S });
  const rest = { x: 196, y: 182 }, onB = { x: BX - 4, y: BY - 1 };
  const bx = (t) => lerp(118, 176, easeInOut(seg(t, 1.0, 1.9)));
  return {
    update(t) {
      const pick = easeInOut(seg(t, 0.35, 0.9)), put = easeInOut(seg(t, 1.9, 2.5));
      const walkP = gait(bx, t, 118, 0, 0.12);
      b.pose({ x: walkP.x, walk: walkP.walk, lean: 6 * pick * (1 - put) + walkP.lean * 0.3, mood: t > 3.2 ? 'grin' : 'smile', look: 0.6,
        armL: 8, armR: t < 0.35 ? 8 : t < 1.9 ? lerp(8, 82, pick) : lerp(82, 70, put) + (t > 2.5 ? lerp(0, -62, easeInOut(seg(t, 2.8, 3.3))) : 0) * 0 });
      // 手の位置から、やかんの取っ手を持つ
      const h = hp(b, S, 'R', 28);
      let pos;
      if (t < 0.5) pos = { x: rest.x, y: rest.y };
      else if (t < 2.45) pos = { x: h.x - 2, y: h.y + 33 };
      else pos = { x: onB.x, y: onB.y };
      if (t >= 2.45 && t < 2.6) { const f = seg(t, 2.45, 2.6); pos = { x: lerp(h.x - 2, onB.x, f), y: lerp(h.y + 33, onB.y, f) }; }
      const air = t > 0.5 && t < 2.5;
      // 置いたときのつぶれ
      const w = wobble(seg(t, 2.5, 3.2), 3, 6);
      tf(kb, 0, 0, air ? -6 * Math.sin(seg(t, 0.5, 0.9) * 3) : 0, 1 + 0.04 * w, 1 - 0.06 * w);
      tf(ket, pos.x, pos.y);
      tag(ksh, !air && t < 0.5);
      // 火・つまみ
      const fl = seg(t, 2.7, 3.0);
      tf(knob, 288, 211, -90 * easeOut(seg(t, 2.6, 3.0)));
      tf(flame, BX, BY + 2, 0, 1 + 0.12 * Math.sin(t * 22), fl * (1 + 0.15 * Math.sin(t * 27)));
      tag(flame, t > 2.7);
      // 湯気
      steam.forEach((s, i) => {
        const p = ((t - 3.2 - i * 0.4) / 1.2);
        const q = p - Math.floor(p);
        tf(s, onB.x + 28 + i * 3, onB.y - 50 - 36 * q, 0, 1, 1);
        s.setAttribute('opacity', t > 3.2 ? Math.sin(q * Math.PI) * 0.9 : 0);
      });
    }
  };
}
