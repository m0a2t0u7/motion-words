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

// note-down：説明を聞きながら、要点だけを短くメモする（She noted down the main points.）
export const meta = { duration: 4.2, beats: [[0, '要点を聞く'], [1.3, '短くメモ'], [3.4, '要点が残る']] };

function card(k, x, y, w, h) {
  const c = k.g({ transform: `translate(${x} ${y})` });
  k.el('rect', { x: 3, y: 4, width: w, height: h, rx: 10, fill: k.pal.shadow }, c);
  k.el('rect', { width: w, height: h, rx: 10, fill: '#fff', stroke: '#D5DBE5', 'stroke-width': 2 }, c);
  const m = k.g({ transform: `translate(${w - 14} 14)` }, c);
  k.el('circle', { r: 5, fill: 'none', stroke: k.pal.sub, 'stroke-width': 2 }, m);
  k.el('line', { x1: 4, y1: 4, x2: 9, y2: 9, stroke: k.pal.sub, 'stroke-width': 2.4, 'stroke-linecap': 'round' }, m);
  return c;
}
// まめが胸の前でメモ帳を持つ
function padFront(k, b, S, dx = 14) {
  const p = k.g({});
  k.el('rect', { x: -2, y: -3, width: 40 * S, height: 30 * S, rx: 4, fill: '#FFF8DC', stroke: k.pal.yellowDark, 'stroke-width': 2 }, p);
  k.el('rect', { x: -2, y: -3, width: 40 * S, height: 6, rx: 3, fill: k.pal.yellowDark }, p);
  for (let i = 0; i < 3; i++) k.el('line', { x1: 5, y1: 12 + i * 7, x2: 32 * S, y2: 12 + i * 7, stroke: '#E8D9A8', 'stroke-width': 1.6 }, p);
  return p;
}

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  const S = 1.1;
  // ボード（説明）
  el('rect', { x: 236, y: 52, width: 150, height: 120, rx: 8, fill: '#fff', stroke: '#C7CFDA', 'stroke-width': 3 });
  el('rect', { x: 250, y: 64, width: 60, height: 9, rx: 4.5, fill: '#9AA6B6' });
  const WORDS = ['Plan', 'Date', 'Cost'];
  const cols = [pal.blue, pal.coral, pal.mint];
  const key = WORDS.map((w, i) => {
    const y = 94 + i * 24;
    el('rect', { x: 250, y: y - 4, width: 92 - i * 10, height: 8, rx: 4, fill: '#E3E9F1' });
    return el('rect', { x: 250, y: y - 4, width: 30, height: 8, rx: 4, fill: cols[i] });
  });
  const hlr = el('rect', { x: 244, y: 86, width: 134, height: 20, rx: 6, fill: 'none', stroke: pal.yellowDark, 'stroke-width': 2.6 });
  const b = k.buddy({ x: 105, y: FY, scale: S, color: pal.coral, dark: pal.coralDark });
  const pad = padFront(k, b, S);
  tf(pad, 105 + 2, FY - 42 * S + 4, -6);
  const pn = pen(k, undefined, pal.blueDark);
  const cd = card(k, 40, 22, 150, 90);
  k.text(75, 38, 'NOTE', { 'font-size': 10, fill: pal.sub }, cd);
  const notes = WORDS.map((w, i) => {
    const gg = g({ opacity: 0 }, cd);
    el('circle', { cx: 22, cy: 56 + i * 18 - 1, r: 4.5, fill: cols[i] }, gg);
    k.text(36, 56 + i * 18, w, { 'font-size': 15, 'text-anchor': 'start' }, gg);
    return gg;
  });
  return {
    update(t) {
      const T = [1.3, 2.1, 2.9];
      let cur = 0;
      T.forEach((tt, i) => { if (t >= tt - 0.2) cur = i; });
      tf(hlr, 0, cur * 24);
      k.set(hlr, { opacity: t > 0.6 && t < 3.4 ? 1 : 0 });
      notes.forEach((n, i) => k.set(n, { opacity: seg(t, T[i], T[i] + 0.25) }));
      const writing = T.some((tt) => t > tt - 0.1 && t < tt + 0.6);
      const w = writing ? Math.sin(t * 20) : 0;
      b.pose({ armR: 38 + w * 9, armL: 52, lean: 5, look: writing ? 0.2 : 1, blink: t > 0.2 && t < 0.3 ? 1 : 0, mood: 'smile' });
      const h = b.handPos('R');
      tf(pn, h.x + 2, h.y + 1, 14);
    }
  };
}
