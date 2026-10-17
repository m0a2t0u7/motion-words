// come out：ダンボール箱の中から子ねこが耳、顔と出てきて、縁を越えて外へ飛び出す（例文 A kitten came out of the box.）
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

export const meta = { duration: 4.2, beats: [[0, '箱の中'], [1.9, "顔を出す"], [3.2, '外へ出た']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  el('rect', { x: 30, y: 44, width: 84, height: 70, rx: 8, fill: '#DDEFFA', stroke: pal.woodDark, 'stroke-width': 4 });
  el('line', { x1: 72, y1: 44, x2: 72, y2: 114, stroke: '#fff', 'stroke-width': 4 });
  // 箱（奥）
  k.shadow(175, FY + 2, 70, 7);
  el('path', { d: 'M 120 190 L 112 168 L 126 176 Z', fill: '#C79A62' });
  el('path', { d: 'M 230 190 L 238 168 L 224 176 Z', fill: '#C79A62' });
  el('path', { d: 'M 126 176 L 224 176 L 230 190 L 120 190 Z', fill: '#B58A55' });
  const clipUrl = k.clip((cp) => el('rect', { x: 0, y: 0, width: 400, height: FY }, cp));
  const kg = g({ 'clip-path': clipUrl });
  const ksh = k.shadow(0, FY, 12, 3, g({}));
  const kit = g({}, kg);
  const O = '#F2A65A', OD = '#D98A3D', CR = '#FFE8C8';
  const tail = g({}, kit); el('path', { d: 'M 0 0 Q 18 2 20 -18', fill: 'none', stroke: O, 'stroke-width': 7, 'stroke-linecap': 'round' }, tail);
  el('ellipse', { cx: 0, cy: -14, rx: 17, ry: 15, fill: O }, kit);
  el('ellipse', { cx: -3, cy: -10, rx: 9, ry: 10, fill: CR }, kit);
  el('ellipse', { cx: 9, cy: -3, rx: 5, ry: 3.4, fill: CR }, kit);
  el('ellipse', { cx: -9, cy: -3, rx: 5, ry: 3.4, fill: CR }, kit);
  const head = g({}, kit);
  el('path', { d: 'M -13 -6 L -12 -21 L -2 -12 Z', fill: OD }, head);
  el('path', { d: 'M 13 -6 L 12 -21 L 2 -12 Z', fill: OD }, head);
  el('path', { d: 'M -10 -8 L -10 -17 L -4 -11 Z', fill: '#FFB5A8' }, head);
  el('path', { d: 'M 10 -8 L 10 -17 L 4 -11 Z', fill: '#FFB5A8' }, head);
  el('circle', { r: 14, fill: O }, head);
  el('path', { d: 'M -4 -12 v 5 M 0 -13 v 6 M 4 -12 v 5', stroke: OD, 'stroke-width': 2, 'stroke-linecap': 'round' }, head);
  const eyes = [-6, 6].map((x) => el('ellipse', { cx: x, cy: 0, rx: 2.4, ry: 3.4, fill: pal.ink }, head));
  el('path', { d: 'M -2 4 L 2 4 L 0 6.5 Z', fill: '#FF8E8E' }, head);
  el('path', { d: 'M -14 3 l -8 -2 M -14 6 l -8 3 M 14 3 l 8 -2 M 14 6 l 8 3', stroke: '#fff', 'stroke-width': 1.4, 'stroke-linecap': 'round' }, head);
  tf(head, 0, -30);
  // 箱（手前）
  const front = g({});
  el('rect', { x: 120, y: 188, width: 110, height: FY - 188, rx: 3, fill: '#D9AE76' }, front);
  el('rect', { x: 160, y: 188, width: 30, height: FY - 188, fill: '#E8CBA0' }, front);
  el('rect', { x: 120, y: 188, width: 110, height: 6, fill: '#C79A62' }, front);
  el('path', { d: 'M 205 214 h 16 M 205 220 h 10', stroke: '#B58A55', 'stroke-width': 2.5, 'stroke-linecap': 'round' }, front);
  const b = k.buddy({ x: 340, y: FY, scale: 0.85, facing: -1 });
  const rest = (t) => ({ x: 258, y: FY });
  return {
    update(t) {
      let x = 175, y = 242, rot = 0, sx = 1, sy = 1;
      const r1 = easeOut(seg(t, 0.6, 1.2)), r2 = easeInOut(seg(t, 1.2, 1.8));
      y = lerp(242, 224, r1); y = lerp(y, 213, r2);
      const crouch = easeInOut(seg(t, 1.8, 2.2));
      const hop = seg(t, 2.2, 3.0);
      if (t >= 2.2) {
        x = lerp(175, 258, easeOut(hop) * 0.3 + hop * 0.7);
        y = lerp(213, FY, easeIn(hop)) - 78 * Math.sin(Math.PI * Math.pow(hop, 0.9));
        rot = lerp(-12, 14, hop);
      }
      const land = wobble(seg(t, 3.0, 3.6), 1.5, 4);
      const sq = t < 2.2 ? 1 - 0.1 * crouch : t < 3.0 ? 1.1 - 0.1 * hop : 1 + 0.12 * land;
      tf(kit, x, y, rot, 2 - sq, sq);
      const tw = Math.sin(t * 7) * 10 * seg(t, 3.2, 3.5);
      tf(tail, 0, -4, tw);
      const bl = (t > 1.7 && t < 1.8) || (t > 3.7 && t < 3.8) ? 0.15 : 1;
      eyes.forEach((e) => e.setAttribute('ry', 3.4 * bl));
      tf(head, 0, -30, lerp(-8, 0, r2) + 3 * Math.sin(t * 9) * (t < 1.2 ? 1 : 0));
      ksh.setAttribute('cx', x); ksh.setAttribute('opacity', t > 2.8 ? 1 : 0);
      b.pose({ x: 340, facing: -1, armR: 8 + 40 * hump(seg(t, 2.2, 3.4)), mood: t < 1.2 ? 'flat' : t < 3.0 ? 'open' : 'smile', look: 0.6, squash: 1, lean: 0 });
      b.g.setAttribute('transform', `translate(340 ${FY}) scale(0.85)`);
    }
  };
}
