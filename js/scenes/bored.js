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
// bored：映画館で、スクリーンを見ながらあくびをして退屈する（例文 I was bored during the movie.）
export const meta = { duration: 4.6, beats: [[0, '映画を見る'], [1.6, 'あくび'], [3.4, '退屈そう']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  el('rect', { x: 0, y: 0, width: 400, height: 300, fill: '#3A3F55' });
  el('rect', { x: 0, y: FY, width: 400, height: 64, fill: '#2C3043' });
  // スクリーン：何かが映って動いている
  el('rect', { x: 70, y: 22, width: 260, height: 118, rx: 6, fill: '#F2F4F8' });
  const clipId = k.clip((c) => el('rect', { x: 74, y: 26, width: 252, height: 110, rx: 4 }, c));
  const scr = g({ 'clip-path': clipId });
  el('rect', { x: 74, y: 26, width: 252, height: 110, fill: '#BFD9F2' }, scr);
  el('rect', { x: 74, y: 100, width: 252, height: 36, fill: '#9ED0B0' }, scr);
  const a1 = el('circle', { r: 11, fill: pal.yellow }, scr);
  const a2 = g({}, scr);
  el('rect', { x: -9, y: -14, width: 18, height: 28, rx: 8, fill: pal.violet }, a2);
  el('circle', { cx: 0, cy: -20, r: 7, fill: '#FFE0C4' }, a2);
  const b = k.buddy({ x: 200, y: FY + 22, scale: 0.95 });
  // 座席の背（キャラは座っている）
  el('rect', { x: 120, y: FY + 6, width: 160, height: 80, rx: 14, fill: '#C85B6A' });
  el('rect', { x: 120, y: FY + 6, width: 160, height: 10, rx: 5, fill: '#E27A89' });
  el('rect', { x: 100, y: FY + 14, width: 24, height: 46, rx: 8, fill: '#A9485A' });
  el('rect', { x: 276, y: FY + 14, width: 24, height: 46, rx: 8, fill: '#A9485A' });
  const pc = g({}); tf(pc, 322, FY + 18);
  el('path', { d: 'M -10 0 L 10 0 L 13 -22 L -13 -22 Z', fill: pal.red }, pc);
  el('rect', { x: -11, y: -9, width: 22, height: 8, fill: '#fff', opacity: 0.8 }, pc);
  [-7, 0, 7].forEach((x) => el('circle', { cx: x, cy: -26, r: 5, fill: '#FFF1D2' }, pc));
  const yawn = g({}); tf(yawn, 250, 165);
  const wd = k.text(0, 0, 'Zzz', { 'font-size': 13, fill: '#B8BED0' }, yawn);
  const wc = g({}); // 腕時計を見る用の小さな丸
  return {
    update(t) {
      // 映画は動き続ける
      tf(a1, lerp(110, 290, (t / 4.6) % 1), 52 + 6 * Math.sin(t * 3));
      tf(a2, lerp(280, 120, (t / 3.2) % 1), 118);
      const y = easeInOut(seg(t, 1.5, 2.0)) * (1 - easeInOut(seg(t, 2.9, 3.3)));
      const chin = easeInOut(seg(t, 3.3, 3.8));
      const sleepy = seg(t, 3.0, 4.2);
      b.pose({
        look: lerp(0.2, 0.0, y) + 0.5 * (1 - chin) * (t < 1.4 ? 1 : 0.3), mood: y > 0.1 ? 'grin' : 'flat',
        blink: t < 1.5 ? 0 : Math.max(y * 0.5, 0.45 * sleepy),
        armR: lerp(8, -98, y) * (1 - chin) + chin * -88, armL: 8,
        lean: -6 * y + 8 * chin, squash: 1 + 0.05 * y - 0.03 * chin
      });
      const shift = Math.sin(t * 1.5) * 0.5;
      faceAt(b, lerp(4, 0, chin) + shift, 1 * chin + 2 * (sleepy));
      tf(yawn, 248, 160 - 8 * seg(t, 3.5, 4.4), 0);
      yawn.setAttribute('opacity', t > 3.5 ? 0.9 * Math.min(1, seg(t, 3.5, 3.9)) : 0);
    }
  };
}
