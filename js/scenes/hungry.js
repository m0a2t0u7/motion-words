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
// hungry：おなかがぐうぐう鳴って空腹→食卓へ向かい「食べよう」（例文 I'm hungry. Let's eat.）
export const meta = { duration: 4.6, beats: [[0, 'おなかが鳴る'], [1.7, '食事に気づく'], [3.4, '食べよう']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  const S = 0.95;
  win(k, 40, 40, 80, 64);
  // 食卓（右）と料理
  el('rect', { x: 240, y: 186, width: 150, height: 9, rx: 3, fill: pal.woodDark });
  el('rect', { x: 252, y: 195, width: 8, height: 41, fill: pal.wood }); el('rect', { x: 370, y: 195, width: 8, height: 41, fill: pal.wood });
  k.shadow(315, 238, 80, 4);
  const food = g({});
  el('ellipse', { cx: 290, cy: 184, rx: 24, ry: 5, fill: '#fff', stroke: pal.line, 'stroke-width': 2 }, food);
  el('path', { d: 'M 270 182 Q 290 156 310 182 Z', fill: '#FFF8E8', stroke: pal.line, 'stroke-width': 2 }, food);
  el('ellipse', { cx: 350, cy: 184, rx: 20, ry: 5, fill: '#fff', stroke: pal.line, 'stroke-width': 2 }, food);
  el('path', { d: 'M 334 182 Q 350 162 366 182 Z', fill: pal.coral }, food);
  el('circle', { cx: 345, cy: 172, r: 3, fill: pal.yellow }, food);
  const st = [0, 1, 2].map((i) => el('path', { d: 'M 0 0 q 5 -7 0 -14', fill: 'none', stroke: '#CBD3DE', 'stroke-width': 3, 'stroke-linecap': 'round' }));
  const b = k.buddy({ x: 90, y: FY, scale: S });
  const rum = g({});
  [-1, 1].forEach((s) => [0, 1].forEach((i) => el('path', { d: `M ${s * (30 + i * 9)} -6 q ${s * 5} 6 0 12`, fill: 'none', stroke: pal.sub, 'stroke-width': 2.4, 'stroke-linecap': 'round' }, rum)));
  const bx = (t) => lerp(90, 200, easeInOut(seg(t, 2.2, 3.4)));
  return {
    update(t) {
      const p = gait(bx, t, 90, 16, 0.11);
      const hold = easeInOut(seg(t, 0.2, 0.7)) * (1 - easeInOut(seg(t, 2.0, 2.4)));
      const rumble = t < 1.9 ? Math.max(0, Math.sin(t * 7)) : 0;
      const look = seg(t, 1.7, 2.1);
      const inv = easeOut(seg(t, 3.3, 3.8));
      b.pose({ x: p.x, walk: p.walk, lean: lerp(0, 10, hold) + p.lean + 4 * rumble * hold, squash: 1 - 0.06 * hold - 0.02 * rumble,
        armR: lerp(8, -62, hold) * (1 - seg(t, 2.0, 2.4)) + (t > 2.2 ? p.armR * (1 - inv) + inv * 100 : 0), armL: t > 2.2 ? p.armL : 8,
        mood: t < 1.7 ? 'sad' : t < 3.3 ? 'open' : 'grin', look: 0.5 + 0.5 * look });
      faceAt(b, 3 * look + 0, t < 1.7 ? 2 : -1);
      const rp = t < 1.9 ? rumble : 0;
      tf(rum, p.x, 178, 0, 1, 1);
      rum.setAttribute('opacity', rp * (t > 0.3 ? 1 : 0));
      tf(rum, p.x, 178 - 8, 0, 0.9 + 0.2 * rp, 0.9 + 0.2 * rp);
      st.forEach((s, i) => { const q = ((t * 0.9 + i * 0.33) % 1); tf(s, 280 + i * 28, 150 - 14 * q); s.setAttribute('opacity', Math.sin(q * Math.PI) * 0.9); });
    }
  };
}
