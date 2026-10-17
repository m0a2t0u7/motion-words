// look around：部屋の真ん中に立ち、右を見て、体の向きを変えて左も見回す（例文 He looked around the room.）
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

export const meta = { duration: 4.2, beats: [[0, '部屋に立つ'], [1.1, '右を見る'], [2.8, '左も見る']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  const item = (cx, cy, fn) => { const n = g({}); fn(n); return { n, cx, cy }; };
  const win = item(72, 82, (n) => { el('rect', { x: -38, y: -36, width: 76, height: 72, rx: 8, fill: '#DDEFFA', stroke: pal.woodDark, 'stroke-width': 4 }, n); el('line', { x1: 0, y1: -36, x2: 0, y2: 36, stroke: '#fff', 'stroke-width': 4 }, n); el('line', { x1: -38, y1: 0, x2: 38, y2: 0, stroke: '#fff', 'stroke-width': 4 }, n); });
  const pic = item(160, 70, (n) => { el('rect', { x: -26, y: -20, width: 52, height: 40, rx: 4, fill: '#fff', stroke: pal.woodDark, 'stroke-width': 4 }, n); el('path', { d: 'M -22 16 L -8 -2 L 2 10 L 10 2 L 22 16 Z', fill: pal.green, opacity: 0.7 }, n); el('circle', { cx: 10, cy: -9, r: 5, fill: pal.yellow }, n); });
  const lamp = item(262, 150, (n) => { el('rect', { x: -2, y: -6, width: 4, height: 90, fill: pal.sub }, n); el('path', { d: 'M -22 -6 L 22 -6 L 14 -40 L -14 -40 Z', fill: pal.yellow, stroke: pal.yellowDark, 'stroke-width': 2 }, n); el('ellipse', { cx: 0, cy: 84, rx: 18, ry: 5, fill: pal.sub }, n); });
  const sofa = item(345, 202, (n) => { el('rect', { x: -44, y: -26, width: 88, height: 34, rx: 14, fill: pal.violet }, n); el('rect', { x: -52, y: -6, width: 104, height: 32, rx: 12, fill: '#B8A3F6' }, n); el('rect', { x: -44, y: 24, width: 6, height: 10, fill: pal.woodDark }, n); el('rect', { x: 38, y: 24, width: 6, height: 10, fill: pal.woodDark }, n); });
  const items = [win, pic, lamp, sofa];
  const fan = el('path', { d: 'M 0 0', fill: pal.yellow, opacity: 0.25 });
  const bx = 195;
  const b = k.buddy({ x: bx, y: FY });
  const gazeX = (t) => t < 0.6 ? 215 : t < 1.5 ? lerp(215, 375, easeInOut(seg(t, 0.6, 1.5))) : t < 2.3 ? 375 : t < 3.4 ? lerp(375, 0, easeInOut(seg(t, 2.3, 3.4))) : 0;

  return {
    update(t) {
      const turn = easeInOut(seg(t, 1.5, 2.3));
      const facing = lerp(1, -1, turn);
      const gx = gazeX(t);
      const scanning = (t > 0.6 && t < 1.5) || (t > 2.3 && t < 3.4);
      items.forEach((it) => {
        const p = scanning ? clamp(1 - Math.abs(gx - it.cx) / 45) : 0;
        tf(it.n, it.cx, it.cy, 0, 1 + 0.12 * smooth(p));
      });
      const dirn = facing >= 0 ? 1 : -1;
      b.pose({ x: bx, facing, look: dirn * 0 + 0.8, mood: t < 3.4 ? 'smile' : 'grin', armL: 8, armR: 8, squash: 1 + 0.012 * Math.sin(t * 3), blink: t > 0.3 && t < 0.4 ? 1 : 0 });
      const head = t < 1.5 ? 10 * easeInOut(seg(t, 0.6, 1.1)) : t < 3.4 ? 10 * (1 - 0.3 * seg(t, 2.3, 3.4)) : 4;
      faceAt(b, head * 0.8, 0);
      const fx = bx + dirn * 14, fy = FY - 60;
      const spread = 30;
      const on = scanning ? 1 : 0;
      k.set(fan, { d: `M ${fx} ${fy} L ${gx} ${fy + 60 - spread} L ${gx} ${fy + 60 + spread} Z`, opacity: 0.22 * on });
    }
  };
}
