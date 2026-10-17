import { seg, lerp, easeInOut, easeOut, easeIn, backOut, smooth, wobble, hump, clamp } from '../ease.js';
const rad = (d) => (d * Math.PI) / 180;
const deg = (r) => (r * 180) / Math.PI;
// 手先の座標（体の傾き・つぶれ・向きを反映）
function hp(b, s, side = 'R', len = 28) {
  const st = b.state, a = rad(side === 'R' ? -st.armR : st.armL);
  let x = (side === 'R' ? 27 : -27) - len * Math.sin(a), y = -46 + len * Math.cos(a);
  x *= 2 - st.squash; y *= st.squash;
  const l = rad(st.lean), c = Math.cos(l), sn = Math.sin(l);
  return { x: st.x + (x * c - y * sn) * st.facing * s, y: st.y + (x * sn + y * c - 10 - st.lift) * s };
}
function reach(b, s, side, tx, ty) {
  const st = b.state, o = hp(b, s, side, 0);
  const phi = deg(Math.atan2(-(tx - o.x) * st.facing, ty - o.y));
  return side === 'R' ? st.lean - phi : phi - st.lean;
}
const faceAt = (b, dx, dy = 0) => b.body.children[3].setAttribute('transform', `translate(${dx.toFixed(2)} ${dy.toFixed(2)})`);
function gait(xf, t, x0, amp = 18, kf = 0.107) {
  const x = xf(t), v = Math.abs(xf(t + 0.02) - xf(t - 0.02)) / 0.04;
  const ph = Math.abs(x - x0) * kf, m = clamp(v / 25);
  const w = lerp(Math.round(ph / Math.PI) * Math.PI, ph, m);
  return { x, walk: w, armL: 8 + Math.sin(w) * amp * m, armR: 8 - Math.sin(w) * amp * m, lean: 3 * m, m };
}
function win(k, x, y, w, h, night) {
  const { el, pal } = k;
  el('rect', { x, y, width: w, height: h, rx: 6, fill: night ? '#2F3A5C' : '#DDEFFA', stroke: '#fff', 'stroke-width': 5 });
  el('line', { x1: x + w / 2, y1: y, x2: x + w / 2, y2: y + h, stroke: '#fff', 'stroke-width': 4 });
}
const tag = (n, on) => n.setAttribute('opacity', on ? 1 : 0);
// small：小さな町を見渡して、自分が住んでいる町だと示す（例文 I live in a small town.）
export const meta = { duration: 4.4, beats: [[0, '町を見る'], [1.5, '自分の町'], [3.0, '小さな町']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236 });
  const S = 0.95;
  // 遠くの丘と、広い野原の中の小さな町
  el('ellipse', { cx: 120, cy: 190, rx: 190, ry: 50, fill: '#CDEBD5' });
  el('ellipse', { cx: 330, cy: 196, rx: 170, ry: 44, fill: '#BDE5C8' });
  el('ellipse', { cx: 200, cy: 214, rx: 260, ry: 34, fill: '#DDF3E2' });
  const house = (x, y, w, h, c) => {
    el('rect', { x, y: y - h, width: w, height: h, fill: c });
    el('path', { d: `M ${x - 2} ${y - h} L ${x + w / 2} ${y - h - w * 0.45} L ${x + w + 2} ${y - h} Z`, fill: pal.coral });
    el('rect', { x: x + w / 2 - 2, y: y - h * 0.5, width: 4, height: h * 0.5, fill: pal.woodDark });
  };
  const ty = 206;
  el('rect', { x: 142, y: ty + 4, width: 120, height: 4, rx: 2, fill: '#fff' });
  house(148, ty, 14, 10, '#FFF1D2'); house(168, ty, 12, 9, '#FBE9DC'); house(186, ty, 14, 11, '#E4F1F8');
  house(206, ty, 13, 9, '#FFF1D2'); house(226, ty, 14, 10, '#FBE9DC');
  // 小さな教会
  el('rect', { x: 244, y: ty - 16, width: 12, height: 16, fill: '#fff' });
  el('path', { d: `M 243 ${ty - 16} L 250 ${ty - 28} L 257 ${ty - 16} Z`, fill: pal.violet });
  // 木
  [[132, 206], [270, 206], [100, 214]].forEach(([x, y]) => { el('rect', { x: x - 1, y: y - 8, width: 2, height: 8, fill: pal.woodDark }); el('circle', { cx: x, cy: y - 12, r: 6, fill: '#6BC48F' }); });
  // 町の外れの標識
  const car = g({});
  el('rect', { x: -8, y: -7, width: 16, height: 7, rx: 3, fill: pal.blue }, car);
  el('rect', { x: -4, y: -11, width: 8, height: 5, rx: 2, fill: '#fff' }, car);
  el('circle', { cx: -4, cy: 0, r: 2, fill: pal.ink }, car); el('circle', { cx: 4, cy: 0, r: 2, fill: pal.ink }, car);
  const smoke = el('circle', { r: 2.4, fill: '#fff', stroke: '#D5DBE5', 'stroke-width': 1 });
  // 手前の丘
  el('ellipse', { cx: 120, cy: 310, rx: 260, ry: 74, fill: '#A9DDB8' });
  const b = k.buddy({ x: 96, y: 262, scale: S });
  const ring = el('ellipse', { cx: 197, cy: 196, rx: 70, ry: 26, fill: 'none', stroke: pal.coralDark, 'stroke-width': 2.5, 'stroke-dasharray': '6 5', opacity: 0 });
  return {
    update(t) {
      const chest = easeInOut(seg(t, 1.2, 1.8)) * (1 - easeInOut(seg(t, 2.4, 3.0)));
      const point = easeInOut(seg(t, 2.6, 3.2));
      b.pose({ look: 0.7, facing: 1, lean: -2 * chest + 4 * point, mood: t > 2.8 ? 'smile' : 'flat', squash: 1 + 0.01 * Math.sin(t * 3),
        armR: lerp(8, -50, chest) + point * 140, armL: 8 + 0 });
      const ph = seg(t, 2.6, 3.0);
      ring.setAttribute('opacity', ph * (0.6 + 0.3 * Math.sin(t * 6)));
      // 車が町を横切る（短い）
      const cp = seg(t, 0.6, 2.4);
      tf(car, lerp(140, 262, easeInOut(cp)), ty + 6 - 0.3 * Math.sin(cp * 20));
      tag(car, cp > 0 && cp < 1 ? 1 : 0);
      const q = (t * 0.8) % 1;
      tf(smoke, 203 + 4 * q, 190 - 14 * q); smoke.setAttribute('opacity', 0.9 * (1 - q));
    }
  };
}
