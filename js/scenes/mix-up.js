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

// mix-up：名札をごちゃ混ぜにして、二人の名前を取り違える（I mixed up the two names.）
export const meta = { duration: 4.2, beats: [[0, '二人の名前'], [1.3, '入れ替わる'], [3.2, '取り違えた']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  const S = 1.0;
  const LX = 90, RX = 310;
  const a = k.buddy({ x: LX, y: FY, scale: S, color: pal.blue, dark: pal.blueDark });
  const c = k.buddy({ x: RX, y: FY, scale: S, color: pal.yellow, dark: pal.yellowDark, facing: -1 });
  const me = k.buddy({ x: 200, y: FY, scale: S });
  const tag = (txt, col) => {
    const q = g({});
    el('rect', { x: -26, y: -11, width: 52, height: 22, rx: 6, fill: '#fff', stroke: col, 'stroke-width': 3 }, q);
    k.text(0, 0.5, txt, { 'font-size': 13, fill: col }, q);
    return q;
  };
  const tA = tag('Tom', pal.blueDark), tC = tag('Tim', pal.yellowDark);
  const swirl = el('path', { d: 'M 0 0', stroke: pal.coral, 'stroke-width': 3, fill: 'none', 'stroke-linecap': 'round' });
  const q1 = k.text(0, 0, '?', { 'font-size': 26, fill: pal.coralDark });
  const q2 = k.text(0, 0, '?', { 'font-size': 20, fill: pal.coralDark });
  const cross = g({});
  [[-14, -8, 14, 8], [-14, 8, 14, -8]].forEach(([x1, y1, x2, y2]) => el('line', { x1, y1, x2, y2, stroke: pal.red, 'stroke-width': 4, 'stroke-linecap': 'round' }, cross));
  return {
    update(t) {
      const sw = easeInOut(seg(t, 1.2, 2.4));
      const arc = Math.sin(Math.PI * sw);
      const ax = lerp(LX, RX, sw), cx = lerp(RX, LX, sw);
      tf(tA, ax, FY - 118 - arc * 38, arc * -14);
      tf(tC, cx, FY - 118 - arc * 38 * -1 + arc * 0 + arc * 76 * 0, arc * 14);
      // 二人の頭上の名札（中央ですれ違う）
      tf(tC, cx, FY - 118 - 0 + arc * 28, arc * 14);
      tf(tA, ax, FY - 118 - arc * 28, arc * -14);
      const conf = seg(t, 2.3, 2.8);
      me.pose({ look: sw < 0.1 ? -1 : 1 * (Math.sin(t * 5) * (sw > 0 && sw < 1 ? 1 : 0)), armL: lerp(8, 130, conf), armR: lerp(8, 130, conf), mood: conf > 0 ? 'sad' : 'smile', lean: Math.sin(t * 6) * 4 * (sw > 0 && sw < 1 ? 1 : 0), blink: t > 0.3 && t < 0.4 ? 1 : 0 });
      a.pose({ look: 1, mood: 'smile' });
      c.pose({ look: 1, mood: 'smile' });
      const wob = Math.sin(t * 12) * 3;
      tf(q1, 190 + wob, FY - 114 - 0, wob, conf, conf);
      k.set(q1, { opacity: conf });
      tf(q2, 222, FY - 106, 14, conf, conf);
      k.set(q2, { opacity: conf });
      // 入れ替わった名札に×（取り違え）
      tf(cross, 200, FY - 136, 0, backOut(seg(t, 3.0, 3.5)));
      k.set(cross, { opacity: 0 });
    }
  };
}
