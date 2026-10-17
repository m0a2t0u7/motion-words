// run away：犬がほえているのに出くわす→まめがびっくりして飛び上がる→向きを変えて全力で走って逃げる（例文 The boy ran away from the dog.）
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

function mkDog(k, parent) {
  const { el, g, tf } = k, col = '#C9915E', dk = '#9C6A3F', cr = '#E9C99C';
  const o = g({}, parent), sh = k.shadow(0, 0, 32, 5, o), f = g({}, o);
  const tail = g({}, f); el('path', { d: 'M 0 0 Q -12 -4 -14 -20', fill: 'none', stroke: dk, 'stroke-width': 6, 'stroke-linecap': 'round' }, tail);
  const legs = [[-17, dk], [-9, col], [12, col], [20, dk]].map(([x, c]) => { const l = g({}, f); el('line', { x1: 0, y1: 0, x2: 0, y2: 16, stroke: c, 'stroke-width': 7, 'stroke-linecap': 'round' }, l); return [l, x]; });
  const body = g({}, f);
  el('ellipse', { cx: 0, cy: -26, rx: 26, ry: 14, fill: col }, body);
  el('ellipse', { cx: 4, cy: -19, rx: 16, ry: 6, fill: cr }, body);
  const head = g({}, f);
  el('circle', { r: 12, fill: col }, head);
  el('ellipse', { cx: 11, cy: 4, rx: 9, ry: 6.5, fill: cr }, head);
  el('ellipse', { cx: 18, cy: 1, rx: 3.4, ry: 2.6, fill: '#3B2A22' }, head);
  el('circle', { cx: 3, cy: -3, r: 2.2, fill: pal_ink(k) }, head);
  const mouth = el('path', { d: 'M 8 7 Q 14 17 20 7 Z', fill: '#C94F4F', opacity: 0 }, head);
  const ear = g({}, head); el('ellipse', { cx: 0, cy: 10, rx: 5, ry: 11, fill: dk }, ear);
  function pose(p) {
    const { x = 0, y = 0, s = 1, face = 1, ph = 0, tailA = 0, earA = 0, bark = 0, hd = 0, hr = 0, lift = 0 } = p;
    tf(o, x, y, 0, s, s); tf(f, 0, 0, 0, face, 1);
    tf(sh, 0, 0, 0, 1 - lift / 120, 1);
    const sw = Math.sin(ph) * 28;
    legs.forEach(([l, lx], i) => tf(l, lx, -16 - lift, (i === 0 || i === 3 ? 1 : -1) * sw));
    const bob = Math.abs(Math.sin(ph)) * 2 + lift;
    tf(body, 0, -bob); tf(head, 24, -38 - bob + hd, hr);
    tf(tail, -25, -34 - bob, tailA); tf(ear, -4, -6, earA);
    mouth.setAttribute('opacity', bark);
  }
  pose({});
  return { g: o, pose };
}
const pal_ink = (k) => k.pal.ink;

export const meta = { duration: 4.0, beats: [[0, '犬がほえる'], [1.0, 'びっくり'], [2.4, '走って逃げる']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236 });
  for (let x = 0; x < 400; x += 26) { el('rect', { x, y: 196, width: 14, height: 40, rx: 3, fill: '#fff', stroke: pal.line, 'stroke-width': 1 }); }
  el('rect', { x: 0, y: 206, width: 400, height: 6, fill: '#fff', stroke: pal.line, 'stroke-width': 1 });
  el('rect', { x: 0, y: FY + 6, width: 400, height: 22, fill: '#E3E8EE' });
  const dog = mkDog(k);
  const b = k.buddy({ x: 190, y: FY + 6, scale: 0.9, facing: -1 });
  const xf = (t) => t < 1.5 ? 190 : lerp(190, 336, easeIn(seg(t, 1.5, 3.2)) * 0.5 + seg(t, 1.5, 3.2) * 0.5);
  const puffs = [1.6, 1.85, 2.1, 2.35, 2.6, 2.85].map((bt) => ({ bt, n: el('circle', { r: 6, fill: '#D9DFE7' }) }));
  const dr = [0, 1].map(() => el('path', { d: 'M 0 -6 Q 4 0 0 3 Q -4 0 0 -6 Z', fill: pal.water, stroke: '#4FB4E0', 'stroke-width': 1.2 }));
  const ex = k.text(0, 0, '!', { 'font-size': 26, fill: pal.red });
  const woof = g({});
  [0, 1, 2].forEach((i) => el('path', { d: `M ${10 + i * 8} ${-10 - i * 4} Q ${16 + i * 9} 0 ${10 + i * 8} ${10 + i * 4}`, stroke: pal.sub, 'stroke-width': 2.6, fill: 'none', 'stroke-linecap': 'round' }, woof));
  return {
    update(t) {
      const p = gait(xf, t, 190, 52, 0.075);
      const scare = hump(seg(t, 0.85, 1.5));
      const turn = easeInOut(seg(t, 1.2, 1.5));
      const run = t > 1.5;
      b.pose({ x: p.x, lift: 16 * scare, facing: lerp(-1, 1, turn), walk: run ? p.walk : 0, armL: run ? p.armL : 8 + 80 * scare, armR: run ? p.armR : 8 + 80 * scare, lean: run ? 16 * easeOut(seg(t, 1.5, 2.0)) : -6 * scare, squash: 1 - 0.1 * (t > 0.8 && t < 0.9 ? 1 : 0), mood: t < 0.85 ? 'smile' : 'open', look: 0.7 });
      const barking = Math.sin(t * 16) > 0;
      const lunge = hump(seg(t, 0.5, 1.5)) * 5;
      dog.pose({ x: 78 + lunge + (t > 1.5 ? 14 * easeOut(seg(t, 1.5, 2.2)) : 0), y: FY + 8, s: 1.05, face: 1, ph: t > 1.5 && t < 2.4 ? t * 14 : 0, tailA: 45 + 10 * Math.sin(t * 20), earA: -25, bark: barking ? 1 : 0, hd: barking ? -2 : 0, hr: barking ? -8 : 0 });
      const wx = 78 + lunge + (t > 1.5 ? 14 * easeOut(seg(t, 1.5, 2.2)) : 0) + 44;
      tf(woof, wx, FY - 36, 0, barking ? 1 : 0.0001);
      puffs.forEach(({ bt, n }) => { const a = seg(t, bt, bt + 0.55); n.setAttribute('cx', xf(bt) - 22 - 8 * a); n.setAttribute('cy', FY + 4 - 8 * a); n.setAttribute('r', 5 + 8 * a); n.setAttribute('opacity', t >= bt && a < 1 ? 0.8 * (1 - a) : 0); });
      dr.forEach((d, i) => { const a = seg(t, 1.0 + i * 0.12, 1.7 + i * 0.12); tf(d, p.x - 6 - 28 * a * (i ? 1 : 0.6) - 8 * (i ? 0 : 1) * 0, FY - 78 + 22 * a * a - 14 * a, 0, 1); d.setAttribute('opacity', a > 0 && a < 1 ? 1 : 0); });
      tf(ex, 0, 0); ex.setAttribute('x', 190); ex.setAttribute('y', FY - 120 - 4 * easeOut(seg(t, 0.85, 1.2)));
      ex.setAttribute('opacity', t > 0.85 && t < 1.7 ? 1 : 0);
    }
  };
}
