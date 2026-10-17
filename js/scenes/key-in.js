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

// key-in：キーを押して暗証番号を機械に入れる（Please key in your PIN.）
export const meta = { duration: 4.2, beats: [[0, '入力前'], [1.2, 'キーを押す'], [3.4, 'OK']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  const S = 1.1;
  k.shadow(296, 236, 54, 5);
  el('rect', { x: 288, y: 190, width: 16, height: 46, fill: '#B9C2CF' });
  el('rect', { x: 246, y: 38, width: 100, height: 162, rx: 14, fill: '#3A4456' });
  el('rect', { x: 256, y: 48, width: 80, height: 32, rx: 6, fill: '#E6F6F1' });
  const dots = [0, 1, 2, 3].map((i) => el('circle', { cx: 272 + i * 16, cy: 64, r: 5, fill: 'none', stroke: pal.mintDark, 'stroke-width': 2 }));
  const ok = k.text(296, 64, 'OK', { 'font-size': 18, fill: pal.green, opacity: 0 });
  const KX = [266, 296, 326];
  const keyY = (r) => 98 + r * 24;
  const keys = [];
  const LABEL = [['1', '2', '3'], ['4', '5', '6'], ['7', '8', '9'], ['', '0', '']];
  for (let r = 0; r < 4; r++) for (let c = 0; c < 3; c++) {
    if (!LABEL[r][c]) continue;
    const kg = g({});
    el('rect', { x: -11, y: -9, width: 22, height: 18, rx: 5, fill: '#EEF1F6' }, kg);
    k.text(0, 0.5, LABEL[r][c], { 'font-size': 11, fill: pal.ink }, kg);
    tf(kg, KX[c], keyY(r));
    keys.push(kg);
  }
  const b = k.buddy({ x: 214, y: FY, scale: S });
  // PIN 2-5-8-0（中央の列を上から下へ）
  const rowAt = [0, 1, 2, 3];
  const T = [1.0, 1.6, 2.2, 2.8];
  return {
    update(t) {
      let r = 0;
      T.forEach((tt, i) => { if (t >= tt - 0.25) r = i; });
      const prev = Math.max(0, r - 1);
      const mv = easeInOut(seg(t, T[r] - 0.25, T[r] - 0.05));
      const row = r === 0 ? 0 : lerp(prev, r, mv);
      const phase = ((t - T[r] + 0.05) / 0.2);
      const press = t > T[0] - 0.1 && t < T[3] + 0.3 ? hump(seg(t, T[r] - 0.05, T[r] + 0.2)) : 0;
      const reach = easeInOut(seg(t, 0.5, 0.9)) * (1 - easeInOut(seg(t, 3.0, 3.6)));
      const ty = keyY(row);
      b.pose({ armR: lerp(8, aim(b, S, 290 - 14 + press * 4, ty), reach), lean: 6 * reach, look: 1, mood: t > 3.3 ? 'grin' : 'smile', blink: t > 0.3 && t < 0.4 ? 1 : 0 });
      keys.forEach((kg) => k.set(kg, { opacity: 1 }));
      dots.forEach((d, i) => k.set(d, { fill: t > T[i] + 0.05 ? pal.mintDark : 'none' }));
      const done = smooth(seg(t, 3.3, 3.5));
      dots.forEach((d) => k.set(d, { opacity: 1 - done }));
      k.set(ok, { opacity: done });
    }
  };
}
