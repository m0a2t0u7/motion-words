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
// together：ひとりで勉強していたら、友達が来て並んで一緒に勉強する（例文 Let's study together.）
export const meta = { duration: 4.6, beats: [[0, 'ひとりで勉強'], [1.8, '友達が来る'], [3.3, '一緒に勉強']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  const S = 0.95;
  win(k, 150, 36, 100, 70);
  // 机と開いたノート
  el('rect', { x: 168, y: 192, width: 80, height: 8, rx: 3, fill: pal.woodDark });
  el('rect', { x: 176, y: 200, width: 7, height: 36, fill: pal.wood }); el('rect', { x: 233, y: 200, width: 7, height: 36, fill: pal.wood });
  k.shadow(208, 238, 56, 4);
  el('path', { d: 'M 184 190 L 208 186 L 232 190 L 232 183 L 208 179 L 184 183 Z', fill: '#fff', stroke: pal.line, 'stroke-width': 1.5 });
  [0, 1].forEach((i) => [0, 1, 2].forEach((j) => el('line', { x1: 188 + i * 24, y1: 184 + j * 2.2 - i * 0, x2: 206 + i * 24, y2: 184 + j * 2.2, stroke: '#D5DBE5', 'stroke-width': 1 })));
  const me = k.buddy({ x: 135, y: FY, scale: S });
  const fr = k.buddy({ x: 430, y: FY, scale: S, facing: -1, color: pal.coral, dark: pal.coralDark });
  const pen = (c) => { const p = g({}); el('line', { x1: 0, y1: 0, x2: 8, y2: -12, stroke: c, 'stroke-width': 3, 'stroke-linecap': 'round' }, p); return p; };
  const pm = pen(pal.yellowDark), pf = pen(pal.red);
  const hearts = [0, 1, 2].map(() => { const s = g({}); el('path', { d: 'M 0 6 C -12 -4 -6 -12 0 -5 C 6 -12 12 -4 0 6 Z', fill: pal.coral }, s); return s; });
  const fx = (t) => lerp(430, 288, easeInOut(seg(t, 1.0, 2.6)));
  return {
    update(t) {
      const wr = Math.sin(t * 9);
      const meWrite = t < 1.6 ? 1 : 0, together = easeInOut(seg(t, 3.0, 3.5));
      const greet = hump(seg(t, 2.3, 3.2));
      me.pose({ armR: 66 + 5 * wr * (meWrite || together), armL: 8, lean: 8 + 2 * together, look: lerp(0.5, 0.9, seg(t, 1.6, 2.0)), mood: t < 1.9 ? 'flat' : 'smile' });
      faceAt(me, lerp(5, 5, 0), 2);
      const q = gait(fx, t, 430, 14, 0.11);
      const wave = t < 2.6 ? 120 + 22 * Math.sin(t * 12) : 66 + 5 * wr * together;
      fr.pose({ x: q.x, walk: q.walk, armL: q.m > 0.1 ? q.armL : 8, armR: t < 2.2 ? q.armR * 0 + (t > 1.4 ? 120 + 22 * Math.sin(t * 12) : q.armR) : lerp(120, 66, easeInOut(seg(t, 2.6, 3.0))) + 5 * wr * together * 0 + (t > 3.0 ? 5 * wr : 0),
        lean: q.lean + 8 * together, mood: 'smile', look: 0.7, blink: 0 });
      // 手元：ペンの先がノートの上で動く
      const mh = hp(me, S, 'R', 26), fh = hp(fr, S, 'R', 26);
      tf(pm, mh.x + 3, mh.y - 2 + 0.8 * wr * (t < 1.6 || t > 3.0 ? 1 : 0), 0);
      tf(pf, fh.x - 3, fh.y - 2 + 0.8 * wr * (t > 3.0 ? 1 : 0), 0, -1, 1);
      pf.setAttribute('opacity', t > 2.4 ? 1 : 0);
      // 一緒になったらハートが浮かぶ
      hearts.forEach((h, i) => { const r = seg(t, 3.6 + i * 0.25, 4.5 + i * 0.25); tf(h, 200 + i * 10 - 8, 160 - 30 * r - 6 * i, 0, 0.45 + 0.2 * hump(r)); h.setAttribute('opacity', r > 0 && r < 1 ? 1 : 0); });
    }
  };
}
