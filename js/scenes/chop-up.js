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

// chop-up：玉ねぎを包丁で何度も切って、細かく刻む（She chopped up an onion.）
export const meta = { duration: 4.2, beats: [[0, '玉ねぎ'], [1.0, 'トントン刻む'], [3.4, '細かくなった']] };

function counter(k, FY) {
  const { el, pal } = k;
  el('rect', { x: 0, y: 214, width: 400, height: 22, fill: '#D9C3A0' });
  el('rect', { x: 0, y: 194, width: 400, height: 20, fill: '#F0DFC2' });
  el('rect', { x: 0, y: 214, width: 400, height: 3, fill: '#B89F78' });
}
function knife(k, parent) {
  const n = k.g({}, parent);
  k.el('rect', { x: -4, y: -14, width: 8, height: 16, rx: 3, fill: k.pal.woodDark }, n);
  k.el('path', { d: 'M -5 2 L 5 2 L 5 26 Q 2 32 -5 28 Z', fill: '#DDE3EA', stroke: '#9AA6B6', 'stroke-width': 1.5, 'stroke-linejoin': 'round' }, n);
  return n;
}

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = 232, S = 1.1;
  k.backdrop({ floorY: 236, mood: 'indoor' });
  const b = k.buddy({ x: 150, y: FY, scale: S, color: pal.coral, dark: pal.coralDark });
  counter(k, FY);
  el('rect', { x: 182, y: 198, width: 200, height: 12, rx: 5, fill: pal.wood });
  el('rect', { x: 182, y: 206, width: 200, height: 4, rx: 2, fill: pal.woodDark });
  const OX = 203;
  const onion = g({});
  el('path', { d: 'M 0 -28 Q 4 -36 8 -30 Q 3 -26 2 -22 Z', fill: '#C7B27A' }, onion);
  el('ellipse', { cx: 0, cy: -12, rx: 22, ry: 17, fill: '#E9D3F0', stroke: '#C9A8D6', 'stroke-width': 2 }, onion);
  el('path', { d: 'M -10 -26 Q -16 -12 -8 -0 M 0 -28 Q -4 -12 0 0 M 10 -26 Q 14 -12 8 0', stroke: '#C9A8D6', 'stroke-width': 1.5, fill: 'none' }, onion);
  const bits = [];
  for (let i = 0; i < 26; i++) {
    const rx = ((i * 37) % 100) / 100, ry = ((i * 53) % 100) / 100;
    const r = el('rect', { width: 4 + (i % 3), height: 3 + (i % 2), rx: 1, fill: i % 3 ? '#EAD6F2' : '#D8B9E6', stroke: '#C9A8D6', 'stroke-width': 0.8 });
    bits.push([r, rx, ry, i]);
  }
  const kn = knife(k);
  const tear = el('path', { d: 'M 0 -5 Q 4 0 0 4 Q -4 0 0 -5 Z', fill: pal.water, stroke: '#6BBDE4', 'stroke-width': 1 });
  return {
    update(t) {
      const act = t > 0.7 && t < 3.3;
      const cyc = (t - 0.7) * 3.0;
      const down = act ? 0.5 - 0.5 * Math.cos(cyc * Math.PI * 2) : 0;
      const w = seg(t, 0.9, 3.3);
      b.pose({ armR: lerp(150, 88, down), armL: 20, x: 147, lean: 6, look: 1, mood: t > 2.2 ? 'sad' : 'smile', blink: t > 2.2 ? 0.5 : 0 });
      const h = b.handPos('R');
      tf(kn, h.x + 2, h.y + 2, 0);
      // 玉ねぎは縮み、細かい欠片が山になる
      const sc = 1 - 0.85 * easeInOut(w);
      tf(onion, OX + 51, 203, 0, 1 + 0.05 * Math.sin(cyc * 6.28) * (act ? 1 : 0) * 0, sc);
      k.set(onion, { opacity: sc > 0.16 ? 1 : 0 });
      bits.forEach(([r, rx, ry, i]) => {
        const p = seg(w, i / 30, i / 30 + 0.15);
        const x = OX + 51 + (rx - 0.5) * 70 * (0.5 + 0.5 * easeOut(w));
        tf(r, x, 203 - ry * 5 - Math.sin(Math.PI * p) * 8 * (p < 1 ? 1 : 0), 0);
        k.set(r, { opacity: p > 0 ? 1 : 0 });
      });
      tf(tear, 161, 188 - 0, 0, 1);
      const tp = ((t - 2.4) * 1.2) % 1;
      tf(tear, 160, FY - 52 + tp * 14, 0, 0.9);
      k.set(tear, { opacity: t > 2.4 ? 1 - tp : 0 });
    }
  };
}
