import { seg, lerp, easeInOut, easeOut, easeIn, backOut, smooth, wobble, hump, clamp } from '../ease.js';
const rad = (d) => (d * Math.PI) / 180;
const deg = (r) => (r * 180) / Math.PI;
// 手先（len=0 で肩）のワールド座標。体の傾き・つぶれ・向きを反映
function hp(b, s, side = 'R', len = 27) {
  const st = b.state, a = rad(side === 'R' ? -st.armR : st.armL);
  let x = (side === 'R' ? 27 : -27) - len * Math.sin(a), y = -46 + len * Math.cos(a);
  x *= 2 - st.squash; y *= st.squash;
  const l = rad(st.lean), c = Math.cos(l), sn = Math.sin(l);
  return { x: st.x + (x * c - y * sn) * st.facing * s, y: st.y + (x * sn + y * c - 10 - st.lift) * s };
}
// 指定の点の方向へ腕を向ける角度
function reach(b, s, side, tx, ty) {
  const st = b.state, o = hp(b, s, side, 0);
  const phi = deg(Math.atan2(-(tx - o.x) * st.facing, ty - o.y));
  return side === 'R' ? st.lean - phi : phi - st.lean;
}
// 位置の関数から歩行の位相と腕振りを作る（止まると脚をそろえる）
function gait(xf, t, x0, amp = 18, kf = 0.107) {
  const x = xf(t), v = Math.abs(xf(t + 0.02) - xf(t - 0.02)) / 0.04;
  const ph = Math.abs(x - x0) * kf, m = clamp(v / 25);
  const w = lerp(Math.round(ph / Math.PI) * Math.PI, ph, m);
  return { x, walk: w, armL: 8 + Math.sin(w) * amp * m, armR: 8 - Math.sin(w) * amp * m, lean: 3 * m, m };
}
// 脚を個別に回す（pose の後に呼ぶ。i=0 奥脚 / 1 手前脚、正で後ろ）
function leg(b, i, ang) {
  const g = b.g.children[1].children[i];
  g.setAttribute('transform', `translate(${i ? 12 : -12} ${-14 - b.state.lift}) rotate(${ang.toFixed(2)})`);
}
function bubble(k, txt, w = 54) {
  const n = k.g();
  k.el('rect', { x: -w / 2, y: -14, width: w, height: 26, rx: 13, fill: '#fff', stroke: k.pal.line, 'stroke-width': 2 }, n);
  k.el('path', { d: 'M -5 11 L 0 21 L 7 11 Z', fill: '#fff', stroke: k.pal.line, 'stroke-width': 2, 'stroke-linejoin': 'round' }, n);
  k.el('rect', { x: -6, y: 9, width: 16, height: 4, fill: '#fff' }, n);
  k.text(0, 0, txt, { 'font-size': 14 }, n);
  return n;
}
const HEART = 'M 0 6 C -12 -2 -8 -12 0 -5 C 8 -12 12 -2 0 6 Z';
// point：壁の地図の前に歩いて行き、腕を伸ばして目的地を指さす（例文 He pointed at the map.）
export const meta = { duration: 4.0, beats: [[0, '地図の前へ'], [1.6, '腕を伸ばす'], [3.0, '指さした']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 0.95;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  const px = 268, py = 168;
  // 壁の地図
  el('rect', { x: 246, y: 92, width: 124, height: 112, rx: 6, fill: pal.woodDark });
  el('rect', { x: 251, y: 97, width: 114, height: 102, rx: 3, fill: '#CFE9F7' });
  el('path', { d: 'M 258 112 Q 280 100 300 114 Q 316 130 296 142 Q 276 150 262 140 Z', fill: '#BEE3A8' });
  el('path', { d: 'M 318 150 Q 340 138 358 152 Q 362 180 336 190 Q 316 184 318 150 Z', fill: '#BEE3A8' });
  el('path', { d: 'M 330 108 Q 346 104 352 118 Q 340 128 330 120 Z', fill: '#E9D9A6' });
  el('path', { d: `M 272 128 Q 300 158 ${px} ${py}`, fill: 'none', stroke: pal.sub, 'stroke-width': 2, 'stroke-dasharray': '4 4' });
  el('rect', { x: 0, y: FY - 6, width: 400, height: 6, fill: pal.line });
  const pin = g({});
  el('path', { d: 'M -7 -7 L 7 7 M 7 -7 L -7 7', stroke: pal.red, 'stroke-width': 5, 'stroke-linecap': 'round' }, pin);
  const ring = el('circle', { cx: px, cy: py, r: 10, fill: 'none', stroke: pal.red, 'stroke-width': 2.5 });
  const b = k.buddy({ x: 110, y: FY, scale: S });
  const xf = (t) => lerp(100, 216, easeInOut(seg(t, 0.2, 1.7)));

  return {
    update(t) {
      const p = gait(xf, t, 100);
      const ra = easeInOut(seg(t, 1.6, 2.4));
      b.pose({ x: p.x, walk: p.walk, armL: p.armL, lean: p.lean + 4 * ra, look: 0.9, armR: 8, mood: 'smile' });
      const tgt = reach(b, S, 'R', px, py);
      b.pose({ armR: lerp(p.armR, tgt, ra) + 3 * Math.sin(t * 6) * ra * (1 - seg(t, 2.4, 2.6)), mood: ra > 0.5 ? 'open' : 'smile' });
      const q = seg(t, 2.4, 3.2);
      tf(pin, px, py - 3 * Math.abs(Math.sin(q * 9)) * (1 - q), 0, 1);
      ring.setAttribute('r', 8 + 16 * ((q * 2) % 1));
      ring.setAttribute('opacity', q > 0 ? (1 - ((q * 2) % 1)) : 0);
    }
  };
}
