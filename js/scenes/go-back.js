// go back：学校を出て歩く→かばんを忘れたことに気づく→向きを変えて学校へ戻る（例文 I forgot my bag, so I went back to school.）
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

export const meta = { duration: 4.4, beats: [[0, '学校を出る'], [1.9, '忘れ物に気づく'], [3.6, '学校へ戻る']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236 });
  el('rect', { x: 0, y: FY, width: 400, height: 12, fill: '#E3E8EE' });
  // 学校
  el('rect', { x: 8, y: 98, width: 176, height: FY - 98, rx: 5, fill: '#F4E1B8' });
  el('rect', { x: 0, y: 86, width: 192, height: 16, rx: 4, fill: pal.coral });
  [24, 54, 124, 154].forEach((x) => { el('rect', { x, y: 122, width: 24, height: 30, rx: 3, fill: '#CFE9F7' }); el('rect', { x, y: 168, width: 24, height: 30, rx: 3, fill: '#CFE9F7' }); });
  el('rect', { x: 78, y: 168, width: 48, height: FY - 168, rx: 3, fill: '#56607A' });
  el('line', { x1: 102, y1: 168, x2: 102, y2: FY, stroke: '#fff', 'stroke-width': 2 });
  el('rect', { x: 70, y: FY - 4, width: 64, height: 6, rx: 2, fill: pal.woodDark });
  clockFace(k, 102, 120, 16, 8, 15);
  el('rect', { x: 168, y: 40, width: 3, height: 50, fill: pal.sub });
  el('path', { d: 'M 171 42 h 22 l -5 7 l 5 7 h -22 Z', fill: pal.red });
  tree(k, 366, FY, 0.8);
  // 忘れたかばん（入口の横）
  const bag = g({}); tf(bag, 146, FY);
  k.shadow(0, 1, 18, 3.5, bag);
  el('rect', { x: -14, y: -34, width: 28, height: 34, rx: 8, fill: pal.red }, bag);
  el('path', { d: 'M -14 -22 q 14 10 28 0 v -8 q -14 6 -28 0 Z', fill: pal.coralDark }, bag);
  el('rect', { x: -4, y: -20, width: 8, height: 8, rx: 2, fill: pal.yellow }, bag);
  el('path', { d: 'M -6 -34 q 6 -10 12 0', fill: 'none', stroke: pal.coralDark, 'stroke-width': 3 }, bag);
  const b = k.buddy({ x: 210, y: FY + 8, scale: 0.9 });
  // 思い出しの吹き出し（かばん）
  const th = g({});
  el('circle', { cx: -4, cy: 36, r: 3, fill: '#fff', stroke: pal.line, 'stroke-width': 1.5 }, th);
  el('circle', { cx: 4, cy: 26, r: 5, fill: '#fff', stroke: pal.line, 'stroke-width': 1.5 }, th);
  el('ellipse', { cx: 0, cy: -6, rx: 30, ry: 24, fill: '#fff', stroke: pal.line, 'stroke-width': 2 }, th);
  const ic = g({}, th); tf(ic, 0, 8, 0, 0.8);
  el('rect', { x: -14, y: -34, width: 28, height: 34, rx: 8, fill: pal.red }, ic);
  el('path', { d: 'M -14 -22 q 14 10 28 0 v -8 q -14 6 -28 0 Z', fill: pal.coralDark }, ic);
  el('path', { d: 'M -6 -34 q 6 -10 12 0', fill: 'none', stroke: pal.coralDark, 'stroke-width': 3 }, ic);
  const xf = (t) => t < 1.7 ? lerp(210, 318, easeOut(seg(t, 0.1, 1.7)) * 0.3 + seg(t, 0.1, 1.7) * 0.7) : t < 2.7 ? 318 : lerp(318, 204, easeInOut(seg(t, 2.7, 4.2)));
  return {
    update(t) {
      const p = gait(xf, t, 210, t > 2.7 ? 34 : 18, t > 2.7 ? 0.09 : 0.107);
      const turn = easeInOut(seg(t, 2.1, 2.7));
      const facing = lerp(1, -1, turn);
      const think = seg(t, 1.8, 2.0) * (1 - seg(t, 3.2, 3.5));
      b.pose({ x: p.x, walk: p.walk, armL: p.armL + (t > 2.7 ? 14 : 0), armR: p.armR + (t > 2.7 ? 14 : 0), lean: p.lean + (t > 2.7 ? 6 : 0), facing, look: 0.6, mood: t < 1.8 ? 'smile' : t < 3.9 ? 'open' : 'smile', blink: 0 });
      if (t > 1.8 && t < 2.5) b.pose({ armR: 8 + 130 * easeOut(seg(t, 1.8, 2.1)), armL: 8 });
      tf(th, p.x - 4, FY - 128 - 4 * Math.sin(t * 4), 0, think * 1.3, think * 1.3);
    }
  };
}
