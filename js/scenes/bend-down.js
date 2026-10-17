// bend down：部屋に立つ→床のペンに気づく→腰を曲げて手を伸ばし、ペンを拾う（例文 She bent down to pick up the pen.）
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

export const meta = { duration: 3.6, beats: [[0, 'ペンに気づく'], [1.2, '腰を曲げる'], [2.6, 'ペンを拾う']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  el('rect', { x: 36, y: 44, width: 92, height: 76, rx: 8, fill: '#DDEFFA', stroke: pal.woodDark, 'stroke-width': 4 });
  el('line', { x1: 82, y1: 44, x2: 82, y2: 120, stroke: '#fff', 'stroke-width': 4 });
  el('rect', { x: 290, y: 60, width: 58, height: 44, rx: 4, fill: '#fff', stroke: pal.woodDark, 'stroke-width': 4 });
  el('path', { d: 'M 294 100 L 310 78 L 322 92 L 332 82 L 344 100 Z', fill: pal.green, opacity: 0.7 });
  el('rect', { x: 330, y: 186, width: 34, height: 50, rx: 5, fill: pal.wood });
  el('ellipse', { cx: 347, cy: 186, rx: 16, ry: 5, fill: pal.woodDark });
  el('path', { d: 'M 347 184 q -18 -26 -22 -44 M 347 184 q 2 -34 0 -50 M 347 184 q 18 -26 24 -42', stroke: pal.green, 'stroke-width': 6, fill: 'none', 'stroke-linecap': 'round' });
  el('ellipse', { cx: 150, cy: 262, rx: 90, ry: 9, fill: pal.coral, opacity: 0.15 });

  const b = k.buddy({ x: 150, y: FY, color: pal.coral, dark: pal.coralDark });
  const fin = { lean: 40, squash: 0.94, armR: 0, armL: 0 };
  b.pose({ ...fin });
  const tgt = { x: 232, y: FY - 3 };
  const pen = g({});
  el('rect', { x: -16, y: -2.5, width: 32, height: 5, rx: 2.5, fill: pal.blue }, pen);
  el('rect', { x: -16, y: -2.5, width: 7, height: 5, rx: 2.5, fill: pal.red }, pen);
  el('path', { d: 'M 16 -2.5 L 22 0 L 16 2.5 Z', fill: pal.ink }, pen);
  const sparkle = g({});
  [[0, -9], [0, 9], [-9, 0], [9, 0]].forEach(([x, y]) => el('line', { x1: x * 0.4, y1: y * 0.4, x2: x, y2: y, stroke: pal.yellowDark, 'stroke-width': 2.5, 'stroke-linecap': 'round' }, sparkle));
  const ex = k.text(0, 0, '!', { 'font-size': 24, fill: pal.red });

  return {
    update(t) {
      const bend = easeInOut(seg(t, 1.1, 2.3));
      const lean = 40 * bend;
      const hold = seg(t, 2.35, 2.5);
      const hand = { x: tgt.x, y: tgt.y };
      b.pose({ lean, squash: 1 - 0.06 * bend, armL: -lean * 0.4 * bend + 8 * (1 - bend), armR: 0, look: 0.6, mood: bend > 0.5 ? 'flat' : 'smile', blink: t > 0.2 && t < 0.3 ? 1 : 0 });
      // 手を伸ばして、手先をペンの位置に合わせる
      const a = bend > 0 ? lerp(8, reach(b, 1, 'R', tgt.x, tgt.y), easeOut(seg(t, 1.5, 2.3))) : 8;
      b.pose({ armR: a });
      faceAt(b, 0, 3 * bend);
      // ペン：床にある→手に握られる
      const h = hp(b, 1, 'R', 28);
      const held = hold;
      tf(pen, lerp(tgt.x, h.x + 1, held), lerp(FY - 3, h.y + 1, held), lerp(0, -10, held));
      tf(sparkle, tgt.x, FY - 22 + 3 * Math.sin(t * 8), 0, t < 2.3 ? 1 : 0);
      sparkle.setAttribute('opacity', t < 1.0 ? 0 : t < 2.3 ? 1 : 0);
      ex.setAttribute('opacity', t > 0.2 && t < 1.1 ? 1 : 0);
      ex.setAttribute('x', 175); ex.setAttribute('y', 108 - 6 * easeOut(seg(t, 0.2, 0.5)));
    }
  };
}
