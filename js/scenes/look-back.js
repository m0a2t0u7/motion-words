// look back：道を歩いてきて立ち止まり、体の向きを変えて歩いてきた道を振り返る（例文 She looked back at the road behind her.）
import { seg, lerp, easeInOut, easeOut, easeIn, backOut, smooth, wobble, hump, clamp } from '../ease.js';
const rad = (d) => (d * Math.PI) / 180;
const deg = (r) => (r * 180) / Math.PI;
// 手先（腕の先）の正確な座標。体の傾き・つぶれ・向きを反映する
function hp(b, s, side = 'R', len = 28) {
  const st = b.state, a = rad(side === 'R' ? -st.armR : st.armL);
  let x = (side === 'R' ? 27 : -27) - len * Math.sin(a), y = -46 + len * Math.cos(a);
  x *= 2 - st.squash; y *= st.squash;
  const l = rad(st.lean), c = Math.cos(l), sn = Math.sin(l);
  return { x: st.x + (x * c - y * sn) * st.facing * s, y: st.y + (x * sn + y * c - 10 - st.lift) * s };
}
// 指定の点へ手を伸ばすための腕の角度
function reach(b, s, side, tx, ty) {
  const st = b.state, o = hp(b, s, side, 0);
  const phi = deg(Math.atan2(-(tx - o.x) * st.facing, ty - o.y));
  return side === 'R' ? st.lean - phi : phi - st.lean;
}
const faceAt = (b, dx, dy = 0) => b.body.children[3].setAttribute('transform', `translate(${dx.toFixed(2)} ${dy.toFixed(2)})`);
const legsOf = (b) => b.g.children[1].children;
// 位置の関数 xf(t) から歩行の位相と腕振りを作る（止まると脚をそろえる）
function gait(xf, t, x0, amp = 18, kf = 0.107) {
  const x = xf(t), v = Math.abs(xf(t + 0.02) - xf(t - 0.02)) / 0.04;
  const ph = Math.abs(x - x0) * kf, m = clamp(v / 25);
  const w = lerp(Math.round(ph / Math.PI) * Math.PI, ph, m);
  return { x, walk: w, armL: 8 + Math.sin(w) * amp * m, armR: 8 - Math.sin(w) * amp * m, lean: 3 * m, m };
}
function clockFace(k, x, y, r, h, m, parent) {
  const c = k.g({}, parent); k.tf(c, x, y);
  k.el('circle', { r, fill: '#fff', stroke: k.pal.ink, 'stroke-width': 3 }, c);
  for (let i = 0; i < 12; i++) { const a = rad(i * 30); k.el('line', { x1: Math.sin(a) * (r - 5), y1: -Math.cos(a) * (r - 5), x2: Math.sin(a) * (r - 2.5), y2: -Math.cos(a) * (r - 2.5), stroke: k.pal.sub, 'stroke-width': 1.8 }, c); }
  const hand = (ang, len, w) => { const a = rad(ang); k.el('line', { x1: 0, y1: 0, x2: Math.sin(a) * len, y2: -Math.cos(a) * len, stroke: k.pal.ink, 'stroke-width': w, 'stroke-linecap': 'round' }, c); };
  hand((h % 12) * 30 + m * 0.5, r * 0.5, 3.2); hand(m * 6, r * 0.75, 2.2);
  return c;
}
function tree(k, x, y, s = 1, parent) {
  const t = k.g({}, parent); k.tf(t, x, y, 0, s);
  k.shadow(0, 0, 26, 5, t);
  k.el('rect', { x: -5, y: -44, width: 10, height: 44, rx: 4, fill: k.pal.woodDark }, t);
  k.el('circle', { cx: 0, cy: -62, r: 30, fill: '#7FD3A0' }, t);
  k.el('circle', { cx: -16, cy: -48, r: 20, fill: '#6BC48F' }, t);
  k.el('circle', { cx: 18, cy: -50, r: 21, fill: '#6BC48F' }, t);
  return t;
}

export const meta = { duration: 4.0, beats: [[0, '歩いている'], [2.0, '立ち止まる'], [3.1, '振り返る']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236 });
  el('path', { d: 'M 0 214 Q 70 188 140 208 Q 230 184 400 210 L 400 236 L 0 236 Z', fill: '#D3EBDD' });
  el('rect', { x: 0, y: FY, width: 400, height: 40, fill: '#E3DAC8' });
  el('rect', { x: 0, y: FY, width: 400, height: 3, fill: '#D4C8B0' });
  // 道の先にある家（歩いてきた方向）
  const h = g({}); tf(h, 40, 214, 0, 0.55);
  el('rect', { x: -40, y: -64, width: 80, height: 64, rx: 4, fill: '#FBE9DC' }, h);
  el('path', { d: 'M -50 -60 L 0 -100 L 50 -60 Z', fill: pal.coral, stroke: pal.coral, 'stroke-width': 6, 'stroke-linejoin': 'round' }, h);
  el('rect', { x: -10, y: -40, width: 20, height: 40, rx: 3, fill: pal.blue }, h);
  tree(k, 70, 222, 0.5);
  tree(k, 345, 224, 0.7);
  const prints = [];
  for (let i = 0; i < 10; i++) prints.push(el('ellipse', { cx: 130 + i * 13, cy: 252 + (i % 2) * 5, rx: 5, ry: 2.6, fill: '#BFB197' }));
  const bx = (t) => t < 1.8 ? lerp(120, 262, easeOut(seg(t, 0, 1.8)) * 0.35 + seg(t, 0, 1.8) * 0.65) : 262;
  const b = k.buddy({ x: 120, y: FY + 6, color: pal.coral, dark: pal.coralDark, scale: 0.95 });

  return {
    update(t) {
      const x0 = 120;
      const p = gait(bx, t, x0);
      const turn = easeInOut(seg(t, 2.2, 2.9));
      const facing = lerp(1, -1, turn);
      b.pose({ x: p.x, walk: p.walk, armL: p.armL, armR: p.armR, lean: p.lean + (-6 * turn), facing, look: 0.9, mood: t < 2.9 ? 'smile' : 'flat', blink: t > 2.0 && t < 2.1 ? 1 : 0 });
      if (t > 3.2) b.pose({ armR: 8 + 20 * easeOut(seg(t, 3.2, 3.6)) });
      faceAt(b, 0, 0);
      prints.forEach((pr, i) => pr.setAttribute('opacity', p.x - 14 > 130 + i * 13 ? 0.75 : 0));
    }
  };
}
