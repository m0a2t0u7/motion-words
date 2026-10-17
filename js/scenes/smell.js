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
// smell：焼きたてのパンの湯気と香りが流れてきて、まめが目を閉じて香りをかぐ（例文 I can smell fresh bread.）
export const meta = { duration: 4.2, beats: [[0, 'パンがある'], [1.6, '香りが届く'], [3.2, 'うっとり']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 0.95;
  const FY = k.backdrop({ floorY: 238, mood: 'indoor' });
  // パン屋の棚（奥）
  el('rect', { x: 20, y: 70, width: 150, height: 6, rx: 3, fill: pal.woodDark });
  el('rect', { x: 20, y: 120, width: 150, height: 6, rx: 3, fill: pal.woodDark });
  [[34, 60, 0], [66, 61, 8], [98, 60, 0], [130, 62, -6]].forEach(([x, y, r]) => el('ellipse', { cx: x + 12, cy: y + 4, rx: 15, ry: 8, fill: '#E2B26A', transform: `rotate(${r} ${x + 12} ${y + 4})` }));
  [[40, 110], [78, 110], [116, 111]].forEach(([x, y]) => el('rect', { x, y: y - 6, width: 34, height: 14, rx: 7, fill: '#D9A25A' }));
  // カウンター
  el('rect', { x: 262, y: 176, width: 138, height: 10, rx: 3, fill: pal.wood });
  el('rect', { x: 270, y: 186, width: 122, height: 52, fill: pal.woodDark });
  k.shadow(332, FY + 1, 70, 4);
  el('ellipse', { cx: 308, cy: 176, rx: 34, ry: 5, fill: '#fff', stroke: pal.line, 'stroke-width': 2 });
  // パン
  el('path', { d: 'M 280 170 Q 278 146 308 146 Q 338 146 336 170 Q 308 176 280 170 Z', fill: '#E0A24E' });
  el('path', { d: 'M 280 170 Q 278 146 308 146 Q 322 146 330 154 Q 300 150 286 160 Z', fill: '#EDB968' });
  [[296, 158], [308, 154], [320, 158]].forEach(([x, y]) => el('path', { d: `M ${x - 4} ${y + 3} L ${x + 4} ${y - 3}`, stroke: '#B97A32', 'stroke-width': 3, 'stroke-linecap': 'round' }));
  const steam = [0, 1].map((i) => el('path', { d: `M ${296 + i * 24} 144 q -8 -10 0 -20 q 8 -10 0 -20`, fill: 'none', stroke: '#fff', 'stroke-width': 4, 'stroke-linecap': 'round', opacity: 0 }));
  const aroma = [0, 1, 2].map((i) => el('path', { d: '', fill: 'none', stroke: '#E0A24E', 'stroke-width': 3.2, 'stroke-linecap': 'round', 'stroke-dasharray': '6 9', opacity: 0 }));
  const b = k.buddy({ x: 110, y: FY, scale: S });
  const heart = el('path', { d: HEART, fill: pal.coral });
  const xf = (t) => lerp(110, 206, easeInOut(seg(t, 0.5, 2.3)));

  return {
    update(t) {
      const p = gait(xf, t, 110);
      const lv = easeInOut(seg(t, 2.2, 2.9));
      const sn = seg(t, 2.6, 3.8) * (1 - seg(t, 3.9, 4.2));
      const sniff = Math.max(0, Math.sin(t * 7)) * sn;
      b.pose({ x: p.x, walk: p.walk, armL: p.armL, armR: p.armR, lean: p.lean + 14 * lv, blink: lv, look: 0.7, squash: 1 + 0.035 * sniff, mood: lv > 0.5 ? 'smile' : 'smile' });
      const fx = p.x + 26 + 12 * lv, fy = FY - 76;
      steam.forEach((s, i) => { s.setAttribute('opacity', seg(t, 0.3 + i * 0.2, 1.0) * (0.5 + 0.4 * Math.sin(t * 4 + i * 2))); tf(s, 0, -4 * Math.sin(t * 3 + i)); });
      aroma.forEach((a, i) => {
        const y0 = 150 + i * 8, ye = fy - 4 + i * 8;
        const w = 12 * Math.sin(t * 3 + i * 2);
        a.setAttribute('d', `M 282 ${y0} C 262 ${y0 - 34 + w} ${fx + 40} ${ye - 30 - w} ${fx + 6} ${ye}`);
        a.setAttribute('stroke-dashoffset', -t * 40);
        a.setAttribute('opacity', seg(t, 1.4 + i * 0.15, 2.0 + i * 0.15));
      });
      const h = seg(t, 3.4, 4.1);
      tf(heart, p.x + 8, fy - 60 - 16 * h, 0, hump(h) * 1.0 + 0.001);
    }
  };
}
