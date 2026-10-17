// look down：橋の上に立って遠くを見る→視線を下（川面）へ向け、足がすくむ（例文 Don't look down from the bridge.）
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

export const meta = { duration: 3.6, beats: [[0, '遠くを見る'], [1.2, '下を見る'], [2.6, '足がすくむ']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  k.backdrop({ floorY: 300 });
  el('path', { d: 'M 0 262 Q 80 226 170 250 Q 260 222 400 258 L 400 300 L 0 300 Z', fill: '#D3EBDD' });
  el('rect', { x: 0, y: 270, width: 400, height: 30, fill: pal.water });
  for (let i = 0; i < 6; i++) el('path', { d: `M ${20 + i * 70} 290 q 8 -5 16 0 t 16 0`, stroke: '#fff', 'stroke-width': 2, fill: 'none', opacity: 0.7 });
  [60, 200, 340].forEach((x) => el('rect', { x: x - 8, y: 224, width: 16, height: 52, rx: 3, fill: pal.woodDark }));
  // 柵（キャラクターの後ろ）
  el('rect', { x: -10, y: 168, width: 420, height: 6, rx: 3, fill: '#fff', stroke: pal.line, 'stroke-width': 1 });
  el('rect', { x: -10, y: 188, width: 420, height: 4, rx: 2, fill: '#fff', stroke: pal.line, 'stroke-width': 1 });
  for (let x = 10; x < 400; x += 50) el('rect', { x, y: 166, width: 6, height: 44, rx: 3, fill: '#fff', stroke: pal.line, 'stroke-width': 1 });
  el('rect', { x: -10, y: 206, width: 420, height: 16, fill: pal.wood });
  el('rect', { x: -10, y: 222, width: 420, height: 6, fill: pal.woodDark });
  const boat = g({}); 
  el('path', { d: 'M -14 0 L 14 0 L 9 8 L -9 8 Z', fill: pal.coral }, boat);
  el('path', { d: 'M 0 -2 L 0 -22 L 12 -2 Z', fill: '#fff', stroke: pal.line, 'stroke-width': 1 }, boat);
  const gaze = el('path', { d: 'M 0 0', stroke: pal.sub, 'stroke-width': 2.4, 'stroke-dasharray': '2 6', 'stroke-linecap': 'round', fill: 'none' });
  const bx = 175, by = 212;
  const b = k.buddy({ x: bx, y: by, scale: 0.95 });
  const drop = el('path', { d: 'M 0 -7 Q 5 0 0 4 Q -5 0 0 -7 Z', fill: pal.water, stroke: '#4FB4E0', 'stroke-width': 1.5 });

  return {
    update(t) {
      const dn = easeInOut(seg(t, 0.8, 1.7));
      const fr = seg(t, 1.9, 3.3);
      const tre = Math.sin(t * 38) * 0.9 * fr;
      tf(boat, 262, 281 + Math.sin(t * 3) * 1.5, Math.sin(t * 2.4) * 4);
      b.pose({ x: bx + tre, lean: 8 * dn, squash: 1 - 0.04 * dn, armL: 8 + 42 * fr, armR: 8 + 42 * fr, look: lerp(0.9, 0.2, dn), mood: dn < 0.4 ? 'smile' : 'open', blink: t > 0.4 && t < 0.5 ? 1 : 0 });
      faceAt(b, lerp(0, 5, dn), 13 * dn);
      const fx = bx + 12, fy = by - 40 + 13 * dn * 0.95;
      k.set(gaze, { d: `M ${fx} ${fy + 6} Q ${fx + 40} ${fy + 20} 258 274`, opacity: dn > 0.6 ? 1 : 0 });
      tf(drop, bx + 42, by - 70 + 10 * easeIn(seg(t, 2.2, 3.2)), 0, fr > 0.1 ? 1 : 0);
      drop.setAttribute('opacity', fr > 0.1 ? 1 - 0.7 * seg(t, 3.0, 3.6) : 0);
    }
  };
}
