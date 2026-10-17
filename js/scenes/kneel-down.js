// kneel down：歩いてきて靴ひもがほどけているのに気づく→片ひざをついて、ひもを結ぶ（例文 He knelt down and tied his shoe.）
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

export const meta = { duration: 3.8, beats: [[0, '立っている'], [1.1, 'ひざをつく'], [2.4, 'ひもを結ぶ']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236 });
  el('rect', { x: 0, y: FY + 6, width: 400, height: 22, fill: '#E3E8EE' });
  tree(k, 335, FY, 1);
  tree(k, 40, FY, 0.8);
  const bx = 170;
  const b = k.buddy({ x: bx, y: FY });
  const [legL, legR] = legsOf(b);
  // 前足のくつ（体より後ろの層に入れる）
  const shoe = g({}, b.g.children[1]);
  b.g.children[1].insertBefore(shoe, b.body);
  tf(shoe, 16, 0);
  el('path', { d: 'M -8 0 L -8 -11 Q 0 -15 8 -10 L 24 -5 Q 30 -2 26 0 Z', fill: '#fff', stroke: pal.ink, 'stroke-width': 2, 'stroke-linejoin': 'round' }, shoe);
  el('rect', { x: -9, y: -2, width: 37, height: 4, rx: 2, fill: pal.red }, shoe);
  const loose = g({}, shoe);
  el('path', { d: 'M 8 -10 q 8 4 4 10 M 8 -10 q 12 2 14 9', stroke: pal.red, 'stroke-width': 2.4, fill: 'none', 'stroke-linecap': 'round' }, loose);
  const bow = g({}, shoe); tf(bow, 8, -10);
  el('ellipse', { cx: -5, cy: -3, rx: 6, ry: 3.5, fill: pal.red, transform: 'rotate(-25)' }, bow);
  el('ellipse', { cx: 5, cy: -3, rx: 6, ry: 3.5, fill: pal.red, transform: 'rotate(25)' }, bow);
  el('circle', { r: 2.6, fill: pal.redDark || '#C94F4F' }, bow);
  const ex = k.text(0, 0, '!', { 'font-size': 24, fill: pal.red });
  const sp = g({});
  [[0, -10], [10, -6], [-10, -6]].forEach(([x, y]) => el('line', { x1: x * 0.4, y1: y * 0.4, x2: x, y2: y, stroke: pal.yellowDark, 'stroke-width': 2.5, 'stroke-linecap': 'round' }, sp));

  return {
    update(t) {
      const kn = easeInOut(seg(t, 0.8, 1.7));
      const tie = seg(t, 1.9, 2.95);
      const tied = backOut(seg(t, 2.95, 3.2));
      const jig = Math.sin(t * 16) * 2.5 * (tie > 0 && tied < 1e-3 ? 1 : 0);
      b.pose({ lean: 14 * kn, squash: 1 - 0.27 * kn, armL: 8 + 24 * kn, armR: 8, look: 0.8, mood: t < 2.95 ? 'flat' : 'smile', blink: t > 0.3 && t < 0.4 ? 1 : 0, walk: 0 });
      // 後ろ脚はすねを地面に寝かせる（ひざ立ち）、前脚は足裏を地面につける
      tf(legL, lerp(-12, -9, kn), lerp(-14, -5, kn), lerp(0, 82, kn));
      tf(legR, lerp(12, 16, kn), -14, 0);
      const target = { x: bx + 26 + jig, y: FY - 11 + (tie > 0 ? Math.sin(t * 12) : 0) };
      const a = lerp(8, reach(b, 1, 'R', target.x, target.y), easeOut(seg(t, 1.5, 2.0)));
      b.pose({ armR: a });
      faceAt(b, 2 * kn, 4 * kn);
      loose.setAttribute('opacity', tied > 0 ? 0 : 1);
      tf(bow, 8, -10, 0, tied, tied);
      tf(ex, 0, 0); ex.setAttribute('x', bx + 20); ex.setAttribute('y', 118 - 6 * easeOut(seg(t, 0.25, 0.5)));
      ex.setAttribute('opacity', t > 0.25 && t < 0.95 ? 1 : 0);
      tf(sp, bx + 38, FY - 20, 0, tied > 0 && t < 3.6 ? 1.2 : 0);
    }
  };
}
