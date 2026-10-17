// go away：公園で犬が近くにいる→まめが大きな声で「しっ！」と叫ぶ→犬が向きを変えて走り去っていく（例文 The dog went away when I shouted.）
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

export const meta = { duration: 4.2, beats: [[0, '犬が近くにいる'], [1.1, '大声で叫ぶ'], [2.6, '犬が去った']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236 });
  tree(k, 42, FY, 1);
  el('rect', { x: 0, y: FY + 6, width: 400, height: 18, fill: '#E9E4D4', opacity: 0.6 });
  const dog = mkDog(k);
  const b = k.buddy({ x: 112, y: FY + 6, scale: 0.9 });
  const waves = g({});
  [0, 1, 2].forEach((i) => el('path', { d: `M ${8 + i * 9} ${-12 - i * 5} Q ${16 + i * 11} 0 ${8 + i * 9} ${12 + i * 5}`, stroke: pal.red, 'stroke-width': 3, fill: 'none', 'stroke-linecap': 'round' }, waves));
  const shout = k.text(0, 0, '!', { 'font-size': 26, fill: pal.red });
  const dx = (t) => t < 1.7 ? 200 : t < 2.2 ? 200 + 10 * seg(t, 1.7, 2.2) : lerp(210, 345, easeIn(seg(t, 2.2, 3.6)) * 0.55 + seg(t, 2.2, 3.6) * 0.45);
  return {
    update(t) {
      const sh = t >= 1.05 && t < 2.0 ? 1 : 0;
      const open = easeOut(seg(t, 1.1, 1.3));
      b.pose({ x: 112, lean: -8 * open * sh, squash: 1 + 0.06 * open * sh, armL: 8 + (sh ? 20 : 0), armR: 8 + 150 * open * sh * (1 - seg(t, 2.0, 2.4)), mood: sh ? 'open' : t < 2.4 ? 'smile' : 'smile', look: 0.6, lift: 0 });
      if (t > 2.0) b.pose({ armR: lerp(8 + 150 * (1 - seg(t, 2.0, 2.4)), 8, seg(t, 2.4, 2.8)) });
      tf(waves, 140, FY - 54, 0, sh * (1 + 0.1 * Math.sin(t * 25)));
      tf(shout, 168, FY - 100 + 0 * Math.sin(t * 30), 0, 1);
      shout.setAttribute('opacity', sh);
      const turn = easeInOut(seg(t, 1.7, 2.1));
      const x = dx(t);
      const run = t > 2.1 ? 1 : 0;
      const far = seg(x, 220, 345);
      const flinch = hump(seg(t, 1.1, 1.8));
      dog.pose({ x, y: FY + 5 - 9 * far, s: lerp(0.95, 0.6, far), face: lerp(-1, 1, turn), ph: run ? (x - 210) * 0.1 : 0, tailA: t < 1.1 ? 20 * Math.sin(t * 14) : 40, earA: -30 * (1 - flinch) + 10 * flinch, bark: 0, hd: 3 * flinch, hr: 0, lift: run ? 2 * Math.abs(Math.sin((x - 210) * 0.1)) : 0 });
    }
  };
}
