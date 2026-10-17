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

// read-through：書類を始めから終わりまで、行を追って通して読む（Please read through the document carefully.）
export const meta = { duration: 4.2, beats: [[0, '最初'], [1.5, '読み進める'], [3.6, '最後まで']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  const S = 1.1;
  k.shadow(300, 236, 70, 5);
  el('rect', { x: 292, y: 200, width: 14, height: 36, fill: pal.woodDark });
  el('rect', { x: 230, y: 24, width: 140, height: 180, rx: 8, fill: '#fff', stroke: '#C7CFDA', 'stroke-width': 3 });
  el('rect', { x: 244, y: 38, width: 56, height: 9, rx: 4.5, fill: '#9AA6B6' });
  const N = 8, Y0 = 66, DY = 17;
  const hl = el('rect', { x: 240, y: Y0 - 8, width: 118, height: 14, rx: 5, fill: pal.yellow, opacity: 0.5 });
  const rows = [];
  for (let i = 0; i < N; i++) {
    const y = Y0 + i * DY;
    const gg = g({});
    el('rect', { x: 246, y: y - 3, width: 96 - (i % 3) * 14, height: 6, rx: 3, fill: '#D5DBE5' }, gg);
    const ov = el('rect', { x: 246, y: y - 3, width: 96 - (i % 3) * 14, height: 6, rx: 3, fill: pal.mint, opacity: 0 }, gg);
    rows.push(ov);
  }
  // 進行バー（始め→終わり）
  el('line', { x1: 358, y1: 44, x2: 358, y2: 186, stroke: '#E3E9F1', 'stroke-width': 3, 'stroke-linecap': 'round' });
  const bar = el('line', { x1: 358, y1: 44, x2: 358, y2: 44, stroke: pal.mint, 'stroke-width': 3, 'stroke-linecap': 'round' });
  const end = el('circle', { cx: 358, cy: 188, r: 6, fill: '#fff', stroke: '#C7CFDA', 'stroke-width': 2.5 });
  const ck = el('path', { d: 'M 354.5 188 L 357 191 L 362 185', stroke: pal.green, 'stroke-width': 0, fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' });
  const b = k.buddy({ x: 180, y: FY, scale: S });
  const stick = el('line', { stroke: pal.woodDark, 'stroke-width': 3, 'stroke-linecap': 'round' });
  return {
    update(t) {
      const p = clamp((t - 0.8) / 2.7);
      const idx = p * (N - 0.01);
      const cur = Math.floor(idx);
      const my = Y0 + Math.min(N - 1, idx) * DY;
      tf(hl, 0, my - Y0);
      k.set(hl, { opacity: t < 0.7 ? 0 : t > 3.55 ? 0.5 * (1 - seg(t, 3.55, 3.8)) : 0.5 });
      rows.forEach((r, i) => k.set(r, { opacity: i < cur ? 0.9 : i === cur ? 0.9 * (idx - cur) : 0 }));
      const ey = Y0 + (N - 1) * DY;
      k.set(bar, { y2: 44 + (ey - 44 + 20) * clamp(p) });
      k.set(ck, { 'stroke-width': 2.4, opacity: seg(t, 3.55, 3.7) });
      k.set(end, { stroke: t > 3.55 ? pal.green : '#C7CFDA' });
      const reach = easeInOut(seg(t, 0.4, 0.9)) * (1 - easeInOut(seg(t, 3.7, 4.1)));
      const ang = aim(b, S, 240, my);
      b.pose({ armR: lerp(8, ang, reach), lean: 3 * reach, look: 1, mood: t > 3.6 ? 'grin' : 'smile', blink: t > 0.2 && t < 0.3 ? 1 : (Math.floor(t * 1.3) % 2 && (t * 1.3) % 1 < 0.1 ? 1 : 0) });
      const h = b.handPos('R');
      k.set(stick, { x1: h.x, y1: h.y, x2: lerp(h.x, 236, 1), y2: my, opacity: reach > 0.05 ? 1 : 0 });
    }
  };
}
