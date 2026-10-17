// set off：朝日がのぼる家の前で、リュックを背負った2人が出発の用意をする→並んで道を歩き出す（例文 We set off early in the morning.）
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

export const meta = { duration: 4.2, beats: [[0, '出発前'], [1.2, '歩き出す'], [3.2, '進んでいく']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'evening' });
  const sun = el('circle', { cx: 352, cy: 236, r: 28, fill: '#FFD27A' });
  const halo = el('circle', { cx: 352, cy: 236, r: 46, fill: '#FFE3A8', opacity: 0.45 });
  el('path', { d: 'M 0 222 Q 90 196 180 214 Q 280 190 400 216 L 400 236 L 0 236 Z', fill: '#C9E4D1' });
  el('rect', { x: 0, y: FY, width: 400, height: 64, fill: '#F3EEE8' });
  el('rect', { x: 0, y: FY + 8, width: 400, height: 18, fill: '#E9DFD2' });
  // 家（後ろ）
  el('rect', { x: -20, y: 118, width: 110, height: FY - 118, rx: 5, fill: '#FBE9DC' });
  el('path', { d: 'M -30 124 L 35 76 L 100 124 Z', fill: pal.coral, stroke: pal.coral, 'stroke-width': 7, 'stroke-linejoin': 'round' });
  el('rect', { x: 20, y: 172, width: 34, height: FY - 172, rx: 3, fill: '#FFD98A' });
  el('rect', { x: 66, y: 142, width: 18, height: 22, rx: 3, fill: '#FFE9B8' });
  // 道しるべ
  el('rect', { x: 208, y: 170, width: 5, height: 70, fill: pal.woodDark });
  el('path', { d: 'M 194 176 h 36 l 12 10 l -12 10 h -36 Z', fill: pal.wood, stroke: pal.woodDark, 'stroke-width': 2, 'stroke-linejoin': 'round' });
  const mk = (x, color, dark, packC) => {
    const b = k.buddy({ x, y: FY + 10, scale: 0.85, color, dark });
    const pk = g({});
    el('rect', { x: -46, y: -72, width: 24, height: 48, rx: 9, fill: packC }, pk);
    el('rect', { x: -42, y: -48, width: 14, height: 14, rx: 4, fill: '#fff', opacity: 0.35 }, pk);
    b.body.insertBefore(pk, b.body.children[0]);
    const strap = g({});
    el('path', { d: 'M -28 -68 Q -12 -50 -28 -30', stroke: packC, 'stroke-width': 5, fill: 'none', 'stroke-linecap': 'round' }, strap);
    b.body.insertBefore(strap, b.body.children[3]);
    return b;
  };
  const a = mk(176, pal.mint, pal.mintDark, pal.blue);
  const c = mk(100, pal.coral, pal.coralDark, pal.violet);
  const xa = (t) => lerp(176, 336, easeInOut(seg(t, 1.1, 4.1)));
  const xc = (t) => lerp(100, 262, easeInOut(seg(t, 1.3, 4.1)));
  return {
    update(t) {
      const r = easeOut(seg(t, 0, 4));
      sun.setAttribute('cy', lerp(250, 206, r)); halo.setAttribute('cy', lerp(250, 206, r));
      const pa = gait(xa, t, 176), pc = gait(xc, t, 100);
      const adj = hump(seg(t, 0.2, 1.0));
      a.pose({ x: pa.x, walk: pa.walk, armL: pa.armL, armR: pa.armR + 90 * adj * (1 - pa.m), lean: pa.lean + 4 * pa.m, look: 0.7, mood: 'grin' });
      c.pose({ x: pc.x, walk: pc.walk, armL: pc.armL, armR: pc.armR, lean: pc.lean + 4 * pc.m, look: 0.7, mood: 'smile' });
      if (t < 1.1) c.pose({ armR: 8 + 120 * adj });
    }
  };
}
