// walk away：向かい合って立つ→まめが背を向ける→うなだれて歩いて遠ざかっていく（例文 He turned and walked away.）
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

export const meta = { duration: 4.2, beats: [[0, '向かい合う'], [1.3, '背を向ける'], [3.2, '遠ざかる']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236 });
  el('rect', { x: 0, y: FY + 6, width: 400, height: 22, fill: '#E3E8EE' });
  tree(k, 30, FY, 0.9);
  // 街灯
  el('rect', { x: 372, y: 110, width: 5, height: 126, rx: 2.5, fill: pal.sub });
  el('path', { d: 'M 364 114 h 21 l -3 -13 h -15 Z', fill: pal.yellow });
  const me = k.buddy({ x: 250, y: FY + 4, scale: 0.9, facing: -1 });
  const fr = k.buddy({ x: 150, y: FY + 4, scale: 0.9, color: pal.coral, dark: pal.coralDark });
  const xf = (t) => lerp(250, 340, easeInOut(seg(t, 2.0, 4.1)));
  return {
    update(t) {
      const turn = easeInOut(seg(t, 1.3, 2.0));
      const facing = lerp(-1, 1, turn);
      const p = gait(xf, t, 250, 12);
      const far = seg(p.x, 250, 340);
      me.pose({ x: p.x, y: FY + 4 - 8 * far, walk: p.walk, armL: p.armL * 0.6, armR: 8, lean: 6 * turn, facing, look: 0.2, mood: 'sad', squash: 1 - 0.02 * turn });
      faceAt(me, 0, 3 * turn + 2);
      me.g.setAttribute('transform', `translate(${p.x.toFixed(2)} ${(FY + 4 - 8 * far).toFixed(2)}) scale(${lerp(0.9, 0.74, far).toFixed(3)})`);
      const call = hump(seg(t, 0.4, 2.2));
      const drop = seg(t, 2.3, 3.0);
      fr.pose({ x: 150, armR: lerp(8 + 70 * call + 15 * Math.sin(t * 6) * call, 8, drop), armL: 8, mood: 'sad', look: 0.8, lean: -2 * drop });
      fr.g.setAttribute('transform', `translate(150 ${FY + 4}) scale(0.9)`);
    }
  };
}
