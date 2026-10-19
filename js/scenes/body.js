// body：公園で体操（ジャンプ）をして、体全体が元気に光る（例文 Exercise is good for your body.）
// このファイルは「体の部位」シーン用の共有ヘルパーも書き出す
import { seg, lerp, easeInOut, easeOut, hump, clamp, wobble } from '../ease.js';
import { hp, held, reach, gait } from './dig.js';
import { P, blinkAt } from './run-after.js';
import { parkBg } from './bench.js';
export { hp, held, reach, gait, P, blinkAt };
const rad = (d) => (d * Math.PI) / 180;

// 体のローカル座標（顔・胴の共通座標、足元から上が負）→ ワールド座標
export function bp(b, s, x, y) {
  const st = b.state;
  x *= 2 - st.squash; y *= st.squash;
  const l = rad(st.lean), c = Math.cos(l), sn = Math.sin(l);
  return { x: st.x + (x * c - y * sn) * st.facing * s, y: st.y + (x * sn + y * c - 10 - st.lift) * s };
}
export const faceOf = (b) => b.body.children[3];
export const legG = (b, i) => b.g.children[1].children[i];
// 脚を個別に回す（pose の後で呼ぶ。正で後ろへ）
export function legs(b, a0, a1) {
  [a0, a1].forEach((a, i) => legG(b, i).setAttribute('transform', `translate(${i ? 12 : -12} ${-14 - b.state.lift}) rotate(${a.toFixed(2)})`));
}
// 足（くつ）を脚の先に付ける
export function feet(k, b, color = '#6D7889') {
  return [0, 1].map((i) => k.el('ellipse', { cx: 4, cy: 16, rx: 7.5, ry: 4.5, fill: color }, legG(b, i)));
}
// 耳（体の後ろ側に付く）。nodes を返す
export function ears(k, b, color, stroke) {
  const back = b.body.children[0];
  return [-1, 1].map((sd) => {
    const n = k.el('ellipse', { cx: sd * 29, cy: -56, rx: 7, ry: 9.5, fill: color, stroke: stroke || 'rgba(0,0,0,0.18)', 'stroke-width': 2 });
    back.insertBefore(n, back.firstChild);
    return n;
  });
}
// 鼻（顔の中、目と口の間）
export function nose(k, b, color = 'rgba(0,0,0,0.18)') {
  return k.el('ellipse', { cx: 0, cy: -48.5, rx: 3.6, ry: 2.6, fill: color }, faceOf(b));
}
// 長い髪。back は体の後ろ、front は前髪。戻り値 { back, front }
export function hair(k, b, color = '#2B2B33', len = 70) {
  const backG = k.g({});
  b.body.children[0].insertBefore(backG, b.body.children[0].firstChild);
  k.el('path', { d: `M -33 -66 Q -36 -86 0 -88 Q 36 -86 33 -66 L 36 ${-80 + len} Q 0 ${-74 + len} -36 ${-80 + len} Z`, fill: color }, backG);
  const front = k.g({});
  b.body.children[4].insertBefore(front, b.body.children[4].firstChild);
  k.el('path', { d: 'M -30 -62 Q -32 -84 0 -84 Q 32 -84 30 -62 Q 22 -70 10 -68 Q 0 -76 -12 -68 Q -22 -72 -30 -62 Z', fill: color }, front);
  k.el('path', { d: 'M -14 -79 Q -4 -82 6 -80', stroke: '#fff', 'stroke-width': 2.4, opacity: 0.35, fill: 'none', 'stroke-linecap': 'round' }, front);
  return { back: backG, front };
}
// 二の腕＋前腕で描く腕（標準の腕の代わり）。set(肩, 手, 曲げ向き ±1)
export function limb(k, color, dark, s = 1, parent) {
  const g = k.g({}, parent);
  const p = k.el('polyline', { fill: 'none', stroke: dark, 'stroke-width': 9 * s, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, g);
  const h = k.el('circle', { r: 6.5 * s, fill: color, stroke: dark, 'stroke-width': 2.5 * s }, g);
  return {
    g, hand: h,
    set(a, hd, bend = 1, L1 = 14 * s, L2 = 13 * s) {
      let dx = hd.x - a.x, dy = hd.y - a.y, d = Math.hypot(dx, dy);
      const dd = clamp(d, 1, L1 + L2 - 0.01), ux = dx / d, uy = dy / d;
      const hx = a.x + ux * dd, hy = a.y + uy * dd;
      const ca = (L1 * L1 + dd * dd - L2 * L2) / (2 * L1 * dd), sa = Math.sqrt(Math.max(0, 1 - ca * ca));
      const e = { x: a.x + L1 * (ux * ca - bend * uy * sa), y: a.y + L1 * (uy * ca + bend * ux * sa) };
      k.set(p, { points: `${a.x.toFixed(1)},${a.y.toFixed(1)} ${e.x.toFixed(1)},${e.y.toFixed(1)} ${hx.toFixed(1)},${hy.toFixed(1)}` });
      k.set(h, { cx: hx, cy: hy });
      return { e, h: { x: hx, y: hy } };
    }
  };
}
// 痛みのギザギザ線。set(p, x, y, t, rot)
export function ache(k, color) {
  const g = k.g({});
  [-42, 0, 42].forEach((a) => k.el('path', { d: 'M 0 -9 l 3.5 -4 l -3.5 -4 l 3.5 -4', transform: `rotate(${a})`, stroke: color || k.pal.red, 'stroke-width': 2.6, fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, g));
  return { g, set(p, x, y, t = 0, rot = 0) { k.tf(g, x, y, rot, Math.max(0.001, p * (1 + 0.14 * Math.sin(t * 20)))); g.setAttribute('opacity', p > 0.01 ? 1 : 0); } };
}
// 注目の輪（点線の輪が回る）。set(p, x, y, r, t)
export function spot(k, color) {
  const c = k.el('circle', { r: 10, fill: 'none', stroke: color || k.pal.yellowDark, 'stroke-width': 3, 'stroke-dasharray': '6 5', 'stroke-linecap': 'round' });
  return { g: c, set(p, x, y, r, t = 0) { k.set(c, { cx: x, cy: y, r: Math.max(0.1, r * (0.7 + 0.3 * easeOut(p))), opacity: clamp(p * 2), 'stroke-dashoffset': (t * 14).toFixed(1) }); } };
}
// 拡大鏡の丸窓（中身は inner に描く。中心が原点）。show(p, x, y, tx, ty)
export function lens(k, r = 46) {
  const o = k.g({});
  const line = k.el('line', { stroke: k.pal.sub, 'stroke-width': 2, 'stroke-dasharray': '4 4' }, o);
  const g = k.g({}, o);
  k.el('circle', { r: r + 4, fill: '#fff', stroke: k.pal.line, 'stroke-width': 3 }, g);
  const inner = k.g({ 'clip-path': k.clip((cp) => k.el('circle', { r }, cp)) }, g);
  k.el('circle', { r, fill: '#F4F8FB' }, inner);
  return {
    o, g, inner,
    show(p, x, y, tx, ty) {
      const s = p <= 0 ? 0.001 : easeOut(clamp(p));
      k.tf(g, x, y, 0, s);
      o.setAttribute('opacity', clamp(p * 3));
      k.set(line, { x1: tx, y1: ty, x2: lerp(tx, x, s), y2: lerp(ty, y, s) });
    }
  };
}
// きらめき（4方向の星）
export function twinkle(k, parent, c) {
  return k.el('path', { d: 'M 0 -8 Q 1 -1 8 0 Q 1 1 0 8 Q -1 1 -8 0 Q -1 -1 0 -8 Z', fill: c || k.pal.yellow }, parent);
}
export const pop = (p) => (p <= 0 ? 0.001 : p);

export const meta = { duration: 4.2, beats: [[0, '体操をする'], [1.4, 'ジャンプ！'], [3.2, '体が元気に']] };

export function create(k) {
  const { el, tf, pal } = k, S = 1.15;
  const FY = parkBg(k, 236);
  el('rect', { x: 130, y: FY + 6, width: 140, height: 16, rx: 6, fill: '#8FC9E8' });
  const b = k.buddy({ x: 200, y: FY + 10, scale: S });
  const glow = el('rect', { x: -33, y: -83, width: 66, height: 86, rx: 31, fill: 'none', stroke: pal.yellow, 'stroke-width': 5 });
  b.body.insertBefore(glow, b.body.children[1]);
  const hearts = [0, 1, 2].map(() => el('path', { d: 'M 0 6 C -12 -4 -8 -12 0 -6 C 8 -12 12 -4 0 6 Z', fill: pal.red }));
  const sp = [0, 1, 2, 3].map(() => twinkle(k));
  return {
    update(t) {
      // 4回のジャンピングジャック（0.6秒周期）
      const on = seg(t, 0.5, 3.0), ph = on > 0 && on < 1 ? ((t - 0.5) / 0.625) % 1 : 0;
      const up = hump(ph), sq = ph < 0.12 || ph > 0.88 ? 0.93 : 1;
      const fin = easeOut(seg(t, 3.1, 3.6));
      P(b, { armL: lerp(lerp(10, 165, up), 140, fin), armR: lerp(lerp(10, 165, up), 140, fin), lift: up * 16, squash: on > 0 && on < 1 ? sq : 1 - 0.04 * hump(seg(t, 3.0, 3.3)), mood: t > 3.0 ? 'grin' : 'open', blink: blinkAt(t) });
      legs(b, lerp(0, 22, up), lerp(0, -22, up));
      glow.setAttribute('opacity', (clamp(seg(t, 2.6, 3.4)) * (0.6 + 0.4 * Math.sin(t * 8))).toFixed(2));
      hearts.forEach((h, i) => { const q = seg(t, 3.1 + i * 0.18, 4.2); tf(h, 150 + i * 50, 92 - 22 * easeOut(q) + (i % 2) * 14, 0, pop(easeOut(seg(q, 0, 0.35)) * 1.2)); });
      sp.forEach((s, i) => { const q = seg(t, 2.9 + i * 0.15, 3.9 + i * 0.1); tf(s, [142, 262, 128, 274][i], [130, 120, 196, 186][i], q * 90, pop(easeOut(seg(q, 0, 0.4)) * (0.8 + 0.2 * Math.sin(t * 9 + i)))); });
    }
  };
}
