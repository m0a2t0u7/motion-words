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

// boil-over：鍋の牛乳が沸いて泡立ち、ふちを越えて外にあふれ出る（The milk boiled over on the stove.）
export const meta = { duration: 4.2, beats: [[0, '火にかける'], [1.4, '泡が上がる'], [3.2, 'あふれた']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  const S = 1.1;
  // コンロ台
  el('rect', { x: 150, y: 196, width: 250, height: 40, fill: '#7B8594' });
  el('rect', { x: 150, y: 196, width: 250, height: 8, fill: '#9AA3B2' });
  [[196, 218], [226, 218]].forEach(([x, y]) => el('circle', { cx: x + 36, cy: y, r: 5, fill: '#4A5568' }));
  const PX = 280, RIM = 128;
  // 牛乳パック
  const carton = g({ transform: 'translate(176 150)' });
  el('rect', { x: 0, y: 8, width: 26, height: 38, fill: '#fff', stroke: '#C7CFDA', 'stroke-width': 2 }, carton);
  el('path', { d: 'M 0 8 L 6 -2 L 20 -2 L 26 8 Z', fill: pal.blue }, carton);
  el('rect', { x: 0, y: 22, width: 26, height: 10, fill: pal.blue, opacity: 0.35 }, carton);
  // 火
  const flame = g({});
  [[-22, 14], [-8, 20], [8, 20], [22, 14]].forEach(([x, h]) => el('path', { d: `M ${x} 0 Q ${x - 7} -${h * 0.6} ${x} -${h} Q ${x + 7} -${h * 0.6} ${x} 0 Z`, fill: pal.red, opacity: 0.9 }, flame));
  [[-8, 11], [8, 11]].forEach(([x, h]) => el('path', { d: `M ${x} 0 Q ${x - 4} -${h * 0.6} ${x} -${h} Q ${x + 4} -${h * 0.6} ${x} 0 Z`, fill: pal.yellow }, flame));
  // 泡・あふれ（鍋の後ろ側）
  const spill = g({});
  const foam = g({}, spill);
  const circles = [[-26, 0, 17], [-8, -6, 20], [12, -4, 19], [28, 2, 16], [0, -16, 15], [-18, -14, 12], [20, -17, 12]].map(([x, y, r]) => el('circle', { cx: x, cy: y, r, fill: '#fff', stroke: '#DCE6F0', 'stroke-width': 2 }, foam));
  // 鍋
  const pot = g({});
  el('rect', { x: PX - 48, y: RIM, width: 96, height: 68, rx: 10, fill: '#8A96A8' }, pot);
  el('rect', { x: PX - 48, y: RIM, width: 96, height: 12, rx: 6, fill: '#A9B4C4' }, pot);
  el('rect', { x: PX - 38, y: RIM + 20, width: 12, height: 40, rx: 6, fill: '#fff', opacity: 0.2 }, pot);
  el('rect', { x: PX + 46, y: RIM + 16, width: 30, height: 9, rx: 4, fill: '#4A5568' }, pot);
  // 外へ流れる牛乳
  const run = g({});
  const mL = el('rect', { x: PX - 54, y: RIM + 4, width: 10, height: 0, rx: 5, fill: '#fff', stroke: '#DCE6F0', 'stroke-width': 1.5 }, run);
  const mR = el('rect', { x: PX + 42, y: RIM + 4, width: 10, height: 0, rx: 5, fill: '#fff', stroke: '#DCE6F0', 'stroke-width': 1.5 }, run);
  const mC = el('rect', { x: PX - 16, y: RIM + 8, width: 9, height: 0, rx: 4.5, fill: '#fff', stroke: '#DCE6F0', 'stroke-width': 1.5 }, run);
  const puddle = el('ellipse', { cx: PX, cy: 199, rx: 0, ry: 0, fill: '#fff', stroke: '#DCE6F0', 'stroke-width': 1.5 });
  const steam = [0, 1, 2].map((i) => el('path', { d: 'M 0 0 q -6 -8 0 -16 q 6 -8 0 -16', stroke: '#C9D3E0', 'stroke-width': 3, fill: 'none', 'stroke-linecap': 'round' }));
  const b = k.buddy({ x: 105, y: FY, scale: S });
  return {
    update(t) {
      const rise = easeIn(seg(t, 0.9, 2.3));
      const over = easeOut(seg(t, 2.2, 3.3));
      tf(flame, PX, 196, 0, 1 + 0.08 * Math.sin(t * 17), 1 + 0.12 * Math.sin(t * 13 + 1));
      tf(foam, PX, RIM + 2 - rise * 22, 0, 0.5 + rise * 0.55 + 0.04 * Math.sin(t * 11));
      k.set(foam, { opacity: seg(t, 0.9, 1.2) });
      k.set(mL, { height: 66 * over });
      k.set(mR, { height: 60 * over });
      k.set(mC, { height: 46 * seg(t, 2.5, 3.3) });
      k.set(puddle, { rx: 62 * seg(t, 3.0, 3.9), ry: 6 * seg(t, 3.0, 3.9) });
      steam.forEach((s, i) => {
        const p = ((t * 0.7 + i * 0.33) % 1);
        tf(s, PX - 20 + i * 20, RIM - 6 - p * 26, 0, 0.8);
        k.set(s, { opacity: (t > 0.5 ? 0.6 : 0) * (1 - p) });
      });
      const shock = seg(t, 2.3, 2.7);
      b.pose({ armL: lerp(8, 140, backOut(shock)), armR: lerp(8, 140, backOut(shock)), squash: 1 - 0.04 * hump(seg(t, 2.3, 2.9)), lean: -8 * shock, look: 1, mood: t > 2.3 ? 'open' : 'smile', blink: t > 0.3 && t < 0.4 ? 1 : 0, lift: 5 * hump(seg(t, 2.3, 2.7)) });
    }
  };
}
