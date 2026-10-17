// go in：友だちと店の前に来る→ドアを押して開ける→2人で店の中へ入っていく（例文 Let's go in and look around the shop.）
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

function facade(k, FY, kind, lit) {
  const { el, g, tf, pal } = k;
  const D = { x: 100, y: FY - 104, w: 84, h: 104 };
  const f = g({});
  if (kind === 'shop') {
    el('rect', { x: 14, y: 84, width: 236, height: FY - 84, rx: 6, fill: '#FFF1D2' }, f);
    for (let i = 0; i < 12; i++) el('path', { d: `M ${14 + i * 19.67} 84 h 19.67 v 24 q -9.8 9 -19.67 0 Z`, fill: i % 2 ? '#fff' : pal.coral }, f);
    el('rect', { x: 14, y: 78, width: 236, height: 9, rx: 3, fill: pal.coralDark }, f);
    [[24, 66], [196, 46]].forEach(([x, w]) => {
      el('rect', { x, y: 126, width: w, height: 70, rx: 5, fill: '#CFE9F7', stroke: '#fff', 'stroke-width': 3 }, f);
      el('rect', { x: x + 4, y: 168, width: w - 8, height: 4, fill: pal.woodDark }, f);
      el('rect', { x: x + 8, y: 148, width: 14, height: 20, rx: 3, fill: pal.yellow }, f);
      el('circle', { cx: x + w - 18, cy: 158, r: 10, fill: pal.violet }, f);
    });
  } else {
    el('rect', { x: 14, y: 96, width: 236, height: FY - 96, rx: 6, fill: '#FBE9DC' }, f);
    el('path', { d: 'M 2 104 L 132 34 L 262 104 Z', fill: pal.coral, 'stroke-linejoin': 'round', stroke: pal.coral, 'stroke-width': 8 }, f);
    [[26, 60], [196, 44]].forEach(([x, w]) => {
      el('rect', { x, y: 128, width: w, height: 48, rx: 5, fill: '#CFE9F7' }, f);
      el('line', { x1: x + w / 2, y1: 128, x2: x + w / 2, y2: 176, stroke: '#fff', 'stroke-width': 3 }, f);
    });
  }
  el('rect', { x: D.x, y: D.y, width: D.w, height: D.h, rx: 3, fill: lit ? '#FFD98A' : '#5A6480' }, f);
  el('rect', { x: D.x, y: FY - 16, width: D.w, height: 16, fill: lit ? '#E8B864' : '#7B86A6' }, f);
  if (kind === 'shop') {
    [FY - 60, FY - 86].forEach((y) => el('rect', { x: D.x + 4, y, width: D.w - 8, height: 4, fill: pal.woodDark }, f));
    [[12, FY - 76, '#FF8E77'], [40, FY - 76, '#5FCDB8'], [66, FY - 76, '#FFCF5C'], [20, FY - 50, '#A58BF3'], [52, FY - 50, '#6AA8F7']].forEach(([dx, y, c]) => el('rect', { x: D.x + dx, y, width: 14, height: 16, rx: 3, fill: c }, f));
  } else {
    el('rect', { x: D.x + 52, y: D.y + 14, width: 22, height: 18, rx: 2, fill: '#fff', opacity: lit ? 0.5 : 0.25 }, f);
    el('circle', { cx: D.x + 18, cy: FY - 26, r: 9, fill: lit ? '#FFF3C4' : pal.yellow, opacity: 0.8 }, f);
  }
  el('rect', { x: D.x - 7, y: FY - 4, width: D.w + 14, height: 8, rx: 3, fill: pal.woodDark }, f);
  const panel = g({}, f);
  el('rect', { x: 0, y: 0, width: D.w, height: D.h, rx: 3, fill: kind === 'shop' ? '#BFE3F5' : pal.blue, stroke: kind === 'shop' ? '#fff' : 'none', 'stroke-width': 4 }, panel);
  el('rect', { x: 9, y: 10, width: D.w - 18, height: 38, rx: 4, fill: '#fff', opacity: 0.3 }, panel);
  el('circle', { cx: D.w - 9, cy: 60, r: 4, fill: pal.yellow }, panel);
  const mid = g({}, f);
  const open = (p) => tf(panel, D.x, D.y, 0, lerp(1, 0.14, p), 1);
  open(0);
  return { D, f, mid, open };
}

export const meta = { duration: 4.4, beats: [[0, '店の前'], [1.6, 'ドアを開ける'], [3.6, '中に入る']] };

export function create(k) {
  const { el, pal } = k;
  const FY = k.backdrop({ floorY: 236 });
  el('rect', { x: 184, y: FY, width: 216, height: 10, fill: '#E3E8EE' });
  const F = facade(k, FY, 'shop');
  const a = k.buddy({ parent: F.mid, x: 360, y: FY, scale: 0.8, facing: -1 });
  const c = k.buddy({ parent: F.mid, x: 400, y: FY, scale: 0.8, facing: -1, color: pal.coral, dark: pal.coralDark });
  const xa = (t) => t < 1.5 ? lerp(350, 210, easeInOut(seg(t, 0.2, 1.5))) : lerp(210, 128, easeInOut(seg(t, 2.3, 3.8)));
  const xc = (t) => t < 1.8 ? lerp(405, 258, easeInOut(seg(t, 0.3, 1.8))) : lerp(258, 164, easeInOut(seg(t, 2.7, 4.2)));
  const place = (b, x, y, s) => b.g.setAttribute('transform', `translate(${x.toFixed(2)} ${y.toFixed(2)}) scale(${s.toFixed(3)})`);
  return {
    update(t) {
      F.open(easeInOut(seg(t, 1.55, 2.3)));
      const pa = gait(xa, t, 350), pc = gait(xc, t, 405);
      const push = t > 1.4 && t < 2.4 ? 1 : 0;
      const ua = 1 - seg(pa.x, 128, 190), uc = 1 - seg(pc.x, 164, 190);
      a.pose({ x: pa.x, walk: pa.walk, armL: pa.armL, armR: 8, lean: pa.lean, look: 0.6, mood: 'grin' });
      if (push) a.pose({ armR: lerp(8, reach(a, 0.8, 'R', 176, 192), easeOut(seg(t, 1.4, 1.7))) });
      else if (t >= 2.4) a.pose({ armR: lerp(reach(a, 0.8, 'R', 176, 192), 8, seg(t, 2.4, 2.8)) });
      place(a, pa.x, FY - 7 * ua, lerp(0.8, 0.7, ua));
      c.pose({ x: pc.x, walk: pc.walk, armL: pc.armL, armR: pc.armR, lean: pc.lean, look: 0.6, mood: 'smile' });
      place(c, pc.x, FY - 7 * uc, lerp(0.8, 0.68, uc));
    }
  };
}
