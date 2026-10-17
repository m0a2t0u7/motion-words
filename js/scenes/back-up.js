import { seg, lerp, easeInOut, easeOut, easeIn, backOut, smooth, wobble, hump, clamp } from '../ease.js';
const D = Math.PI / 180;
// 手(R/L)を点(tx,ty)へ向ける腕の角度
function aim(b, S, tx, ty, side = 'R') {
  const s = b.state, f = s.facing, o = side === 'R' ? 1 : -1;
  return Math.atan2((tx - (s.x + 27 * S * f * o)) * f * o, ty - (s.y - 56 * S - s.lift)) / D;
}
function cursor(k, parent) {
  return k.el('path', { d: 'M0 0 L0 15 L4 11.5 L7 18 L10 16.5 L7 10.5 L12 10.5 Z', fill: k.pal.ink, stroke: '#fff', 'stroke-width': 1.4, 'stroke-linejoin': 'round' }, parent);
}
function pen(k, parent, c) {
  const p = k.g({}, parent);
  k.el('line', { x1: 0, y1: 0, x2: -22, y2: -6, stroke: c || k.pal.coralDark, 'stroke-width': 5, 'stroke-linecap': 'round' }, p);
  k.el('path', { d: 'M 0 0 L 6 1.6 L 0 3 Z', fill: '#F4D9B5' }, p);
  k.el('circle', { cx: 5.2, cy: 1.7, r: 1.1, fill: k.pal.ink }, p);
  return p;
}

// back-up：ボタンを押すと元のファイルはそのまま、控え（コピー）が別の場所に作られる（I back up my files every week.）
export const meta = { duration: 4.0, beats: [[0, '元のファイル'], [1.2, '控えを送る'], [3.0, '控えが保存']] };

function doc(k, parent, c) {
  const d = k.g({}, parent);
  k.el('path', { d: 'M -14 -18 L 6 -18 L 14 -10 L 14 18 L -14 18 Z', fill: '#fff', stroke: c, 'stroke-width': 2.5, 'stroke-linejoin': 'round' }, d);
  k.el('path', { d: 'M 6 -18 L 6 -10 L 14 -10', fill: c, opacity: 0.4 }, d);
  for (let i = 0; i < 3; i++) k.el('line', { x1: -8, y1: -4 + i * 8, x2: 8, y2: -4 + i * 8, stroke: c, 'stroke-width': 2.4, 'stroke-linecap': 'round' }, d);
  return d;
}

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  const S = 1.1;
  // 机
  k.shadow(305, 238, 100, 5);
  el('rect', { x: 200, y: 206, width: 200, height: 10, rx: 4, fill: pal.wood });
  el('rect', { x: 212, y: 216, width: 10, height: 20, fill: pal.woodDark });
  el('rect', { x: 380, y: 216, width: 10, height: 20, fill: pal.woodDark });
  // 元データ（PC）
  el('rect', { x: 226, y: 150, width: 56, height: 56, rx: 8, fill: '#CBD3DF' });
  el('rect', { x: 232, y: 156, width: 44, height: 30, rx: 4, fill: '#fff' });
  const orig = doc(k, undefined, pal.blue);
  tf(orig, 254, 171, 0, 0.85);
  // 保存先（外付けドライブ）
  el('rect', { x: 330, y: 168, width: 56, height: 38, rx: 8, fill: '#4A5568' });
  const led = el('circle', { cx: 376, cy: 198, r: 3, fill: '#8892A3' });
  el('rect', { x: 338, y: 190, width: 22, height: 4, rx: 2, fill: '#2F3847' });
  const ck = el('path', { d: 'M 342 177 L 348 183 L 358 172', stroke: pal.green, 'stroke-width': 0, fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' });
  const cpy = doc(k, undefined, pal.blue);
  // ボタン台
  el('rect', { x: 206, y: 196, width: 26, height: 10, rx: 3, fill: '#B9C2CF' });
  const btn = el('rect', { x: 210, y: 190, width: 18, height: 7, rx: 3.5, fill: pal.coral });
  const b = k.buddy({ x: 166, y: FY, scale: S });
  const ring = el('circle', { r: 8, fill: 'none', stroke: pal.coralDark, 'stroke-width': 3 });
  return {
    update(t) {
      const reach = easeInOut(seg(t, 0.4, 1.0)) * (1 - easeInOut(seg(t, 1.6, 2.1)));
      const press = hump(seg(t, 1.0, 1.3));
      b.pose({ armR: lerp(8, aim(b, S, 219, 188 + press * 3), reach), lean: 6 * reach, look: 1, mood: t > 3 ? 'grin' : 'smile', blink: t > 0.2 && t < 0.3 ? 1 : 0 });
      k.set(btn, { y: 190 + press * 3 });
      tf(ring, 219, 187, 0, 0.5 + seg(t, 1.05, 1.5) * 1.3);
      k.set(ring, { opacity: hump(seg(t, 1.05, 1.5)) * 0.6 });
      // コピーが元から離れて保存先へ
      const p = easeInOut(seg(t, 1.4, 2.7));
      const fx = lerp(254, 358, p), fy = lerp(171, 176, p) - Math.sin(Math.PI * p) * 46;
      const sc = lerp(0.85, 0.5, seg(t, 2.3, 2.8));
      tf(cpy, fx, fy, 0, sc);
      k.set(cpy, { opacity: t < 1.4 ? 0 : 1 - seg(t, 2.6, 2.8) });
      k.set(led, { fill: t > 2.7 ? pal.green : '#8892A3' });
      k.set(ck, { 'stroke-width': 3.6, opacity: seg(t, 2.8, 3.0) });
      const pulse = t > 1.4 ? 0.25 * hump(seg(t, 1.4, 1.8)) : 0;
      tf(orig, 254, 171, 0, 0.85 + pulse * 0.2);
    }
  };
}
