// lie down：眠そうに立っている→ベッドに上がる→体を倒して横になり、毛布をかける（例文 I want to lie down for a while.）
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

function bedroom(k, o = {}) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 250, mood: 'indoor' });
  el('rect', { x: 30, y: 34, width: 88, height: 76, rx: 8, fill: o.sun ? '#DDEFFA' : '#35406B' });
  const sun = el('circle', { cx: 74, cy: 96, r: 13, fill: o.sun ? pal.yellow : '#FFF3C4' });
  el('line', { x1: 74, y1: 34, x2: 74, y2: 110, stroke: '#fff', 'stroke-width': 4 });
  el('line', { x1: 30, y1: 72, x2: 118, y2: 72, stroke: '#fff', 'stroke-width': 4 });
  el('rect', { x: 30, y: 34, width: 88, height: 76, rx: 8, fill: 'none', stroke: pal.woodDark, 'stroke-width': 4 });
  clockFace(k, 200, 72, 21, o.h, o.m);
  el('rect', { x: 252, y: 46, width: 52, height: 40, rx: 4, fill: '#fff', stroke: pal.woodDark, 'stroke-width': 4 });
  el('path', { d: 'M 256 82 L 270 64 L 280 76 L 288 68 L 300 82 Z', fill: pal.green, opacity: 0.7 });
  el('circle', { cx: 288, cy: 57, r: 5, fill: pal.yellow });
  el('ellipse', { cx: 92, cy: 264, rx: 70, ry: 8, fill: pal.blue, opacity: 0.22 });
  // ベッド（マットレス上面 y=210）
  el('rect', { x: 318, y: 150, width: 14, height: 100, rx: 5, fill: pal.woodDark });
  el('rect', { x: 140, y: 196, width: 10, height: 54, rx: 4, fill: pal.woodDark });
  el('rect', { x: 144, y: 226, width: 182, height: 14, rx: 4, fill: pal.wood });
  el('rect', { x: 152, y: 240, width: 9, height: 10, fill: pal.woodDark });
  el('rect', { x: 306, y: 240, width: 9, height: 10, fill: pal.woodDark });
  el('rect', { x: 148, y: 208, width: 172, height: 20, rx: 8, fill: '#EAF2FA' });
  el('ellipse', { cx: 276, cy: 203, rx: 32, ry: 9, fill: '#fff', stroke: '#D5DBE5', 'stroke-width': 2 });
  const fsh = k.shadow(108, 252, 28, 5);
  const grp = g({});
  const b = k.buddy({ parent: grp, x: 0, y: 0 });
  b.g.children[0].setAttribute('display', 'none');
  const blanket = g({});
  const bl = el('rect', { x: 0, y: 0, width: 62, height: 48, rx: 14, fill: pal.blue }, blanket);
  el('rect', { x: 0, y: 0, width: 62, height: 9, rx: 4, fill: '#fff', opacity: 0.35 }, blanket);
  // p: 0=体にかかっている, 1=足元にたたまれている
  const pull = (p) => { tf(blanket, 160, 166 + 24 * p, 0, 1, 1 - 0.55 * p); };
  pull(0);
  return { FY, grp, b, fsh, pull, sun };
}

export const meta = { duration: 3.8, beats: [[0, '立っている'], [1.9, '体を倒す'], [3.2, '横になった']] };

export function create(k) {
  const R = bedroom(k, { sun: false, h: 9, m: 30 });
  const { b, grp } = R;
  return {
    update(t) {
      const up = easeInOut(seg(t, 0.9, 1.7));
      const lay = easeInOut(seg(t, 1.9, 2.9));
      const rot = lerp(0, 90, lay);
      const onBed = 210 - 30 * Math.sin(rad(rot));
      const y = lerp(250, onBed, up) - 12 * hump(up);
      const x = lerp(108, 175, up);
      k.tf(grp, x, y, rot);
      R.pull(1 - seg(t, 2.9, 3.5));
      k.set(R.fsh, { cx: 108, opacity: 1 - seg(t, 0.9, 1.3) });
      const yawn = hump(seg(t, 0.2, 0.8));
      b.pose({
        blink: Math.max(0.5 * (1 - up) + 0.3 * hump(seg(t, 0.2, 0.8)), seg(t, 2.6, 3.1)),
        mood: yawn > 0.2 ? 'open' : t < 3.1 ? 'flat' : 'smile',
        armL: 8 + yawn * 10, armR: 8 + yawn * 150,
        squash: 1 - 0.03 * yawn,
        lean: t < 0.9 ? 5 : 0,
        look: 0.3
      });
    }
  };
}
