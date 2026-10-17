// come over：小川の向こうから、橋を渡って友だちの家へ遊びに来る。友だちが迎える（例文 Can you come over to my house tonight?）
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

export const meta = { duration: 4.4, beats: [[0, '川の向こう'], [1.7, '橋を渡る'], [3.5, '家に着く']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236 });
  // 川と橋
  el('rect', { x: 100, y: FY, width: 100, height: 64, fill: pal.water });
  for (let i = 0; i < 3; i++) el('path', { d: `M ${112 + i * 30} ${262 + (i % 2) * 14} q 6 -4 12 0 t 12 0`, stroke: '#fff', 'stroke-width': 2, fill: 'none', opacity: 0.8 });
  const arch = (x) => 26 * Math.sin(Math.PI * clamp((x - 100) / 100));
  let d = 'M 100 236 '; for (let x = 100; x <= 200; x += 6) d += `L ${x} ${236 - arch(x)} `;
  for (let x = 200; x >= 100; x -= 6) d += `L ${x} ${236 - arch(x) + 9} `;
  el('path', { d: d + 'Z', fill: pal.wood, stroke: pal.woodDark, 'stroke-width': 2, 'stroke-linejoin': 'round' });
  // 左の自分の家（遠景）と右の友だちの家
  const mh = g({}); tf(mh, 30, 236, 0, 0.7);
  el('rect', { x: -50, y: -70, width: 100, height: 70, rx: 4, fill: '#E4F1EA' }, mh);
  el('path', { d: 'M -58 -66 L 0 -108 L 58 -66 Z', fill: pal.mint, stroke: pal.mint, 'stroke-width': 6, 'stroke-linejoin': 'round' }, mh);
  el('rect', { x: -10, y: -42, width: 20, height: 42, rx: 3, fill: pal.mintDark }, mh);
  el('rect', { x: 296, y: 100, width: 120, height: 136, rx: 5, fill: '#FBE9DC' });
  el('path', { d: 'M 284 108 L 356 52 L 428 108 Z', fill: pal.coral, stroke: pal.coral, 'stroke-width': 7, 'stroke-linejoin': 'round' });
  el('rect', { x: 330, y: 150, width: 44, height: 86, rx: 3, fill: pal.blue });
  el('circle', { cx: 366, cy: 196, r: 3.5, fill: pal.yellow });
  el('rect', { x: 306, y: 128, width: 18, height: 22, rx: 3, fill: '#CFE9F7' });
  const host = k.buddy({ x: 312, y: FY + 4, scale: 0.85, facing: -1, color: pal.coral, dark: pal.coralDark });
  const b = k.buddy({ x: 40, y: FY + 4, scale: 0.85 });
  const xf = (t) => lerp(40, 252, easeInOut(seg(t, 0.4, 3.6)) * 0.4 + seg(t, 0.4, 3.6) * 0.6);
  return {
    update(t) {
      const p = gait(xf, t, 40);
      const y = FY + 4 - arch(p.x) * 0.95;
      b.pose({ x: p.x, y, walk: p.walk, armL: p.armL, armR: p.armR, lean: p.lean, look: 0.6, mood: t > 3.4 ? 'grin' : 'smile' });
      const greet = seg(t, 3.0, 3.4);
      if (t > 3.3) b.pose({ armR: 8 + 120 * easeOut(greet) + 20 * Math.sin((t - 3.3) * 10) * greet });
      const inv = hump(seg(t, 0.2, 1.6)) * 0 + (t < 3.2 ? 1 : 0);
      host.pose({ x: 312, facing: -1, armR: 8 + (t < 3.2 ? 118 + 24 * Math.sin(t * 7) : 60 + 12 * Math.sin(t * 7)), armL: 8, look: 0.6, mood: 'grin', squash: 1 + 0.015 * Math.sin(t * 5) });
    }
  };
}
